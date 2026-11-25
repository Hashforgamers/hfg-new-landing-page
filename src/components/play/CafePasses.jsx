"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { PassCard, usePassBuy } from "./PassShop";
import { Button, Notice } from "./ui";

/** This cafe's own passes, on its page. Only shown when the cafe accepts cafe passes. */
export default function CafePasses({ vendorId, cafeName }) {
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const [accepts, setAccepts] = useState(null);
  const [passes, setPasses] = useState(null);
  const [owned, setOwned] = useState([]);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    secureCall("cafes.payments", { vendorId })
      .then((d) => setAccepts(Boolean(d.methods.cafePass)))
      .catch(() => setAccepts(false));
  }, [vendorId]);

  const load = useCallback(() => {
    secureCall("passes.available", { vendorId }).then((d) => setPasses(d.passes)).catch(() => setPasses([]));
    secureCall("passes.mine").then((d) => setOwned(d.passes.filter((p) => Number(p.vendorId) === Number(vendorId)))).catch(() => {});
    secureCall("wallet.balance").then((d) => setBalance(d.balance)).catch(() => {});
  }, [vendorId]);
  useEffect(() => {
    if (ready && user && accepts) load();
  }, [ready, user, accepts, load]);

  const { busy, message, buy } = usePassBuy(() => {
    load();
    window.dispatchEvent(new Event("hfg:passes-changed"));
  }, "cafe_page");

  if (!accepts) return null;
  const forSale = (passes || []).filter((p) => !p.owned);
  if (user && passes && !forSale.length && !owned.length) return null;

  return (
    <section aria-labelledby="passes-title">
      <h2 id="passes-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
        <Ticket className="h-5 w-5 text-[#ff9a3d]" aria-hidden /> Passes for {cafeName}
      </h2>
      <p className="mt-1 text-sm text-white/50">Pay once, then book slots here without paying each time.</p>
      {!ready ? null : !user ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/[0.08] bg-[#0e0e12] p-5">
          <p className="text-sm text-white/70">Sign in to see this cafe&apos;s passes and prices.</p>
          <Button size="sm" onClick={() => { track("Cafe Passes Sign In Clicked", { cafe_id: vendorId }); requireLogin(); }}>Sign in</Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {owned.length > 0 && <Notice tone="success">You have {owned.map((p) => p.name).join(", ")}. Pick it under &quot;Pay with&quot; when you book.</Notice>}
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          {passes === null ? (
            <p className="text-sm text-white/45">Loading passes…</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {forSale.map((p) => <PassCard key={p.id} pass={p} busy={busy} balance={balance} onBuy={buy} showVendor={false} />)}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
