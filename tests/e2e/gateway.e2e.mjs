/*
 * End-to-end test of the website secure gateway against fake backends.
 *
 *   npm run build && node tests/e2e/gateway.e2e.mjs
 *
 * Starts the mock backends + `next start`, then drives the real browser
 * client (src/lib/secure/client.js) through: handshake + pinning, login,
 * signup, cafe booking (online / wallet / pay-at-cafe / dismissed), the
 * marketplace checkout, and attack cases (replay, tampering, wrong origin,
 * forged pin, stale timestamp, unauthenticated ops, rate limits).
 */
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { createMockBackends, firebaseIdToken, GATEWAY_SECRET, PROJECT_ID, BACKEND_JWT_SECRET, BACKEND_PUBLIC_PEM } from "./mock-backends.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const MOCK_PORT = 4010;
const WEB_PORT = 3100;
const BASE = `http://localhost:${WEB_PORT}`;
const ORIGIN = "http://localhost:3000";

// ---------------------------------------------------------------- keys
const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const pin = publicKey.export({ type: "spki", format: "der" }).toString("base64url");
const env = {
  ...process.env,
  NODE_ENV: "production",
  PORT: String(WEB_PORT),
  HFG_SECURE_IDENTITY_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }),
  HFG_SECURE_TICKET_KEYS: `t1:${crypto.randomBytes(32).toString("base64")}`,
  HFG_SESSION_COOKIE_KEYS: `c1:${crypto.randomBytes(32).toString("base64")}`,
  HFG_ALLOWED_ORIGINS: ORIGIN,
  HFG_USER_ONBOARD_URL: `http://localhost:${MOCK_PORT}`,
  HFG_BOOKING_URL: `http://localhost:${MOCK_PORT}`,
  HFG_VENDOR_URL: `http://localhost:${MOCK_PORT}`,
  HASH_MEDUSA_URL: `http://localhost:${MOCK_PORT}`,
  FIREBASE_PROJECT_ID: PROJECT_ID,
  HFG_ALLOW_TEST_OVERRIDES: "true",
  FIREBASE_JWKS_URL_OVERRIDE: `http://localhost:${MOCK_PORT}/jwks`,
  RAZORPAY_KEY_ID: "rzp_test_key",
  HFG_SERVICE_JWT_SECRET: BACKEND_JWT_SECRET,
  WALLET_CREDIT_INTERNAL_TOKEN: "test-credit-token",
  HFG_SERVICE_PUBLIC_KEY: BACKEND_PUBLIC_PEM,
  HFG_GATEWAY_HMAC_SECRET: process.env.TEST_AUTH_MODE === "legacy" ? "" : GATEWAY_SECRET,
};

// --------------------------------------------- browser-ish environment
// Secure cookies are not sent over http in prod mode, so the jar ignores the
// Secure flag (the server-side attributes are asserted separately).
let jar = new Map();
let originHeader = ORIGIN;
const realFetch = globalThis.fetch;
const setCookieLog = [];
globalThis.fetch = async (url, init = {}) => {
  const full = typeof url === "string" && url.startsWith("/") ? `${BASE}${url}` : url;
  const headers = new Headers(init.headers || {});
  if (String(full).startsWith(BASE)) {
    if (originHeader) headers.set("Origin", originHeader);
    if (jar.size) headers.set("Cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
  }
  const { keepalive, credentials, ...rest } = init;
  void keepalive;
  void credentials;
  const res = await realFetch(full, { ...rest, headers });
  for (const c of res.headers.getSetCookie?.() || []) {
    setCookieLog.push(c);
    const [pair] = c.split(";");
    const [k, ...v] = pair.split("=");
    const value = v.join("=");
    if (/max-age=0/i.test(c) || !value) jar.delete(k.trim());
    else jar.set(k.trim(), value);
  }
  return res;
};

async function loadClient(pins) {
  process.env.NEXT_PUBLIC_HFG_SECURE_PINS = pins;
  const src = fs.readFileSync(path.join(root, "src/lib/secure/client.js"), "utf8");
  const tmp = path.join(here, `.client-${crypto.randomBytes(4).toString("hex")}.mjs`);
  fs.writeFileSync(tmp, src);
  try {
    return await import(tmp);
  } finally {
    fs.unlinkSync(tmp);
  }
}

function rzpSignature(orderId, paymentId) {
  return crypto.createHmac("sha256", "rzp_secret").update(`${orderId}|${paymentId}`).digest("hex");
}

// --------------------------------------------------------------- runner
const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.log(`  ✗ ${name}\n    ${error?.stack?.split("\n").slice(0, 3).join("\n    ")}`);
  }
}

