/*
 * In-process fake of hfg-user-onboard, hfg-onboard, hfg-booking, Hash Medusa
 * and Google's Firebase JWKS, implementing exactly the request/response
 * contracts the website gateway relies on. Used by gateway.e2e.mjs.
 */
import http from "node:http";
import crypto from "node:crypto";

const { privateKey: fbPriv, publicKey: fbPub } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const FB_KID = "test-kid-1";
export const PROJECT_ID = "hash-ee6fc";
export const GATEWAY_SECRET = "test-gateway-secret-test-gateway-secret";

const b64u = (b) => Buffer.from(b).toString("base64url");

export function firebaseIdToken({ uid, phone = "+919876543210", email = "", authAgeSec = 5, provider = "phone" }) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: "RS256", kid: FB_KID, typ: "JWT" }));
  const payload = b64u(
    JSON.stringify({
      iss: `https://securetoken.google.com/${PROJECT_ID}`,
      aud: PROJECT_ID,
      auth_time: now - authAgeSec,
      user_id: uid,
      sub: uid,
      iat: now - 1,
      exp: now + 3600,
      phone_number: phone,
      email,
      email_verified: Boolean(email),
      firebase: { sign_in_provider: provider },
    }),
  );
  const sig = crypto.sign("RSA-SHA256", Buffer.from(`${header}.${payload}`), fbPriv);
  return `${header}.${payload}.${b64u(sig)}`;
}

