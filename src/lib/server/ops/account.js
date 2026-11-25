import "server-only";
import crypto from "node:crypto";
import { upstream, UpstreamError } from "@/lib/server/upstream";
import { istToday, v } from "@/lib/server/validate";
import { openIntent, sealIntent } from "@/lib/secure/server-crypto";
import { claimOnce } from "@/lib/secure/store";
import { hfgToken } from "@/lib/server/hfg-token";
import { cafePath } from "@/lib/verticals";
import { bookingOps } from "./booking";

/*
 * Account data the HFG app shows: bookings with cafe details, Hash Wallet,
 * Hash Coins and passes. Same endpoints and payloads as HFG-frontend
 * (api_endpoints.dart / remote_repo.dart), read-only there.
 */

/* ------------------------------------------------------------ bookings */

const STATUS = {
  confirmed: ["Confirmed", "success"],
  booked: ["Confirmed", "success"],
  checked_in: ["Checked in", "success"],
  in_progress: ["Playing now", "success"],
  completed: ["Completed", "neutral"],
  pending_acceptance: ["Awaiting cafe", "warn"],
  pending: ["Payment pending", "warn"],
  pending_verified: ["Payment pending", "warn"],
  pending_payment: ["Payment pending", "warn"],
  verification_failed: ["Not completed", "muted"],
  payment_failed: ["Payment failed", "muted"],
  abandoned: ["Not completed", "muted"],
  expired: ["Expired", "muted"],
  rejected: ["Declined by cafe", "danger"],
  declined: ["Declined by cafe", "danger"],
  cancelled: ["Cancelled", "danger"],
  canceled: ["Cancelled", "danger"],
  no_show: ["Missed", "danger"],
};
const INCOMPLETE = new Set(["verification_failed", "payment_failed", "abandoned", "expired"]);

export function bookingStatus(raw) {
  const key = String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const [label, tone] = STATUS[key] || [key ? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "Unknown", "neutral"];
  return { key, label, tone };
}

const hhmm = (t) => (typeof t === "string" && /^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : null);
const isoDay = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);
const istDay = (iso) => {
  // Backend timestamps without a zone are UTC.
  const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? null : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
};
const CONSOLE_NAMES = { pc: "PC", ps5: "PS5", ps4: "PS4", xbox: "Xbox", vr: "VR", racing: "Racing sim", nintendo: "Nintendo Switch", switch: "Nintendo Switch" };
export function consoleName(raw) {
  const key = String(raw || "").trim().toLowerCase();
  if (!key) return "";
  return CONSOLE_NAMES[key] || key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bPs(\d)\b/g, "PS$1");
}
// Still open on the cafe side: these become "Missed" or "Not accepted" once the slot is over.
const OPEN = new Set(["confirmed", "booked", "checked_in", "in_progress", "pending_acceptance", "pending", "pending_verified", "pending_payment"]);

