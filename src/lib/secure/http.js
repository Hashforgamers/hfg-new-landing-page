import "server-only";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { sha256Hex } from "./server-crypto";

export const isProd = process.env.NODE_ENV === "production";

export function clientIp(request) {
  const h = request.headers;
  const candidates = [
    h.get("x-vercel-forwarded-for"),
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
    (h.get("x-forwarded-for") || "").split(",")[0],
  ];
  for (const value of candidates) {
    const ip = (value || "").trim();
    if (ip && ip.length <= 64) return ip;
  }
  return "0.0.0.0";
}

/** A stable, non-reversible id for rate-limit buckets and logs. */
export function ipBucket(request) {
  return sha256Hex(`${process.env.HFG_LOG_SALT || "hfg"}|${clientIp(request)}`).slice(0, 24);
}

function allowedOrigins() {
  const configured = (process.env.HFG_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const defaults = [SITE_URL, SITE_URL.replace("://", "://www.")];
  if (!isProd) defaults.push("http://localhost:3000", "http://127.0.0.1:3000");
  return new Set([...configured, ...defaults]);
}

/**
 * Same-origin enforcement. Browsers always send Origin on POST; a missing or
 * foreign Origin means another site (or a script) is driving the request.
 */
export function originAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  if (allowedOrigins().has(origin.replace(/\/$/, ""))) return true;
  // Preview deployments: allow the request's own host when explicitly enabled.
  if (process.env.HFG_ALLOW_SAME_HOST_ORIGIN === "true") {
    const host = request.headers.get("host");
    return Boolean(host) && (origin === `https://${host}` || (!isProd && origin === `http://${host}`));
  }
  return false;
}

export function noStoreHeaders(extra = {}) {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    ...extra,
  };
}

export function plainError(status, code, message, extraHeaders = {}) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: noStoreHeaders(extraHeaders) },
  );
}

export async function readJsonBody(request, maxBytes = 64 * 1024) {
  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().startsWith("application/json")) return { error: "content_type" };
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) return { error: "too_large" };
  const text = await request.text();
  if (text.length > maxBytes) return { error: "too_large" };
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "shape" };
    return { value };
  } catch {
    return { error: "json" };
  }
}

export function log(level, event, fields = {}) {
  // Structured, PII-free logs. Never pass tokens, phone numbers or emails here.
  const line = JSON.stringify({ level, event, ts: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
