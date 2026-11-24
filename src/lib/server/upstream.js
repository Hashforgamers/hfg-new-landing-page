import "server-only";
import crypto from "node:crypto";
import { hmacSha256Hex, randomId, sha256Hex } from "@/lib/secure/server-crypto";
import { log } from "@/lib/secure/http";

export const UPSTREAMS = {
  userOnboard: () => process.env.HFG_USER_ONBOARD_URL || "https://hfg-user-onboard.onrender.com",
  booking: () => process.env.HFG_BOOKING_URL || "https://hfg-booking.onrender.com",
  vendor: () => process.env.HFG_VENDOR_URL || "https://hfg-onboard.onrender.com",
  medusa: () => process.env.HASH_MEDUSA_URL || "https://hash-medusa.onrender.com",
};

export class UpstreamError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * Signs a request for the hfg-user-onboard web gateway endpoints.
 * Canonical string: METHOD \n PATH \n TS \n NONCE \n sha256(body)
 */
export function gatewayHeaders(method, path, bodyText) {
  const secret = process.env.HFG_GATEWAY_HMAC_SECRET;
  if (!secret) return null;
  const ts = String(Math.floor(Date.now() / 1000));
  const nonce = randomId(16);
  const canonical = [method.toUpperCase(), path, ts, nonce, sha256Hex(bodyText || "")].join("\n");
  return {
    "X-HFG-Gateway-Key": process.env.HFG_GATEWAY_KEY_ID || "web-1",
    "X-HFG-Gateway-Ts": ts,
    "X-HFG-Gateway-Nonce": nonce,
    "X-HFG-Gateway-Signature": hmacSha256Hex(secret, canonical),
  };
}

/**
 * JSON fetch with a hard timeout, no caching, and a request id that the
 * backends already log (X-Request-Id). Upstream error bodies are never sent
 * verbatim to the browser; callers map them to safe messages.
 */
export async function upstream(service, path, {
  method = "GET",
  body,
  token,
  headers = {},
  timeoutMs = 20000,
  signGateway = false,
  requestId = crypto.randomUUID(),
} = {}) {
  const base = UPSTREAMS[service]();
  const url = `${base}${path}`;
  const bodyText = body === undefined ? undefined : JSON.stringify(body);
  const finalHeaders = {
    Accept: "application/json",
    "X-Request-Id": requestId,
    // Backends only recognise app|dashboard|kiosk for audit attribution; the
    // website is a customer channel, so it is attributed like the app.
    "X-Client-Source": "app",
    "X-HFG-Channel": "web",
    ...headers,
  };
  if (bodyText !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (signGateway) {
    const signed = gatewayHeaders(method, new URL(url).pathname, bodyText);
    if (!signed) throw new UpstreamError(503, "Gateway signing is not configured");
    Object.assign(finalHeaders, signed);
  }

  const started = Date.now();
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: bodyText,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    log("warn", "upstream.network_error", { service, path: redactPath(path), requestId, ms: Date.now() - started, error: error?.name });
    throw new UpstreamError(503, "Service is temporarily unavailable. Please try again.");
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  log(res.ok ? "info" : "warn", "upstream.response", {
    service,
    path: redactPath(path),
    status: res.status,
    requestId,
    ms: Date.now() - started,
  });
  if (!res.ok) {
    throw new UpstreamError(res.status, safeMessage(data, res.status), data);
  }
  return { status: res.status, data, headers: res.headers };
}

function redactPath(path) {
  return path.replace(/\/fid\/[^/?]+/, "/fid/:fid").replace(/\?.*$/, "");
}

const SAFE_MESSAGES = {
  400: "The request could not be processed.",
  401: "Please sign in again.",
  403: "This action is not allowed for your account.",
  404: "Not found.",
  409: "This changed while you were checking out. Please refresh and try again.",
  429: "Too many attempts. Please wait a moment.",
};

/** Business messages from our own backends are safe to show; stack traces are not. */
function safeMessage(data, status) {
  const candidate = data && (data.message || data.error?.message || data.error || data.details);
  if (typeof candidate === "string" && candidate.length <= 200 && !/traceback|exception|sql|psycopg|stack/i.test(candidate)) {
    return candidate;
  }
  return SAFE_MESSAGES[status] || "Something went wrong. Please try again.";
}