function shapeBooking(row, cafes) {
  const game = row.slot?.gaming_type_id || {};
  const vendorId = Number(game.vendor_id) || null;
  const cafe = vendorId ? cafes.get(vendorId) : null;
  const status = bookingStatus(row.status);
  const start = hhmm(row.custom_start_time) || hhmm(row.slot?.time?.start_time);
  const end = hhmm(row.custom_end_time) || hhmm(row.slot?.time?.end_time);
  // slot_date: the booked day (hfg-booking adds it; pay-at-cafe rows have no
  // transaction, so book_date is empty). Like the cafe dashboard, fall back
  // to the day the booking was made.
  const date = isoDay(row.slot_date) || isoDay(row.book_date) || (row.created_at ? istDay(row.created_at) : null);
  const dateKnown = Boolean(isoDay(row.slot_date) || isoDay(row.book_date));
  // Slots are calendar times on that date; an end at/after midnight rolls to the next day.
  const endsAt = date && (end || start) ? `${date}T${end && start && end <= start ? "23:59" : end || start}:00+05:30` : null;
  const over = endsAt ? Date.parse(endsAt) < Date.now() : true;
  if (over && status.key === "pending_acceptance") Object.assign(status, { label: "Not accepted", tone: "muted" });
  else if (over && ["pending", "pending_verified", "pending_payment"].includes(status.key)) Object.assign(status, { label: "Not completed", tone: "muted" });
  const upcoming = !over && OPEN.has(status.key);
  return {
    id: Number(row.booking_id),
    cafeId: vendorId,
    cafeName: cafe?.name || game.cafe_name || "Gaming cafe",
    cafeImage: cafe?.images?.[0] || "",
    cafeArea: cafe?.area || "",
    cafeHref: cafe ? cafePath(cafe) : "",
    cafeAddress: cafe?.addressLine || "",
    directions: cafe?.lat && cafe?.lng ? `https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}` : cafe?.addressLine ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${cafe.name}, ${cafe.addressLine}`)}` : "",
    console: consoleName(game.game_name),
    date,
    dateKnown,
    upcoming,
    requestedAt: row.created_at || null,
    start,
    end,
    amount: Number(game.single_slot_price) || 0,
    mode: row.booking_mode === "private" ? "Private room" : "",
    status,
    incomplete: INCOMPLETE.has(status.key) || (over && !["confirmed", "booked", "checked_in", "in_progress", "completed"].includes(status.key) && status.tone === "muted"),
  };
}

async function cafeIndex(ctx) {
  try {
    const { cafes } = await bookingOps["cafes.list"].run(ctx);
    return new Map(cafes.map((c) => [Number(c.id), c]));
  } catch {
    return new Map();
  }
}

/* -------------------------------------------------------- transactions */

const TXN_LABEL = {
  booking: "Cafe booking",
  pass_purchase: "Pass purchase",
  wallet_credit: "Added to wallet",
  wallet_debit: "Paid from wallet",
  "top-up": "Added to wallet",
  top_up: "Added to wallet",
  topup: "Added to wallet",
  refund: "Refund",
  drop_crate: "Welcome reward",
};

function shapeTxn(t) {
  const amount = Number(t.amount) || 0;
  const type = String(t.type || "");
  const isWallet = type.startsWith("wallet_") || /^top.?up$/i.test(type);
  return {
    id: String(t.id || ""),
    date: t.date || "",
    time: hhmm(t.time) || "",
    label: TXN_LABEL[type] || type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) || "Transaction",
    amount: Math.abs(amount),
    // Wallet rows are signed; other rows are money the player paid.
    direction: isWallet ? (amount >= 0 ? "in" : "out") : "out",
    via: isWallet ? "Hash Wallet" : { wallet: "Hash Wallet", payment_gateway: "Online", gateway: "Online", pay_at_cafe: "At the cafe", date_pass: "Pass", hour_pass: "Hour pass" }[t.mode] || "",
  };
}

/* --------------------------------------------------------------- passes */

function shapeOwnedPass(p) {
  return {
    id: Number(p.id),
    passId: Number(p.cafe_pass_id) || null,
    name: p.cafe_pass_name || "Pass",
    vendorId: p.vendor_id ?? null,
    vendorName: p.vendor_name || "Hash Pass",
    image: p.vendor_images?.[0]?.url || "",
    validFrom: p.valid_from || "",
    validTo: p.valid_to || "",
    type: p.pass_type || "",
    scope: p.vendor_id == null ? "hash" : "cafe",
  };
}

function shapeCatalogPass(p) {
  return {
    id: Number(p.id),
    name: p.name || "Pass",
    price: Number(p.price) || 0,
    daysValid: Number(p.days_valid) || 0,
    description: p.description || "",
    type: p.pass_type || "",
    vendorId: p.vendor_id ?? null,
    vendorName: p.vendor_name || "Hash Pass",
    image: p.vendor_images?.[0]?.url || "",
    owned: Boolean(p.is_bought),
    mode: p.pass_mode === "hour_based" ? "hour" : "date",
    totalHours: p.total_hours ?? null,
    scope: p.vendor_id == null ? "hash" : "cafe",
  };
}

