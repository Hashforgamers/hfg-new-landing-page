"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Trash2 } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { openRazorpay } from "@/lib/razorpay-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Empty, Eyebrow, Field, Input, Notice, Panel, SecureBadge, Spinner, Title, buttonClass, inr } from "./ui";

const EMPTY_ADDRESS = { first_name: "", last_name: "", address_1: "", address_2: "", city: "", province: "", postal_code: "", phone: "" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function CartCheckout() {
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const [cart, setCart] = useState(undefined);
  const [error, setError] = useState("");
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [email, setEmail] = useState("");
  const [prepared, setPrepared] = useState(null);
  const [busy, setBusy] = useState("");
  const [flowError, setFlowError] = useState("");
  const [order, setOrder] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await secureCall("store.cart.get");
      setCart(data.cart);
      if (data.cart?.shippingAddress) setAddress((a) => ({ ...a, ...data.cart.shippingAddress }));
      if (data.cart) track("Cart Viewed", { items: data.cart.items.length });
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (ready && user) load();
  }, [ready, user, load]);

  // Order placed: the confirmation renders at the top of a now-short page.
  useEffect(() => {
    if (order) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [order]);

  // Start the address from the Hash profile.
  useEffect(() => {
    if (!user) return;
    const [first = "", ...rest] = String(user.name || "").split(" ");
    const phone = String(user.phone || "").replace(/[^\d+]/g, "");
    setAddress((a) => ({ ...a, first_name: a.first_name || first, last_name: a.last_name || rest.join(" "), phone: a.phone || (phone.includes("•") ? "" : phone) }));
  }, [user]);

  async function changeQty(item, quantity) {
    setBusy(`item:${item.id}`);
    setPrepared(null);
    try {
      const data = await secureCall("store.cart.update", { itemId: item.id, quantity });
      setCart(data.cart);
    } catch (err) {
      setFlowError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function onPrepare(e) {
    e.preventDefault();
    setFlowError("");
    setBusy("prepare");
    try {
      const data = await secureCall("store.checkout.prepare", { address, email: email || undefined });
      setCart(data.cart);
      setPrepared(data);
      // On phones the total sits below the form: bring the Pay button into view.
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setTimeout(() => document.getElementById("order-total")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      }
      track("Checkout Address Entered", { delivery_payer: data.delivery.payer });
    } catch (err) {
      setFlowError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function completeWithRetry() {
    // Capture can lag the Razorpay callback; keep the same cart and retry.
    for (let attempt = 0; attempt < 6; attempt++) {
      const res = await secureCall("store.checkout.complete");
      if (res.status === "order") return res;
      await sleep(1500 * (attempt + 1));
    }
    return null;
  }

  async function onPay() {
    setFlowError("");
    setBusy("pay");
    try {
      const { checkout } = await secureCall("store.checkout.pay");
      track("Razorpay Opened", { amount: checkout.amount / 100, flow: "marketplace" });
      const payment = await openRazorpay(checkout);
      if (payment.status !== "paid") {
        track("Razorpay Dismissed", { flow: "marketplace" });
        setFlowError("Payment was cancelled. Your cart is saved.");
        return;
      }
      setBusy("complete");
      const res = await completeWithRetry();
      if (res) {
        setOrder(res);
        setCart(null);
      } else {
        setFlowError("Payment received. We're still confirming it with the bank - check My Orders in a minute. Don't pay again.");
      }
    } catch (err) {
      setFlowError(err.message);
    } finally {
      setBusy("");
    }
  }

  if (ready && !user) {
    return (
      <Panel className="mx-auto max-w-xl text-center">
        <Title as="h2" className="text-xl">Sign in to see your cart</Title>
        <p className="mt-3 text-sm text-white/60">Your cart is saved to your Hash account.</p>
        <Button className="mt-6" onClick={requireLogin}>Sign in</Button>
      </Panel>
    );
  }

  if (order) {
    return (
      <Panel className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" aria-hidden />
        <Title as="h2" className="mt-4 text-xl md:text-2xl">Order placed</Title>
        <p className="mt-3 text-sm text-white/70">Order #{order.displayId || order.orderId}. The seller will accept and ship it soon.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/account/orders/${order.orderId}`} className={buttonClass()}>Track order</Link>
          <Link href="/marketplace" className={buttonClass({ variant: "subtle" })}>Keep shopping</Link>
        </div>
      </Panel>
    );
  }

  if (error) return <Notice action={<Button variant="subtle" onClick={load}>Retry</Button>}>{error}</Notice>;
  if (cart === undefined) return <Spinner label="Loading cart" />;

  if (!cart || !cart.items.length) {
    return (
      <div className="mx-auto max-w-xl">
        <Empty title="Your cart is empty">
          <Link href="/marketplace" className="text-white underline underline-offset-2">Browse the marketplace</Link>
        </Empty>
      </div>
    );
  }

  const set = (k) => (e) => {
    setPrepared(null);
    setAddress({ ...address, [k]: e.target.value });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Checkout</Eyebrow>
          <Title className="mt-3">Your cart</Title>
        </div>
        <SecureBadge />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Panel>
            <ul className="divide-y divide-white/10">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.thumbnail && <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{item.title}</p>
                    <p className="text-xs text-white/50">{inr(item.unitPrice)} each</p>
                  </div>
                  <select
                    aria-label="Quantity"
                    value={item.quantity}
                    disabled={busy === `item:${item.id}`}
                    onChange={(e) => changeQty(item, Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button type="button" aria-label="Remove" className="p-2 text-white/40 hover:text-red-300" onClick={() => changeQty(item, 0)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">Delivery address</p>
            <p className="mt-2 text-sm text-white/50">We&apos;ll work out delivery for this address before you pay.</p>
            <form onSubmit={onPrepare} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="First name"><Input required value={address.first_name} onChange={set("first_name")} autoComplete="given-name" /></Field>
              <Field label="Last name"><Input value={address.last_name} onChange={set("last_name")} autoComplete="family-name" /></Field>
              <div className="sm:col-span-2"><Field label="Address"><Input required minLength={4} value={address.address_1} onChange={set("address_1")} autoComplete="address-line1" /></Field></div>
              <div className="sm:col-span-2"><Field label="Landmark / line 2"><Input value={address.address_2} onChange={set("address_2")} autoComplete="address-line2" /></Field></div>
              <Field label="City"><Input required value={address.city} onChange={set("city")} autoComplete="address-level2" /></Field>
              <Field label="State"><Input required value={address.province} onChange={set("province")} autoComplete="address-level1" /></Field>
              <Field label="PIN code"><Input required inputMode="numeric" pattern="[1-9][0-9]{5}" value={address.postal_code} onChange={set("postal_code")} autoComplete="postal-code" /></Field>
              <Field label="Phone"><Input required inputMode="tel" pattern="\+?[0-9]{8,15}" value={address.phone} onChange={set("phone")} autoComplete="tel" /></Field>
              {!user?.email && (
                <div className="sm:col-span-2">
                  <Field label="Email for receipts"><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
                </div>
              )}
              <div className="sm:col-span-2">
                <Button type="submit" variant={prepared ? "ghost" : "primary"} loading={busy === "prepare"} className="w-full">
                  {prepared ? "Update address" : "Save address and continue"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Panel id="order-total">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">Order total</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/80"><span>Items</span><span>{inr(cart.subtotal)}</span></div>
              {cart.discount > 0 && <div className="flex justify-between text-emerald-300"><span>Discount</span><span>−{inr(cart.discount)}</span></div>}
              <div className="flex justify-between text-white/80">
                <span>Delivery</span>
                <span>{prepared ? (prepared.delivery.payer === "seller" ? "Free" : inr(cart.shipping)) : "After address"}</span>
              </div>
              {cart.tax > 0 && <div className="flex justify-between text-white/60"><span>Tax</span><span>{inr(cart.tax)}</span></div>}
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white"><span>Total</span><span>{inr(cart.total)}</span></div>
            </div>
            {flowError && <div className="mt-4"><Notice>{flowError}</Notice></div>}
            <Button className="mt-5 w-full" disabled={!prepared} loading={busy === "pay" || busy === "complete"} onClick={onPay}>
              {busy === "complete" ? "Confirming payment" : `Pay ${inr(cart.total)}`}
            </Button>
            {!prepared && <p className="mt-3 text-center text-xs text-white/50">Add your delivery address to continue.</p>}
            <p className="mt-3 text-[11px] leading-5 text-white/40">
              One seller per order. You&apos;ll get a completion code in My Orders to share with the seller only after delivery.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
