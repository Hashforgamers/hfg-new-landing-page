import "server-only";
import crypto from "node:crypto";

/*
 * Application-layer crypto for the website <-> Hash gateway channel.
 *
 * Handshake: ephemeral ECDH P-256 on both sides, HKDF-SHA256 into two
 * AES-256-GCM keys (client->server, server->client). The server signs the
 * handshake transcript with a long-term ECDSA P-256 identity key whose public
 * half is pinned in the website bundle, so an intercepting proxy that can
 * terminate TLS still cannot impersonate the gateway.
 *
 * Session state is stateless: derived keys are sealed into a ticket with a
 * server-only AES-256-GCM key, so any serverless instance can serve a request.
 */

export const PROTOCOL_VERSION = 1;
export const HANDSHAKE_INFO = "hfg-web-v1";
const TICKET_AAD = Buffer.from("hfg-ticket-v1");
const COOKIE_AAD = Buffer.from("hfg-cookie-v1");
const INTENT_AAD = Buffer.from("hfg-intent-v1");

export class SecureConfigError extends Error {}

export const b64u = {
  enc: (buf) => Buffer.from(buf).toString("base64url"),
  dec: (str) => {
    if (typeof str !== "string" || !/^[A-Za-z0-9_-]*$/.test(str)) {
      throw new Error("invalid base64url");
    }
    return Buffer.from(str, "base64url");
  },
};

/** Parses "kid1:base64key,kid2:base64key" (first entry = active). */
function parseKeyRing(envName) {
  const raw = process.env[envName];
  if (!raw) throw new SecureConfigError(`${envName} is not configured`);
  const ring = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [kid, value] = entry.includes(":") ? entry.split(":", 2) : ["k1", entry];
      const key = Buffer.from(value, "base64");
      if (key.length !== 32) {
        throw new SecureConfigError(`${envName} key ${kid} must be 32 bytes (base64)`);
      }
      return { kid, key };
    });
  if (!ring.length) throw new SecureConfigError(`${envName} is empty`);
  return ring;
}

const ringCache = new Map();
function keyRing(envName) {
  const raw = process.env[envName];
  const cached = ringCache.get(envName);
  if (cached && cached.raw === raw) return cached.ring;
  const ring = parseKeyRing(envName);
  ringCache.set(envName, { raw, ring });
  return ring;
}

