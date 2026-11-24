import { secureCall } from "@/lib/secure/client";
import { track as siteTrack } from "@/lib/analytics";

/*
 * Funnel analytics for the new web flows. Events are batched and sent through
 * the encrypted gateway; the server attaches anonymous/user ids from HttpOnly
 * cookies and forwards to Segment / GA4. Never put names, phones, emails or
 * tokens in props: the server drops those keys anyway.
 */

const queue = [];
let timer = null;
let utmSent = false;

function readUtm() {
  try {
    const stored = sessionStorage.getItem("hfg_utm");
    if (stored) return JSON.parse(stored);
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"]) {
      const value = params.get(key);
      if (value) utm[key] = value.slice(0, 100);
    }
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      utm.referrer_host = new URL(document.referrer).host;
    }
    sessionStorage.setItem("hfg_utm", JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
}

function flush(keepalive = false) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length) return;
  const events = queue.splice(0, 20);
  const args = { events };
  if (!utmSent) {
    args.utm = readUtm();
    utmSent = true;
  }
  secureCall("analytics.track", args, { keepalive }).catch(() => {});
  if (queue.length) flush(keepalive);
}

const snake = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);

export function track(name, props = {}) {
  if (typeof window === "undefined") return;
  // Also into the site's own GA4 / Meta setup, in its snake_case naming.
  if (name !== "Page Viewed") siteTrack(snake(name), { ...props, platform: "web" });
  queue.push({ name, props, path: window.location.pathname, ts: Date.now() });
  if (queue.length >= 10) flush();
  else if (!timer) timer = setTimeout(() => flush(), 2500);
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
}