function hfgJwt(userId) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const p = b64u(JSON.stringify({ uuid: `enc-${userId}`, uid: `enc-${userId}`, iat: now, exp: now + 7200 }));
  const s = b64u(crypto.createHmac("sha256", "server-secret").update(`${h}.${p}`).digest());
  return `${h}.${p}.${s}`;
}
// Like production: user-onboard's sign-in token carries the id encrypted for
// the app key pair ("enc-<id>" here), while booking/medusa only accept the
// app-format token whose uuid is RSA-OAEP encrypted with the backend key.
const { privateKey: backendPriv, publicKey: backendPub } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
export const BACKEND_PUBLIC_PEM = backendPub.export({ type: "spki", format: "pem" });
export const BACKEND_JWT_SECRET = "server-secret";
function userFromHfg(auth) {
  const token = (auth || "").replace(/^Bearer /, "");
  try {
    const p = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    const s = b64u(crypto.createHmac("sha256", BACKEND_JWT_SECRET).update(token.split(".").slice(0, 2).join(".")).digest());
    if (s !== token.split(".")[2]) return null;
    if (!(p.exp > Date.now() / 1000)) return null;
    const id = crypto.privateDecrypt({ key: backendPriv, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(String(p.uuid), "base64"));
    return Number(id.toString());
  } catch {
    return null;
  }
}
function medusaJwt(actorId) {
  const now = Math.floor(Date.now() / 1000);
  return `${b64u(JSON.stringify({ alg: "HS256" }))}.${b64u(JSON.stringify({ actor_id: actorId, exp: now + 3600 }))}.sig`;
}

const MOCK_PASSES = [
  { id: 41, name: "Neon Monthly", price: 249, days_valid: 30, description: "Unlimited play at Neon Arena for 30 days.", pass_type: "cafe", vendor_id: 7, vendor_name: "Neon Arena", vendor_images: [{ url: "https://res.cloudinary.com/x/neon1.jpg" }], pass_mode: "date_based", total_hours: null },
  { id: 42, name: "Hash Weekender", price: 699, days_valid: 7, description: "Play at any Hash cafe for a week.", pass_type: "global", vendor_id: null, vendor_name: null, vendor_images: [], pass_mode: "date_based", total_hours: null },
];

export function createMockBackends() {
  const calls = [];
  const state = {
    users: new Map([["fid-existing-1", { id: 101, name: "Existing Player", gameUserName: "existing_1", email: "p@example.com" }]]),
    nextUserId: 200,
    bookings: new Map(),
    nextBookingId: 9000,
    orders: new Map(), // razorpay orders
    customers: new Map(), // hfg id -> customer id
    carts: new Map(),
    nonces: new Set(),
    walletBalance: process.env.MOCK_RICH ? 2000 : 500,
    medusaOrders: new Map(),
    passes: [], // owned passes
    nextPassId: 300,
    txns: [],
  };

  const verifyGateway = (req, raw) => {
    const ts = req.headers["x-hfg-gateway-ts"];
    const nonce = req.headers["x-hfg-gateway-nonce"];
    const sig = req.headers["x-hfg-gateway-signature"];
    if (!ts || !nonce || !sig) return "missing";
    if (Math.abs(Date.now() / 1000 - Number(ts)) > 60) return "stale";
    if (state.nonces.has(nonce)) return "replay";
    const path = new URL(req.url, "http://x").pathname;
    const canonical = [req.method, path, ts, nonce, crypto.createHash("sha256").update(raw || "").digest("hex")].join("\n");
    const expected = crypto.createHmac("sha256", GATEWAY_SECRET).update(canonical).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig).padEnd(expected.length).slice(0, expected.length)))) return "bad_sig";
    state.nonces.add(nonce);
    return null;
  };

  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString();
    let body = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {}
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    calls.push({ method: req.method, path, query: url.search, body, headers: req.headers });

    const send = (status, data, headers = {}) => {
      res.writeHead(status, { "Content-Type": "application/json", ...headers });
      res.end(JSON.stringify(data));
    };
    const m = (re) => path.match(re);
    let match;

    // ---------- Firebase JWKS
    if (path === "/jwks") {
      const jwk = fbPub.export({ format: "jwk" });
      return send(200, { keys: [{ ...jwk, kid: FB_KID, alg: "RS256", use: "sig" }] }, { "Cache-Control": "public, max-age=3600" });
    }

    // ---------- hfg-user-onboard
    if (req.method === "GET" && (match = m(/^\/api\/users\/fid\/([^/]+)$/))) {
      const user = state.users.get(decodeURIComponent(match[1]));
      if (!user) return send(404, { message: "User not found" });
      const token = hfgJwt(user.id);
      return send(200, { user, token }, { Authorization: `Bearer ${token}` });
    }
    if (req.method === "POST" && path === "/api/users") {
      if (state.users.has(body.fid)) return send(409, { message: "User already exists" });
      const id = state.nextUserId++;
      state.users.set(body.fid, { id, name: body.name, gameUserName: body.gameUserName, email: body.contact?.electronicAddress?.emailId });
      return send(201, { user: { id } });
    }
    if (req.method === "POST" && (path === "/api/web/auth/session" || path === "/api/web/auth/signup")) {
      const err = verifyGateway(req, raw);
      if (err) return send(401, { message: `gateway ${err}` });
      const p = JSON.parse(Buffer.from(String(body.id_token).split(".")[1], "base64url").toString());
      if (path.endsWith("/signup")) {
        if (state.users.has(p.sub)) return send(409, { message: "User already exists" });
        const id = state.nextUserId++;
        state.users.set(p.sub, { id, name: body.profile.name, gameUserName: body.profile.gameUserName });
        return send(201, { user: { id } });
      }
      const user = state.users.get(p.sub);
      if (!user) return send(404, { message: "User not found", needs_signup: true });
      return send(200, { user, token: hfgJwt(user.id) });
    }
    if (req.method === "GET" && path === "/api/users/wallet") {
      if (!userFromHfg(req.headers.authorization)) return send(401, { message: "Invalid token" });
      return send(200, { balance: state.walletBalance });
    }
    if (req.method === "GET" && path === "/api/users/hash-coins") {
      if (!userFromHfg(req.headers.authorization)) return send(401, { message: "Invalid token" });
      return send(200, { hash_coins: 1250 });
    }
    if (req.method === "GET" && path === "/api/users/transactions") {
      if (!userFromHfg(req.headers.authorization)) return send(401, { message: "Invalid token" });
      return send(200, {
        transactions: [
          ...state.txns,
          { id: 11, date: "2026-11-20", time: "18:05:00", amount: 300, type: "booking", mode: "payment_gateway", status: "success", reference_id: "pay_x" },
          { id: 10, date: "2026-11-18", time: "12:00:00", amount: 500, type: "wallet_credit", mode: "wallet", status: "success", reference_id: "w1" },
        ],
      });
    }
    if (req.method === "GET" && path === "/api/user/available_passes") {
      if (!userFromHfg(req.headers.authorization)) return send(401, { message: "Invalid token" });
      const owned = new Set(state.passes.map((p) => p.cafe_pass_id));
      return send(200, MOCK_PASSES.map((p) => ({ ...p, is_bought: owned.has(p.id) })));
    }
    if (req.method === "GET" && path === "/api/user/passes") {
      const uid = userFromHfg(req.headers.authorization);
      if (!uid) return send(401, { message: "Invalid token" });
      return send(200, state.passes.filter((p) => p.uid === uid).map(({ uid: _u, ...p }) => p));
    }
    if (req.method === "POST" && path === "/api/user/purchase_pass") {
      const uid = userFromHfg(req.headers.authorization);
      if (!uid) return send(401, { message: "Invalid token" });
      const pass = MOCK_PASSES.find((p) => p.id === body.cafe_pass_id);
      if (!pass) return send(404, { message: "Pass not found" });
      if (body.payment_mode === "wallet") {
        if (!body.idempotency_key || body.idempotency_key.length < 8) return send(400, { message: "idempotency_key required" });
        if (state.walletBalance < pass.price) return send(400, { message: "Insufficient wallet balance" });
        state.walletBalance -= pass.price;
        state.txns.unshift({ id: 99, date: "2026-11-25", time: "10:00:00", amount: -pass.price, type: "wallet_debit", mode: "wallet", status: "success" });
      } else if (body.payment_mode === "payment_gateway") {
        if (!/^pay_/.test(String(body.payment_id || ""))) return send(400, { message: "payment_id required" });
      } else return send(400, { message: "Invalid payment_mode" });
      const today = new Date().toISOString().slice(0, 10);
      const to = new Date(Date.now() + pass.days_valid * 864e5).toISOString().slice(0, 10);
      state.passes.push({ uid, id: state.nextPassId++, cafe_pass_id: pass.id, cafe_pass_name: pass.name, vendor_id: pass.vendor_id, vendor_name: pass.vendor_name, vendor_images: pass.vendor_images, valid_from: today, valid_to: to, pass_type: pass.pass_type });
      return send(200, { message: "Pass purchased" });
    }

    // ---------- hfg-onboard (vendor)
    if (path === "/api/vendor/getAllGamingCafe") {
      return send(200, {
        vendors: [
          {
            vendor_id: 7,
            cafe_name: "Neon Arena",
            owner_name: "SECRET OWNER",
            email: "owner@secret.example",
            phone: "+910000000000",
            status: "active",
            address: { addressLine1: "12 Hill Rd", addressLine2: "Bandra", pincode: "400050", state: "Maharashtra", latitude: 19.05, longitude: 72.83 },
            opening_time: "10:00:00",
            closing_time: "23:00:00",
            amenities: [{ name: "AC", available: true }],
            images: process.env.MOCK_RICH ? [1, 2, 3, 4, 5, 6].map((i) => ({ url: `https://res.cloudinary.com/x/neon${i}.jpg` })) : [{ url: "https://res.cloudinary.com/x/neon.jpg" }],
            accepted_payment_methods: { pay_in_cafe: true },
          },
          ...(process.env.MOCK_RICH ? RICH_CAFES : []),
        ],
      });
    }

    // ---------- hfg-booking
    if ((match = m(/^\/api\/games\/vendor\/(\d+)$/))) {
      return send(200, {
        games: [{ id: 55, game_name: "ps5", total_slots: 4, single_slot_price: 150 }],
        shop_open: true,
        console_types: [{ console_slug: "ps5", console_display_name: "PS5", bookable: true, available_game_id: 55, inventory_count: 4, family: "console" }],
      });
    }
    if ((match = m(/^\/api\/getSlots\/vendor\/(\d+)\/game\/(\d+)\/(\d{8})$/))) {
      return send(200, {
        slots: [
          { slot_id: 1, start_time: "22:00:00", end_time: "23:00:00", is_available: true, available_slot: 3, single_slot_price: 150 },
          { slot_id: 2, start_time: "23:00:00", end_time: "23:59:00", is_available: true, available_slot: 1, single_slot_price: 150 },
        ],
      });
    }
    if (path === "/api/bookings/pricing-preview") {
      const ids = body.slot_id || [];
      return send(200, {
        success: true,
        matched_game_id: 55,
        matched_game_name: "ps5",
        slot_breakdown: ids.map((id) => ({ slot_id: id, start_time: "22:00:00", end_time: "23:00:00", slot_final_amount: 150, can_book: true })),
        pricing_engine: { slot_base_total: 150 * ids.length, final_amount: 150 * ids.length, app_fee_amount: 0, squad_discount_amount: 0 },
      });
    }
    if (req.method === "POST" && path === "/api/bookings") {
      const uid = userFromHfg(req.headers.authorization);
      if (!uid) return send(401, { message: "Missing Authorization Bearer token" });
      const bookings = body.slot_id.map((slotId) => {
        const id = state.nextBookingId++;
        state.bookings.set(id, { id, uid, slotId, status: body.is_pay_at_cafe ? "pending_acceptance" : "pending" });
        return { booking_id: id, slot_id: slotId };
      });
      return send(200, { bookings });
    }
    if (path === "/api/create_order") {
      const uid = userFromHfg(req.headers.authorization);
      if (!uid) return send(401, { message: "Missing token" });
      const id = `order_${crypto.randomBytes(6).toString("hex")}`;
      const pass = body.cafe_pass_id ? MOCK_PASSES.find((p) => p.id === body.cafe_pass_id) : null;
      const amount = pass ? pass.price * 100 : body.amount;
      state.orders.set(id, { id, amount, uid });
      return send(200, { id, amount, currency: "INR", status: "created" });
    }
    if (path === "/api/capture_payment") {
      const { razorpay_payment_id: pid, razorpay_order_id: oid, razorpay_signature: sig } = body;
      const expected = crypto.createHmac("sha256", "rzp_secret").update(`${oid}|${pid}`).digest("hex");
      if (sig !== expected) return send(400, { message: "Invalid payment signature" });
      return send(200, { message: "Payment captured successfully" });
    }
    if (path === "/api/bookings/confirm") {
      const uid = userFromHfg(req.headers.authorization);
      if (!uid) return send(401, { message: "Token expired" });
      if (body.payment_mode === "wallet") {
        if (state.walletBalance < 150 * body.booking_id.length) return send(400, { message: "Insufficient wallet balance" });
        state.walletBalance -= 150 * body.booking_id.length;
      }
      for (const id of body.booking_id) {
        const b = state.bookings.get(id);
        if (!b || b.uid !== uid) return send(403, { message: "Booking does not belong to user" });
        b.status = "confirmed";
        b.date = body.book_date;
        b.mode = body.payment_mode;
      }
      return send(200, { message: "confirmed" });
    }
    if (path === "/api/release_slot") {
      for (const b of body.bookings) {
        const x = state.bookings.get(b.booking_id);
        if (x) x.status = "released";
      }
      return send(200, { message: `Processed ${body.bookings.length} bookings.` });
    }
    if (path === "/api/users/bookings") {
      const uid = userFromHfg(req.headers.authorization);
      if (!uid) return send(401, { message: "Invalid token" });
      // Compact rows, like GET /api/users/bookings?compact=true.
      const mine = [...state.bookings.values()].filter((b) => b.uid === uid).map((b) => ({
        booking_id: b.id,
        status: b.status,
        booking_mode: "regular",
        book_date: b.date || null,
        created_at: "2026-11-25T10:00:00",
        slot: { gaming_type_id: { game_id: 55, vendor_id: 7, game_name: "ps5", single_slot_price: 150, cafe_name: null }, time: { start_time: "22:00:00", end_time: "23:00:00" } },
      }));
      if (process.env.MOCK_RICH) {
        mine.push(
          { booking_id: 8801, status: "completed", booking_mode: "regular", book_date: "2026-11-12", created_at: "2026-11-11T09:00:00", slot: { gaming_type_id: { game_id: 56, vendor_id: 21, game_name: "pc", single_slot_price: 120, cafe_name: null }, time: { start_time: "18:00:00", end_time: "19:00:00" } } },
          { booking_id: 8800, status: "rejected", booking_mode: "regular", book_date: "2026-11-08", created_at: "2026-11-07T09:00:00", slot: { gaming_type_id: { game_id: 55, vendor_id: 7, game_name: "ps5", single_slot_price: 150, cafe_name: null }, time: { start_time: "20:00:00", end_time: "21:00:00" } } },
          { booking_id: 8799, status: "verification_failed", booking_mode: "regular", book_date: null, created_at: "2026-11-06T09:00:00", slot: { gaming_type_id: { game_id: 55, vendor_id: 7, game_name: "ps5", single_slot_price: 150, cafe_name: null }, time: { start_time: "20:00:00", end_time: "21:00:00" } } },
        );
      }
      return send(200, mine);
    }

    // ---------- Medusa
    const pk = req.headers["x-publishable-api-key"];
    if (path === "/hash-store/config") {
      return send(200, { version: 1, publishable_api_key: "pk_test", region_id: "reg_in", sales_channel_id: "sc_1", currency_code: "inr", country_code: "in" });
    }
    if (path === "/auth/customer/hfg") {
      const uid = userFromHfg(`Bearer ${body?.token}`);
      if (!uid) return send(401, { message: "Unauthorized" });
      return send(200, { token: medusaJwt(state.customers.get(uid) || "") });
    }
    if (path.startsWith("/store/") && pk !== "pk_test") return send(400, { message: "A valid publishable key is required" });
    const actor = () => {
      try {
        return JSON.parse(Buffer.from(String(req.headers.authorization).replace("Bearer ", "").split(".")[1], "base64url").toString()).actor_id;
      } catch {
        return null;
      }
    };
    if (req.method === "POST" && path === "/store/customers") {
      // The registration token has an empty actor; map via the last exchanged user.
      const lastExchange = [...calls].reverse().find((c) => c.path === "/auth/customer/hfg");
      const uid = userFromHfg(`Bearer ${lastExchange.body.token}`);
      const cid = `cus_${uid}`;
      state.customers.set(uid, cid);
      return send(200, { customer: { id: cid, ...body } });
    }
    if (path === "/store/hash/products") {
      return send(200, {
        products: [
          { product_id: "prod_1", vendor_id: "hv_a", vendor_name: "Gear Co", title: "Pro Headset", kind: "product", variant_id: "variant_1", price_inr: 2499, available: 5, thumbnail: "https://res.cloudinary.com/x/h.jpg", ...(process.env.MOCK_RICH ? RICH_HEADSET : {}) },
          { product_id: "prod_2", vendor_id: "hv_b", vendor_name: "Other Co", title: "Mouse", kind: "product", variant_id: "variant_2", price_inr: 999, available: 2, thumbnail: "" },
          ...(process.env.MOCK_RICH ? RICH_PRODUCTS : []),
        ],
        count: process.env.MOCK_RICH ? 2 + RICH_PRODUCTS.length : 2,
      });
    }
    if (path === "/store/hash/categories") {
      return send(200, { categories: process.env.MOCK_RICH ? RICH_CATEGORIES : [] });
    }
    if ((match = m(/^\/store\/products\/(prod_\w+)$/))) {
      if (!process.env.MOCK_RICH || match[1] !== "prod_1") return send(200, { product: { id: match[1], description: "Great", images: [{ url: "https://res.cloudinary.com/x/h2.jpg" }] } });
      // Visual checks: a product with colours, sizes, a gallery and specs.
      const colour = { id: "opt_c", title: "Color", values: [{ value: "Black" }, { value: "White" }, { value: "Pink" }] };
      const size = { id: "opt_s", title: "Edition", values: [{ value: "Standard" }, { value: "Pro" }] };
      const variants = [];
      let n = 0;
      for (const c of colour.values)
        for (const e of size.values)
          variants.push({
            id: n === 0 ? "variant_1" : `variant_1${n}`,
            title: `${c.value} / ${e.value}`,
            options: [{ value: c.value, option: { title: "Color" } }, { value: e.value, option: { title: "Edition" } }],
            calculated_price: { calculated_amount: e.value === "Pro" ? 3299 : 2499 },
            manage_inventory: true,
            inventory_quantity: n++ === 3 ? 0 : 7,
          });
      return send(200, {
        product: {
          id: "prod_1",
          description: "Wireless gaming headset with 7.1 surround sound.\nUp to 40 hours of battery and a detachable boom mic.",
          images: [1, 2, 3, 4, 5].map((i) => ({ url: `https://res.cloudinary.com/x/h${i}.jpg` })),
          options: [colour, size],
          variants,
          metadata: { brand: "Gear Co", connectivity: "2.4 GHz wireless, Bluetooth 5.3", battery_life: "40 hours", driver_size: "50 mm", hash_vendor_id: "hv_a" },
          weight: 280,
          material: "Aluminium and memory foam",
          origin_country: "in",
          categories: [{ name: "Headsets" }],
        },
      });
    }
    if (path.startsWith("/store/") && !actor()) return send(401, { message: "Unauthorized" });
    const cartFor = (id) => {
      const c = state.carts.get(id);
      if (!c || c.owner !== actor()) return null;
      return c;
    };
    const cartJson = (c) => {
      const subtotal = c.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      return { cart: { id: c.id, email: c.email, currency_code: "inr", items: c.items, item_subtotal: subtotal, shipping_total: c.shipping, tax_total: 0, total: subtotal + c.shipping, shipping_address: c.address, shipping_methods: c.shipping_methods, completed_at: c.completed_at } };
    };
    const prices = new Proxy({ variant_1: { price: 2499, vendor: "hv_a", title: "Pro Headset" }, variant_2: { price: 999, vendor: "hv_b", title: "Mouse" } }, {
      // Rich-mode colour SKUs of the headset share its seller and price.
      get: (t, k) => t[k] || (String(k).startsWith("variant_1") ? t.variant_1 : String(k).startsWith("variant_r") ? { price: 1999, vendor: `hv_r${String(k).slice(9)}`, title: "Gear" } : undefined),
    });
    if (req.method === "POST" && path === "/store/carts") {
      const id = `cart_${crypto.randomBytes(4).toString("hex")}`;
      const c = { id, owner: actor(), email: body.email, items: [], shipping: 0, address: null, shipping_methods: [] };
      for (const it of body.items) c.items.push({ id: `cali_${crypto.randomBytes(3).toString("hex")}`, variant_id: it.variant_id, quantity: it.quantity, unit_price: prices[it.variant_id].price, product_title: prices[it.variant_id].title });
      state.carts.set(id, c);
      return send(200, cartJson(c));
    }
    if ((match = m(/^\/store\/carts\/(cart_\w+)$/))) {
      const c = cartFor(match[1]);
      if (!c) return send(404, { message: "Cart not found" });
      if (req.method === "POST") {
        c.email = body.email;
        c.address = body.shipping_address;
      }
      return send(200, cartJson(c));
    }
    if ((match = m(/^\/store\/carts\/(cart_\w+)\/line-items$/))) {
      const c = cartFor(match[1]);
      if (!c) return send(404, { message: "Cart not found" });
      const vendor = prices[body.variant_id].vendor;
      if (c.items.some((i) => prices[i.variant_id].vendor !== vendor)) return send(400, { message: "Cart items must come from one vendor" });
      c.items.push({ id: `cali_${crypto.randomBytes(3).toString("hex")}`, variant_id: body.variant_id, quantity: body.quantity, unit_price: prices[body.variant_id].price, product_title: prices[body.variant_id].title });
      return send(200, cartJson(c));
    }
    if ((match = m(/^\/store\/carts\/(cart_\w+)\/line-items\/(cali_\w+)$/))) {
      const c = cartFor(match[1]);
      if (req.method === "DELETE") c.items = c.items.filter((i) => i.id !== match[2]);
      else c.items.find((i) => i.id === match[2]).quantity = body.quantity;
      return send(200, req.method === "DELETE" ? { deleted: true, parent: cartJson(c).cart } : cartJson(c));
    }
    if ((match = m(/^\/store\/hash\/carts\/(cart_\w+)\/delivery$/))) {
      return send(200, { vendor_id: "hv_a", vendor_name: "Gear Co", payer: "customer", provider_id: "hash_delivery_hash_delivery", shipping_option_ids: ["so_1"], missing_package_product_ids: [] });
    }
    if (path === "/store/shipping-options") return send(200, { shipping_options: [{ id: "so_legacy", provider_id: "manual_manual" }, { id: "so_1", provider_id: "hash_delivery_hash_delivery" }] });
    if (path === "/store/shipping-options/so_1/calculate") return send(200, { shipping_option: { id: "so_1", amount: 80, calculated_price: { calculated_amount: 80 } } });
    if ((match = m(/^\/store\/carts\/(cart_\w+)\/shipping-methods$/))) {
      const c = cartFor(match[1]);
      c.shipping = 80;
      c.shipping_methods = [{ id: "sm_1", shipping_option_id: body.option_id }];
      return send(200, cartJson(c));
    }
    if (path === "/store/payment-providers") return send(200, { payment_providers: [{ id: "pp_razorpay_razorpay" }, { id: "pp_system_default" }] });
    if (path === "/store/payment-collections") return send(200, { payment_collection: { id: "pay_col_1", cart_id: body.cart_id } });
    if (path === "/store/payment-collections/pay_col_1/payment-sessions") {
      const c = [...state.carts.values()].find((x) => x.owner === actor() && !x.completed_at);
      const total = c.items.reduce((s, i) => s + i.unit_price * i.quantity, 0) + c.shipping;
      return send(200, { payment_collection: { id: "pay_col_1", payment_sessions: [{ provider_id: "pp_razorpay_razorpay", data: { id: "order_medusa1", amount: total * 100, currency: "INR", key_id: "rzp_test_key" } }] } });
    }
    if ((match = m(/^\/store\/carts\/(cart_\w+)\/complete$/))) {
      const c = cartFor(match[1]);
      c.completed_at = new Date().toISOString();
      const oid = `order_${crypto.randomBytes(4).toString("hex")}`;
      state.medusaOrders.set(oid, { id: oid, owner: actor(), total: cartJson(c).cart.total });
      return send(200, { type: "order", order: { id: oid, display_id: 42, total: cartJson(c).cart.total, currency_code: "inr" } });
    }
    if (path === "/store/orders") return send(200, { orders: [...state.medusaOrders.values()].filter((o) => o.owner === actor()).map((o) => ({ id: o.id, display_id: 42, total: o.total, currency_code: "inr", items: [] })) });
    if ((match = m(/^\/store\/orders\/(order_\w+)$/))) {
      const o = state.medusaOrders.get(match[1]);
      if (!o || o.owner !== actor()) return send(404, { message: "Not found" });
      return send(200, { order: { id: o.id, display_id: 42, total: o.total, items: [] } });
    }
    if ((match = m(/^\/store\/hash\/orders\/(order_\w+)$/))) {
      const o = state.medusaOrders.get(match[1]);
      if (!o || o.owner !== actor()) return send(404, { message: "Not found" });
      return send(200, { order: { id: o.id, paid: true, completion_eligible: true }, tracking: { status: "shipped", timeline: [{ id: "placed", status: "placed", at: "2026-11-24T08:00:00Z", note: "Order placed" }] } });
    }
    if ((match = m(/^\/store\/hash\/orders\/(order_\w+)\/otp$/))) return send(200, { code: "123456", expires_at: new Date(Date.now() + 600000).toISOString(), instruction: "Share after delivery" });

    send(404, { message: `mock: no route ${req.method} ${path}` });
  });

  return { server, calls, state };
}

