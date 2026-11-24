"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { openRazorpay } from "@/lib/razorpay-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Chip, Empty, Eyebrow, Notice, Panel, SecureBadge, Spinner, Title, formatTime, inr } from "./ui";

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

export default function CafeBooking({ vendorId }) {
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => istDate(i)), []);

  const [detail, setDetail] = useState(null);
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

  const loadDetail = useCallback(async () => {
    setError("");
    try {
      const data = await secureCall("cafes.detail", { vendorId });
      setDetail(data);
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
    } catch (err) {
      setError(err.message);
    }
  }, [vendorId, dates]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

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
      <div className="space-y-4">
        <Notice action={<Button variant="subtle" onClick={loadDetail}>Retry</Button>}>{error}</Notice>
        <Link href="/book" className="text-xs uppercase tracking-[0.24em] text-[#16FF00]">← All cafes</Link>
      </div>
    );
  }
  if (!detail) return <Spinner label="Loading cafe" />;

  if (result) {
    const tone = result.status === "needs_attention" ? "warn" : "success";
    return (
      <Panel className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#16FF00]" aria-hidden />
        <Title as="h2" className="mt-4 text-xl md:text-2xl">
          {result.status === "confirmed" && "Slot locked in"}
          {result.status === "pending_acceptance" && "Booking requested"}
          {result.status === "needs_attention" && "Payment received"}
        </Title>
        <div className="mt-4">
          <Notice tone={tone}>
            {result.status === "confirmed" && `You're booked at ${detail.cafe.name}. Show your booking in the Hash app or My Bookings at the counter.`}
            {result.status === "pending_acceptance" && `The cafe will accept your booking shortly. Pay ${inr(result.total)} at the counter when you arrive.`}
            {result.status === "needs_attention" && result.message}
          </Notice>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/account"><Button>My bookings</Button></Link>
          <Link href="/book"><Button variant="subtle">Book another</Button></Link>
        </div>
      </Panel>
    );
  }

  const { cafe, consoles } = detail;
  const pickedSlots = (slots || []).filter((s) => picked.includes(s.id));
  const walletShort = method === "wallet" && quote && wallet !== null && wallet < quote.total;

  return (
    <div>
      <Link href="/book" className="text-xs uppercase tracking-[0.24em] text-white/50 hover:text-[#16FF00]">← All cafes</Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Book your slot</Eyebrow>
          <Title className="mt-3">{cafe.name}</Title>
          {cafe.addressLine && (
            <p className="mt-3 flex items-center gap-2 font-sans text-sm text-white/60">
              <MapPin className="h-4 w-4 text-[#16FF00]" aria-hidden /> {cafe.addressLine}
            </p>
          )}
        </div>
        <SecureBadge />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Panel>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">1 · Console</p>
            {!consoles.length ? (
              <div className="mt-4"><Empty title="No consoles open for web booking" /></div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {consoles.map((c) => (
                  <button
                    key={c.gameId}
                    type="button"
                    aria-pressed={consoleSel?.gameId === c.gameId}
                    onClick={() => {
                      setConsoleSel(c);
                      setPicked([]);
                      track("Cafe Console Selected", { cafe_id: vendorId, console: c.name });
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      consoleSel?.gameId === c.gameId ? "border-[#16FF00] bg-[#16FF00]/10" : "border-white/10 bg-black/40 hover:border-white/30"
                    }`}
                  >
                    <p className="text-sm font-black uppercase tracking-[0.14em]">{c.name}</p>
                    <p className="mt-1 font-sans text-xs text-white/50">{c.units ? `${c.units} available` : "Console"}</p>
                    {c.pricePerSlot > 0 && <p className="mt-2 text-sm text-[#16FF00]">from {inr(c.pricePerSlot)}/slot</p>}
                  </button>
                ))}
              </div>
            )}
          </Panel>

          {consoleSel && (
            <Panel>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">2 · Date</p>
              <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
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

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-white/60">3 · Time slots</p>
              <div className="mt-4">
                {slotError && <Notice>{slotError}</Notice>}
                {!slots && !slotError && <Spinner label="Checking availability" />}
                {slots && !slots.filter((s) => !isPast(date, s.start)).length && <Empty title="No slots on this day">Try another date.</Empty>}
                {slots && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {slots
                      .filter((s) => !isPast(date, s.start))
                      .map((s) => (
                        <Chip key={s.id} active={picked.includes(s.id)} disabled={!s.available} onClick={() => toggleSlot(s)} className="w-full">
                          {formatTime(s.start)}
                          {s.available && s.left <= 2 && <span className="ml-1 text-[9px] text-amber-300">· {s.left} left</span>}
                        </Chip>
                      ))}
                  </div>
                )}
                {picked.length >= MAX_SLOTS && <p className="mt-3 font-sans text-xs text-white/50">You can book up to {MAX_SLOTS} slots at once.</p>}
              </div>
            </Panel>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Panel>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">Summary</p>
            {!picked.length ? (
              <p className="mt-4 font-sans text-sm text-white/50">Pick a console, date and at least one slot.</p>
            ) : (
              <>
                <ul className="mt-4 space-y-2 font-sans text-sm">
                  {pickedSlots.map((s) => {
                    const line = quote?.breakdown.find((b) => b.slotId === s.id);
                    return (
                      <li key={s.id} className="flex justify-between gap-3 text-white/80">
                        <span>{formatTime(s.start)} – {formatTime(s.end)}</span>
                        <span>{line ? inr(line.amount) : "…"}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 space-y-1 border-t border-white/10 pt-4 font-sans text-sm">
                  {quote?.discount > 0 && (
                    <div className="flex justify-between text-[#16FF00]"><span>Discount</span><span>−{inr(quote.discount)}</span></div>
                  )}
                  {quote?.appFee > 0 && (
                    <div className="flex justify-between text-white/60"><span>Platform fee</span><span>{inr(quote.appFee)}</span></div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white">
                    <span>Total</span>
                    <span>{quoting || !quote ? "…" : inr(quote.total)}</span>
                  </div>
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-white/60">Pay with</p>
                <div className="mt-3 grid gap-2">
                  {[
                    { id: "online", label: "UPI / Card / Netbanking", show: true },
                    { id: "wallet", label: wallet !== null ? `Hash Wallet · ${inr(wallet)}` : "Hash Wallet", show: Boolean(user) },
                    { id: "pay_at_cafe", label: "Pay at cafe", show: cafe.payAtCafe },
                  ]
                    .filter((m) => m.show)
                    .map((m) => (
                      <Chip
                        key={m.id}
                        active={method === m.id}
                        className="w-full text-left"
                        onClick={() => {
                          setMethod(m.id);
                          track("Payment Method Selected", { method: m.id, flow: "booking" });
                        }}
                      >
                        {m.label}
                      </Chip>
                    ))}
                </div>
                {walletShort && <p className="mt-2 font-sans text-xs text-amber-200">Not enough wallet balance. Choose another method.</p>}
                {flowError && <div className="mt-4"><Notice>{flowError}</Notice></div>}
                <Button
                  className="mt-5 w-full"
                  loading={busy}
                  disabled={!quote || quoting || !quote.allBookable || walletShort || !ready}
                  onClick={onBook}
                >
                  {!user ? "Login to book" : method === "online" ? `Pay ${quote ? inr(quote.total) : ""}` : "Confirm booking"}
                </Button>
                {quote && !quote.allBookable && <p className="mt-2 font-sans text-xs text-amber-200">One of these slots just filled up. Pick another.</p>}
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
