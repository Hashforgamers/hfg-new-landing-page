"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Car, CheckCircle2, ChevronLeft, ChevronRight, Gamepad2, Glasses, Monitor, Moon, MoonStar, Sun, Sunrise, Sunset } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { openRazorpay } from "@/lib/razorpay-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Chip, Label, Notice, Panel, SecureBadge, Spinner, Title, buttonClass, cx, formatTime, inr } from "./ui";

const MAX_SLOTS = 12;
const DRAFT_KEY = "hfg_booking_draft";

function istDate(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}

function consoleIcon(c) {
  const k = `${c.family || ""} ${c.name || ""}`.toLowerCase();
  if (/vr|virtual/.test(k)) return Glasses;
  if (/rac|sim|wheel/.test(k)) return Car;
  if (/pc|computer|desktop/.test(k)) return Monitor;
  return Gamepad2;
}

// Slots are calendar times on the chosen date (the cafe dashboard reads them
// the same way), so 1:30 AM is the early hours of that date and comes first.
const DAY_PARTS = [
  { id: "early", label: "Early hours", icon: MoonStar, from: 0, to: 5 },
  { id: "morning", label: "Morning", icon: Sunrise, from: 5, to: 12 },
  { id: "afternoon", label: "Afternoon", icon: Sun, from: 12, to: 17 },
  { id: "evening", label: "Evening", icon: Sunset, from: 17, to: 21 },
  { id: "night", label: "Night", icon: Moon, from: 21, to: 24 },
];
function dayPart(start) {
  const h = Number(String(start).slice(0, 2));
  return DAY_PARTS.find((p) => h >= p.from && h < p.to)?.id || "night";
}

function dateParts(iso, index) {
  const d = new Date(`${iso}T12:00:00+05:30`);
  return {
    top: index === 0 ? "Today" : index === 1 ? "Tmrw" : d.toLocaleDateString("en-IN", { weekday: "short" }),
    day: d.toLocaleDateString("en-IN", { day: "numeric" }),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
  };
}

