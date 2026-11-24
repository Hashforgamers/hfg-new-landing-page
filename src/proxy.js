import { NextResponse } from "next/server";

/*
 * Security headers for the new player flows only (booking, marketplace,
 * account, login and the secure gateway). Existing landing pages are not
 * matched and behave exactly as before.
 */

const isProd = process.env.NODE_ENV === "production";

function csp(nonce) {
  const directives = {
    "default-src": ["'self'"],
    // strict-dynamic: scripts we load (Razorpay, Firebase reCAPTCHA) inherit
    // trust from our nonce'd bundle; https: is a fallback for old browsers.
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "https:", ...(isProd ? [] : ["'unsafe-eval'"])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://*.googleapis.com",
      "https://www.google.com",
      "https://*.razorpay.com",
      ...(isProd ? [] : ["ws:", "http://localhost:*"]),
    ],
    "frame-src": [
      "https://*.razorpay.com",
      "https://*.firebaseapp.com",
      "https://www.google.com",
      "https://recaptcha.google.com",
      "https://apis.google.com",
    ],
    "media-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const text = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
  return isProd ? `${text}; upgrade-insecure-requests` : text;
}

export function proxy(request) {
  const nonce = btoa(crypto.randomUUID());
  const policy = csp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    'camera=(), microphone=(), geolocation=(self), payment=(self "https://api.razorpay.com"), usb=(), interest-cohort=()',
  );
  // Google sign-in and Razorpay use popups that must talk back to us.
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  if (isProd) response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return response;
}

export const config = {
  matcher: [
    "/login",
    "/book",
    "/book/:path*",
    "/marketplace",
    "/marketplace/:path*",
    "/account",
    "/account/:path*",
    "/api/secure/:path*",
  ],
};
