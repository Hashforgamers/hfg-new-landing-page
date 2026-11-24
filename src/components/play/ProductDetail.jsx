"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Truck } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Notice, SecureBadge, cx } from "./ui";

export function ProductGallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1a20] to-black">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl uppercase text-white/10">Hash</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={cx("h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition", i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100")}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Quantity + Add to bag / Buy now. Product data comes from the server-rendered page. */
export default function BuyBox({ product }) {
  const router = useRouter();
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const soldOut = product.available <= 0;
  const maxQty = Math.max(1, Math.min(10, product.available));

  useEffect(() => {
    track("Product Viewed", { product_id: product.id, vendor_id: product.vendorId, price: product.price });
  }, [product.id, product.vendorId, product.price]);

  async function add(goToCart) {
    if (!user) {
      requireLogin();
      return;
    }
    setBusy(goToCart ? "buy" : "add");
    setNotice(null);
    try {
      await secureCall("store.cart.add", { variantId: product.variantId, quantity: qty });
      track("Product Added", { product_id: product.id, quantity: qty, price: product.price });
      if (goToCart) router.push("/marketplace/cart");
      else setNotice({ tone: "success", text: "Added to your bag." });
    } catch (err) {
      setNotice({ tone: "error", text: err.message, mixed: err.code === "mixed_vendor" });
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <p className="text-sm text-white/50">{soldOut ? "Currently sold out" : product.available <= 5 ? `Only ${product.available} left` : "In stock"}</p>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
        <span className="text-[15px] text-white/70">Quantity</span>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Decrease quantity" className="rounded-full p-1.5 text-white/80 hover:bg-white/10 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center text-[17px] text-white" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" className="rounded-full p-1.5 text-white/80 hover:bg-white/10 disabled:opacity-30" disabled={qty >= maxQty} onClick={() => setQty((q) => q + 1)}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Button size="lg" disabled={soldOut} loading={busy === "buy"} onClick={() => add(true)}>
          Buy now
        </Button>
        <Button size="lg" variant="ghost" disabled={soldOut} loading={busy === "add"} onClick={() => add(false)}>
          Add to bag
        </Button>
      </div>

      {notice && (
        <div className="mt-4">
          <Notice
            tone={notice.tone}
            action={
              notice.mixed || notice.tone === "success" ? (
                <Link href="/marketplace/cart" className="text-sm font-semibold underline underline-offset-2">
                  View bag
                </Link>
              ) : null
            }
          >
            {notice.text}
          </Notice>
        </div>
      )}

      <ul className="mt-6 space-y-3 text-sm text-white/55">
        <li className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 text-white/40" aria-hidden /> {product.kind === "service" ? "Scheduled with the seller after you order" : "Tracked delivery, with an OTP on handover"}
        </li>
        <li>
          <SecureBadge />
        </li>
      </ul>
    </div>
  );
}
