"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { secureCall } from "@/lib/secure/client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Chip, Empty, Eyebrow, Notice, Panel, SecureBadge, Spinner, Title, formatTime, inr } from "./ui";

function bookingDate(b) {
  return b.book_date || b.booked_date || b.date || b.slot_date || "";
}

function BookingRow({ b }) {
  const status = String(b.status || b.booking_status || "").replace(/_/g, " ");
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div>
        <p className="text-[15px] font-medium">{b.cafe_name || b.vendor_name || b.vendorName || "Gaming cafe"}</p>
        <p className="text-xs text-white/60">
          {[b.game_name || b.console_type, bookingDate(b), b.start_time && `${formatTime(b.start_time)}${b.end_time ? ` – ${formatTime(b.end_time)}` : ""}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="text-right">
        {status && <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">{status}</span>}
        {(b.amount || b.total_amount) && <p className="mt-1 text-xs text-white/50">{inr(b.amount || b.total_amount)}</p>}
      </div>
    </li>
  );
}

export default function AccountView() {
  const { user, ready, logout } = useAuth();
  const requireLogin = useRequireLogin();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (which) => {
    setError("");
    try {
      if (which === "bookings") setBookings((await secureCall("bookings.mine")).bookings);
      else setOrders((await secureCall("store.orders")).orders);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      requireLogin();
      return;
    }
    if (tab === "bookings" && bookings === null) load("bookings");
    if (tab === "orders" && orders === null) load("orders");
  }, [ready, user, tab, bookings, orders, load, requireLogin]);

  if (!ready || !user) return <Spinner label="Loading account" />;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>My Account</Eyebrow>
          <Title className="mt-3">{user.handle || user.name || "Player"}</Title>
          <p className="mt-2 text-sm text-white/50">{[user.name, user.phone, user.email].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex items-center gap-3">
          <SecureBadge />
          <Button variant="subtle" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <Chip active={tab === "bookings"} onClick={() => setTab("bookings")}>Cafe bookings</Chip>
        <Chip active={tab === "orders"} onClick={() => setTab("orders")}>Marketplace orders</Chip>
      </div>

      <Panel className="mt-6">
        {error && <Notice action={<Button variant="subtle" onClick={() => load(tab)}>Retry</Button>}>{error}</Notice>}

        {tab === "bookings" && !error && (
          <>
            {bookings === null && <Spinner label="Loading bookings" />}
            {bookings?.length === 0 && (
              <Empty title="No bookings yet">
                <Link href="/book" className="text-white underline underline-offset-2">Book your first slot</Link>
              </Empty>
            )}
            {bookings?.length > 0 && (
              <ul className="divide-y divide-white/10">
                {bookings.map((b, i) => (
                  <BookingRow key={b.booking_id || b.id || i} b={b} />
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "orders" && !error && (
          <>
            {orders === null && <Spinner label="Loading orders" />}
            {orders?.length === 0 && (
              <Empty title="No orders yet">
                <Link href="/marketplace" className="text-white underline underline-offset-2">Visit the marketplace</Link>
              </Empty>
            )}
            {orders?.length > 0 && (
              <ul className="divide-y divide-white/10">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:text-white">
                      <div>
                        <p className="text-[15px] font-medium">Order #{o.displayId}</p>
                        <p className="text-xs text-white/60">
                          {o.items.map((i) => `${i.title} ×${i.quantity}`).join(", ").slice(0, 80)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{inr(o.total)}</p>
                        <p className="text-xs text-white/50">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
