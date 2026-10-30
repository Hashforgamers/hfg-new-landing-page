"use client";

import { useEffect } from "react";

// Same Google publisher account as the Mumbai Surfer app's AdMob ads.
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8804377047878009";

// One AdSense unit in a quiet, labelled frame. Without an ad unit id (slot) it shows an empty
// placeholder of the same size, since AdSense serves nothing to a unit with no slot.
export default function AdSlot({ slot, className = "", format = "auto" }) {
  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Blocked by an ad blocker or not loaded yet: leave the slot empty.
    }
  }, []);

  return (
    <aside aria-label="Advertisement" className={`flex flex-col ${className}`}>
      <span className="font-tech mb-2 text-center text-[9px] uppercase tracking-[0.3em] text-white/30">Advertisement</span>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025]">
        {slot ? (
          <ins
            className="adsbygoogle block h-full w-full"
            data-ad-client={CLIENT}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          <span className="font-tech text-[10px] uppercase tracking-[0.25em] text-white/15">Ad space</span>
        )}
      </div>
    </aside>
  );
}