async function ownedPasses(ctx) {
  const { data } = await upstream("userOnboard", "/api/user/passes", { token: hfgToken(ctx), requestId: ctx.requestId });
  return (Array.isArray(data) ? data : []).map(shapeOwnedPass);
}

async function catalogPass(ctx, passId) {
  const { data } = await upstream("userOnboard", "/api/user/available_passes", { token: hfgToken(ctx), requestId: ctx.requestId });
  const pass = (Array.isArray(data) ? data : []).map(shapeCatalogPass).find((p) => p.id === passId);
  if (!pass) {
    const e = new Error("This pass is no longer available.");
    e.status = 404;
    throw e;
  }
  return pass;
}

async function purchasePass(ctx, body) {
  // Same endpoint and body as the app (POST /api/user/purchase_pass).
  const { data } = await upstream("userOnboard", "/api/user/purchase_pass", {
    method: "POST",
    token: hfgToken(ctx),
    requestId: ctx.requestId,
    body,
    timeoutMs: 30000,
  });
  return data;
}

/* --------------------------------------------------------------- top-up */

const TOPUP_MIN = 10;
const TOPUP_MAX = 10000;
// Crediting the wallet needs user-onboard's internal credit token on this server.
const topupEnabled = () => Boolean(process.env.WALLET_CREDIT_INTERNAL_TOKEN);

/* ------------------------------------------------------------------ ops */

