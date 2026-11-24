"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { secureCall } from "@/lib/secure/client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Eyebrow, Field, Input, Notice, Panel, SecureBadge, Spinner, Title, inr } from "./ui";

// Labels from docs/HFG-DELIVERY-CHECKOUT.md and HFG-ORDER-TRACKING.md
const LABELS = {
  placed: "New order",
  payment_confirmed: "Payment confirmed",
  accepted: "Accepted",
  preparing: "Processing",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivery_attempted: "Delivery attempted",
  delivered: "Delivery confirmed",
  ready_for_service: "Ready for service",
  in_progress: "Service in progress",
  completed: "Service completed",
  canceled: "Order canceled",
  cancellation_pending: "Cancellation pending",
  carrier_delivered: "Courier reports delivered — awaiting OTP",
  return_in_progress: "Return in progress",
  carrier_update: "Carrier update",
};

const label = (s) => LABELS[s] || String(s || "").replace(/_/g, " ");

export default function OrderTracker({ orderId }) {
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);
  const failures = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await secureCall("store.order", { orderId });
      setOrder(data.order);
      setError("");
      failures.current = 0;
    } catch (err) {
      failures.current += 1;
      // Network errors never mean "canceled": keep the last known state.
      if (!order) setError(err.message);
    }
  }, [orderId, order]);

  useEffect(() => {
    if (!ready) return undefined;
    if (!user) {
      requireLogin();
      return undefined;
    }
    load();
    // Poll every 30s while visible, back off on errors (per the tracking contract).
    let timer;
    const schedule = () => {
      const delay = Math.min(30000 * 2 ** failures.current, 240000);
      timer = setTimeout(async () => {
        if (document.visibilityState === "visible") await load();
        schedule();
      }, delay);
    };
    schedule();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, orderId]);

  async function requestOtp() {
    setOtpBusy(true);
    setOtpError("");
    try {
      setOtp(await secureCall("store.order.otp", { orderId }));
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpBusy(false);
    }
  }

  async function requestCancel(e) {
    e.preventDefault();
    setCancelBusy(true);
    try {
      await secureCall("store.order.cancel", { orderId, reason });
      setCancelOpen(false);
      await load();
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setCancelBusy(false);
    }
  }

  if (error) return <Notice action={<Button variant="subtle" onClick={load}>Retry</Button>}>{error}</Notice>;
  if (!order) return <Spinner label="Loading order" />;

  const done = ["delivered", "completed", "canceled"].includes(order.stage);
  const cancelPending = Boolean(order.cancellation) || order.stage === "cancellation_pending";

  return (
    <div>
      <Link href="/account" className="text-xs uppercase tracking-[0.24em] text-white/50 hover:text-[#16FF00]">← My account</Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Order #{order.displayId}</Eyebrow>
          <Title className="mt-3 text-2xl md:text-3xl">{order.stage ? label(order.stage) : "Processing"}</Title>
          {order.onHold && <p className="mt-2 font-sans text-sm text-amber-200">On hold for review</p>}
        </div>
        <SecureBadge />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">Timeline</p>
          {order.timeline.length === 0 ? (
            <p className="mt-4 font-sans text-sm text-white/50">Your order is being registered. Updates appear here automatically.</p>
          ) : (
            <ol className="mt-5 space-y-5 border-l border-white/10 pl-6">
              {order.timeline.map((t) => (
                <li key={`${t.id}-${t.at}`} className="relative">
                  <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-black bg-[#16FF00]" aria-hidden />
                  <p className="text-sm font-bold uppercase tracking-[0.1em]">{label(t.status)}</p>
                  <p className="font-sans text-xs text-white/50">{t.at ? new Date(t.at).toLocaleString("en-IN") : ""}</p>
                  {t.note && <p className="mt-1 font-sans text-sm text-white/70">{t.note}</p>}
                </li>
              ))}
            </ol>
          )}
          {(order.courier || order.trackingNumber) && (
            <p className="mt-6 font-sans text-sm text-white/70">
              {order.courier} {order.trackingNumber && `· ${order.trackingNumber}`}{" "}
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[#16FF00] underline">Track parcel</a>
              )}
            </p>
          )}
          {order.expectedDelivery && <p className="mt-1 font-sans text-xs text-white/50">Expected by {order.expectedDelivery} (seller estimate)</p>}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">Items</p>
            <ul className="mt-3 space-y-2 font-sans text-sm">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-3"><span>{i.title} ×{i.quantity}</span><span>{inr(i.total)}</span></li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-bold"><span>Total</span><span>{inr(order.total)}</span></div>
          </Panel>

          {order.completionEligible && !done && !cancelPending && (
            <Panel>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">Completion code</p>
              <p className="mt-3 font-sans text-sm text-white/70">
                Only share this code with the seller after you&apos;ve received your order or service. Sharing it confirms delivery.
              </p>
              {otp?.code ? (
                <div className="mt-4 rounded-2xl border border-[#16FF00]/40 bg-[#16FF00]/10 p-4 text-center">
                  <p className="text-3xl font-black tracking-[0.5em] text-[#16FF00]">{otp.code}</p>
                  <p className="mt-2 font-sans text-xs text-white/60">Expires {new Date(otp.expiresAt).toLocaleTimeString("en-IN")}</p>
                </div>
              ) : (
                <Button className="mt-4 w-full" variant="ghost" loading={otpBusy} onClick={requestOtp}>Show completion code</Button>
              )}
              {otpError && <div className="mt-3"><Notice>{otpError}</Notice></div>}
            </Panel>
          )}

          {!done && !cancelPending && (
            <Panel>
              {!cancelOpen ? (
                <Button variant="danger" className="w-full" onClick={() => setCancelOpen(true)}>Request cancellation</Button>
              ) : (
                <form onSubmit={requestCancel} className="space-y-3">
                  <Field label="Reason"><Input required minLength={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
                  <p className="font-sans text-xs text-white/50">Hash reviews refunds separately. In-transit orders may be returned to the seller.</p>
                  <Button type="submit" variant="danger" className="w-full" loading={cancelBusy}>Send request</Button>
                </form>
              )}
            </Panel>
          )}
          {cancelPending && <Notice tone="warn">Cancellation requested ({label(order.cancellation?.status || "requested")}).</Notice>}
        </div>
      </div>
    </div>
  );
}
