"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, Clock, Coins, Gamepad2, LogOut, Package, Receipt, Ticket, Wallet } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { openRazorpay } from "@/lib/razorpay-client";
import { track } from "@/lib/analytics-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Empty, Notice, Panel, SecureBadge, Spinner, cx, formatTime, inr } from "./ui";

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

function BookingCard({ b }) {
  const when = b.date ? fmtDate(b.date) : b.requestedAt ? `Requested ${fmtDate(b.requestedAt, { day: "numeric", month: "short" })}` : "";
  const time = b.start ? `${formatTime(b.start)}${b.end ? ` – ${formatTime(b.end)}` : ""}` : "";
  return (
    <li className="flex min-w-0 gap-3 rounded-[22px] border border-white/[0.08] bg-[#0e0e12] p-3 sm:gap-4 sm:p-4">
      <Thumb src={b.cafeImage} className="h-16 w-16 sm:h-24 sm:w-32" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-white">{b.cafeName}</p>
            <p className="truncate text-[13px] text-white/45">{[b.cafeArea, b.console, b.mode].filter(Boolean).join(" · ")}</p>
          </div>
          <StatusBadge status={b.status} />
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-1 pt-3 text-[13px] text-white/65">
          <span className="flex min-w-0 max-w-full flex-wrap items-center gap-x-4 gap-y-1">
            {when && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-white/35" aria-hidden /> {when}
              </span>
            )}
            {time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-white/35" aria-hidden /> {time}
              </span>
            )}
          </span>
          <span className="flex items-center gap-3">
            {b.amount > 0 && <span className="font-medium text-white">{inr(b.amount)}</span>}
            <span className="text-white/30">#{b.id}</span>
            {b.cafeHref && (
              <Link href={b.cafeHref} className="font-semibold text-white hover:text-[#ff9a3d]">
                Book again
              </Link>
            )}
          </span>
        </div>
      </div>
    </li>
  );
}

function Bookings({ data, onRetry }) {
  const [view, setView] = useState("upcoming");
  const [showIncomplete, setShowIncomplete] = useState(false);
  const groups = useMemo(() => {
    if (!data) return null;
    const today = data.today;
    const complete = data.bookings.filter((b) => !b.incomplete);
    const upcoming = complete
      .filter((b) => (b.date ? b.date >= today : ["warn", "success"].includes(b.status.tone)) && b.status.tone !== "danger")
      .sort((a, b) => `${a.date || ""}${a.start || ""}`.localeCompare(`${b.date || ""}${b.start || ""}`));
    const upcomingIds = new Set(upcoming.map((b) => b.id));
    const past = complete.filter((b) => !upcomingIds.has(b.id));
    return { upcoming, past, incomplete: data.bookings.filter((b) => b.incomplete) };
  }, [data]);

  if (!groups) return <Spinner label="Loading bookings" />;
  const list = view === "upcoming" ? groups.upcoming : groups.past;
  return (
    <div>
      <div className="inline-flex rounded-full bg-white/[0.05] p-1" role="tablist" aria-label="Bookings">
        {[
          ["upcoming", `Upcoming${groups.upcoming.length ? ` (${groups.upcoming.length})` : ""}`],
          ["past", "Past"],
        ].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)} className={cx("rounded-full px-4 py-2 text-sm font-medium transition", view === id ? "bg-white text-black" : "text-white/60 hover:text-white")}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-5 rounded-[22px] border border-dashed border-white/10 p-8 text-center">
          <p className="text-[15px] font-medium text-white">{view === "upcoming" ? "Nothing booked yet" : "No past bookings"}</p>
          <p className="mt-1 text-sm text-white/50">Find a cafe near you and lock in a slot in a few taps.</p>
          <Link href="/book" className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#ff9a3d]">Book a cafe</Link>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3">
          {list.map((b) => <BookingCard key={b.id} b={b} />)}
        </ul>
      )}

      {groups.incomplete.length > 0 && (
        <div className="mt-6">
          <button type="button" onClick={() => setShowIncomplete((x) => !x)} aria-expanded={showIncomplete} className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white/80">
            <ChevronDown className={cx("h-4 w-4 transition", showIncomplete && "rotate-180")} aria-hidden />
            {groups.incomplete.length} {groups.incomplete.length === 1 ? "attempt" : "attempts"} that didn&apos;t go through
          </button>
          {showIncomplete && (
            <>
              <p className="mt-2 text-xs text-white/40">Payment wasn&apos;t completed, so no slot was held and nothing was charged.</p>
              <ul className="mt-3 grid gap-3 opacity-70">
                {groups.incomplete.map((b) => <BookingCard key={b.id} b={b} />)}
              </ul>
            </>
          )}
        </div>
      )}
      {onRetry && null}
    </div>
  );
}