function sealWith(envName, aad, payload) {
  const [{ kid, key }] = keyRing(envName);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.concat([aad, Buffer.from(`|${kid}`)]));
  const pt = Buffer.from(JSON.stringify(payload));
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${kid}.${b64u.enc(iv)}.${b64u.enc(Buffer.concat([ct, tag]))}`;
}

function openWith(envName, aad, sealed) {
  if (typeof sealed !== "string" || sealed.length > 8192) return null;
  const parts = sealed.split(".");
  if (parts.length !== 3) return null;
  const [kid, ivPart, ctPart] = parts;
  const entry = keyRing(envName).find((k) => k.kid === kid);
  if (!entry) return null;
  try {
    const iv = b64u.dec(ivPart);
    const data = b64u.dec(ctPart);
    if (iv.length !== 12 || data.length < 17) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", entry.key, iv);
    decipher.setAAD(Buffer.concat([aad, Buffer.from(`|${kid}`)]));
    decipher.setAuthTag(data.subarray(data.length - 16));
    const pt = Buffer.concat([decipher.update(data.subarray(0, data.length - 16)), decipher.final()]);
    return JSON.parse(pt.toString("utf8"));
  } catch {
    return null;
  }
}

export const sealTicket = (payload) => sealWith("HFG_SECURE_TICKET_KEYS", TICKET_AAD, payload);
export const openTicket = (sealed) => openWith("HFG_SECURE_TICKET_KEYS", TICKET_AAD, sealed);
export const sealCookie = (payload) => sealWith("HFG_SESSION_COOKIE_KEYS", COOKIE_AAD, payload);
export const openCookie = (sealed) => openWith("HFG_SESSION_COOKIE_KEYS", COOKIE_AAD, sealed);
export const sealIntent = (payload) => sealWith("HFG_SECURE_TICKET_KEYS", INTENT_AAD, payload);
export const openIntent = (sealed) => openWith("HFG_SECURE_TICKET_KEYS", INTENT_AAD, sealed);

let identityCache = null;
function identityKey() {
  const pem = process.env.HFG_SECURE_IDENTITY_PRIVATE_KEY;
  if (!pem) throw new SecureConfigError("HFG_SECURE_IDENTITY_PRIVATE_KEY is not configured");
  if (identityCache && identityCache.pem === pem) return identityCache;
  const normalized = pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;
  const privateKey = crypto.createPrivateKey(normalized);
  if (privateKey.asymmetricKeyDetails?.namedCurve !== "prime256v1") {
    throw new SecureConfigError("Identity key must be an EC P-256 private key");
  }
  const publicDer = crypto.createPublicKey(privateKey).export({ type: "spki", format: "der" });
  const kid = crypto.createHash("sha256").update(publicDer).digest("base64url").slice(0, 16);
  identityCache = { pem, privateKey, kid };
  return identityCache;
}

export function handshakeTranscript({ cpk, spk, cn, sn, sid, exp }) {
  return Buffer.from(
    ["hfg-hs-v1", cpk, spk, cn, sn, sid, String(exp)].join("|"),
    "utf8",
  );
}

/**
 * Server side of the key exchange. `clientPublicKey` is the raw uncompressed
 * P-256 point (65 bytes) base64url encoded.
 */
export function performHandshake({ clientPublicKey, clientNonce, ttlSeconds = 1800 }) {
  const cpkBytes = b64u.dec(clientPublicKey);
  const cnBytes = b64u.dec(clientNonce);
  if (cpkBytes.length !== 65 || cpkBytes[0] !== 0x04) throw new Error("bad client key");
  if (cnBytes.length !== 16) throw new Error("bad client nonce");

  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  // computeSecret validates that the point is on the curve.
  const shared = ecdh.computeSecret(cpkBytes);
  const spk = b64u.enc(ecdh.getPublicKey());
  const snBytes = crypto.randomBytes(16);
  const sn = b64u.enc(snBytes);

  const salt = Buffer.concat([cnBytes, snBytes]);
  const info = Buffer.from(`${HANDSHAKE_INFO}|${clientPublicKey}|${spk}`);
  const okm = Buffer.from(crypto.hkdfSync("sha256", shared, salt, info, 64));
  const kc = okm.subarray(0, 32);
  const ks = okm.subarray(32, 64);

  const sid = b64u.enc(crypto.randomBytes(16));
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const ticket = sealTicket({ v: PROTOCOL_VERSION, sid, kc: b64u.enc(kc), ks: b64u.enc(ks), exp });

  const { privateKey, kid } = identityKey();
  const sig = crypto.sign(
    "sha256",
    handshakeTranscript({ cpk: clientPublicKey, spk, cn: clientNonce, sn, sid, exp }),
    { key: privateKey, dsaEncoding: "ieee-p1363" },
  );

  return { v: PROTOCOL_VERSION, spk, sn, sid, exp, ticket, kid, sig: b64u.enc(sig) };
}

export function rpcAad({ sid, ts, n }) {
  return Buffer.from(`hfg-rpc-v1|${sid}|${ts}|${n}`, "utf8");
}

export function rpcResponseAad({ sid, n }) {
  return Buffer.from(`hfg-rpc-res-v1|${sid}|${n}`, "utf8");
}

export function decryptRequest(key, { iv, ct }, aad) {
  const ivBytes = b64u.dec(iv);
  const data = b64u.dec(ct);
  if (ivBytes.length !== 12 || data.length < 17) throw new Error("bad envelope");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBytes);
  decipher.setAAD(aad);
  decipher.setAuthTag(data.subarray(data.length - 16));
  const pt = Buffer.concat([decipher.update(data.subarray(0, data.length - 16)), decipher.final()]);
  return JSON.parse(pt.toString("utf8"));
}

export function encryptResponse(key, payload, aad) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aad);
  const ct = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(payload))), cipher.final()]);
  return { v: PROTOCOL_VERSION, iv: b64u.enc(iv), ct: b64u.enc(Buffer.concat([ct, cipher.getAuthTag()])) };
}

export function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomId(bytes = 16) {
  return b64u.enc(crypto.randomBytes(bytes));
}

export function hmacSha256Hex(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}
