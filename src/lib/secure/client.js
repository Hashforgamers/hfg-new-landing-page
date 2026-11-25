/*
 * Browser side of the Hash secure channel. Every call to the website gateway
 * is end-to-end encrypted at the application layer (on top of TLS):
 *
 *   1. ECDH P-256 key agreement with a fresh ephemeral key per tab.
 *   2. The gateway signs the handshake with its identity key; we verify it
 *      against the pinned public key(s) below before trusting the channel.
 *   3. HKDF-SHA256 derives separate AES-256-GCM keys for each direction.
 *   4. Each request carries a timestamp and a random nonce bound into the
 *      AES-GCM additional data; the gateway rejects stale or replayed calls,
 *      and each response is bound to the request nonce.
 *
 * Private keys are generated as non-extractable CryptoKeys and live only in
 * this tab's memory.
 */

const PINNED_KEYS = (process.env.NEXT_PUBLIC_HFG_SECURE_PINS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const enc = new TextEncoder();
const dec = new TextDecoder();

const b64u = {
  enc(bytes) {
    let s = "";
    const arr = new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  dec(str) {
    const pad = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
    const bin = atob(pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },
};

export class SecureError extends Error {
  constructor(message, { status = 0, code = "error" } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let channelPromise = null;
let clockOffset = 0; // server - client, seconds

const nowSeconds = () => Math.floor(Date.now() / 1000) + clockOffset;

async function importPins() {
  if (!PINNED_KEYS.length) throw new SecureError("Secure channel is not configured", { code: "no_pin" });
  return Promise.all(
    PINNED_KEYS.map((spki) =>
      crypto.subtle.importKey("spki", b64u.dec(spki), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]),
    ),
  );
}

async function handshake() {
  const pins = await importPins();
  const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
  const cpkRaw = await crypto.subtle.exportKey("raw", pair.publicKey);
  const cpk = b64u.enc(cpkRaw);
  const cnBytes = crypto.getRandomValues(new Uint8Array(16));
  const cn = b64u.enc(cnBytes);

  const doFetch = () =>
    fetch("/api/secure/handshake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify({ v: 1, cpk, cn, ts: nowSeconds() }),
    });
  let res = await doFetch();
  if (res.status === 400 && res.headers.get("x-hfg-server-time")) {
    clockOffset = Number(res.headers.get("x-hfg-server-time")) - Math.floor(Date.now() / 1000);
    res = await doFetch();
  }
  if (!res.ok) throw new SecureError("Could not open a secure connection", { status: res.status, code: "handshake_failed" });
  const hs = await res.json();
  if (typeof hs.now === "number") clockOffset = hs.now - Math.floor(Date.now() / 1000);

  // Verify the gateway's identity signature over the full transcript.
  const transcript = enc.encode(["hfg-hs-v1", cpk, hs.spk, cn, hs.sn, hs.sid, String(hs.exp)].join("|"));
  const sig = b64u.dec(hs.sig);
  let trusted = false;
  for (const pin of pins) {
    if (await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pin, sig, transcript)) {
      trusted = true;
      break;
    }
  }
  if (!trusted) throw new SecureError("Secure connection could not be verified", { code: "untrusted_gateway" });

  const spk = await crypto.subtle.importKey("raw", b64u.dec(hs.spk), { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = await crypto.subtle.deriveBits({ name: "ECDH", public: spk }, pair.privateKey, 256);
  const hkdfKey = await crypto.subtle.importKey("raw", shared, "HKDF", false, ["deriveBits"]);
  const salt = new Uint8Array(32);
  salt.set(cnBytes, 0);
  salt.set(b64u.dec(hs.sn), 16);
  const okm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: enc.encode(`hfg-web-v1|${cpk}|${hs.spk}`) },
      hkdfKey,
      512,
    ),
  );
  const kc = await crypto.subtle.importKey("raw", okm.slice(0, 32), "AES-GCM", false, ["encrypt"]);
  const ks = await crypto.subtle.importKey("raw", okm.slice(32, 64), "AES-GCM", false, ["decrypt"]);
  okm.fill(0);
  return { sid: hs.sid, exp: hs.exp, ticket: hs.ticket, kc, ks };
}

function getChannel(force = false) {
  if (force || !channelPromise) {
    channelPromise = handshake().catch((err) => {
      channelPromise = null;
      throw err;
    });
  }
  return channelPromise.then((ch) => {
    if (ch.exp - nowSeconds() < 60) {
      channelPromise = null;
      return getChannel(true);
    }
    return ch;
  });
}

async function send(ch, op, args, { keepalive = false } = {}) {
  const ts = nowSeconds();
  const n = b64u.enc(crypto.getRandomValues(new Uint8Array(16)));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aad = enc.encode(`hfg-rpc-v1|${ch.sid}|${ts}|${n}`);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    ch.kc,
    enc.encode(JSON.stringify({ op, args })),
  );
  const res = await fetch("/api/secure/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-HFG-Ticket": ch.ticket },
    credentials: "same-origin",
    cache: "no-store",
    keepalive,
    body: JSON.stringify({ v: 1, sid: ch.sid, ts, n, iv: b64u.enc(iv), ct: b64u.enc(ct) }),
  });
  if (res.status === 401) {
    const serverTime = res.headers.get("x-hfg-server-time");
    if (serverTime) clockOffset = Number(serverTime) - Math.floor(Date.now() / 1000);
    return { retry: true };
  }
  if (!res.ok) {
    let message = "Request failed";
    try {
      message = (await res.json())?.error?.message || message;
    } catch {}
    throw new SecureError(message, { status: res.status, code: res.status === 429 ? "rate_limited" : "transport" });
  }
  const envelope = await res.json();
  let plain;
  try {
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64u.dec(envelope.iv), additionalData: enc.encode(`hfg-rpc-res-v1|${ch.sid}|${n}`) },
      ch.ks,
      b64u.dec(envelope.ct),
    );
    plain = JSON.parse(dec.decode(pt));
  } catch {
    throw new SecureError("Response failed verification", { code: "tampered" });
  }
  return { plain };
}

/**
 * Calls a gateway operation. Resolves with `data`, rejects with SecureError
 * carrying the server's safe message, HTTP-like status and code.
 */
export async function secureCall(op, args = {}, opts = {}) {
  let ch = await getChannel();
  let out = await send(ch, op, args, opts);
  if (out.retry) {
    // Rejected before decryption (expired ticket / skew): safe to resend once.
    ch = await getChannel(true);
    out = await send(ch, op, args, opts);
    if (out.retry) throw new SecureError("Your secure session expired. Please refresh.", { status: 401, code: "handshake_required" });
  }
  const { plain } = out;
  if (!plain.ok) {
    // The server cleared the login (expired or rejected by a backend): let the UI show signed-out state.
    if (plain.error?.code === "auth_required" && typeof window !== "undefined") window.dispatchEvent(new Event("hfg:signed-out"));
    if (typeof window !== "undefined" && op !== "analytics.track") {
      window.dispatchEvent(new CustomEvent("hfg:api-error", { detail: { op, status: plain.status || 0, code: String(plain.error?.code || "error").slice(0, 40) } }));
    }
    throw new SecureError(plain.error?.message || "Something went wrong", { status: plain.status, code: plain.error?.code });
  }
  return plain.data;
}
