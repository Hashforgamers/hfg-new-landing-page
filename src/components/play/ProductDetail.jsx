"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Link2, Maximize2, Minus, Plus, Share2, Truck, X } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { useAuth, useRequireLogin } from "./PlayShell";
import { Button, Notice, SecureBadge, cx, inr } from "./ui";

const PENDING_KEY = "hfg_pending_cart_add";

/* ------------------------------------------------------------------ gallery */

function useSwipe(onPrev, onNext) {
  const start = useRef(null);
  return {
    onTouchStart: (e) => (start.current = e.touches[0].clientX),
    onTouchEnd: (e) => {
      if (start.current == null) return;
      const dx = e.changedTouches[0].clientX - start.current;
      start.current = null;
      if (Math.abs(dx) > 40) (dx > 0 ? onPrev : onNext)();
    },
  };
}

export function Lightbox({ images, index, setIndex, title, onClose }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const prev = useCallback(() => { setZoom(false); setIndex((i) => (i - 1 + images.length) % images.length); }, [images.length, setIndex]);
  const next = useCallback(() => { setZoom(false); setIndex((i) => (i + 1) % images.length); }, [images.length, setIndex]);
  const swipe = useSwipe(prev, next);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/60 sm:px-8">
        <span>
          {index + 1} / {images.length}
        </span>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Close photos">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" {...swipe}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${title} ${index + 1}`}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            setZoom((z) => !z);
          }}
          style={{ transformOrigin: origin }}
          className={cx("max-h-full max-w-full select-none object-contain transition-transform duration-300", zoom ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in")}
        />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:block">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={next} aria-label="Next photo" className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:block">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none]">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => { setZoom(false); setIndex(i); }} aria-label={`Photo ${i + 1}`} className={cx("h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2", i === index ? "border-white" : "border-transparent opacity-50 hover:opacity-100")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Product photos: main image with arrows and swipe, thumbnail rail, full-screen zoom. */
export function ProductGallery({ images, title, activeImage = "" }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const swipe = useSwipe(prev, next);

  // A colour pick with its own photo jumps to it.
  useEffect(() => {
    const i = activeImage ? images.indexOf(activeImage) : -1;
    if (i >= 0) setIndex(i);
  }, [activeImage, images]);

  if (!count) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[32px] bg-gradient-to-br from-[#1a1a20] to-black font-display text-5xl uppercase text-white/10">Hash</div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] lg:max-h-[620px] lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={cx("h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-white/[0.04] transition lg:h-20 lg:w-20", i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100")}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="group relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1a20] to-black" {...swipe}>
        <button type="button" onClick={() => setOpen(true)} className="block h-full w-full cursor-zoom-in" aria-label="Open photo full screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[index]} alt={index === 0 ? title : `${title} photo ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        </button>
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden /> {count > 1 ? `${index + 1} / ${count}` : "Zoom"}
        </span>
        {count > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition hover:bg-black/70 focus:opacity-100 group-hover:opacity-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition hover:bg-black/70 focus:opacity-100 group-hover:opacity-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {open && <Lightbox images={images} index={index} setIndex={setIndex} title={title} onClose={() => setOpen(false)} />}
    </div>
  );
}

