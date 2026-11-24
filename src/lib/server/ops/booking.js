import "server-only";
import { upstream, UpstreamError } from "@/lib/server/upstream";
import { istToday, v } from "@/lib/server/validate";
import { openIntent, sealIntent } from "@/lib/secure/server-crypto";
import { claimOnce } from "@/lib/secure/store";
import { log } from "@/lib/secure/http";

/* ---------------------------------------------------------------- cache */
const cache = new Map();
export async function cached(key, ttlMs, loader) {
  const hitEntry = cache.get(key);
  if (hitEntry && hitEntry.exp > Date.now()) return hitEntry.value;
  const value = await loader();
  cache.set(key, { value, exp: Date.now() + ttlMs });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return value;
}

/* ------------------------------------------------------- sanitisers */
// The vendor listing endpoint also returns owner names, emails and phone
// numbers. The public website only ever receives what a player needs.
export function publicCafe(raw) {
  const address = raw.address || {};
  return {
    id: raw.vendor_id,
    name: raw.cafe_name || raw.display_name || "Gaming cafe",
    area: [address.addressLine2, address.state].filter(Boolean).join(", "),
    addressLine: [address.addressLine1, address.addressLine2].filter(Boolean).join(", "),
    pincode: address.pincode || "",
    state: address.state || "",
    lat: Number(address.latitude) || null,
    lng: Number(address.longitude) || null,
    opens: raw.opening_time || null,
    closes: raw.closing_time || null,
    amenities: (raw.amenities || []).filter((a) => a.available).map((a) => a.name).slice(0, 12),
    images: (raw.images || []).map((img) => img.url).filter((u) => typeof u === "string" && u.startsWith("https://")).slice(0, 8),
    payAtCafe: Boolean(raw.accepted_payment_methods?.pay_in_cafe),
  };
}

function toCompactDate(isoDate) {
  return isoDate.replaceAll("-", "");
}

async function quote({ vendorId, gameId, date, slotIds }, requestId) {
  // Server-side price: the browser never tells us what to charge. Client
  // controlled fields such as waive_off_amount are deliberately not forwarded.
  const { data } = await upstream("booking", "/api/bookings/pricing-preview", {
    method: "POST",
    body: { vendor_id: vendorId, game_id: gameId, book_date: date, slot_id: slotIds },
    requestId,
  });
  if (!data?.success) {
    const e = new Error(data?.message || "Pricing is unavailable for these slots.");
    e.status = 409;
    throw e;
  }
  const breakdown = (data.slot_breakdown || []).map((s) => ({
    slotId: s.slot_id,
    start: s.start_time,
    end: s.end_time,
    amount: s.slot_final_amount,
    canBook: s.can_book !== false,
  }));
  const final = Number(data.pricing_engine?.final_amount || 0);
  return {
    gameName: data.matched_game_name,
    gameId: data.matched_game_id,
    breakdown,
    subtotal: Number(data.pricing_engine?.slot_base_total || 0),
    discount: Number(data.pricing_engine?.squad_discount_amount || 0),
    appFee: Number(data.pricing_engine?.app_fee_amount || 0),
    total: Math.round(final * 100) / 100,
    allBookable: breakdown.length === slotIds.length && breakdown.every((s) => s.canBook),
  };
}

function parseBookingArgs(args) {
  return {
    vendorId: v.int(args.vendorId, "vendorId"),
    gameId: v.int(args.gameId, "gameId"),
    date: v.bookDate(args.date),
    slotIds: v.intList(args.slotIds, "slotIds", { maxItems: 12 }),
  };
}

async function releaseBookings(bookingMap, date, requestId) {
  const bookings = Object.entries(bookingMap).map(([bookingId, slotId]) => ({
    booking_id: Number(bookingId),
    slot_id: Number(slotId),
    book_date: date,
  }));
  if (!bookings.length) return;
  try {
    await upstream("booking", "/api/release_slot", { method: "POST", body: { bookings }, requestId });
  } catch (error) {
    log("warn", "booking.release_failed", { requestId, status: error.status });
  }
}

