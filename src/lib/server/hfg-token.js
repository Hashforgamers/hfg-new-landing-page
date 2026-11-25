import "server-only";
import crypto from "node:crypto";
import { log } from "@/lib/secure/http";
import { HFG_BACKEND_PUBLIC_KEY } from "@/lib/server/keys/hfg-backend-public";

/*
 * Backend bearer token for a signed-in player.
 *
 * hfg-user-onboard hands out a sign-in token whose `uuid` claim is encrypted
 * for the *app* key pair. The HFG app never sends that token on: it decrypts
 * the id and re-encrypts it with the backend public key, then signs a fresh
 * HS256 JWT ({exp, iat, uuid}) with the backends' JWT secret. hfg-booking,
 * hfg-user-onboard and hash-medusa only accept that second form, which is why
 * forwarding the raw sign-in token failed with "cannot decrypt subject".
 *
 * The website mints the same token the app does, from the HFG user id that
 * hfg-user-onboard returned for the verified Firebase identity. The public key
 * is the one shipped inside the app (not a secret); the JWT secret must match
 * JWT_SECRET_KEY on the backends and only lives in the environment.
 */

const TOKEN_TTL_SECONDS = 5 * 60 * 60; // same lifetime the app uses
const REFRESH_MARGIN_SECONDS = 10 * 60;

let cachedKey;
function backendPublicKey() {
  if (cachedKey !== undefined) return cachedKey;
  const fromEnv = (process.env.HFG_SERVICE_PUBLIC_KEY || "").replace(/\\n/g, "\n").trim();
  const pem = fromEnv || HFG_BACKEND_PUBLIC_KEY;
  try {
    cachedKey = pem ? crypto.createPublicKey(pem) : null;
  } catch {
    log("error", "hfg_token.bad_public_key", {});
    cachedKey = null;
  }
  return cachedKey;
}

function jwtSecret() {
  return process.env.HFG_SERVICE_JWT_SECRET || "";
}

export function canMintHfgToken() {
  return Boolean(jwtSecret() && backendPublicKey());
}

const b64u = (value) => Buffer.from(value).toString("base64url");

/** Mints the app-format backend token for an HFG user id. */
export function mintHfgToken(userId, now = Math.floor(Date.now() / 1000)) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid HFG user id");
  const uuid = crypto
    .publicEncrypt({ key: backendPublicKey(), padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(String(id)))
    .toString("base64");
  const exp = now + TOKEN_TTL_SECONDS;
  const head = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64u(JSON.stringify({ exp, iat: now, uuid }));
  const sig = crypto.createHmac("sha256", jwtSecret()).update(`${head}.${body}`).digest("base64url");
  return { token: `${head}.${body}.${sig}`, exp };
}

let warned = false;

/**
 * The bearer token to send to HFG backends for this request. Re-mints it when
 * it is missing, was not minted by us, or is close to expiry, and stores it
 * back in the sealed session cookie. Falls back to the sign-in token only when
 * minting is not configured (logged once, so the misconfiguration is visible).
 */
export function hfgToken(ctx) {
  const session = ctx.session;
  if (!session) return undefined;
  if (!canMintHfgToken()) {
    if (!warned) {
      warned = true;
      log("error", "hfg_token.not_configured", { hint: "set HFG_SERVICE_JWT_SECRET" });
    }
    return session.hfg;
  }
  const now = Math.floor(Date.now() / 1000);
  if (session.hfgMinted && session.hfg && Number(session.hfgExp) > now + REFRESH_MARGIN_SECONDS) return session.hfg;
  const { token, exp } = mintHfgToken(session.uid, now);
  ctx.updateSession({ hfg: token, hfgExp: exp, hfgMinted: true });
  return token;
}
