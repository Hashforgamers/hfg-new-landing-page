"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { openRazorpay } from "@/lib/razorpay-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Chip, Label, Notice, Panel, SecureBadge, Spinner, Title, cx, formatTime, inr } from "./ui";

const MAX_SLOTS = 12;
const DRAFT_KEY = "hfg_booking_draft";

function istDate(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
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
  const [flowError, setFlowError] = useState("");

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
    try {
      const created = await secureCall("booking.create", {
        vendorId,
        gameId: consoleSel.gameId,
        date,
        slotIds: picked,
        paymentMethod: method,
      });
      if (created.status !== "payment_required") {
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
      setResult(confirmed);
    } catch (err) {
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
    return (
      <Panel className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" aria-hidden />
        <Title className="mt-4 text-2xl md:text-2xl">
          {result.status === "confirmed" && "You're booked."}
          {result.status === "pending_acceptance" && "Booking requested."}
          {result.status === "needs_attention" && "Payment received."}
        </Title>
        <div className="mt-4 text-left">
          <Notice tone={tone}>
            {result.status === "confirmed" && `See you at ${detail.cafe.name}. Show this booking in the Hash app or under My bookings at the counter.`}
            {result.status === "pending_acceptance" && `The cafe will accept your booking shortly. Pay ${inr(result.total)} at the counter when you arrive.`}
            {result.status === "needs_attention" && result.message}
          </Notice>
        </div>
        <div className="mt-6 grid gap-2">
          <Link href="/account#bookings"><Button className="w-full">View my bookings</Button></Link>
          <Link href={cafeUrl}><Button variant="subtle" className="w-full">Book another slot</Button></Link>
        </div>
      </Panel>
    );
  }

  const { cafe, consoles } = detail;
  const pickedSlots = (slots || []).filter((s) => picked.includes(s.id));
  const walletShort = method === "wallet" && quote && wallet !== null && wallet < quote.total;
  const visibleSlots = (slots || []).filter((s) => !isPast(date, s.start));

  return (
    <Panel className="p-0 md:p-0">
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        <Title as="h2" className="text-xl md:text-xl">Book a slot</Title>
        <SecureBadge />
      </div>

      <section className="border-b border-white/[0.06] px-6 pb-6 pt-5" aria-label="Console">
        <Label>Console</Label>
        {!consoles.length ? (
          <p className="mt-3 text-sm text-white/55">This cafe hasn&apos;t opened consoles for online booking yet.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {consoles.map((c) => {
              const active = consoleSel?.gameId === c.gameId;
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
                    "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition",
                    active ? "border-white bg-white/[0.06]" : "border-white/10 hover:border-white/30",
                  )}
                >
                  <span>
                    <span className="block text-[15px] font-medium text-white">{c.name}</span>
                    {c.units ? <span className="block text-xs text-white/45">{c.units} {c.units === 1 ? "station" : "stations"}</span> : null}
                  </span>
                  {c.pricePerSlot > 0 && <span className="text-sm text-white/70">{inr(c.pricePerSlot)}<span className="text-white/40">/slot</span></span>}
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
            {dates.map((d, i) => (
              <Chip
                key={d}
                active={d === date}
                className="shrink-0"
                onClick={() => {
                  setDate(d);
                  setPicked([]);
                  track("Date Selected", { days_ahead: i });
                }}
              >
                {dateLabel(d, i)}
              </Chip>
            ))}
          </div>

          <Label className="mt-6">Time</Label>
          <div className="mt-3">
            {slotError && <Notice>{slotError}</Notice>}
            {!slots && !slotError && <Spinner label="Checking availability" />}
            {slots && !visibleSlots.length && <p className="text-sm text-white/55">No slots left on this day. Try another date.</p>}
            {slots && visibleSlots.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {visibleSlots.map((s) => (
                  <Chip key={s.id} active={picked.includes(s.id)} disabled={!s.available} onClick={() => toggleSlot(s)} className="w-full px-2">
                    {formatTime(s.start)}
                    {s.available && s.left <= 2 && !picked.includes(s.id) && <span className="block text-[10px] text-amber-300">{s.left} left</span>}
                  </Chip>
                ))}
              </div>
            )}
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
              {[
                { id: "online", label: "UPI, card or netbanking", show: true },
                { id: "wallet", label: wallet !== null ? `Hash Wallet (${inr(wallet)})` : "Hash Wallet", show: Boolean(user) },
                { id: "pay_at_cafe", label: "Pay at the cafe", show: cafe.payAtCafe },
              ]
                .filter((m) => m.show)
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
            {walletShort && <p className="mt-2 text-xs text-amber-200">Not enough wallet balance. Choose another method.</p>}
            {flowError && <div className="mt-4"><Notice>{flowError}</Notice></div>}
            <Button
              size="lg"
              className="mt-5 w-full"
              loading={busy}
              disabled={!quote || quoting || !quote.allBookable || walletShort || !ready}
              onClick={onBook}
            >
              {!user ? "Sign in to book" : method === "online" ? `Pay ${quote ? inr(quote.total) : ""}` : "Confirm booking"}
            </Button>
            {quote && !quote.allBookable && <p className="mt-2 text-xs text-amber-200">One of these slots just filled up. Pick another.</p>}
          </>
        )}
      </section>
    </Panel>
  );
}
