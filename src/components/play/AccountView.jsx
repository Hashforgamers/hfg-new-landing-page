"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, Coins, Gamepad2, LogOut, Navigation, Package, Plus, Receipt, RotateCcw, Ticket, Wallet } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { openRazorpay } from "@/lib/razorpay-client";
import { track } from "@/lib/analytics-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Empty, Notice, Panel, SecureBadge, Spinner, cx, formatTime, inr } from "./ui";
import { PassCatalog } from "./PassShop";

const TABS = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "passes", label: "Passes", icon: Ticket },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "orders", label: "Orders", icon: Package },
];

const TONES = {
  success: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20",
  warn: "bg-amber-500/15 text-amber-200 ring-amber-400/20",
  danger: "bg-rose-500/15 text-rose-200 ring-rose-400/20",
  muted: "bg-white/[0.05] text-white/45 ring-white/10",
  neutral: "bg-white/[0.08] text-white/75 ring-white/10",
};

const fmtDate = (iso, opts = { weekday: "short", day: "numeric", month: "short" }) => {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00+05:30` : iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", opts);
};

function StatusBadge({ status }) {
  return <span className={cx("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset", TONES[status.tone] || TONES.neutral)}>{status.label}</span>;
}

function Thumb({ src, className = "" }) {
  return (
    <div className={cx("relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a0838] via-black to-[#3b1a0a]", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Gamepad2 className="h-6 w-6 text-white/50" aria-hidden />
        </span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- bookings */

const mins = (t) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : 0);

/** Back-to-back slots at one cafe on one day with the same status read as one visit. */
function mergeVisits(list) {
  const sorted = [...list].sort((a, b) => `${a.date || ""}${a.start || ""}${a.id}`.localeCompare(`${b.date || ""}${b.start || ""}${b.id}`));
  const out = [];
  for (const b of sorted) {
    const prev = out[out.length - 1];
    if (prev && prev.cafeId === b.cafeId && prev.date === b.date && prev.console === b.console && prev.status.label === b.status.label && prev.end && b.start && mins(b.start) - mins(prev.end) <= 0 && mins(b.start) >= mins(prev.start)) {
      prev.ids.push(b.id);
      prev.end = mins(b.end) > mins(prev.end) ? b.end : prev.end;
      prev.amount += b.amount;
      continue;
    }
    out.push({ ...b, ids: [b.id] });
  }
  return out;
}

function dayHeading(iso, today) {
  if (!iso) return "Date not set";
  const t = new Date(`${today}T12:00:00+05:30`).getTime();
  const diff = Math.round((new Date(`${iso}T12:00:00+05:30`).getTime() - t) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return fmtDate(iso, sameYear ? { weekday: "long", day: "numeric", month: "long" } : { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function VisitCard({ b }) {
  const [open, setOpen] = useState(false);
  const time = b.start ? `${formatTime(b.start)}${b.end ? ` – ${formatTime(b.end)}` : ""}` : "";
  const slots = b.ids.length;
  return (
    <li className="min-w-0 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0e0e12] transition hover:border-white/15">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((x) => !x);
          if (!open) track("Booking Details Opened", { status: b.status.key, upcoming: b.upcoming });
        }}
        className="flex w-full min-w-0 items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
      >
        <Thumb src={b.cafeImage} className="h-14 w-14 sm:h-16 sm:w-16" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-white sm:text-[16px]">{b.cafeName}</p>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-white/50">
            {[time, b.console, slots > 1 ? `${slots} slots` : "", b.mode].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={b.status} />
          {b.amount > 0 && <span className="text-[13px] font-medium text-white/80">{inr(b.amount)}</span>}
        </div>
        <ChevronDown className={cx("hidden h-4 w-4 shrink-0 text-white/35 transition sm:block", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 text-[13px] sm:px-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <div><dt className="text-white/40">Date</dt><dd className="mt-0.5 text-white">{b.date ? fmtDate(b.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—"}</dd></div>
            <div><dt className="text-white/40">Time</dt><dd className="mt-0.5 text-white">{time || "—"}</dd></div>
            <div><dt className="text-white/40">Console</dt><dd className="mt-0.5 text-white">{b.console || "—"}</dd></div>
            <div><dt className="text-white/40">{slots > 1 ? "Booking IDs" : "Booking ID"}</dt><dd className="mt-0.5 break-all text-white">{b.ids.map((id) => `#${id}`).join(", ")}</dd></div>
            {b.cafeAddress && <div className="col-span-2 sm:col-span-4"><dt className="text-white/40">Address</dt><dd className="mt-0.5 text-white/80">{b.cafeAddress}</dd></div>}
          </dl>
          {b.status.key === "pending_acceptance" && b.upcoming && <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-amber-100/90">The cafe still has to accept this booking. You pay at the cafe after you play.</p>}
          {!b.dateKnown && b.date && <p className="mt-3 text-[12px] text-white/35">Date shown is when you booked; the cafe confirms the slot day.</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {b.directions && b.upcoming && (
              <a href={b.directions} target="_blank" rel="noopener noreferrer" onClick={() => track("Booking Directions Clicked", {})} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-[#ff9a3d]">
                <Navigation className="h-3.5 w-3.5" aria-hidden /> Get directions
              </a>
            )}
            {b.cafeHref && (
              <Link href={b.cafeHref} onClick={() => track("Book Again Clicked", { status: b.status.key })} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white hover:border-white/40">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Book again
              </Link>
            )}
            <a href="/support" className="inline-flex items-center rounded-full px-3 py-2 text-[13px] text-white/50 hover:text-white">Need help?</a>
          </div>
        </div>
      )}
    </li>
  );
}

