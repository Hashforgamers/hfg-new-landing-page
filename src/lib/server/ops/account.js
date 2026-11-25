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

function shapeBooking(row, cafes) {
  const game = row.slot?.gaming_type_id || {};
  const vendorId = Number(game.vendor_id) || null;
  const cafe = vendorId ? cafes.get(vendorId) : null;
  const status = bookingStatus(row.status);
  const start = hhmm(row.custom_start_time) || hhmm(row.slot?.time?.start_time);
  const end = hhmm(row.custom_end_time) || hhmm(row.slot?.time?.end_time);
  return {
    id: Number(row.booking_id),
    cafeId: vendorId,
    cafeName: cafe?.name || game.cafe_name || "Gaming cafe",
    cafeImage: cafe?.images?.[0] || "",
    cafeArea: cafe?.area || "",
    cafeHref: cafe ? cafePath(cafe) : "",
    console: game.game_name || "",
    date: row.book_date || null,
    requestedAt: row.created_at || null,
    start,
    end,
    amount: Number(game.single_slot_price) || 0,
    mode: row.booking_mode === "private" ? "Private room" : "",
    status,
    incomplete: INCOMPLETE.has(status.key),
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
  refund: "Refund",
  drop_crate: "Welcome reward",
};

function shapeTxn(t) {
  const amount = Number(t.amount) || 0;
  const type = String(t.type || "");
  const isWallet = type.startsWith("wallet_");
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

/* ------------------------------------------------------------------ ops */

export const accountOps = {
  "bookings.mine": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      const [{ data }, cafes] = await Promise.all([
        upstream("booking", "/api/users/bookings?compact=true&limit=60", { token: hfgToken(ctx), requestId: ctx.requestId }),
        cafeIndex(ctx),
      ]);
      const rows = Array.isArray(data) ? data : data?.bookings || [];
      const bookings = rows.slice(0, 60).map((r) => shapeBooking(r, cafes));
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
    async run(ctx) {
      const { data } = await upstream("userOnboard", "/api/user/available_passes", { token: hfgToken(ctx), requestId: ctx.requestId });
      return { passes: (Array.isArray(data) ? data : []).map(shapeCatalogPass) };
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
