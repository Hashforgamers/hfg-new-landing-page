#!/usr/bin/env node
/*
 * Generates the secrets for the website secure gateway.
 *   node scripts/generate-secure-keys.mjs
 * Put the server values in the hosting provider's secret store (never commit
 * them). NEXT_PUBLIC_HFG_SECURE_PINS is public by design: it's the identity
 * public key the browser pins.
 *
 * Rotation: generate a new identity key, deploy with BOTH pins
 * (new,old) first, then switch HFG_SECURE_IDENTITY_PRIVATE_KEY, then drop the
 * old pin. Ticket/cookie key rings take "kid:base64" lists; the first entry
 * signs, all entries verify.
 */
import crypto from "node:crypto";

const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const pem = privateKey.export({ type: "pkcs8", format: "pem" });
const spki = publicKey.export({ type: "spki", format: "der" }).toString("base64url");
const kid = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const k = () => crypto.randomBytes(32).toString("base64");

console.log("# --- server-only secrets ---");
console.log(`HFG_SECURE_IDENTITY_PRIVATE_KEY="${pem.trim().replace(/\n/g, "\\n")}"`);
console.log(`HFG_SECURE_TICKET_KEYS="t${kid}:${k()}"`);
console.log(`HFG_SESSION_COOKIE_KEYS="c${kid}:${k()}"`);
console.log(`HFG_GATEWAY_HMAC_SECRET="${crypto.randomBytes(48).toString("base64url")}"`);
console.log(`HFG_LOG_SALT="${crypto.randomBytes(16).toString("base64url")}"`);
console.log("");
console.log("# --- public (bundled into the browser) ---");
console.log(`NEXT_PUBLIC_HFG_SECURE_PINS="${spki}"`);
