"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Eyebrow, Notice, Panel, SecureBadge, Spinner, Title, inr } from "./ui";

export default function ProductDetail({ productId }) {
  const router = useRouter();
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await secureCall("store.product", { productId });
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addToCart(goToCart) {
    if (!user) {
      requireLogin();
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await secureCall("store.cart.add", { variantId: product.variantId, quantity: qty });
      if (goToCart) router.push("/marketplace/cart");
      else setNotice({ tone: "success", text: "Added to your cart." });
    } catch (err) {
      setNotice({
        tone: "error",
        text: err.message,
        mixed: err.code === "mixed_vendor",
      });
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Notice action={<Button variant="subtle" onClick={load}>Retry</Button>}>{error}</Notice>;
  if (!product) return <Spinner label="Loading product" />;

  const gallery = product.images.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const soldOut = product.available <= 0;

  return (
    <div>
      <Link href="/marketplace" className="text-xs uppercase tracking-[0.24em] text-white/50 hover:text-[#16FF00]">← Marketplace</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-purple-900/40 via-black to-[#16FF00]/10">
            {gallery[image] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery[image]} alt={product.title} className="h-full w-full object-cover" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${i === image ? "border-[#16FF00]" : "border-white/10"}`}
                  aria-label={`Image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Eyebrow>{product.kind === "service" ? "Service" : "Product"} · {product.vendorName}</Eyebrow>
          <Title className="mt-3 text-2xl md:text-3xl">{product.title}</Title>
          {product.subtitle && <p className="mt-2 font-sans text-sm text-white/60">{product.subtitle}</p>}
          <p className="mt-5 text-3xl font-black text-[#16FF00]">{inr(product.price)}</p>
          <p className="mt-1 font-sans text-xs text-white/50">{soldOut ? "Currently sold out" : `${product.available} in stock`}</p>

          <Panel className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Quantity</span>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Decrease" className="rounded-full border border-white/15 p-2 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  className="rounded-full border border-white/15 p-2 disabled:opacity-30"
                  disabled={qty >= Math.min(10, product.available)}
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button variant="ghost" disabled={soldOut} loading={busy} onClick={() => addToCart(false)}>
                Add to cart
              </Button>
              <Button disabled={soldOut} loading={busy} onClick={() => addToCart(true)}>
                Buy now
              </Button>
            </div>
            {notice && (
              <div className="mt-4">
                <Notice
                  tone={notice.tone}
                  action={
                    notice.mixed ? (
                      <Link href="/marketplace/cart" className="text-xs uppercase tracking-[0.2em] underline">Open cart</Link>
                    ) : notice.tone === "success" ? (
                      <Link href="/marketplace/cart" className="text-xs uppercase tracking-[0.2em] underline">View cart</Link>
                    ) : null
                  }
                >
                  {notice.text}
                </Notice>
              </div>
            )}
            <div className="mt-4"><SecureBadge /></div>
          </Panel>

          {product.description && (
            <div className="mt-6 whitespace-pre-line font-sans text-sm leading-7 text-white/70">{product.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