async function confirm(session, { bookingIds, paymentMode, paymentId, orderId }, requestId) {
  // Same body as HFG-frontend remote_repo.confirmBooking (+ razorpay_order_id,
  // which the backend accepts and uses to bind the payment to this order).
  const body = {
    booking_id: bookingIds,
    payment_id: paymentId,
    book_date: istToday(),
    payment_mode: paymentMode,
    use_pass: false,
    user_pass_id: null,
  };
  if (orderId) body.razorpay_order_id = orderId;
  const { data } = await upstream("booking", "/api/bookings/confirm", {
    method: "POST",
    body,
    token: session.hfg,
    requestId,
    timeoutMs: 30000,
  });
  return data;
}

function intentFor(ctx, intent) {
  const data = openIntent(v.str(intent, "intent", { max: 4000 }));
  const now = Math.floor(Date.now() / 1000);
  if (!data || data.kind !== "booking" || data.uid !== ctx.session.uid || data.exp < now) {
    const e = new Error("This checkout has expired. Please pick your slots again.");
    e.status = 409;
    throw e;
  }
  return data;
}

/* ------------------------------------------------------------- ops */
/* ------------------------------------------------------- catalogue */
/** Public cafe list, shared by the encrypted API and the server-rendered pages. */
export async function loadCafes(requestId) {
  return cached("cafes", 5 * 60_000, async () => {
    const { data } = await upstream("vendor", "/api/vendor/getAllGamingCafe", { requestId, timeoutMs: 30000 });
    return (data?.vendors || []).filter((c) => String(c.status || "").toLowerCase() !== "inactive").map(publicCafe);
  });
}

/** One cafe plus its bookable consoles and per-slot prices, or null. */
export async function loadCafeDetail(vendorId, requestId) {
  const [cafes, games] = await Promise.all([
    loadCafes(requestId),
    cached(`games:${vendorId}`, 60_000, async () => {
      const { data } = await upstream("booking", `/api/games/vendor/${vendorId}`, { requestId });
      return data || {};
    }),
  ]);
  const cafe = cafes.find((c) => c.id === vendorId);
  if (!cafe) return null;
  const consoles = (games.console_types || [])
    .filter((c) => c.bookable && c.available_game_id)
    .map((c) => {
      const game = (games.games || []).find((g) => g.id === c.available_game_id) || {};
      return {
        gameId: c.available_game_id,
        name: c.console_display_name,
        family: c.family,
        icon: c.icon,
        units: c.inventory_count,
        pricePerSlot: Number(game.single_slot_price || 0),
        multiplayer: c.supports_multiplayer,
      };
    });
  // Older vendors without a console catalog still expose plain games.
  if (!consoles.length) {
    for (const g of games.games || []) {
      consoles.push({ gameId: g.id, name: g.game_name, family: "other", units: g.total_slots, pricePerSlot: Number(g.single_slot_price || 0) });
    }
  }
  return { cafe, consoles, openToday: games.shop_open !== false };
}

