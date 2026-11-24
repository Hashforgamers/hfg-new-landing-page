import "server-only";
import crypto from "node:crypto";

/*
 * Verifies Firebase Auth ID tokens without the Admin SDK, following
 * https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
 */

const GOOGLE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

// Test harness only: both variables must be set explicitly on the server.
const JWKS_URL =
  process.env.HFG_ALLOW_TEST_OVERRIDES === "true" && process.env.FIREBASE_JWKS_URL_OVERRIDE
    ? process.env.FIREBASE_JWKS_URL_OVERRIDE
    : GOOGLE_JWKS_URL;

let jwksCache = { keys: new Map(), expiresAt: 0 };

async function loadKeys(force = false) {
  const now = Date.now();
  if (!force && jwksCache.expiresAt > now && jwksCache.keys.size) return jwksCache.keys;
  const res = await fetch(JWKS_URL, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`jwks ${res.status}`);
  const body = await res.json();
  const keys = new Map();
  for (const jwk of body.keys || []) {
    if (jwk.kty === "RSA" && jwk.kid) keys.set(jwk.kid, crypto.createPublicKey({ key: jwk, format: "jwk" }));
  }
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") || "")?.[1] || 3600);
  jwksCache = { keys, expiresAt: now + Math.min(maxAge, 6 * 3600) * 1000 };
  return keys;
}

function decodePart(part) {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

export class TokenError extends Error {}

export async function verifyFirebaseIdToken(idToken, { maxAuthAgeSeconds = 15 * 60 } = {}) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new TokenError("Firebase project is not configured");
  if (typeof idToken !== "string" || idToken.length > 4096) throw new TokenError("Malformed token");
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new TokenError("Malformed token");

  let header;
  let payload;
  try {
    header = decodePart(parts[0]);
    payload = decodePart(parts[1]);
  } catch {
    throw new TokenError("Malformed token");
  }
  if (header.alg !== "RS256" || !header.kid) throw new TokenError("Unexpected token algorithm");

  let keys = await loadKeys();
  if (!keys.has(header.kid)) keys = await loadKeys(true);
  const key = keys.get(header.kid);
  if (!key) throw new TokenError("Unknown signing key");

  const valid = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    key,
    Buffer.from(parts[2], "base64url"),
  );
  if (!valid) throw new TokenError("Bad signature");

  const now = Math.floor(Date.now() / 1000);
  const skew = 60;
  if (payload.aud !== projectId) throw new TokenError("Wrong audience");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new TokenError("Wrong issuer");
  if (typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 128) throw new TokenError("No subject");
  if (!(payload.exp > now - skew)) throw new TokenError("Token expired");
  if (!(payload.iat <= now + skew)) throw new TokenError("Token issued in the future");
  if (!(payload.auth_time <= now + skew)) throw new TokenError("Bad auth_time");
  // Web login must be fresh: a stolen long-lived refresh can't mint sessions later.
  if (now - payload.auth_time > maxAuthAgeSeconds) throw new TokenError("Sign-in is too old, please sign in again");

  return {
    uid: payload.sub,
    phone: payload.phone_number || "",
    email: payload.email_verified ? payload.email || "" : "",
    name: payload.name || "",
    picture: payload.picture || "",
    provider: payload.firebase?.sign_in_provider || "",
  };
}