/* -------------------------------------------------------------------- share */

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export function ShareMenu({ title, text }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const url = () => {
    const u = new URL(window.location.href);
    u.search = "";
    u.hash = "";
    u.searchParams.set("utm_source", "share");
    return u.toString();
  };

  async function onShare() {
    track("Share Clicked", { title });
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, text, url: url() });
        track("Shared", { method: "native" });
      } catch {}
      return;
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      track("Shared", { method: "copy" });
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={onShare} className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white/85 transition hover:border-white/40 hover:text-white" aria-expanded={open}>
        <Share2 className="h-4 w-4" aria-hidden /> Share
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-white/10 bg-[#121216] p-2 shadow-2xl">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${typeof window !== "undefined" ? url() : ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("Shared", { method: "whatsapp" })}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 hover:bg-white/10"
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          <button type="button" onClick={copy} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/10">
            {copied ? <Check className="h-4 w-4 text-emerald-300" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- options */

const SWATCH = {
  black: "#111", white: "#f5f5f5", grey: "#8a8a8f", gray: "#8a8a8f", silver: "#c9cbd0", red: "#e53935", blue: "#1e63e9", navy: "#1b2a4a",
  green: "#2e9d55", yellow: "#f6c945", orange: "#ff8a1f", pink: "#ff5ca8", purple: "#7b4ae2", gold: "#d4af37", brown: "#7a4e2d", beige: "#e3d5b8",
};
const swatchFor = (value) => {
  const key = String(value).toLowerCase().split(/[\s/]+/).find((w) => SWATCH[w]);
  return key ? SWATCH[key] : null;
};

function OptionPicker({ option, selected, onPick, isAvailable }) {
  const colour = /colou?r/i.test(option.title);
  return (
    <fieldset>
      <legend className="text-sm text-white/55">
        {option.title}: <span className="text-white">{selected || "Choose"}</span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {option.values.map((value) => {
          const active = value === selected;
          const ok = isAvailable(value);
          const sw = colour ? swatchFor(value) : null;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              aria-label={`${option.title} ${value}${ok ? "" : ", sold out"}`}
              onClick={() => onPick(value)}
              className={cx(
                "relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                active ? "border-white bg-white/[0.08] text-white" : "border-white/15 text-white/75 hover:border-white/40",
                !ok && "opacity-40 line-through",
              )}
            >
              {sw && <span className="h-4 w-4 rounded-full border border-white/25" style={{ background: sw }} aria-hidden />}
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ buy box */

/** Title block, price, variant pickers, quantity, Add to cart / Buy now and share. */
export default function BuyBox({ product, onImage }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const variants = product.variants || [];
  const options = product.options || [];

  const initial = useMemo(() => variants.find((v) => v.id === product.variantId) || variants[0] || null, [variants, product.variantId]);
  const [picked, setPicked] = useState(() => (initial ? { ...initial.options } : {}));
  const variant = useMemo(
    () => (variants.length ? variants.find((v) => options.every((o) => v.options[o.title] === picked[o.title])) || null : null),
    [variants, options, picked],
  );
  const current = variant || (variants.length ? null : { id: product.variantId, price: product.price, available: product.available });

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const soldOut = !current || current.available <= 0;
  const maxQty = Math.max(1, Math.min(10, current?.available || 1));

  useEffect(() => {
    track("Product Viewed", { product_id: product.id, vendor_id: product.vendorId, price: product.price });
  }, [product.id, product.vendorId, product.price]);

  useEffect(() => {
    setQty((q) => Math.min(q, maxQty));
    if (variant?.image) onImage?.(variant.image);
  }, [variant, maxQty, onImage]);

  const isAvailable = (title) => (value) =>
    variants.some((v) => v.options[title] === value && v.available > 0 && options.every((o) => o.title === title || v.options[o.title] === picked[o.title]));

  // After sign-in, finish the add the player started.
  useEffect(() => {
    if (!ready || !user) return;
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
      if (pending?.productId === product.id) {
        sessionStorage.removeItem(PENDING_KEY);
        setQty(pending.qty || 1);
        add(Boolean(pending.goToCart), pending.qty || 1, pending.variantId);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, product.id]);

  async function add(goToCart, quantity = qty, variantId = current?.id) {
    if (!variantId) return;
    if (!user) {
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ productId: product.id, variantId, qty, goToCart }));
      } catch {}
      requireLogin();
      return;
    }
    setBusy(goToCart ? "buy" : "add");
    setNotice(null);
    try {
      await secureCall("store.cart.add", { variantId, quantity });
      track("Product Added", { product_id: product.id, variant_id: variantId, quantity, price: current?.price });
      if (goToCart) router.push("/marketplace/cart");
      else setNotice({ tone: "success", text: "Added to your cart." });
    } catch (err) {
      setNotice({ tone: "error", text: err.message, mixed: err.code === "mixed_vendor" });
    } finally {
      setBusy("");
    }
  }

  const price = current?.price ?? product.price;
  const stockText = !current ? "This combination isn't available" : soldOut ? "Currently sold out" : current.available <= 5 ? `Only ${current.available} left` : "In stock";

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[34px] font-semibold leading-none tracking-tight text-white">{inr(price)}</p>
          <p className="mt-2 text-sm text-white/40">Inclusive of all taxes</p>
        </div>
        <ShareMenu title={product.title} text={`${product.title} for ${inr(price)} on Hash`} />
      </div>

      {options.length > 0 && (
        <div className="mt-8 space-y-6">
          {options.map((o) => (
            <OptionPicker key={o.title} option={o} selected={picked[o.title]} isAvailable={isAvailable(o.title)} onPick={(value) => setPicked((p) => ({ ...p, [o.title]: value }))} />
          ))}
        </div>
      )}

      <p className={cx("mt-8 text-sm", soldOut ? "text-amber-200" : current.available <= 5 ? "text-[#ff9a3d]" : "text-emerald-300")}>{stockText}</p>

      <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
        <span className="text-[15px] text-white/70">Quantity</span>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Decrease quantity" className="rounded-full p-1.5 text-white/80 hover:bg-white/10 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center text-[17px] text-white" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" className="rounded-full p-1.5 text-white/80 hover:bg-white/10 disabled:opacity-30" disabled={qty >= maxQty || soldOut} onClick={() => setQty((q) => q + 1)}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button size="lg" disabled={soldOut || !ready} loading={busy === "buy"} onClick={() => add(true)}>
          Buy now
        </Button>
        <Button size="lg" variant="ghost" disabled={soldOut || !ready} loading={busy === "add"} onClick={() => add(false)}>
          Add to cart
        </Button>
      </div>

      {notice && (
        <div className="mt-4">
          <Notice
            tone={notice.tone}
            action={
              notice.mixed || notice.tone === "success" ? (
                <Link href="/marketplace/cart" className="text-sm font-semibold underline underline-offset-2">
                  View cart
                </Link>
              ) : null
            }
          >
            {notice.text}
          </Notice>
        </div>
      )}

      <ul className="mt-6 grid gap-3 rounded-2xl border border-white/[0.08] p-4 text-sm text-white/60">
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

/** Gallery + buy box wired together so a colour pick can switch the photo. */
export function ProductHero({ product, images, header }) {
  const [image, setImage] = useState("");
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <ProductGallery images={images} title={product.title} activeImage={image} />
      </div>
      <div className="min-w-0">
        {header}
        <div className="mt-8">
          <BuyBox product={product} onImage={setImage} />
        </div>
      </div>
    </div>
  );
}