export const bookingOps = {
  "cafes.list": {
    auth: "none",
    limit: { perIp: 60 },
    async run(ctx) {
      return { cafes: await loadCafes(ctx.requestId) };
    },
  },

  "cafes.detail": {
    auth: "none",
    limit: { perIp: 90 },
    async run(ctx, args) {
      const vendorId = v.int(args.vendorId, "vendorId");
      const detail = await loadCafeDetail(vendorId, ctx.requestId);
      if (!detail) {
        const e = new Error("This cafe is not taking web bookings right now.");
        e.status = 404;
        throw e;
      }
      ctx.track("Gaming Cafe Viewed", { cafe_id: vendorId });
      return detail;
    },
  },

  "slots.list": {
    auth: "none",
    limit: { perIp: 120 },
    async run(ctx, args) {
      const vendorId = v.int(args.vendorId, "vendorId");
      const gameId = v.int(args.gameId, "gameId");
      const date = v.bookDate(args.date);
      const { data } = await upstream("booking", `/api/getSlots/vendor/${vendorId}/game/${gameId}/${toCompactDate(date)}`, {
        requestId: ctx.requestId,
      });
      const slots = (data?.slots || []).map((s) => ({
        id: s.slot_id,
        start: s.start_time,
        end: s.end_time,
        available: Boolean(s.is_available) && Number(s.available_slot) > 0,
        left: Number(s.available_slot) || 0,
        price: Number(s.single_slot_price || 0),
      }));
      return { slots };
    },
  },

  "booking.quote": {
    auth: "none",
    limit: { perIp: 60 },
    async run(ctx, args) {
      const parsed = parseBookingArgs(args);
      const q = await quote(parsed, ctx.requestId);
      ctx.track("Booking Summary Viewed", { cafe_id: parsed.vendorId, game_id: parsed.gameId, slots: parsed.slotIds.length, amount: q.total });
      return q;
    },
  },

  "wallet.balance": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      const { data } = await upstream("userOnboard", "/api/users/wallet", { token: ctx.session.hfg, requestId: ctx.requestId });
      return { balance: Number(data?.balance || 0) };
    },
  },

  "booking.create": {
    auth: "user",
    limit: { perIp: 15, perUser: 10 },
    async run(ctx, args) {
      const parsed = parseBookingArgs(args);
      const method = v.oneOf(args.paymentMethod, "paymentMethod", ["online", "pay_at_cafe", "wallet"]);
      const q = await quote(parsed, ctx.requestId);
      if (!q.allBookable) {
        const e = new Error("Some of those slots were just taken. Please pick again.");
        e.status = 409;
        throw e;
      }
      if (method === "pay_at_cafe") {
        const cafe = (await bookingOps["cafes.list"].run(ctx)).cafes.find((c) => c.id === parsed.vendorId);
        if (!cafe?.payAtCafe) {
          const e = new Error("This cafe does not accept pay at cafe bookings.");
          e.status = 400;
          throw e;
        }
      }

      ctx.track("Booking Started", { cafe_id: parsed.vendorId, game_id: parsed.gameId, slots: parsed.slotIds.length, payment_method: method });

      // Same payload as HFG-frontend booking_summary_screen.createBookingWithSlotMap.
      const { data } = await upstream("booking", "/api/bookings", {
        method: "POST",
        token: ctx.session.hfg,
        requestId: ctx.requestId,
        body: { slot_id: parsed.slotIds, game_id: parsed.gameId, book_date: parsed.date, is_pay_at_cafe: method === "pay_at_cafe" },
      });
      const bookingMap = {};
      if (Array.isArray(data?.bookings)) {
        for (const b of data.bookings) if (b.booking_id && b.slot_id) bookingMap[b.booking_id] = b.slot_id;
      } else if (Array.isArray(data?.booking_ids)) {
        data.booking_ids.forEach((id, i) => {
          if (parsed.slotIds[i]) bookingMap[id] = parsed.slotIds[i];
        });
      }
      const bookingIds = Object.keys(bookingMap).map(Number);
      if (!bookingIds.length) {
        const e = new Error("We couldn't hold those slots. Please try again.");
        e.status = 409;
        throw e;
      }

      if (method === "pay_at_cafe") {
        ctx.track("Booking Confirmed", { booking_id: bookingIds[0], payment_method: "pay_at_cafe", amount: q.total, status: "pending_acceptance" });
        return { status: "pending_acceptance", bookingIds, total: q.total };
      }

      if (method === "wallet") {
        try {
          await confirm(ctx.session, { bookingIds, paymentMode: "wallet", paymentId: `WALLET_${Date.now()}` }, ctx.requestId);
        } catch (error) {
          await releaseBookings(bookingMap, parsed.date, ctx.requestId);
          ctx.track("Payment Failed", { reason: "wallet", payment_gateway: "wallet" });
          throw error;
        }
        ctx.track("Booking Confirmed", { booking_id: bookingIds[0], payment_method: "wallet", amount: q.total });
        return { status: "confirmed", bookingIds, total: q.total };
      }

      // Online payment: create the Razorpay order for the server-computed total.
      const amountPaise = Math.round(q.total * 100);
      if (!(amountPaise > 0)) {
        await releaseBookings(bookingMap, parsed.date, ctx.requestId);
        const e = new Error("Nothing to pay for these slots. Please contact the cafe.");
        e.status = 409;
        throw e;
      }
      let order;
      try {
        ({ data: order } = await upstream("booking", "/api/create_order", {
          method: "POST",
          token: ctx.session.hfg,
          requestId: ctx.requestId,
          body: { amount: amountPaise, currency: "INR", receipt: `web_${Date.now()}` },
        }));
      } catch (error) {
        await releaseBookings(bookingMap, parsed.date, ctx.requestId);
        throw error;
      }
      if (!order?.id || Number(order.amount) !== amountPaise) {
        await releaseBookings(bookingMap, parsed.date, ctx.requestId);
        const e = new Error("Payment could not be started. Please try again.");
        e.status = 502;
        throw e;
      }
      const intent = sealIntent({
        kind: "booking",
        uid: ctx.session.uid,
        bookingMap,
        vendorId: parsed.vendorId,
        gameId: parsed.gameId,
        date: parsed.date,
        orderId: order.id,
        amount: amountPaise,
        exp: Math.floor(Date.now() / 1000) + 20 * 60,
      });
      ctx.track("Payment Initiated", { booking_id: bookingIds[0], amount: q.total, payment_method_selected: "razorpay" });
      return {
        status: "payment_required",
        intent,
        total: q.total,
        checkout: {
          key: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          orderId: order.id,
          amount: amountPaise,
          currency: "INR",
          name: "Hash For Gamers",
          description: `${q.gameName || "Gaming"} booking`,
          prefill: { name: ctx.session.name || "", email: ctx.session.email || "", contact: ctx.session.phone || "" },
        },
      };
    },
  },

  "booking.confirmPayment": {
    auth: "user",
    limit: { perIp: 20, perUser: 10 },
    async run(ctx, args) {
      const intent = intentFor(ctx, args.intent);
      const rp = v.object(args.razorpay, "razorpay");
      const paymentId = v.str(rp.paymentId, "paymentId", { max: 40, pattern: /^pay_[A-Za-z0-9]+$/ });
      const orderId = v.str(rp.orderId, "orderId", { max: 40, pattern: /^order_[A-Za-z0-9]+$/ });
      const signature = v.str(rp.signature, "signature", { max: 128, pattern: /^[a-f0-9]{64}$/ });
      if (orderId !== intent.orderId) {
        const e = new Error("Payment does not match this checkout.");
        e.status = 400;
        throw e;
      }
      if (!(await claimOnce(`confirm:${orderId}`, 90))) {
        const e = new Error("We're already confirming this payment. Check My Bookings in a moment.");
        e.status = 409;
        throw e;
      }
      const bookingIds = Object.keys(intent.bookingMap).map(Number);

      // 1) Capture (backend verifies the Razorpay HMAC signature + ownership).
      try {
        await upstream("booking", "/api/capture_payment", {
          method: "POST",
          token: ctx.session.hfg,
          requestId: ctx.requestId,
          body: { razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature },
        });
      } catch (error) {
        if (error instanceof UpstreamError && error.status >= 400 && error.status < 500) {
          await releaseBookings(intent.bookingMap, intent.date, ctx.requestId);
        }
        ctx.track("Payment Failed", { reason: "capture", payment_gateway: "razorpay" });
        throw error;
      }
      ctx.track("Payment Success", { transaction_id: paymentId, booking_id: bookingIds[0], payment_gateway: "razorpay" });

      // 2) Confirm the bookings against the captured payment.
      try {
        await confirm(ctx.session, { bookingIds, paymentMode: "gateway", paymentId, orderId }, ctx.requestId);
      } catch (error) {
        // Money was captured. Releasing slots here would charge the player
        // for nothing, so ambiguous failures are left for reconciliation.
        log("error", "booking.confirm_after_capture_failed", { requestId: ctx.requestId, status: error.status });
        return {
          status: "needs_attention",
          message: "Payment received. We're finalising your booking - it will appear in My Bookings shortly. If it doesn't, contact support with your payment id.",
          paymentId,
        };
      }
      ctx.track("Booking Confirmed", { booking_id: bookingIds[0], payment_method: "razorpay", amount: intent.amount / 100 });
      return { status: "confirmed", bookingIds, total: intent.amount / 100 };
    },
  },

  "booking.abandon": {
    auth: "user",
    limit: { perIp: 20 },
    async run(ctx, args) {
      const intent = intentFor(ctx, args.intent);
      await releaseBookings(intent.bookingMap, intent.date, ctx.requestId);
      ctx.track("Payment Failed", { reason: v.optStr(args.reason, "reason", { max: 60 }) || "dismissed", payment_gateway: "razorpay" });
      return { status: "released" };
    },
  },

  "bookings.mine": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      const { data } = await upstream("booking", "/api/users/bookings?compact=true&limit=50", {
        token: ctx.session.hfg,
        requestId: ctx.requestId,
      });
      const rows = Array.isArray(data) ? data : data?.bookings || [];
      return { bookings: rows.slice(0, 50) };
    },
  },
};