function dateLabel(iso, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const d = new Date(`${iso}T12:00:00+05:30`);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/** Hide slots that already started today (IST). */
function isPast(date, start) {
  if (date !== istDate(0)) return false;
  const nowIst = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  return String(start).slice(0, 5) <= nowIst;
}

export default function CafeBooking({ vendorId, initial = null, cafeUrl = "/book" }) {
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => istDate(i)), []);

  const [detail, setDetail] = useState(initial);
  const [error, setError] = useState("");
  const [consoleSel, setConsoleSel] = useState(null);
  const [date, setDate] = useState(dates[0]);
  const [slots, setSlots] = useState(null);
  const [slotError, setSlotError] = useState("");
  const [picked, setPicked] = useState([]);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [method, setMethod] = useState("online");
  const [wallet, setWallet] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [booked, setBooked] = useState(null);
  const [flowError, setFlowError] = useState("");

  // The confirmation replaces the long form, so bring it into view (it used to leave people at the FAQ).
  useEffect(() => {
    if (!result) return;
    const card = document.getElementById("book");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [result]);

  const restoreDraft = useCallback(
    (data) => {
      // Restore a selection made before the login redirect.
      try {
        const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
        if (draft?.vendorId === vendorId && dates.includes(draft.date)) {
          const c = data.consoles.find((x) => x.gameId === draft.gameId);
          if (c) {
            setConsoleSel(c);
            setDate(draft.date);
            setPicked(draft.slotIds || []);
          }
        }
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      if (data.consoles.length === 1) setConsoleSel((c) => c || data.consoles[0]);
    },
    [vendorId, dates],
  );

  const loadDetail = useCallback(async () => {
    setError("");
    try {
      const data = await secureCall("cafes.detail", { vendorId });
      setDetail(data);
      restoreDraft(data);
    } catch (err) {
      setError(err.message);
    }
  }, [vendorId, restoreDraft]);

  useEffect(() => {
    if (initial) {
      restoreDraft(initial);
      track("Gaming Cafe Viewed", { cafe_id: vendorId });
    } else loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slots for console + date
  useEffect(() => {
    if (!consoleSel) return undefined;
    let cancelled = false;
    setSlots(null);
    setSlotError("");
    secureCall("slots.list", { vendorId, gameId: consoleSel.gameId, date })
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots);
        setPicked((prev) => prev.filter((id) => data.slots.some((s) => s.id === id && s.available)));
      })
      .catch((err) => !cancelled && setSlotError(err.message));
    return () => {
      cancelled = true;
    };
  }, [vendorId, consoleSel, date]);

  // Server-side quote whenever the selection changes
  useEffect(() => {
    setQuote(null);
    if (!consoleSel || !picked.length) return undefined;
    let cancelled = false;
    setQuoting(true);
    const t = setTimeout(() => {
      secureCall("booking.quote", { vendorId, gameId: consoleSel.gameId, date, slotIds: picked })
        .then((q) => !cancelled && setQuote(q))
        .catch((err) => !cancelled && setFlowError(err.message))
        .finally(() => !cancelled && setQuoting(false));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [vendorId, consoleSel, date, picked]);

  // What this cafe accepts, as set in its dashboard (same rules as the app's checkout).
  const [payments, setPayments] = useState(null);
  useEffect(() => {
    secureCall("cafes.payments", { vendorId })
      .then((d) => setPayments(d.methods))
      .catch(() => setPayments({ online: true, wallet: true, payAtCafe: Boolean(detail?.cafe?.payAtCafe), hashPass: false, cafePass: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  // Passes the player owns (same list as the app's "My passes").
  const [passes, setPasses] = useState(null);
  useEffect(() => {
    // A pass bought on this page shows up under "Pay with" straight away.
    const refresh = () => setPasses(null);
    window.addEventListener("hfg:passes-changed", refresh);
    return () => window.removeEventListener("hfg:passes-changed", refresh);
  }, []);
  useEffect(() => {
    if (user && passes === null) secureCall("passes.mine").then((d) => setPasses(d.passes)).catch(() => setPasses([]));
  }, [user, passes]);
  const usablePasses = (passes || []).filter(
    (p) =>
      (p.vendorId == null ? payments?.hashPass : Number(p.vendorId) === Number(vendorId) && payments?.cafePass) &&
      (!p.validFrom || p.validFrom <= date) &&
      (!p.validTo || p.validTo >= date),
  );
  const methodOptions = [
    { id: "online", label: "UPI, card or netbanking", show: payments ? payments.online : true },
    { id: "wallet", label: wallet !== null ? `Hash Wallet (${inr(wallet)})` : "Hash Wallet", show: Boolean(user) && (payments ? payments.wallet : true) },
    { id: "pay_at_cafe", label: "Pay at the cafe", show: payments ? payments.payAtCafe : Boolean(detail?.cafe?.payAtCafe) },
    ...usablePasses.map((p) => ({
      id: `pass:${p.id}`,
      label: `${p.name} · ${p.vendorId == null ? "Hash pass" : "cafe pass"}${p.validTo ? `, valid till ${new Date(`${p.validTo}T12:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}`,
      show: true,
    })),
  ].filter((m) => m.show);
  useEffect(() => {
    // Default to the first method the cafe accepts.
    if (payments && !methodOptions.some((m) => m.id === method) && methodOptions[0]) setMethod(methodOptions[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, methodOptions.map((m) => m.id).join(","), method]);
  useEffect(() => {
    // A pass chosen for another date no longer applies.
    if (method.startsWith("pass:") && !usablePasses.some((p) => `pass:${p.id}` === method)) setMethod(payments?.online === false ? "pay_at_cafe" : "online");
  }, [method, usablePasses]);

  useEffect(() => {
    if (user && method === "wallet" && wallet === null) {
      secureCall("wallet.balance").then((d) => setWallet(d.balance)).catch(() => setWallet(0));
    }
  }, [user, method, wallet]);

  function toggleSlot(slot) {
    setFlowError("");
    setPicked((prev) => {
      if (prev.includes(slot.id)) return prev.filter((id) => id !== slot.id);
      if (prev.length >= MAX_SLOTS) return prev;
      track("Slot Selected", { cafe_id: vendorId, game_id: consoleSel.gameId, slot_time: slot.start });
      return [...prev, slot.id].sort((a, b) => a - b);
    });
  }

  function startOver() {
    setResult(null);
    setBooked(null);
    setPicked([]);
    setQuote(null);
    setFlowError("");
    // Fresh availability for the same console and day.
    setSlots(null);
    if (consoleSel) secureCall("slots.list", { vendorId, gameId: consoleSel.gameId, date }).then((d) => setSlots(d.slots)).catch((e) => setSlotError(e.message));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onBook() {
    setFlowError("");
    if (!user) {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ vendorId, gameId: consoleSel.gameId, date, slotIds: picked }));
      } catch {}
      requireLogin();
      return;
    }
    setBusy(true);
    const summary = {
      console: consoleSel.name,
      date,
      dateText: new Date(`${date}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }),
      times: (slots || []).filter((s) => picked.includes(s.id)).map((s) => `${formatTime(s.start)} – ${formatTime(s.end)}`),
      total: quote?.total,
      method,
    };
    try {
      const created = await secureCall("booking.create", {
        vendorId,
        gameId: consoleSel.gameId,
        date,
        slotIds: picked,
        paymentMethod: method.startsWith("pass:") ? "pass" : method,
        ...(method.startsWith("pass:") ? { userPassId: Number(method.slice(5)) } : {}),
      });
      if (created.status !== "payment_required") {
        setBooked(summary);
        setResult(created);
        return;
      }
      track("Razorpay Opened", { amount: created.total, flow: "booking" });
      const payment = await openRazorpay(created.checkout);
      if (payment.status !== "paid") {
        track("Razorpay Dismissed", { flow: "booking" });
        await secureCall("booking.abandon", { intent: created.intent, reason: payment.status }).catch(() => {});
        setFlowError("Payment was cancelled. Your slots have been released.");
        return;
      }
      const confirmed = await secureCall("booking.confirmPayment", {
        intent: created.intent,
        razorpay: { paymentId: payment.paymentId, orderId: payment.orderId, signature: payment.signature },
      });
      setBooked(summary);
      setResult(confirmed);
    } catch (err) {
      track("Booking Failed", { cafe_id: vendorId, method: method.startsWith("pass:") ? "pass" : method, code: String(err.code || err.status || "error").slice(0, 40), slots: picked.length });
      setFlowError(err.message);
      if (err.status === 409) {
        // Refresh availability after a conflict.
        setSlots(null);
        secureCall("slots.list", { vendorId, gameId: consoleSel.gameId, date }).then((d) => setSlots(d.slots)).catch(() => {});
        setPicked([]);
      }
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <Panel>
        <Notice action={<Button size="sm" variant="subtle" onClick={loadDetail}>Retry</Button>}>{error}</Notice>
      </Panel>
    );
  }
  if (!detail) return <Panel><Spinner label="Loading cafe" /></Panel>;

  if (result) {
    const tone = result.status === "needs_attention" ? "warn" : "success";
    const ids = result.bookingIds || [];
    return (
      <Panel>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" aria-hidden />
          <Title className="mt-4 text-2xl md:text-2xl">
            {result.status === "confirmed" && "You're booked."}
            {result.status === "pending_acceptance" && "Booking requested."}
            {result.status === "needs_attention" && "Payment received."}
          </Title>
        </div>
        {booked && (
          <dl className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] px-4 text-sm">
            {[
              ["Cafe", detail.cafe.name],
              ["Console", booked.console],
              ["Date", booked.dateText],
              ["Time", booked.times.join(", ")],
              ["Total", result.paidWithPass ? "Covered by your pass" : booked.total != null ? `${inr(result.total ?? booked.total)}${booked.method === "pay_at_cafe" ? " at the cafe" : " paid"}` : ""],
              ids.length ? [ids.length > 1 ? "Booking IDs" : "Booking ID", ids.map((id) => `#${id}`).join(", ")] : null,
            ]
              .filter((row) => row && row[1])
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-white/50">{k}</dt>
                  <dd className="text-right text-white">{v}</dd>
                </div>
              ))}
          </dl>
        )}
        <div className="mt-4">
          <Notice tone={tone}>
            {result.status === "confirmed" && "Show this booking at the counter from the Hash app or My bookings."}
            {result.status === "pending_acceptance" && "The cafe will accept your booking shortly. You'll pay at the counter when you arrive."}
            {result.status === "needs_attention" && result.message}
          </Notice>
        </div>
        <div className="mt-6 grid gap-2">
          <Link href="/account#bookings" className={buttonClass({ className: "w-full" })}>View my bookings</Link>
          <button type="button" onClick={startOver} className={buttonClass({ variant: "subtle", className: "w-full" })}>Book another slot</button>
        </div>
      </Panel>
    );
  }

  const { cafe, consoles } = detail;
  const pickedSlots = (slots || []).filter((s) => picked.includes(s.id));
  const walletShort = method === "wallet" && quote && wallet !== null && wallet < quote.total;
  const visibleSlots = (slots || []).filter((s) => !isPast(date, s.start)).sort((a, b) => String(a.start).localeCompare(String(b.start)));

  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        <Title as="h2" className="text-xl md:text-xl">Book a slot</Title>
        <SecureBadge />
      </div>

      <section className="border-b border-white/[0.06] px-6 pb-6 pt-5" aria-label="Console">
        <Label>Console</Label>
        {!consoles.length ? (
          <p className="mt-3 text-sm text-white/55">This cafe hasn&apos;t opened consoles for online booking yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {consoles.map((c) => {
              const active = consoleSel?.gameId === c.gameId;
              const Icon = consoleIcon(c);
              return (
                <button
                  key={c.gameId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setConsoleSel(c);
                    setPicked([]);
                    track("Cafe Console Selected", { cafe_id: vendorId, console: c.name });
                  }}
                  className={cx(
                    "flex min-w-0 flex-col gap-3 rounded-2xl border p-3.5 text-left transition",
                    active ? "border-white bg-white/[0.08]" : "border-white/10 hover:border-white/30",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <Icon className={cx("h-5 w-5", active ? "text-white" : "text-white/55")} aria-hidden />
                    {c.pricePerSlot > 0 && <span className="text-sm font-semibold text-white">{inr(c.pricePerSlot)}</span>}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-white">{c.name}</span>
                    <span className="block text-xs text-white/45">{c.units ? `${c.units} ${c.units === 1 ? "station" : "stations"} · ` : ""}per slot</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {consoleSel && (
        <section className="border-b border-white/[0.06] px-6 py-6" aria-label="Date and time">
          <Label>Date</Label>
          <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
            {dates.map((d, i) => {
              const p = dateParts(d, i);
              const active = d === date;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  aria-label={dateLabel(d, i)}
                  onClick={() => {
                    setDate(d);
                    setPicked([]);
                    track("Date Selected", { days_ahead: i });
                  }}
                  className={cx(
                    "flex w-[60px] shrink-0 flex-col items-center rounded-2xl py-2.5 transition",
                    active ? "bg-white text-black" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]",
                  )}
                >
                  <span className={cx("text-[11px] font-medium uppercase tracking-wide", active ? "text-black/60" : "text-white/45")}>{p.top}</span>
                  <span className="text-lg font-semibold leading-tight">{p.day}</span>
                  <span className={cx("text-[11px]", active ? "text-black/60" : "text-white/45")}>{p.month}</span>
                </button>
              );
            })}
          </div>

          <Label className="mt-6">Time</Label>
          <div className="mt-3">
            {slotError && <Notice>{slotError}</Notice>}
            {!slots && !slotError && <Spinner label="Checking availability" />}
            {slots && !visibleSlots.length && <p className="text-sm text-white/55">No slots left on this day. Try another date.</p>}
            {slots && visibleSlots.length > 0 && <SlotScroller slots={visibleSlots} picked={picked} onToggle={toggleSlot} />}
            {picked.length >= MAX_SLOTS && <p className="mt-3 text-xs text-white/50">You can book up to {MAX_SLOTS} slots at once.</p>}
          </div>
        </section>
      )}

      <section className="px-6 py-6" aria-label="Summary">
        {!picked.length ? (
          <p className="text-sm text-white/50">{consoleSel ? "Pick one or more time slots." : "Choose a console to see open slots."}</p>
        ) : (
          <>
            <ul className="space-y-2 text-sm">
              {pickedSlots.map((s) => {
                const line = quote?.breakdown.find((b) => b.slotId === s.id);
                return (
                  <li key={s.id} className="flex justify-between gap-3 text-white/75">
                    <span>{formatTime(s.start)} – {formatTime(s.end)}</span>
                    <span>{line ? inr(line.amount) : "…"}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-4 text-sm">
              {quote?.discount > 0 && <div className="flex justify-between text-emerald-300"><span>Discount</span><span>−{inr(quote.discount)}</span></div>}
              {quote?.appFee > 0 && <div className="flex justify-between text-white/55"><span>Platform fee</span><span>{inr(quote.appFee)}</span></div>}
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total</span>
                <span>{quoting || !quote ? "…" : inr(quote.total)}</span>
              </div>
            </div>

            <Label className="mt-6">Pay with</Label>
            <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Payment method">
              {methodOptions
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={method === m.id}
                    onClick={() => {
                      setMethod(m.id);
                      track("Payment Method Selected", { method: m.id, flow: "booking" });
                    }}
                    className={cx(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition",
                      method === m.id ? "border-white bg-white/[0.06] text-white" : "border-white/10 text-white/75 hover:border-white/30",
                    )}
                  >
                    <span className={cx("h-4 w-4 rounded-full border", method === m.id ? "border-[5px] border-white" : "border-white/30")} aria-hidden />
                    {m.label}
                  </button>
                ))}
            </div>
            {payments && !methodOptions.length && <p className="mt-2 text-xs text-amber-200">This cafe isn&apos;t taking online bookings right now. Book in the Hash app or at the cafe.</p>}
            {walletShort && <p className="mt-2 text-xs text-amber-200">Not enough wallet balance. Choose another method.</p>}
            {flowError && <div className="mt-4"><Notice>{flowError}</Notice></div>}
            <Button
              size="lg"
              className="mt-5 w-full"
              loading={busy}
              disabled={!quote || quoting || !quote.allBookable || walletShort || !ready || (payments && !methodOptions.length)}
              onClick={onBook}
            >
              {!user ? `Sign in to book${quote ? ` · ${inr(quote.total)}` : ""}` : method === "online" ? `Pay ${quote ? inr(quote.total) : ""}` : method.startsWith("pass:") ? "Book with my pass" : "Confirm booking"}
            </Button>
            {quote && !quote.allBookable && <p className="mt-2 text-xs text-amber-200">One of these slots just filled up. Pick another.</p>}
          </>
        )}
      </section>
    </Panel>
  );
}

/**
 * Day-part tabs over a sideways scroller of slots, in time order from now.
 * Two rows on wide cards keep many slots compact without a long grid.
 */
function SlotScroller({ slots, picked, onToggle }) {
  const parts = DAY_PARTS.map((p) => ({ ...p, list: slots.filter((x) => dayPart(x.start) === p.id) })).filter((p) => p.list.length);
  const firstOpen = parts.find((p) => p.list.some((x) => x.available)) || parts[0];
  const [partId, setPartId] = useState(firstOpen?.id);
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const part = parts.find((p) => p.id === partId) || firstOpen;

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    if (!parts.some((p) => p.id === partId)) setPartId(firstOpen?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);
  useEffect(() => {
    scroller.current?.scrollTo({ left: 0 });
    measure();
  }, [part?.id, measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  if (!part) return null;
  const nudge = (dir) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });
  const pickedHere = (p) => p.list.filter((x) => picked.includes(x.id)).length;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Time of day">
        {parts.map((p) => {
          const Icon = p.icon;
          const open = p.list.filter((x) => x.available).length;
          const active = p.id === part.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setPartId(p.id);
                track("Slot Day Part Selected", { part: p.id, open_slots: open });
              }}
              className={cx(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition",
                active ? "border-white bg-white text-black" : "border-white/10 text-white/70 hover:border-white/30",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {p.label}
              <span className={cx("text-[11px]", active ? "text-black/50" : "text-white/40")}>{pickedHere(p) ? `${pickedHere(p)} picked` : open}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-3">
        <div
          ref={scroller}
          onScroll={measure}
          className={cx(
            "grid snap-x snap-mandatory auto-cols-[92px] grid-flow-col gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]",
            part.list.length > 8 ? "grid-rows-2" : "grid-rows-1",
          )}
          aria-label={`${part.label} slots`}
        >
          {part.list.map((x) => (
            <Chip
              key={x.id}
              active={picked.includes(x.id)}
              disabled={!x.available}
              onClick={() => onToggle(x)}
              aria-label={`${formatTime(x.start)}${x.available ? "" : ", full"}`}
              className="flex min-h-[52px] w-full snap-start flex-col items-center justify-center whitespace-nowrap rounded-2xl px-1 text-[13px] leading-tight"
            >
              {formatTime(x.start)}
              {x.available && x.left <= 2 && !picked.includes(x.id) && <span className="mt-0.5 text-[10px] font-normal text-amber-300">{x.left} left</span>}
              {!x.available && <span className="mt-0.5 text-[10px] font-normal">Full</span>}
            </Chip>
          ))}
        </div>
        {edges.left && (
          <button type="button" aria-label="Earlier slots" onClick={() => nudge(-1)} className="absolute -left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white backdrop-blur sm:flex">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {edges.right && (
          <button type="button" aria-label="Later slots" onClick={() => nudge(1)} className="absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white backdrop-blur sm:flex">
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-1 text-[11px] text-white/35">{part.list.length} {part.list.length === 1 ? "slot" : "slots"} · {formatTime(part.list[0].start)} to {formatTime(part.list[part.list.length - 1].end || part.list[part.list.length - 1].start)}</p>
    </div>
  );
}