const PAST_FILTERS = [
  ["all", "All"],
  ["done", "Played"],
  ["cancelled", "Cancelled or declined"],
  ["other", "Not accepted"],
];
function pastBucket(b) {
  if (["completed", "confirmed", "booked", "checked_in", "in_progress"].includes(b.status.key)) return "done";
  if (b.status.tone === "danger") return "cancelled";
  return "other";
}

function Bookings({ data }) {
  const [view, setView] = useState("upcoming");
  const [filter, setFilter] = useState("all");
  const [cafe, setCafe] = useState("all");
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [limit, setLimit] = useState(20);
  const groups = useMemo(() => {
    if (!data) return null;
    const real = data.bookings.filter((b) => !b.incomplete);
    const upcoming = mergeVisits(real.filter((b) => b.upcoming));
    const past = mergeVisits(real.filter((b) => !b.upcoming)).reverse();
    return { upcoming, past, incomplete: mergeVisits(data.bookings.filter((b) => b.incomplete)).reverse() };
  }, [data]);

  if (!groups) return <Spinner label="Loading bookings" />;
  const cafes = [...new Map([...groups.upcoming, ...groups.past].map((b) => [b.cafeId, b.cafeName])).entries()].filter(([id]) => id);
  let list = view === "upcoming" ? groups.upcoming : groups.past;
  if (view === "past" && filter !== "all") list = list.filter((b) => pastBucket(b) === filter);
  if (cafe !== "all") list = list.filter((b) => String(b.cafeId) === cafe);
  const shown = list.slice(0, limit);
  const byDay = [];
  for (const b of shown) {
    const last = byDay[byDay.length - 1];
    if (last && last.date === b.date) last.items.push(b);
    else byDay.push({ date: b.date, items: [b] });
  }
  const next = groups.upcoming[0];

  return (
    <div>
      {view === "upcoming" && next && (
        <div className="mb-5 overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#2a0838]/70 via-[#0e0e12] to-[#3b1a0a]/60 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">Next up</p>
          <div className="mt-3 flex items-center gap-4">
            <Thumb src={next.cafeImage} className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-white">{next.cafeName}</p>
              <p className="text-sm text-white/65">{dayHeading(next.date, data.today)} · {formatTime(next.start)}{next.end ? ` – ${formatTime(next.end)}` : ""}</p>
              <p className="text-[13px] text-white/45">{[next.console, next.cafeArea].filter(Boolean).join(" · ")}</p>
            </div>
            <StatusBadge status={next.status} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full bg-white/[0.05] p-1" role="tablist" aria-label="Bookings">
          {[
            ["upcoming", `Upcoming${groups.upcoming.length ? ` (${groups.upcoming.length})` : ""}`],
            ["past", `Past${groups.past.length ? ` (${groups.past.length})` : ""}`],
          ].map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => { setView(id); setLimit(20); track("Bookings View Changed", { view: id }); }} className={cx("rounded-full px-4 py-2 text-sm font-medium transition", view === id ? "bg-white text-black" : "text-white/60 hover:text-white")}>
              {label}
            </button>
          ))}
        </div>
        {cafes.length > 1 && (
          <select aria-label="Filter by cafe" value={cafe} onChange={(e) => setCafe(e.target.value)} className="rounded-full border border-white/10 bg-black px-4 py-2 text-sm text-white/80">
            <option value="all">All cafes</option>
            {cafes.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
          </select>
        )}
      </div>
      {view === "past" && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {PAST_FILTERS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={cx("shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition", filter === id ? "border-white/60 text-white" : "border-white/10 text-white/55 hover:text-white")}>
              {label}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-5 rounded-[22px] border border-dashed border-white/10 p-8 text-center">
          <p className="text-[15px] font-medium text-white">{view === "upcoming" ? "No upcoming bookings" : "Nothing here yet"}</p>
          <p className="mt-1 text-sm text-white/50">Find a cafe near you and lock in a slot in a few taps.</p>
          <Link href="/book" className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#ff9a3d]">Book a cafe</Link>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {byDay.map((day) => (
            <section key={day.date || "none"}>
              <h4 className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-white/55">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {dayHeading(day.date, data.today)}
              </h4>
              <ul className="grid gap-2.5">
                {day.items.map((b) => <VisitCard key={b.ids.join("-")} b={b} />)}
              </ul>
            </section>
          ))}
          {list.length > shown.length && (
            <button type="button" onClick={() => setLimit((n) => n + 20)} className="w-full rounded-full border border-white/10 py-2.5 text-sm text-white/70 hover:border-white/30">
              Show more ({list.length - shown.length})
            </button>
          )}
        </div>
      )}

      {groups.incomplete.length > 0 && (
        <div className="mt-8">
          <button type="button" onClick={() => setShowIncomplete((x) => !x)} aria-expanded={showIncomplete} className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white/80">
            <ChevronDown className={cx("h-4 w-4 transition", showIncomplete && "rotate-180")} aria-hidden />
            {groups.incomplete.length} {groups.incomplete.length === 1 ? "booking" : "bookings"} that never went through
          </button>
          {showIncomplete && (
            <>
              <p className="mt-2 text-xs text-white/40">Payment wasn&apos;t finished or the cafe didn&apos;t accept in time, so no slot was held and nothing was charged.</p>
              <ul className="mt-3 grid gap-2.5 opacity-70">
                {groups.incomplete.slice(0, 30).map((b) => <VisitCard key={b.ids.join("-")} b={b} />)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ wallet */

const TOPUP_PRESETS = [100, 250, 500, 1000];

function TopUp({ limits, onDone }) {
  const [amount, setAmount] = useState(500);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const valid = Number.isInteger(amount) && amount >= limits.min && amount <= limits.max;

  async function go() {
    setMsg(null);
    setBusy(true);
    track("Wallet Topup Clicked", { amount });
    try {
      const { intent, checkout } = await secureCall("wallet.topup", { amount });
      track("Razorpay Opened", { amount, flow: "wallet_topup" });
      const payment = await openRazorpay(checkout);
      if (payment.status !== "paid") {
        track("Razorpay Dismissed", { flow: "wallet_topup" });
        setMsg({ tone: "warn", text: "Payment was cancelled. You weren't charged." });
        return;
      }
      const res = await secureCall("wallet.confirmTopup", { intent, razorpay: { paymentId: payment.paymentId, orderId: payment.orderId, signature: payment.signature } });
      setMsg(res.status === "credited" ? { tone: "success", text: `${inr(amount)} added to your Hash Wallet.` } : { tone: "warn", text: res.message });
      onDone();
    } catch (err) {
      track("Wallet Topup Failed", { amount, reason: String(err.code || err.status || "error") });
      setMsg({ tone: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-[#0e0e12] p-6">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-white"><Plus className="h-4 w-4 text-[#ff9a3d]" aria-hidden /> Add money</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {TOPUP_PRESETS.map((n) => (
          <button key={n} type="button" aria-pressed={amount === n} onClick={() => setAmount(n)} className={cx("rounded-full py-2 text-sm font-medium transition", amount === n ? "bg-white text-black" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]")}>
            ₹{n}
          </button>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 focus-within:border-white/40">
        <span className="text-white/50">₹</span>
        <input
          type="number"
          inputMode="numeric"
          min={limits.min}
          max={limits.max}
          value={Number.isFinite(amount) ? amount : ""}
          onChange={(e) => setAmount(Math.floor(Number(e.target.value)))}
          aria-label="Amount to add"
          className="w-full bg-transparent text-[15px] text-white outline-none"
        />
      </label>
      {!valid && <p className="mt-2 text-xs text-amber-200">Enter between ₹{limits.min} and ₹{limits.max.toLocaleString("en-IN")}.</p>}
      {msg && <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <Button className="mt-4 w-full" loading={busy} disabled={!valid} onClick={go}>Add {valid ? inr(amount) : "money"}</Button>
      <p className="mt-2 text-center text-[11px] text-white/35">UPI, card or netbanking via Razorpay</p>
    </div>
  );
}

function WalletTab({ wallet, onRefresh }) {
  if (!wallet) return <Spinner label="Loading wallet" />;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#3b0f2a] via-[#141018] to-[#3b2208] p-6">
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-white/55"><Wallet className="h-4 w-4" aria-hidden /> Hash Wallet</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{inr(wallet.balance)}</p>
          <p className="mt-2 text-sm text-white/55">Pay for cafe slots and passes in one tap.{wallet.topup ? "" : " Top up from the Hash app."}</p>
        </div>
        {wallet.topup && <TopUp limits={wallet.topup} onDone={onRefresh} />}
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0e0e12] p-6">
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-white/55"><Coins className="h-4 w-4 text-[#ffd23d]" aria-hidden /> Hash Coins</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{wallet.coins == null ? "—" : wallet.coins.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-white/55">Earned from bookings, games and tournaments. Redeem them in the Hash app.</p>
        </div>
      </div>
      <div className="rounded-[24px] border border-white/[0.08] bg-[#0e0e12] p-2 sm:p-3">
        <p className="flex items-center gap-2 px-3 pb-1 pt-3 text-[15px] font-semibold text-white"><Receipt className="h-4 w-4 text-white/45" aria-hidden /> Transactions</p>
        {wallet.transactions.length === 0 ? (
          <p className="px-3 py-6 text-sm text-white/50">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {wallet.transactions.map((t, i) => (
              <li key={`${t.id}-${i}`} className="flex items-center justify-between gap-4 px-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[15px] text-white">{t.label}</p>
                  <p className="text-xs text-white/40">{[fmtDate(t.date, { day: "numeric", month: "short", year: "numeric" }), t.time && formatTime(t.time), t.via].filter(Boolean).join(" · ")}</p>
                </div>
                <span className={cx("shrink-0 text-[15px] font-medium", t.direction === "in" ? "text-emerald-300" : "text-white")}>
                  {t.direction === "in" ? "+" : "−"}
                  {inr(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ passes */

function PassesTab({ mine, available, balance, onBought }) {
  if (!mine || !available) return <Spinner label="Loading passes" />;
  const groups = [
    ["hash", "Hash passes", mine.filter((p) => p.scope === "hash")],
    ["cafe", "Cafe passes", mine.filter((p) => p.scope !== "hash")],
  ].filter(([, , list]) => list.length);
  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-[17px] font-semibold text-white">My passes</h3>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-white/50">No active passes. A pass covers your slots, so you book without paying each time.</p>
        ) : (
          groups.map(([id, label, list]) => (
            <div key={id} className="mt-4">
              {groups.length > 1 && <p className="mb-2.5 text-[13px] font-medium text-white/55">{label}</p>}
              <ul className="grid gap-3 sm:grid-cols-2">
                {list.map((p) => (
                  <li key={p.id} className="relative overflow-hidden rounded-[22px] border border-white/[0.1] bg-gradient-to-br from-[#2a0838] via-[#111015] to-[#3b1a0a] p-5">
                    <p className="flex items-center gap-2 pr-16 text-[12px] font-medium uppercase tracking-[0.14em] text-white/55"><Ticket className="h-4 w-4" aria-hidden /> {p.scope === "hash" ? "Any Hash cafe" : p.vendorName}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{p.name}</p>
                    <p className="mt-1 text-sm text-white/60">{p.validTo ? `Valid ${fmtDate(p.validFrom, { day: "numeric", month: "short" })} – ${fmtDate(p.validTo, { day: "numeric", month: "short", year: "numeric" })}` : "Active"}</p>
                    <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[12px] font-medium text-emerald-200">Active</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section>
        <h3 className="text-[17px] font-semibold text-white">Get a pass</h3>
        <div className="mt-4">
          <PassCatalog passes={available} balance={balance} onBought={onBought} source="account" />
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ orders */

function OrdersTab({ orders }) {
  if (!orders) return <Spinner label="Loading orders" />;
  if (!orders.length) {
    return (
      <Empty bare title="No orders yet">
        <Link href="/marketplace" className="text-white underline underline-offset-2">Visit the marketplace</Link>
      </Empty>
    );
  }
  return (
    <ul className="grid gap-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="flex items-center gap-4 rounded-[22px] border border-white/[0.08] bg-[#0e0e12] p-3 transition hover:border-white/20 sm:p-4">
            <Thumb src={o.items?.[0]?.thumbnail} className="h-16 w-16" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-white">Order #{o.displayId}</p>
              <p className="truncate text-[13px] text-white/50">{o.items.map((i) => `${i.title} ×${i.quantity}`).join(", ")}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[15px] font-medium text-white">{inr(o.total)}</p>
              <p className="text-xs text-white/40">{fmtDate(o.createdAt, { day: "numeric", month: "short" })}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------- page */

export default function AccountView() {
  const { user, ready, logout } = useAuth();
  const requireLogin = useRequireLogin();
  const [tab, setTabState] = useState("bookings");
  const [bookings, setBookings] = useState(null);
  const [orders, setOrders] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [passes, setPasses] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");

  // The tab follows the URL hash, so "My bookings", "Orders" etc. links land on the right list.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      setTabState(TABS.some((t) => t.id === h) ? h : "bookings");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const setTab = (next) => {
    setTabState(next);
    try {
      window.history.replaceState(null, "", `#${next}`);
    } catch {}
  };

  const loadAll = useCallback(() => {
    setError("");
    const fail = (err) => setError(err.message);
    secureCall("bookings.mine").then(setBookings).catch(fail);
    secureCall("wallet.summary").then(setWallet).catch(() => setWallet({ balance: 0, coins: null, transactions: [] }));
    secureCall("passes.mine").then((d) => setPasses(d.passes)).catch(() => setPasses([]));
  }, []);
  const loadPassCatalog = useCallback(() => {
    secureCall("passes.available").then((d) => setCatalog(d.passes)).catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      requireLogin();
      return;
    }
    if (bookings === null && wallet === null) loadAll();
  }, [ready, user, bookings, wallet, loadAll, requireLogin]);

  useEffect(() => {
    if (!user) return;
    if (tab === "orders" && orders === null) secureCall("store.orders").then((d) => setOrders(d.orders)).catch((err) => setError(err.message));
    if (tab === "passes" && catalog === null) loadPassCatalog();
  }, [tab, user, orders, catalog, loadPassCatalog]);

  if (!ready || !user) return <Spinner label="Loading account" />;

  const upcomingCount = bookings ? mergeVisits(bookings.bookings.filter((b) => !b.incomplete && b.upcoming)).length : null;
  const initial = (user.name || user.handle || "P").trim().charAt(0).toUpperCase();
  const stats = [
    { label: "Hash Wallet", value: wallet ? inr(wallet.balance) : "…", icon: Wallet, tab: "wallet" },
    { label: "Hash Coins", value: wallet ? (wallet.coins == null ? "—" : wallet.coins.toLocaleString("en-IN")) : "…", icon: Coins, tab: "wallet" },
    { label: "Active passes", value: passes ? String(passes.length) : "…", icon: Ticket, tab: "passes" },
    { label: "Upcoming", value: upcomingCount == null ? "…" : String(upcomingCount), icon: CalendarDays, tab: "bookings" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] text-2xl font-semibold text-black">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[28px] font-semibold tracking-tight text-white sm:text-[32px]">{user.handle || user.name || "Player"}</h1>
            <p className="truncate text-sm text-white/50">{[user.handle && user.name, user.phone, user.email].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SecureBadge className="hidden sm:inline-flex" />
          <Button variant="subtle" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} type="button" onClick={() => setTab(s.tab)} className="rounded-[22px] border border-white/[0.08] bg-[#0e0e12] p-4 text-left transition hover:border-white/20 sm:p-5">
            <span className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] text-white/45">
              <s.icon className="h-4 w-4" aria-hidden /> {s.label}
            </span>
            <span className="mt-2 block text-2xl font-semibold tracking-tight text-white">{s.value}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 border-b border-white/[0.08]">
        <div className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Account">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cx("inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-[14px] sm:gap-2 sm:px-4 sm:text-[15px] font-medium transition", tab === t.id ? "border-white text-white" : "border-transparent text-white/50 hover:text-white")}
            >
              <t.icon className="h-4 w-4" aria-hidden /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {error && (
          <div className="mb-4">
            <Notice action={<Button variant="subtle" onClick={loadAll}>Retry</Button>}>{error}</Notice>
          </div>
        )}
        {tab === "bookings" && <Bookings data={bookings} />}
        {tab === "wallet" && <WalletTab wallet={wallet} onRefresh={() => secureCall("wallet.summary").then(setWallet).catch(() => {})} />}
        {tab === "passes" && (
          <PassesTab
            mine={passes}
            available={catalog}
            balance={wallet?.balance ?? null}
            onBought={() => {
              setPasses(null);
              setCatalog(null);
              setWallet(null);
              secureCall("passes.mine").then((d) => setPasses(d.passes)).catch(() => setPasses([]));
              secureCall("wallet.summary").then(setWallet).catch(() => {});
              loadPassCatalog();
            }}
          />
        )}
        {tab === "orders" && <OrdersTab orders={orders} />}
      </div>
    </div>
  );
}