// Extra catalogue for visual checks only (MOCK_RICH=1); the e2e assertions use the two-item set above.
const img = (n) => `https://res.cloudinary.com/x/${n}.jpg`;
const RICH_CAFES = [
  ["Pixel Den", "off Link Road, Lokhandwala Complex, Andheri West", "Maharashtra", "11:00:00", "02:00:00"],
  ["Respawn Lounge", "Koramangala", "Karnataka", "10:00:00", "23:30:00"],
  ["Level Up Arena", "Powai", "Maharashtra", "09:00:00", "23:00:00"],
  ["Headshot Hub", "Indiranagar", "Karnataka", "12:00:00", "00:00:00"],
  ["Lag Free Zone", "Connaught Place", "Delhi", "10:00:00", "22:00:00"],
].map(([name, area, state, open, close], i) => ({
  vendor_id: 20 + i,
  cafe_name: name,
  status: "active",
  address: { addressLine1: `${10 + i} Main Road`, addressLine2: area, pincode: `4000${60 + i}`, state, latitude: 19.1, longitude: 72.9 },
  opening_time: open,
  closing_time: close,
  amenities: [{ name: "AC", available: true }, { name: "Snacks", available: true }, { name: "Parking", available: i % 2 === 0 }],
  images: i === 3 ? [] : [{ url: img(`cafe${i}`) }],
  accepted_payment_methods: { pay_in_cafe: i % 2 === 0 },
}));
// The headset as the Hash catalogue returns it: per-colour photos, SKUs, offer pricing and specifications.
const COLOURS = ["Black", "Blue", "Pink", "White"];
const RICH_HEADSET = {
  description: "56g ultra-light symmetrical design. Engineered for long sessions, with 7.1 surround sound, up to 40 hours of battery and a detachable boom mic.\nTri-mode connection: wired, Bluetooth and 2.4GHz wireless.",
  thumbnail: img("fx-headset-black-1"),
  gallery: [
    ...COLOURS.flatMap((c) => [1, 2, 3].map((n) => ({ url: img(`fx-headset-${c.toLowerCase()}-${n}`), color: c }))),
    { url: img("fx-headset-box"), color: null },
  ],
  categories: [{ id: "pcat_audio", name: "Headsets", handle: "headsets" }],
  specifications: {
    brand: "Gear Co", model: "Pro Headset X2", weight: 280, connectivity: ["Wired", "Bluetooth", "2.4GHz Wireless"], driver_size: 50,
    backlighting: "RGB", battery_capacity: 800, compatibility: ["Windows", "macOS", "Linux", "Android"], noise_cancelling: true, warranty: "1 Year",
  },
  pricing: { calculated_amount: 2499, original_amount: 2999, discount_amount: 500 },
  variants: COLOURS.map((c, i) => ({
    id: i === 0 ? "variant_1" : `variant_1${i}`,
    sku: `PH-${c.toUpperCase()}`,
    title: c,
    options: { color: c },
    images: [1, 2, 3].map((n) => img(`fx-headset-${c.toLowerCase()}-${n}`)).concat(img("fx-headset-box")),
    prices: [{ currency_code: "inr", amount: 2999 }],
    pricing: { calculated_amount: 2499, original_amount: 2999, discount_amount: 500 },
    available: i === 2 ? 0 : i === 1 ? 3 : 5,
  })),
  rating_summary: { average: 4.4, count: 128 },
};
const RICH_CATEGORIES = [
  {
    id: "pcat_audio", name: "Headsets", handle: "headsets",
    specifications: [
      ["brand", "Brand", "text"], ["model", "Model", "text"], ["weight", "Weight", "number", "g"], ["driver_size", "Driver size", "number", "mm"],
      ["connectivity", "Connectivity", "multi"], ["backlighting", "Backlighting", "select"], ["battery_capacity", "Battery Capacity", "number", "mAh"],
      ["compatibility", "Compatibility", "multi"], ["noise_cancelling", "Noise cancelling", "boolean"], ["warranty", "Warranty", "select"], ["color", "Color", "multi"],
    ].map(([key, label, type, unit = ""]) => ({ key, label, type, unit, choices: [], required: false, filterable: false, variant: key === "color" })),
  },
  { id: "pcat_input", name: "Controllers", handle: "controllers", specifications: [] },
  { id: "pcat_keys", name: "Keyboards", handle: "keyboards", specifications: [] },
  { id: "pcat_acc", name: "Accessories", handle: "accessories", specifications: [] },
  { id: "pcat_svc", name: "Services", handle: "services", specifications: [] },
];
const RICH_PRODUCTS = [
  ["Wireless Gaming Controller", 3499, "Gear Co"],
  ["Mechanical Keyboard RGB", 5299, "Keys Lab"],
  ["Gaming Mouse Pad XL", 899, "Gear Co"],
  ["7.1 Surround Headset", 4199, "Sound Arena"],
  ["PC Tune-up Service", 1499, "Fix My Rig", "service"],
  ["Streaming Webcam 1080p", 2799, "Gear Co"],
].map(([title, price, vendor, kind = "product"], i) => ({
  product_id: `prod_r${i}`,
  vendor_id: `hv_r${i}`,
  vendor_name: vendor,
  title,
  kind,
  variant_id: `variant_r${i}`,
  price_inr: price,
  available: i === 2 ? 0 : 8,
  thumbnail: img(`prod${i}`),
  rating_summary: i % 2 ? { average: 4.6, count: 23 } : { average: 4.1, count: 9 + i },
  categories: [[{ id: "pcat_input", name: "Controllers", handle: "controllers" }], [{ id: "pcat_keys", name: "Keyboards", handle: "keyboards" }], [{ id: "pcat_acc", name: "Accessories", handle: "accessories" }], [{ id: "pcat_audio", name: "Headsets", handle: "headsets" }], [{ id: "pcat_svc", name: "Services", handle: "services" }], [{ id: "pcat_acc", name: "Accessories", handle: "accessories" }]][i],
  pricing: i % 3 === 0 ? { calculated_amount: price, original_amount: Math.round(price * 1.25), discount_amount: Math.round(price * 0.25) } : { calculated_amount: price, original_amount: price, discount_amount: 0 },
  variants: (i === 0 ? ["Black", "White", "Red"] : i === 1 ? ["Black", "White"] : [null]).map((c, n) => ({ id: n ? `variant_r${i}${n}` : `variant_r${i}`, options: c ? { color: c } : {}, images: [], available: 8 })),
}));