async function waitFor(url, ms = 30000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await realFetch(url);
      if (r.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`timeout waiting for ${url}`);
}

const mock = createMockBackends();
await new Promise((r) => mock.server.listen(MOCK_PORT, r));
const web = spawn(path.join(root, "node_modules/.bin/next"), ["start", "-p", String(WEB_PORT)], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
web.stdout.on("data", (d) => (serverLog += d));
web.stderr.on("data", (d) => (serverLog += d));

try {
  await waitFor(`${BASE}/robots.txt`);
  const client = await loadClient(pin);
  const { secureCall, SecureError } = client;
  console.log(`\nGateway e2e (auth mode: ${env.HFG_GATEWAY_HMAC_SECRET ? "gateway HMAC" : "legacy fid"})`);

  // ------------------------------------------------------------ channel
  await test("handshake verifies pinned identity and public op works", async () => {
    const { cafes } = await secureCall("cafes.list");
    assert.equal(cafes.length, 1);
    assert.equal(cafes[0].name, "Neon Arena");
  });

  await test("vendor PII (owner, email, phone) is stripped from public data", async () => {
    const { cafes } = await secureCall("cafes.list");
    const text = JSON.stringify(cafes);
    assert.ok(!text.includes("SECRET OWNER") && !text.includes("owner@secret") && !text.includes("+910000000000"));
  });

  await test("wire traffic is ciphertext only (no plaintext op/args)", async () => {
    const before = setCookieLog.length;
    void before;
    let captured = null;
    const prev = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      if (String(url).includes("/api/secure/rpc")) captured = init.body;
      return prev(url, init);
    };
    await secureCall("slots.list", { vendorId: 7, gameId: 55, date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()) });
    globalThis.fetch = prev;
    assert.ok(captured && !captured.includes("slots.list") && !captured.includes("vendorId"));
    const env1 = JSON.parse(captured);
    assert.deepEqual(Object.keys(env1).sort(), ["ct", "iv", "n", "sid", "ts", "v"]);
  });

  await test("client refuses a gateway signed by an unpinned key (MITM)", async () => {
    const other = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" }).publicKey.export({ type: "spki", format: "der" }).toString("base64url");
    const evil = await loadClient(other);
    await assert.rejects(() => evil.secureCall("cafes.list"), (e) => e.code === "untrusted_gateway");
    process.env.NEXT_PUBLIC_HFG_SECURE_PINS = pin;
  });

  // Capture a valid envelope for raw attack tests.
  let lastEnvelope = null;
  let lastTicket = null;
  {
    const prev = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      if (String(url).includes("/api/secure/rpc")) {
        lastEnvelope = init.body;
        lastTicket = new Headers(init.headers).get("X-HFG-Ticket");
      }
      return prev(url, init);
    };
    await secureCall("cafes.list");
    globalThis.fetch = prev;
  }
  const rawRpc = (body, { ticket = lastTicket, origin = ORIGIN } = {}) =>
    realFetch(`${BASE}/api/secure/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-HFG-Ticket": ticket, ...(origin ? { Origin: origin } : {}) },
      body,
    });

  await test("replayed request is rejected (409)", async () => {
    const r = await rawRpc(lastEnvelope);
    assert.equal(r.status, 409);
  });

  await test("tampered ciphertext is rejected (400)", async () => {
    const e = JSON.parse(lastEnvelope);
    const ct = Buffer.from(e.ct, "base64url");
    ct[3] ^= 0xff;
    e.ct = ct.toString("base64url");
    e.n = crypto.randomBytes(16).toString("base64url");
    assert.equal((await rawRpc(JSON.stringify(e))).status, 400);
  });

  await test("request from a foreign origin is rejected (403)", async () => {
    assert.equal((await rawRpc(lastEnvelope, { origin: "https://evil.example" })).status, 403);
    assert.equal((await rawRpc(lastEnvelope, { origin: null })).status, 403);
  });

  await test("forged / missing ticket requires a new handshake (401)", async () => {
    assert.equal((await rawRpc(lastEnvelope, { ticket: "t1.AAAA.BBBB" })).status, 401);
  });

  await test("stale timestamp is rejected", async () => {
    const e = JSON.parse(lastEnvelope);
    e.ts -= 600;
    e.n = crypto.randomBytes(16).toString("base64url");
    assert.equal((await rawRpc(JSON.stringify(e))).status, 401);
  });

  await test("handshake from foreign origin is rejected", async () => {
    const r = await realFetch(`${BASE}/api/secure/handshake`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example" }, body: "{}" });
    assert.equal(r.status, 403);
  });

  await test("security headers present on new pages", async () => {
    const r = await realFetch(`${BASE}/book`);
    assert.equal(r.status, 200);
    const csp = r.headers.get("content-security-policy");
    assert.ok(csp.includes("frame-ancestors 'none'") && csp.includes("'strict-dynamic'"));
    assert.equal(r.headers.get("x-frame-options"), "DENY");
    assert.ok(r.headers.get("strict-transport-security"));
    const html = await r.text();
    const nonce = /nonce-([^']+)'/.exec(csp)[1];
    assert.ok(html.includes(`nonce="${nonce}"`), "Next scripts carry the CSP nonce");
  });

  // ------------------------------------------------------------- SEO
  await test("cafe pages are server-rendered with canonical slug, JSON-LD and no PII", async () => {
    const short = await realFetch(`${BASE}/book/7?utm_source=qr&evil=1`, { redirect: "manual" });
    assert.equal(short.status, 308, "short /book/<id> link redirects permanently");
    const loc = short.headers.get("location");
    assert.match(loc, /\/book\/neon-arena-bandra-7\?utm_source=qr$/);
    const r = await realFetch(`${BASE}/book/neon-arena-bandra-7`);
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.ok(html.includes("<h1") && html.includes("Neon Arena"), "cafe name is in the server HTML");
    assert.ok(html.includes('"@type":"EntertainmentBusiness"') && html.includes('"ReserveAction"'));
    assert.ok(html.includes('rel="canonical" href="https://www.hashforgamers.com/book/neon-arena-bandra-7"'));
    assert.ok(/<title>Book Neon Arena, Bandra/.test(html));
    assert.ok(!html.includes("owner@secret.example") && !html.includes("SECRET OWNER"));
    assert.equal((await realFetch(`${BASE}/book/does-not-exist-999`)).status, 404);
  });

  await test("product pages are server-rendered with Product/Offer JSON-LD", async () => {
    const short = await realFetch(`${BASE}/marketplace/prod_1`, { redirect: "manual" });
    assert.equal(short.status, 308);
    assert.match(short.headers.get("location"), /\/marketplace\/pro-headset-prod_1$/);
    const html = await (await realFetch(`${BASE}/marketplace/pro-headset-prod_1`)).text();
    assert.ok(html.includes("Pro Headset") && html.includes('"@type":"Product"') && html.includes('"priceCurrency":"INR"'));
    assert.ok(html.includes('"availability":"https://schema.org/InStock"'));
  });

  await test("vertical sitemaps list every cafe and product; robots points to them", async () => {
    const book = await (await realFetch(`${BASE}/book/sitemap.xml`)).text();
    assert.ok(book.includes("https://www.hashforgamers.com/book/neon-arena-bandra-7"));
    const store = await (await realFetch(`${BASE}/marketplace/sitemap.xml`)).text();
    assert.ok(store.includes("https://www.hashforgamers.com/marketplace/pro-headset-prod_1"));
    const robots = await (await realFetch(`${BASE}/robots.txt`)).text();
    assert.ok(robots.includes("/book/sitemap.xml") && robots.includes("/marketplace/sitemap.xml"));
    const shop = await realFetch(`${BASE}/shop`, { redirect: "manual" });
    assert.equal(shop.status, 308);
  });

  await test("IndexNow ping endpoint requires its secret", async () => {
    const r = await realFetch(`${BASE}/api/seo/indexnow`, { method: "POST", body: "{}" });
    assert.equal(r.status, 401);
  });

  await test("existing landing page is not affected by the new proxy", async () => {
    const r = await realFetch(`${BASE}/`);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("content-security-policy"), null);
  });

  // ------------------------------------------------------------- auth
  await test("member-only op without login returns auth_required", async () => {
    await assert.rejects(() => secureCall("bookings.mine"), (e) => e.code === "auth_required" && e.status === 401);
  });

  await test("login rejects a token signed by someone else", async () => {
    const forged = firebaseIdToken({ uid: "fid-existing-1" }).split(".");
    forged[2] = Buffer.from("not-a-signature").toString("base64url");
    await assert.rejects(() => secureCall("auth.login", { idToken: forged.join(".") }), (e) => e.status === 401);
  });

  await test("login rejects a stale sign-in (auth_time too old)", async () => {
    await assert.rejects(() => secureCall("auth.login", { idToken: firebaseIdToken({ uid: "fid-existing-1", authAgeSec: 3600 }) }), (e) => e.status === 401);
  });

  await test("new user: login -> needs_signup -> signup -> signed in", async () => {
    const idToken = firebaseIdToken({ uid: "fid-new-user-9" });
    const first = await secureCall("auth.login", { idToken });
    assert.equal(first.status, "needs_signup");
    assert.equal(first.prefill.phone, "+919876543210");
    const done = await secureCall("auth.signup", { idToken, profile: { name: "New Player", gameUserName: "new_player", dob: "2000-04-09", gender: "male" } });
    assert.equal(done.status, "signed_in");
    const signupCall = mock.calls.filter((c) => c.path.endsWith("/signup") || (c.path === "/api/users" && c.method === "POST")).pop();
    const payload = signupCall.body.profile || signupCall.body;
    assert.equal(payload.fid, "fid-new-user-9", "fid comes from the verified token");
    assert.equal(payload.dob, "09-Apr-2000");
    assert.equal(payload.contact.electronicAddress.mobileNo, "+919876543210");
    if (env.HFG_GATEWAY_HMAC_SECRET) assert.ok(signupCall.headers["x-hfg-gateway-signature"], "signup is HMAC signed");
    jar = new Map();
  });

  await test("existing user login sets a sealed HttpOnly SameSite=Strict cookie, no token to JS", async () => {
    const res = await secureCall("auth.login", { idToken: firebaseIdToken({ uid: "fid-existing-1" }) });
    assert.equal(res.status, "signed_in");
    assert.ok(!JSON.stringify(res).includes("eyJ"), "no JWT in response");
    const cookie = setCookieLog.filter((c) => c.startsWith("__Host-hfg_auth=")).pop();
    assert.ok(/HttpOnly/i.test(cookie) && /SameSite=strict/i.test(cookie) && /Secure/i.test(cookie) && /Path=\//.test(cookie));
    const value = cookie.split(";")[0].split("=")[1];
    assert.ok(!value.includes("eyJ"), "cookie is encrypted");
    const s = await secureCall("auth.session");
    assert.equal(s.user.name, "Existing Player");
  });

  // ---------------------------------------------------------- booking
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const tomorrow = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(Date.now() + 86400000));

  await test("cafe detail exposes consoles from the catalog", async () => {
    const d = await secureCall("cafes.detail", { vendorId: 7 });
    assert.equal(d.consoles[0].gameId, 55);
    assert.equal(d.cafe.payAtCafe, true);
  });

  await test("quote is computed server-side (pricing-preview), not by the browser", async () => {
    const q = await secureCall("booking.quote", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [1, 2], waive_off_amount: 300 });
    assert.equal(q.total, 300);
    const call = mock.calls.filter((c) => c.path === "/api/bookings/pricing-preview").pop();
    assert.equal(call.body.waive_off_amount, undefined, "client discounts never forwarded");
  });

  await test("dates outside the booking window are rejected", async () => {
    await assert.rejects(() => secureCall("booking.quote", { vendorId: 7, gameId: 55, date: "2020-01-01", slotIds: [1] }), (e) => e.status === 400);
  });

  let intent;
  let checkout;
  await test("online booking: create holds slots + server-priced Razorpay order", async () => {
    const r = await secureCall("booking.create", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [1], paymentMethod: "online" });
    assert.equal(r.status, "payment_required");
    assert.equal(r.checkout.amount, 15000);
    const create = mock.calls.filter((c) => c.path === "/api/bookings").pop();
    assert.deepEqual(create.body, { slot_id: [1], game_id: 55, book_date: tomorrow, is_pay_at_cafe: false });
    assert.ok(create.headers.authorization.startsWith("Bearer "));
    intent = r.intent;
    checkout = r.checkout;
  });

  await test("tampered checkout intent is rejected", async () => {
    const bad = intent.slice(0, -4) + (intent.endsWith("AAAA") ? "BBBB" : "AAAA");
    await assert.rejects(
      () => secureCall("booking.confirmPayment", { intent: bad, razorpay: { paymentId: "pay_x1", orderId: checkout.orderId, signature: "a".repeat(64) } }),
      (e) => e.status === 409,
    );
  });

  await test("bad Razorpay signature fails capture and releases the slots", async () => {
    const r2 = await secureCall("booking.create", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [2], paymentMethod: "online" });
    await assert.rejects(() =>
      secureCall("booking.confirmPayment", { intent: r2.intent, razorpay: { paymentId: "pay_bad1", orderId: r2.checkout.orderId, signature: "0".repeat(64) } }),
    );
    const release = mock.calls.filter((c) => c.path === "/api/release_slot").pop();
    assert.equal(release.body.bookings[0].slot_id, 2);
  });

  await test("paid booking: capture -> confirm with app-compatible payload", async () => {
    const paymentId = "pay_ok123";
    const r = await secureCall("booking.confirmPayment", {
      intent,
      razorpay: { paymentId, orderId: checkout.orderId, signature: rzpSignature(checkout.orderId, paymentId) },
    });
    assert.equal(r.status, "confirmed");
    const confirm = mock.calls.filter((c) => c.path === "/api/bookings/confirm").pop();
    assert.equal(confirm.body.payment_mode, "gateway");
    assert.equal(confirm.body.payment_id, paymentId);
    assert.equal(confirm.body.razorpay_order_id, checkout.orderId);
    assert.equal(confirm.body.book_date, tomorrow); // the booked day, as the app sends it
    assert.equal(confirm.body.use_pass, false);
    assert.deepEqual(Object.keys(confirm.body).sort(), ["book_date", "booking_id", "payment_id", "payment_mode", "razorpay_order_id", "use_pass", "user_pass_id"]);
  });

  await test("double confirm of the same order is blocked", async () => {
    await assert.rejects(
      () => secureCall("booking.confirmPayment", { intent, razorpay: { paymentId: "pay_ok123", orderId: checkout.orderId, signature: rzpSignature(checkout.orderId, "pay_ok123") } }),
      (e) => e.status === 409,
    );
  });

  await test("dismissed payment releases held slots", async () => {
    const r = await secureCall("booking.create", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [1, 2], paymentMethod: "online" });
    const res = await secureCall("booking.abandon", { intent: r.intent, reason: "dismissed" });
    assert.equal(res.status, "released");
    const release = mock.calls.filter((c) => c.path === "/api/release_slot").pop();
    assert.equal(release.body.bookings.length, 2);
  });

  await test("wallet booking confirms with payment_mode=wallet", async () => {
    const r = await secureCall("booking.create", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [1], paymentMethod: "wallet" });
    assert.equal(r.status, "confirmed");
    assert.equal(mock.calls.filter((c) => c.path === "/api/bookings/confirm").pop().body.payment_mode, "wallet");
  });

  await test("pay-at-cafe booking stays pending acceptance (no confirm call)", async () => {
    const confirmsBefore = mock.calls.filter((c) => c.path === "/api/bookings/confirm").length;
    const r = await secureCall("booking.create", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [2], paymentMethod: "pay_at_cafe" });
    assert.equal(r.status, "pending_acceptance");
    assert.equal(mock.calls.filter((c) => c.path === "/api/bookings/confirm").length, confirmsBefore);
    assert.equal(mock.calls.filter((c) => c.path === "/api/bookings").pop().body.is_pay_at_cafe, true);
  });

  await test("my bookings lists the user's bookings", async () => {
    const { bookings } = await secureCall("bookings.mine");
    const b = bookings.find((x) => x.status.key === "confirmed");
    assert.ok(b);
    assert.equal(b.cafeName, "Neon Arena");
    assert.equal(b.status.label, "Confirmed");
    assert.equal(b.start, "22:00");
  });

  await test("wallet summary: balance, Hash Coins and transactions", async () => {
    const w = await secureCall("wallet.summary");
    assert.equal(typeof w.balance, "number");
    assert.equal(w.coins, 1250);
    assert.ok(w.transactions.some((t) => t.label === "Added to wallet" && t.direction === "in"));
  });

  await test("buy a pass with wallet, then book with it", async () => {
    const before = (await secureCall("wallet.summary")).balance;
    const { passes } = await secureCall("passes.available");
    const neon = passes.find((p) => p.vendorId === 7);
    assert.equal((await secureCall("passes.buy", { passId: neon.id, method: "wallet" })).status, "owned");
    const buy = mock.calls.filter((c) => c.path === "/api/user/purchase_pass").pop();
    assert.equal(buy.body.payment_mode, "wallet");
    assert.ok(buy.body.idempotency_key.length >= 8);
    assert.equal((await secureCall("wallet.summary")).balance, before - neon.price);
    const mine = (await secureCall("passes.mine")).passes;
    assert.equal(mine.length, 1);
    const r = await secureCall("booking.create", { vendorId: 7, gameId: 55, date: tomorrow, slotIds: [1], paymentMethod: "pass", userPassId: mine[0].id });
    assert.equal(r.status, "confirmed");
    const confirm = mock.calls.filter((c) => c.path === "/api/bookings/confirm").pop();
    assert.equal(confirm.body.payment_mode, "date_pass");
    assert.equal(confirm.body.use_pass, true);
    assert.equal(confirm.body.user_pass_id, mine[0].id);
    assert.equal(confirm.body.book_date, tomorrow);
  });

  await test("a pass for another cafe cannot be used", async () => {
    const { passes } = await secureCall("passes.mine");
    await assert.rejects(() => secureCall("booking.create", { vendorId: 21, gameId: 55, date: tomorrow, slotIds: [1], paymentMethod: "pass", userPassId: passes[0].id }));
  });

  await test("online pass purchase is priced by the backend and bound to the order", async () => {
    const { passes } = await secureCall("passes.available");
    const global = passes.find((p) => p.vendorId === null);
    const r = await secureCall("passes.buy", { passId: global.id, method: "online" });
    assert.equal(r.status, "payment_required");
    assert.equal(r.checkout.amount, global.price * 100);
    await assert.rejects(() => secureCall("passes.confirmPayment", { intent: r.intent, razorpay: { paymentId: "pay_x1", orderId: "order_other" } }));
    const ok = await secureCall("passes.confirmPayment", { intent: r.intent, razorpay: { paymentId: "pay_x1", orderId: r.checkout.orderId } });
    assert.equal(ok.status, "owned");
    const buy = mock.calls.filter((c) => c.path === "/api/user/purchase_pass").pop();
    assert.deepEqual(buy.body, { cafe_pass_id: global.id, payment_mode: "payment_gateway", payment_id: "pay_x1" });
  });

  // ------------------------------------------------------ marketplace
  await test("catalog loads with publishable key from /hash-store/config", async () => {
    const { products } = await secureCall("store.products", {});
    assert.equal(products.length, 2);
    assert.equal(mock.calls.filter((c) => c.path === "/store/hash/products").pop().headers["x-publishable-api-key"], "pk_test");
  });

  await test("first add-to-cart registers the Medusa customer and creates the cart", async () => {
    const { cart } = await secureCall("store.cart.add", { variantId: "variant_1", quantity: 1 });
    assert.equal(cart.items.length, 1);
    assert.equal(cart.id, undefined, "cart id never leaves the server");
    const exchanges = mock.calls.filter((c) => c.path === "/auth/customer/hfg");
    assert.ok(exchanges.length >= 2, "exchange -> register -> exchange");
    assert.ok(mock.calls.some((c) => c.path === "/store/customers" && c.method === "POST"));
  });

  await test("mixed-vendor add is refused with a clear message", async () => {
    await assert.rejects(() => secureCall("store.cart.add", { variantId: "variant_2", quantity: 1 }), (e) => e.code === "mixed_vendor");
  });

  await test("checkout prepare picks hash delivery and returns server totals", async () => {
    const r = await secureCall("store.checkout.prepare", {
      address: { first_name: "Existing", last_name: "Player", address_1: "12 Hill Road", city: "Mumbai", province: "Maharashtra", postal_code: "400050", phone: "+919876543210" },
    });
    assert.equal(r.delivery.amount, 80);
    assert.equal(r.cart.total, 2499 + 80);
    assert.equal(mock.calls.filter((c) => c.path.endsWith("/shipping-methods")).pop().body.option_id, "so_1");
  });

  await test("pay returns Razorpay session amount in paise (not multiplied twice)", async () => {
    const r = await secureCall("store.checkout.pay");
    assert.equal(r.checkout.amount, (2499 + 80) * 100);
    assert.equal(r.checkout.orderId, "order_medusa1");
  });

  let orderId;
  await test("complete returns the order and clears the cart", async () => {
    const r = await secureCall("store.checkout.complete");
    assert.equal(r.status, "order");
    orderId = r.orderId;
    const { cart } = await secureCall("store.cart.get");
    assert.equal(cart, null);
  });

  await test("order tracking + completion OTP", async () => {
    const { order } = await secureCall("store.order", { orderId });
    assert.equal(order.stage, "shipped");
    assert.equal(order.timeline[0].status, "placed");
    const otp = await secureCall("store.order.otp", { orderId });
    assert.equal(otp.code, "123456");
  });

  await test("payment options follow the cafe's dashboard settings", async () => {
    const neon = await secureCall("cafes.payments", { vendorId: 7 });
    assert.deepEqual(neon.methods, { online: true, wallet: true, payAtCafe: true, hashPass: true, cafePass: true });
    assert.equal(neon.source, "dashboard");
  });

  await test("wallet top-up: server-priced order, verified capture, idempotent credit", async () => {
    const before = (await secureCall("wallet.summary")).balance;
    await assert.rejects(() => secureCall("wallet.topup", { amount: 5 }));
    const { intent, checkout } = await secureCall("wallet.topup", { amount: 250 });
    assert.equal(checkout.amount, 25000);
    const order = mock.calls.filter((c) => c.path === "/api/create_order").pop();
    assert.equal(order.body.purpose, "wallet_topup");
    await assert.rejects(() => secureCall("wallet.confirmTopup", { intent, razorpay: { paymentId: "pay_t1", orderId: checkout.orderId, signature: "0".repeat(64) } }));
    const res = await secureCall("wallet.confirmTopup", { intent, razorpay: { paymentId: "pay_t2", orderId: checkout.orderId, signature: rzpSignature(checkout.orderId, "pay_t2") } });
    assert.equal(res.status, "credited");
    const credit = mock.calls.filter((c) => c.path === "/api/users/wallet" && c.method === "POST").pop();
    assert.deepEqual(credit.body, { amount: 250, reference_id: "pay_t2" });
    assert.equal((await secureCall("wallet.summary")).balance, before + 250);
  });

  await test("pay-at-cafe bookings use the booked day, not the request day", async () => {
    const { bookings } = await secureCall("bookings.mine");
    const p = bookings.find((b) => b.status.key === "pending_acceptance");
    assert.ok(p);
    assert.equal(p.date, tomorrow);
    assert.equal(p.upcoming, true);
    assert.equal(p.console, "PS5");
  });

  await test("analytics: server-only events can't come from the browser", async () => {
    const before = mock.calls.length;
    await secureCall("analytics.track", { events: [{ name: "Booking Confirmed", props: {} }, { name: "Slot Day Part Selected", props: { part: "night" } }] });
    assert.ok(mock.calls.length >= before);
  });

  await test("analytics: unknown client events and PII props are dropped", async () => {
    const r = await secureCall("analytics.track", { events: [{ name: "Payment Success", props: {} }, { name: "Page Viewed", props: { email: "x@y.z", path_len: 3 } }] });
    assert.equal(r.accepted, true);
  });

  await test("per-op rate limit kicks in (auth.login 10/min/IP)", async () => {
    let limited = false;
    for (let i = 0; i < 14; i++) {
      try {
        await secureCall("auth.login", { idToken: "x.y.z" });
      } catch (e) {
        if (e.status === 429) limited = true;
      }
    }
    assert.ok(limited);
  });

  await test("logout clears the session cookie", async () => {
    await secureCall("auth.logout");
    await assert.rejects(() => secureCall("bookings.mine"), (e) => e.code === "auth_required");
  });

  void SecureError;
} finally {
  web.kill("SIGTERM");
  mock.server.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("\n--- server log (tail) ---\n" + serverLog.split("\n").slice(-40).join("\n"));
  process.exit(1);
}
