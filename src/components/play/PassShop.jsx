"use client";

import { useState } from "react";
import { Globe2, Store, Ticket } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { openRazorpay } from "@/lib/razorpay-client";
import { track } from "@/lib/analytics-client";
import { Button, Notice, cx, inr } from "./ui";

/*
 * Pass catalogue shared by My account and the cafe page. Online purchase is a
 * backend-priced Razorpay order; wallet purchase goes straight to the same
 * purchase endpoint the app uses.
 */

export function usePassBuy(onBought, source) {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null);

  async function buy(pass, method) {
    setMessage(null);
    setBusy(`${pass.id}:${method}`);
    track("Pass Buy Clicked", { pass_id: pass.id, scope: pass.scope, price: pass.price, payment_method: method, source });
    try {
      const res = await secureCall("passes.buy", { passId: pass.id, method });
      if (res.status === "payment_required") {
        track("Razorpay Opened", { amount: res.checkout.amount / 100, flow: "pass" });
        const payment = await openRazorpay(res.checkout);
        if (payment.status !== "paid") {
          track("Razorpay Dismissed", { flow: "pass" });
          setMessage({ tone: "warn", text: "Payment was cancelled. You weren't charged." });
          return;
        }
        const done = await secureCall("passes.confirmPayment", { intent: res.intent, razorpay: { paymentId: payment.paymentId, orderId: payment.orderId, signature: payment.signature } });
        if (done.status === "needs_attention") {
          setMessage({ tone: "warn", text: done.message });
          onBought?.();
          return;
        }
      }
      track("Pass Purchased", { pass_id: pass.id, scope: pass.scope, payment_method: method, source });
      setMessage({ tone: "success", text: `${pass.name} is active. Pick it under "Pay with" when you book.` });
      onBought?.();
    } catch (err) {
      track("Pass Purchase Failed", { pass_id: pass.id, payment_method: method, reason: String(err.code || err.status || "error"), source });
      setMessage({ tone: "error", text: err.message });
    } finally {
      setBusy("");
    }
  }
  return { busy, message, buy };
}

export function PassCard({ pass: p, busy, balance, onBuy, showVendor = true }) {
  const short = balance != null && balance < p.price;
  return (
    <li className="flex min-w-0 flex-col rounded-[22px] border border-white/[0.08] bg-[#0e0e12] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showVendor && <p className="truncate text-[12px] font-medium uppercase tracking-[0.14em] text-white/45">{p.scope === "hash" ? "Any Hash cafe" : p.vendorName}</p>}
          <p className={cx("text-lg font-semibold text-white", showVendor && "mt-1")}>{p.name}</p>
        </div>
        <p className="shrink-0 text-xl font-semibold text-white">{inr(p.price)}</p>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-white/55">
        {p.description || (p.mode === "hour" ? `${p.totalHours || ""} hours of play` : `Unlimited slots for ${p.daysValid} days`)}
      </p>
      <p className="mt-2 text-xs text-white/40">
        {p.mode === "hour" ? `${p.totalHours} hours` : `${p.daysValid} ${p.daysValid === 1 ? "day" : "days"}`} · {p.scope === "hash" ? "Works at every Hash cafe" : "This cafe only"}
      </p>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <Button size="sm" loading={busy === `${p.id}:online`} disabled={Boolean(busy)} onClick={() => onBuy(p, "online")}>Pay {inr(p.price)}</Button>
        <Button size="sm" variant="subtle" loading={busy === `${p.id}:wallet`} disabled={Boolean(busy) || short} onClick={() => onBuy(p, "wallet")}>
          Wallet
        </Button>
      </div>
      {short && <p className="mt-2 text-xs text-white/35">Wallet balance {inr(balance)}</p>}
    </li>
  );
}

/** Hash passes first, then cafe passes grouped under each cafe (with a cafe filter). */
export function PassCatalog({ passes, balance, onBought, source = "account" }) {
  const { busy, message, buy } = usePassBuy(onBought, source);
  const [cafe, setCafe] = useState("all");
  const forSale = passes.filter((p) => !p.owned);
  const hash = forSale.filter((p) => p.scope === "hash");
  const cafePasses = forSale.filter((p) => p.scope === "cafe");
  const cafes = [...new Map(cafePasses.map((p) => [String(p.vendorId), p.vendorName])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const shownCafes = cafe === "all" ? cafes : cafes.filter(([id]) => id === cafe);

  if (!forSale.length) {
    return <p className="mt-2 text-sm text-white/50">{passes.length ? "You already own every pass on sale." : "No passes on sale right now."}</p>;
  }
  return (
    <div className="space-y-8">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {hash.length > 0 && (
        <section>
          <h4 className="flex items-center gap-2 text-[15px] font-semibold text-white"><Globe2 className="h-4 w-4 text-[#ff9a3d]" aria-hidden /> Hash passes</h4>
          <p className="mt-1 text-sm text-white/45">Play at any Hash partner cafe that accepts Hash passes.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {hash.map((p) => <PassCard key={p.id} pass={p} busy={busy} balance={balance} onBuy={buy} showVendor={false} />)}
          </ul>
        </section>
      )}
      {cafes.length > 0 && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h4 className="flex items-center gap-2 text-[15px] font-semibold text-white"><Store className="h-4 w-4 text-[#ff9a3d]" aria-hidden /> Cafe passes</h4>
              <p className="mt-1 text-sm text-white/45">Cheaper passes for one cafe you visit often.</p>
            </div>
            {cafes.length > 1 && (
              <select aria-label="Filter passes by cafe" value={cafe} onChange={(e) => setCafe(e.target.value)} className="rounded-full border border-white/10 bg-black px-4 py-2 text-sm text-white/80">
                <option value="all">All cafes ({cafes.length})</option>
                {cafes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            )}
          </div>
          <div className="mt-4 space-y-6">
            {shownCafes.map(([id, name]) => (
              <div key={id}>
                <p className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-white/60"><Ticket className="h-3.5 w-3.5" aria-hidden /> {name}</p>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {cafePasses.filter((p) => String(p.vendorId) === id).map((p) => <PassCard key={p.id} pass={p} busy={busy} balance={balance} onBuy={buy} showVendor={false} />)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
