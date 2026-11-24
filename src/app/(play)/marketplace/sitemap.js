import { loadProducts } from "@/lib/server/ops/store";
import { SITE_URL } from "@/lib/site";
import { productPath } from "@/lib/verticals";

// /marketplace/sitemap.xml: every listed product, rebuilt every few minutes.
export const revalidate = 300;

export default async function sitemap() {
  let products = [];
  try {
    products = await loadProducts();
  } catch {}
  const now = new Date();
  return [
    { url: `${SITE_URL}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...products.map((p) => ({
      url: `${SITE_URL}${productPath(p)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
      ...(p.thumbnail ? { images: [p.thumbnail] } : {}),
    })),
  ];
}
