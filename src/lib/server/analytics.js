import "server-only";
import { log } from "@/lib/secure/http";
import { sha256Hex } from "@/lib/secure/server-crypto";

/*
 * Server-side analytics fan-out. Event names match HFG-frontend's
 * SegmentSdkService so web and app funnels line up in the same workspace;
 * every event carries platform=web.
 *
 * Destinations (all optional, configured by env):
 *   SEGMENT_WRITE_KEY                -> Segment HTTP Tracking API (batch)
 *   GA4_MEASUREMENT_ID + GA4_API_SECRET -> GA4 Measurement Protocol
 * With neither set, events are written to structured logs only.
 */

// Events the browser may send. Server-only events (payments, confirmations,
// sign-ups) are emitted by the gateway itself and cannot be forged by clients.
// Outcomes only the gateway may report (so funnels can't be inflated by clients).
export const SERVER_ONLY_EVENTS = new Set([
  "Booking Started",
  "Booking Confirmed",
  "Payment Initiated",
  "Payment Success",
  "Payment Failed",
  "Order Completed",
  "Pass Purchased",
  "Pass Purchase Started",
  "Wallet Topup Started",
  "Wallet Topup Completed",
  "Wallet Topup Failed",
  "Signup Completed",
  "Login Successful",
  "Checkout Started",
  "Store Account Created",
  "API Error",
]);

/** Any "Title Case" event name from the browser, except the server-only ones. */
export function isClientEvent(name) {
  return typeof name === "string" && /^[A-Z][A-Za-z0-9 ]{2,40}$/.test(name) && !SERVER_ONLY_EVENTS.has(name);
}

export const CLIENT_EVENTS = new Set([
  "Page Viewed",
  "Cafe List Viewed",
  "Cafe Searched",
  "Cafe Console Selected",
  "Date Selected",
  "Slot Selected",
  "Payment Method Selected",
  "OTP Requested",
  "OTP Verified",
  "Login Started",
  "Login Failed",
  "Store Viewed",
  "Cart Viewed",
  "Checkout Address Entered",
  "Razorpay Opened",
  "Razorpay Dismissed",
  "Help Requested",
  "CTA Clicked",
  "Web Vitals",
  "Client Error",
]);

const PROP_ALLOW = /^[a-z][a-z0-9_]{0,39}$/;

export function sanitizeProps(props) {
  const out = {};
  if (!props || typeof props !== "object") return out;
  let count = 0;
  for (const [key, value] of Object.entries(props)) {
    if (!PROP_ALLOW.test(key) || ++count > 25) continue;
    // Never accept free-form PII from the browser.
    if (/(email|phone|mobile|name|address|token|otp|password)/.test(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
    else if (typeof value === "string") out[key] = value.replace(/[\u0000-\u001f]/g, "").slice(0, 160);
  }
  return out;
}

function userKey(uid) {
  // Segment userId for web: same numeric HFG id the app uses would allow
  // cross-device stitching; we hash it with a server salt unless explicitly
  // allowed, to keep raw ids out of third-party tools by default.
  if (process.env.ANALYTICS_RAW_USER_ID === "true") return String(uid);
  return sha256Hex(`${process.env.HFG_LOG_SALT || "hfg"}|uid|${uid}`).slice(0, 32);
}

export async function sendAnalytics(events, { anonId, uid, context }) {
  if (!events.length) return;
  const userId = uid ? userKey(uid) : undefined;
  const tasks = [];

  const segmentKey = process.env.SEGMENT_WRITE_KEY;
  if (segmentKey) {
    tasks.push(
      fetch("https://api.segment.io/v1/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${segmentKey}:`).toString("base64")}`,
        },
        body: JSON.stringify({
          batch: events.map((e) => ({
            type: e.type || "track",
            event: e.type === "identify" ? undefined : e.name,
            traits: e.type === "identify" ? e.props : undefined,
            properties: e.type === "identify" ? undefined : { ...e.props, platform: "web" },
            anonymousId: anonId,
            userId,
            timestamp: e.ts,
            context: { ...context, library: { name: "hfg-web-gateway", version: "1" } },
          })),
        }),
        signal: AbortSignal.timeout(3000),
      }),
    );
  }

  const gaId = process.env.GA4_MEASUREMENT_ID;
  const gaSecret = process.env.GA4_API_SECRET;
  if (gaId && gaSecret) {
    const trackEvents = events.filter((e) => e.type !== "identify").slice(0, 25);
    if (trackEvents.length) {
      tasks.push(
        fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(gaId)}&api_secret=${encodeURIComponent(gaSecret)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: anonId,
            user_id: userId,
            events: trackEvents.map((e) => ({
              name: e.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40),
              params: { ...e.props, platform: "web", engagement_time_msec: 1 },
            })),
          }),
          signal: AbortSignal.timeout(3000),
        }),
      );
    }
  }

  for (const e of events) log("info", "analytics", { name: e.name || e.type, props: e.props, anon: anonId?.slice(0, 8) });

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected" || (r.value && !r.value.ok)) {
      log("warn", "analytics.delivery_failed", { status: r.value?.status });
    }
  }
}
