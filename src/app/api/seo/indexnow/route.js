import crypto from "node:crypto";
import { loadCafeDetail, loadCafes } from "@/lib/server/ops/booking";
import { loadProduct, loadProducts } from "@/lib/server/ops/store";
import { SITE_URL } from "@/lib/site";
import { cafePath, productPath } from "@/lib/verticals";

/*
 * Tells IndexNow search engines (Bing, Yandex, Seznam, Naver...) about new or
 * changed cafe and product pages, so a new listing is crawled within minutes.
 * Google reads the per-vertical sitemaps instead (submit them once in Search Console).
 *
 *   POST /api/seo/indexnow   Authorization: Bearer <SEO_PING_SECRET>
 *        { "vendorIds": [12], "productIds": ["prod_..."] }   -> just those pages
 *        {}                                                  -> every cafe and product
 *   GET  /api/seo/indexnow   Authorization: Bearer <CRON_SECRET>   (Vercel cron, full resubmit)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(request, secret) {
  if (!secret || secret.length < 16) return false;
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function collect({ vendorIds = [], productIds = [] } = {}) {
  const urls = new Set();
  if (!vendorIds.length && !productIds.length) {
    urls.add(`${SITE_URL}/book`);
    urls.add(`${SITE_URL}/marketplace`);
    for (const c of await loadCafes().catch(() => [])) urls.add(`${SITE_URL}${cafePath(c)}`);
    for (const p of await loadProducts().catch(() => [])) urls.add(`${SITE_URL}${productPath(p)}`);
    return [...urls];
  }
  for (const id of vendorIds.slice(0, 100)) {
    const d = await loadCafeDetail(Number(id)).catch(() => null);
    if (d) urls.add(`${SITE_URL}${cafePath(d.cafe)}`);
  }
  for (const id of productIds.slice(0, 100)) {
    const p = await loadProduct(String(id)).catch(() => null);
    if (p) urls.add(`${SITE_URL}${productPath(p)}`);
  }
  if (urls.size) {
    if (vendorIds.length) urls.add(`${SITE_URL}/book`);
    if (productIds.length) urls.add(`${SITE_URL}/marketplace`);
  }
  return [...urls];
}

async function submit(urls) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || !urls.length) return { submitted: 0, skipped: !key ? "INDEXNOW_KEY not set" : "no urls" };
  const host = new URL(SITE_URL).host;
  let submitted = 0;
  for (let i = 0; i < urls.length; i += 10000) {
    const batch = urls.slice(i, i + 10000);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${SITE_URL}/indexnow-key.txt`, urlList: batch }),
      cache: "no-store",
    });
    if (!res.ok && res.status !== 202) return { submitted, error: `IndexNow responded ${res.status}` };
    submitted += batch.length;
  }
  return { submitted };
}

export async function POST(request) {
  if (!authorised(request, process.env.SEO_PING_SECRET)) return Response.json({ error: "unauthorised" }, { status: 401 });
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const vendorIds = Array.isArray(body.vendorIds) ? body.vendorIds.filter((x) => /^\d{1,9}$/.test(String(x))) : [];
  const productIds = Array.isArray(body.productIds) ? body.productIds.filter((x) => /^prod_[A-Za-z0-9]{1,60}$/.test(String(x))) : [];
  const urls = await collect({ vendorIds, productIds });
  return Response.json({ urls: urls.length, ...(await submit(urls)) });
}

export async function GET(request) {
  if (!authorised(request, process.env.CRON_SECRET)) return Response.json({ error: "unauthorised" }, { status: 401 });
  const urls = await collect();
  return Response.json({ urls: urls.length, ...(await submit(urls)) });
}