export const accountOps = {
  "bookings.mine": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      const [{ data }, cafes] = await Promise.all([
        upstream("booking", "/api/users/bookings?compact=true&limit=120", { token: hfgToken(ctx), requestId: ctx.requestId }),
        cafeIndex(ctx),
      ]);
      const rows = Array.isArray(data) ? data : data?.bookings || [];
      const bookings = rows.slice(0, 120).map((r) => shapeBooking(r, cafes));
      return { bookings, today: istToday() };
    },
  },

  "wallet.summary": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      const opts = { token: hfgToken(ctx), requestId: ctx.requestId };
      const [wallet, coins, txns] = await Promise.allSettled([
        upstream("userOnboard", "/api/users/wallet", opts),
        upstream("userOnboard", "/api/users/hash-coins", opts),
        upstream("userOnboard", "/api/users/transactions", opts),
      ]);
      if (wallet.status === "rejected") throw wallet.reason;
      return {
        balance: Number(wallet.value.data?.balance || 0),
        coins: coins.status === "fulfilled" ? Number(coins.value.data?.hash_coins || 0) : null,
        transactions: txns.status === "fulfilled" ? (txns.value.data?.transactions || []).slice(0, 40).map(shapeTxn) : [],
        topup: topupEnabled() ? { min: TOPUP_MIN, max: TOPUP_MAX } : null,
      };
    },
  },

  "passes.mine": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      return { passes: await ownedPasses(ctx) };
    },
  },

  "passes.available": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx, args = {}) {
      const vendorId = args.vendorId == null ? null : v.int(args.vendorId, "vendorId");
      const { data } = await upstream("userOnboard", "/api/user/available_passes", { token: hfgToken(ctx), requestId: ctx.requestId });
      let passes = (Array.isArray(data) ? data : []).map(shapeCatalogPass);
      if (vendorId != null) passes = passes.filter((p) => Number(p.vendorId) === vendorId);
      return { passes };
    },
  },

  /** Add money to Hash Wallet: Razorpay order tagged wallet_topup, like the app. */
  "wallet.topup": {
    auth: "user",
    limit: { perIp: 15, perUser: 10 },
    async run(ctx, args) {
      if (!topupEnabled()) {
        const e = new Error("Adding money on the website isn't available yet. Please top up in the Hash app.");
        e.status = 503;
        throw e;
      }
      const amount = v.int(args.amount, "amount");
      if (amount < TOPUP_MIN || amount > TOPUP_MAX) {
        const e = new Error(`Enter an amount between ₹${TOPUP_MIN} and ₹${TOPUP_MAX.toLocaleString("en-IN")}.`);
        e.status = 400;
        throw e;
      }
      ctx.track("Wallet Topup Started", { amount });
      const { data: order } = await upstream("booking", "/api/create_order", {
        method: "POST",
        token: hfgToken(ctx),
        requestId: ctx.requestId,
        body: { amount: amount * 100, currency: "INR", receipt: `wallet_rcpt_${Date.now()}`, purpose: "wallet_topup" },
      });
      if (!order?.id || Number(order.amount) !== amount * 100) {
        const e = new Error("Payment could not be started. Please try again.");
        e.status = 502;
        throw e;
      }
      const intent = sealIntent({ kind: "topup", uid: ctx.session.uid, orderId: order.id, amount, exp: Math.floor(Date.now() / 1000) + 20 * 60 });
      return {
        intent,
        checkout: {
          key: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          orderId: order.id,
          amount: order.amount,
          currency: "INR",
          name: "Hash For Gamers",
          description: "Add money to Hash Wallet",
          prefill: { name: ctx.session.name || "", email: ctx.session.email || "", contact: ctx.session.phone || "" },
        },
      };
    },
  },

  "wallet.confirmTopup": {
    auth: "user",
    limit: { perIp: 20, perUser: 10 },
    async run(ctx, args) {
      const intent = openIntent(v.str(args.intent, "intent", { max: 4000 }));
      const now = Math.floor(Date.now() / 1000);
      if (!intent || intent.kind !== "topup" || intent.uid !== ctx.session.uid || intent.exp < now) {
        const e = new Error("This checkout has expired. Please try again.");
        e.status = 409;
        throw e;
      }
      const rp = v.object(args.razorpay, "razorpay");
      const paymentId = v.str(rp.paymentId, "paymentId", { max: 40, pattern: /^pay_[A-Za-z0-9]+$/ });
      const orderId = v.str(rp.orderId, "orderId", { max: 40, pattern: /^order_[A-Za-z0-9]+$/ });
      const signature = v.str(rp.signature, "signature", { max: 128, pattern: /^[a-f0-9]{64}$/ });
      if (orderId !== intent.orderId) {
        const e = new Error("Payment does not match this checkout.");
        e.status = 400;
        throw e;
      }
      // 1) hfg-booking checks the Razorpay signature, that the order is this
      //    user's wallet_topup order, and captures it.
      await upstream("booking", "/api/capture_payment", {
        method: "POST",
        token: hfgToken(ctx),
        requestId: ctx.requestId,
        body: { razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature },
      });
      if (!(await claimOnce(`topup:${orderId}`, 90))) {
        const e = new Error("We're already adding this payment to your wallet. Check again in a moment.");
        e.status = 409;
        throw e;
      }
      // 2) Credit exactly the amount of the order we created (sealed above).
      //    reference_id makes a retry idempotent on the backend.
      try {
        const { data } = await upstream("userOnboard", "/api/users/wallet", {
          method: "POST",
          token: hfgToken(ctx),
          requestId: ctx.requestId,
          headers: { "X-Wallet-Credit-Token": process.env.WALLET_CREDIT_INTERNAL_TOKEN },
          body: { amount: intent.amount, reference_id: paymentId },
          timeoutMs: 20000,
        });
        ctx.track("Wallet Topup Completed", { amount: intent.amount });
        return { status: "credited", balance: Number(data?.new_balance ?? 0) };
      } catch (error) {
        ctx.track("Wallet Topup Failed", { amount: intent.amount, reason: error instanceof UpstreamError ? `http_${error.status}` : "error" });
        if (error instanceof UpstreamError && error.status >= 500) {
          return { status: "needs_attention", message: "Payment received. Your wallet will be updated shortly. Don't pay again." };
        }
        throw error;
      }
    },
  },

  /** Wallet: buys at once. Online: returns a Razorpay checkout for the pass price set by the backend. */
  "passes.buy": {
    auth: "user",
    limit: { perIp: 15, perUser: 10 },
    async run(ctx, args) {
      const passId = v.int(args.passId, "passId");
      const method = v.oneOf(args.method, "method", ["wallet", "online"]);
      const pass = await catalogPass(ctx, passId);
      ctx.track("Pass Purchase Started", { pass_id: passId, price: pass.price, payment_method: method });
      if (method === "wallet") {
        await purchasePass(ctx, { cafe_pass_id: passId, payment_mode: "wallet", idempotency_key: `web_${crypto.randomUUID()}` });
        ctx.track("Pass Purchased", { pass_id: passId, price: pass.price, payment_method: "wallet" });
        return { status: "owned" };
      }
      // The backend prices the order from the pass and tags it with user + pass.
      const { data: order } = await upstream("booking", "/api/create_order", {
        method: "POST",
        token: hfgToken(ctx),
        requestId: ctx.requestId,
        body: { cafe_pass_id: passId, currency: "INR" },
      });
      if (!order?.id || Number(order.amount) !== Math.round(pass.price * 100)) {
        const e = new Error("Payment could not be started. Please try again.");
        e.status = 502;
        throw e;
      }
      const intent = sealIntent({ kind: "pass", uid: ctx.session.uid, passId, orderId: order.id, amount: order.amount, exp: Math.floor(Date.now() / 1000) + 20 * 60 });
      return {
        status: "payment_required",
        intent,
        checkout: {
          key: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          orderId: order.id,
          amount: order.amount,
          currency: "INR",
          name: "Hash For Gamers",
          description: pass.name,
          prefill: { name: ctx.session.name || "", email: ctx.session.email || "", contact: ctx.session.phone || "" },
        },
      };
    },
  },

  "passes.confirmPayment": {
    auth: "user",
    limit: { perIp: 20, perUser: 10 },
    async run(ctx, args) {
      const intent = openIntent(v.str(args.intent, "intent", { max: 4000 }));
      const now = Math.floor(Date.now() / 1000);
      if (!intent || intent.kind !== "pass" || intent.uid !== ctx.session.uid || intent.exp < now) {
        const e = new Error("This checkout has expired. Please try again.");
        e.status = 409;
        throw e;
      }
      const rp = v.object(args.razorpay, "razorpay");
      const paymentId = v.str(rp.paymentId, "paymentId", { max: 40, pattern: /^pay_[A-Za-z0-9]+$/ });
      const orderId = v.str(rp.orderId, "orderId", { max: 40, pattern: /^order_[A-Za-z0-9]+$/ });
      if (orderId !== intent.orderId) {
        const e = new Error("Payment does not match this checkout.");
        e.status = 400;
        throw e;
      }
      if (!(await claimOnce(`pass:${orderId}`, 90))) {
        const e = new Error("We're already confirming this payment. Check My passes in a moment.");
        e.status = 409;
        throw e;
      }
      // The backend fetches the payment from Razorpay and checks it was captured
      // for this user, this pass and its exact price before issuing the pass.
      try {
        await purchasePass(ctx, { cafe_pass_id: intent.passId, payment_mode: "payment_gateway", payment_id: paymentId });
      } catch (error) {
        if (error instanceof UpstreamError && error.status >= 500) {
          return { status: "needs_attention", message: "Payment received. Your pass is being issued and will appear here shortly. Don't pay again." };
        }
        throw error;
      }
      ctx.track("Pass Purchased", { pass_id: intent.passId, price: intent.amount / 100, payment_method: "razorpay" });
      return { status: "owned" };
    },
  },
};

export { ownedPasses };