/* ------------------------------------------------------------------ wallet */

function WalletTab({ wallet }) {
  if (!wallet) return <Spinner label="Loading wallet" />;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#3b0f2a] via-[#141018] to-[#3b2208] p-6">
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-white/55"><Wallet className="h-4 w-4" aria-hidden /> Hash Wallet</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{inr(wallet.balance)}</p>
          <p className="mt-2 text-sm text-white/55">Pay for cafe slots and passes in one tap. Top up from the Hash app.</p>
        </div>
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
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null);

  async function buy(pass, method) {
    setMessage(null);
    setBusy(`${pass.id}:${method}`);
    try {
      const res = await secureCall("passes.buy", { passId: pass.id, method });
      if (res.status === "payment_required") {
        const payment = await openRazorpay(res.checkout);
        if (payment.status !== "paid") {
          setMessage({ tone: "warn", text: "Payment was cancelled. You weren't charged." });
          return;
        }
        const done = await secureCall("passes.confirmPayment", { intent: res.intent, razorpay: { paymentId: payment.paymentId, orderId: payment.orderId, signature: payment.signature } });
        if (done.status === "needs_attention") {
          setMessage({ tone: "warn", text: done.message });
          onBought();
          return;
        }
      }
      track("Pass Purchased", { pass_id: pass.id, payment_method: method });
      setMessage({ tone: "success", text: `${pass.name} is active. Pick it under "Pay with" when you book.` });
      onBought();
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setBusy("");
    }
  }

  if (!mine || !available) return <Spinner label="Loading passes" />;
  const forSale = available.filter((p) => !p.owned);
  return (
    <div className="space-y-8">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <section>
        <h3 className="text-[17px] font-semibold text-white">My passes</h3>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-white/50">No active passes. A pass covers your slots, so you book without paying each time.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {mine.map((p) => (
              <li key={p.id} className="relative overflow-hidden rounded-[22px] border border-white/[0.1] bg-gradient-to-br from-[#2a0838] via-[#111015] to-[#3b1a0a] p-5">
                <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-white/55"><Ticket className="h-4 w-4" aria-hidden /> {p.vendorName}</p>
                <p className="mt-2 text-xl font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-sm text-white/60">{p.validTo ? `Valid ${fmtDate(p.validFrom, { day: "numeric", month: "short" })} – ${fmtDate(p.validTo, { day: "numeric", month: "short", year: "numeric" })}` : "Active"}</p>
                <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[12px] font-medium text-emerald-200">Active</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-[17px] font-semibold text-white">Get a pass</h3>
        {forSale.length === 0 ? (
          <p className="mt-2 text-sm text-white/50">{available.length ? "You already own every pass on sale." : "No passes on sale right now."}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {forSale.map((p) => (
              <li key={p.id} className="flex flex-col rounded-[22px] border border-white/[0.08] bg-[#0e0e12] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium uppercase tracking-[0.14em] text-white/45">{p.vendorName}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{p.name}</p>
                  </div>
                  <p className="shrink-0 text-xl font-semibold text-white">{inr(p.price)}</p>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-white/55">
                  {p.description || (p.mode === "hour" ? `${p.totalHours || ""} hours of play` : `Unlimited slots for ${p.daysValid} days`)}
                </p>
                <p className="mt-2 text-xs text-white/40">{p.mode === "hour" ? `${p.totalHours} hours` : `${p.daysValid} days`} · {p.vendorId == null ? "All Hash cafes" : "This cafe only"}</p>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                  <Button size="sm" loading={busy === `${p.id}:online`} disabled={Boolean(busy)} onClick={() => buy(p, "online")}>Pay {inr(p.price)}</Button>
                  <Button size="sm" variant="subtle" loading={busy === `${p.id}:wallet`} disabled={Boolean(busy) || (balance != null && balance < p.price)} onClick={() => buy(p, "wallet")}>
                    Wallet
                  </Button>
                </div>
                {balance != null && balance < p.price && <p className="mt-2 text-xs text-white/35">Wallet balance {inr(balance)}</p>}
              </li>
            ))}
          </ul>
        )}
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

  const upcomingCount = bookings ? bookings.bookings.filter((b) => !b.incomplete && b.date && b.date >= bookings.today && ["success", "warn"].includes(b.status.tone)).length : null;
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
        {tab === "wallet" && <WalletTab wallet={wallet} />}
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
