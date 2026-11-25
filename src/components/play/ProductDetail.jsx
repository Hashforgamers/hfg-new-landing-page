"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Link2, Mail, Maximize2, Minus, Plus, Share2, ShoppingBag, Star, Truck, X, Zap } from "lucide-react";
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
          <img src={images[index]} alt={index === 0 ? title : `${title} photo ${index + 1}`} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]" />
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
  const [canNative, setCanNative] = useState(false);
  const [link, setLink] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
    const u = new URL(window.location.href);
    u.search = "";
    u.hash = "";
    u.searchParams.set("utm_source", "share");
    setLink(u.toString());
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const via = (method) => () => {
    track("Shared", { method, title });
    setOpen(false);
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      track("Shared", { method: "copy", title });
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function native() {
    try {
      await navigator.share({ title, text, url: link });
      track("Shared", { method: "native", title });
    } catch {}
    setOpen(false);
  }

  const message = `${text} ${link}`;
  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/10";
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          track("Share Clicked", { title });
        }}
        className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white/85 transition hover:border-white/40 hover:text-white"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Share2 className="h-4 w-4" aria-hidden /> Share
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-white/10 bg-[#121216] p-2 shadow-2xl" role="menu">
          <p className="px-3 pb-1 pt-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">Share</p>
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={via("whatsapp")} className={item} role="menuitem">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-white"><WhatsAppIcon /></span> WhatsApp
          </a>
          <button type="button" onClick={copy} className={item} role="menuitem">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              {copied ? <Check className="h-4 w-4 text-emerald-300" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
            </span>
            {copied ? "Link copied" : "Copy link"}
          </button>
          <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`} onClick={via("email")} className={item} role="menuitem">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><Mail className="h-4 w-4" aria-hidden /></span> Email
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" onClick={via("x")} className={item} role="menuitem">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-bold">𝕏</span> X (Twitter)
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" onClick={via("facebook")} className={item} role="menuitem">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877f2] text-[15px] font-bold text-white">f</span> Facebook
          </a>
          {canNative && (
            <button type="button" onClick={native} className={item} role="menuitem">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><Share2 className="h-4 w-4" aria-hidden /></span> More options
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- options */

const SWATCH = {
  black: "#111", white: "#f5f5f5", grey: "#8a8a8f", gray: "#8a8a8f", silver: "#c9cbd0", graphite: "#3b3b40", red: "#e53935", crimson: "#c0182f",
  blue: "#5b8def", navy: "#1b2a4a", cyan: "#2ec5d3", teal: "#1f9e95", green: "#2e9d55", mint: "#9be3c5", yellow: "#f6c945", orange: "#ff8a1f",
  pink: "#ff8fc1", purple: "#7b4ae2", lavender: "#b9a6f0", gold: "#d4af37", brown: "#7a4e2d", beige: "#e3d5b8", cream: "#f2e8d2",
};
export const swatchFor = (value) => {
  const key = String(value).toLowerCase().split(/[\s/-]+/).find((w) => SWATCH[w]);
  return key ? SWATCH[key] : null;
};
const isColour = (o) => /colou?r/i.test(o.key || "") || /colou?r/i.test(o.title || "");

/** Colour: photo tiles of each colour (as on big marketplaces). Other options: pills. */
function OptionPicker({ option, selected, onPick, isAvailable, imageFor }) {
  const colour = isColour(option);
  return (
    <fieldset>
      <legend className="text-[15px] text-white/55">
        {option.title}: <span className="font-medium text-white">{selected || "Choose"}</span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {option.values.map((value) => {
          const active = value === selected;
          const ok = isAvailable(value);
          const photo = colour ? imageFor(value) : "";
          const sw = colour ? swatchFor(value) : null;
          if (colour && photo) {
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                aria-label={`${option.title} ${value}${ok ? "" : ", sold out"}`}
                title={value}
                onClick={() => onPick(value)}
                className={cx(
                  "group relative w-[76px] overflow-hidden rounded-2xl border-2 bg-[#0f0f12] text-left transition",
                  active ? "border-white" : "border-white/10 hover:border-white/40",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="" className={cx("aspect-square w-full object-cover", !ok && "opacity-35")} />
                <span className={cx("block truncate px-2 py-1.5 text-[11px]", active ? "text-white" : "text-white/60", !ok && "line-through")}>{value}</span>
              </button>
            );
          }
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

/* ------------------------------------------------------------------ pieces */

export function Stars({ value = 0, className = "h-4 w-4" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={cx("relative inline-block", className)}>
            <Star className={cx("absolute inset-0 text-white/20", className)} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cx("fill-[#ffb02e] text-[#ffb02e]", className)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const off = (price, mrp) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

function PriceBlock({ price, mrp, large = false }) {
  const pct = off(price, mrp);
  return (
    <div>
      <p className="flex items-baseline gap-3">
        {pct > 0 && <span className={cx("font-medium text-[#ff6b6b]", large ? "text-2xl" : "text-lg")}>−{pct}%</span>}
        <span className={cx("font-semibold tracking-tight text-white", large ? "text-[40px] leading-none" : "text-[28px] leading-none")}>{inr(price)}</span>
      </p>
      {pct > 0 && (
        <p className="mt-2 text-sm text-white/45">
          M.R.P.: <span className="line-through">{inr(mrp)}</span> · You save {inr(mrp - price)}
        </p>
      )}
      <p className="mt-1 text-sm text-white/40">Inclusive of all taxes</p>
    </div>
  );
}

/** Up to six bullet points from the description: lines first, then sentences. */
function bullets(text) {
  const s = String(text || "").replace(/<[^>]+>/g, " ").trim();
  if (!s) return [];
  let parts = s.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  if (parts.length < 2) parts = s.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((x) => x.trim()).filter(Boolean);
  return parts.filter((x) => x.length > 2).slice(0, 6);
}

/* ------------------------------------------------------------- product view */

/**
 * The whole product hero: gallery | details | buy box. The chosen SKU drives
 * the photos (each colour has its own), price, stock and what goes in the cart.
 */
export function ProductView({ product, crumbs = null }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const requireLogin = useRequireLogin();
  const variants = product.variants || [];
  const options = product.options || [];
  const keyOf = (o) => o.key || o.title;

  const initial = useMemo(() => variants.find((v) => v.id === product.variantId) || variants[0] || null, [variants, product.variantId]);
  const [picked, setPicked] = useState(() => (initial ? { ...initial.options } : {}));
  const variant = useMemo(
    () => (variants.length ? variants.find((v) => options.every((o) => v.options[keyOf(o)] === picked[keyOf(o)])) || null : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variants, options, picked],
  );
  const current = variant || (variants.length ? null : { id: product.variantId, price: product.price, mrp: product.mrp, available: product.available, images: [] });

  const baseImages = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const images = current?.images?.length ? current.images : baseImages;
  const imageFor = useCallback(
    (key) => (value) => variants.find((v) => v.options[key] === value && v.images?.length)?.images[0] || "",
    [variants],
  );

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const soldOut = !current || current.available <= 0;
  const maxQty = Math.max(1, Math.min(10, current?.available || 1));

  useEffect(() => {
    track("Product Viewed", { product_id: product.id, vendor_id: product.vendorId, price: product.price });
  }, [product.id, product.vendorId, product.price]);

  useEffect(() => setQty((q) => Math.min(q, maxQty)), [maxQty]);

  const isAvailable = (key) => (value) =>
    variants.some((v) => v.options[key] === value && v.available > 0 && options.every((o) => keyOf(o) === key || v.options[keyOf(o)] === picked[keyOf(o)]));

  function pick(key, value) {
    setPicked((p) => {
      const next = { ...p, [key]: value };
      // If that exact combination doesn't exist, jump to the closest one that does.
      if (!variants.some((v) => options.every((o) => v.options[keyOf(o)] === next[keyOf(o)]))) {
        const alt = variants.find((v) => v.options[key] === value && v.available > 0) || variants.find((v) => v.options[key] === value);
        if (alt) return { ...alt.options };
      }
      return next;
    });
    track("Product Option Selected", { product_id: product.id, option: key, value });
  }

  // After sign-in, finish the add the player started.
  useEffect(() => {
    if (!ready || !user) return;
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
      if (pending?.productId === product.id) {
        sessionStorage.removeItem(PENDING_KEY);
        const v = variants.find((x) => x.id === pending.variantId);
        if (v) setPicked({ ...v.options });
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
  const mrp = current?.mrp ?? product.mrp ?? 0;
  const stockText = !current ? "This combination isn't available" : soldOut ? "Currently unavailable" : current.available <= 5 ? `Only ${current.available} left in stock` : "In stock";
  const stockTone = soldOut ? "text-[#ff6b6b]" : current.available <= 5 ? "text-[#ff9a3d]" : "text-emerald-300";
  const points = bullets(product.description);
  const keySpecs = (product.specs || []).slice(0, 6);
  const service = product.kind === "service";

  const buyBox = (
    <div className="rounded-[28px] border border-white/[0.08] bg-[#0e0e12] p-5 sm:p-6">
      {/* The price already sits right above on phone and tablet. */}
      <div className="mb-4 hidden xl:block">
        <PriceBlock price={price} mrp={mrp} />
      </div>
      <p className="flex items-start gap-2.5 text-sm text-white/65">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden />
        {service ? "Scheduled with the seller after you order." : "Tracked delivery across India, with an OTP on handover."}
      </p>
      <p className={cx("mt-4 text-[17px] font-medium", stockTone)}>{stockText}</p>

      <label className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2.5">
        <span className="text-[15px] text-white/70">Quantity</span>
        <span className="flex items-center gap-3">
          <button type="button" aria-label="Decrease quantity" className="rounded-full p-1.5 text-white/80 hover:bg-white/10 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center text-[17px] text-white" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" className="rounded-full p-1.5 text-white/80 hover:bg-white/10 disabled:opacity-30" disabled={qty >= maxQty || soldOut} onClick={() => setQty((q) => q + 1)}>
            <Plus className="h-4 w-4" />
          </button>
        </span>
      </label>

      <div className="mt-4 grid gap-3">
        <Button size="lg" disabled={soldOut || !ready} loading={busy === "add"} onClick={() => add(false)}>
          <ShoppingBag className="h-[18px] w-[18px]" aria-hidden /> Add to cart
        </Button>
        <Button size="lg" variant="accent" disabled={soldOut || !ready} loading={busy === "buy"} onClick={() => add(true)}>
          <Zap className="h-[18px] w-[18px]" aria-hidden /> Buy now
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

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-white/[0.08] pt-4 text-sm">
        <dt className="text-white/40">{service ? "Provided by" : "Ships from"}</dt>
        <dd className="text-white/80">{product.vendorName}</dd>
        <dt className="text-white/40">Sold by</dt>
        <dd className="text-white/80">{product.vendorName}</dd>
        <dt className="text-white/40">Payment</dt>
        <dd className="text-white/80">UPI, cards and netbanking</dd>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3">
        <SecureBadge />
        <ShareMenu title={product.title} text={`${product.title} for ${inr(price)} on Hash`} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_360px] xl:gap-x-10">
      <div className="min-w-0 lg:sticky lg:top-28 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:self-start xl:row-span-2">
        <ProductGallery key={images.join("|")} images={images} title={product.title} />
      </div>

      <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        {crumbs}
        <p className="text-[15px] text-[#ff9a3d]">
          {product.brand ? `Brand: ${product.brand}` : service ? "Service" : product.category || "Gaming gear"}
        </p>
        <h1 className="mt-2 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.15] tracking-tight text-white">{product.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/55">
          {product.rating?.count > 0 ? (
            <a href="#ratings" className="inline-flex items-center gap-2 hover:text-white">
              <span className="font-medium text-white">{product.rating.average.toFixed(1)}</span>
              <Stars value={product.rating.average} />
              <span>{product.rating.count.toLocaleString("en-IN")} ratings</span>
            </a>
          ) : (
            <span>New listing</span>
          )}
          <span>
            Sold by <span className="text-white/85">{product.vendorName}</span>
          </span>
        </div>

        <div className="mt-6 border-t border-white/[0.08] pt-6">
          <PriceBlock price={price} mrp={mrp} large />
        </div>

        {options.length > 0 && (
          <div className="mt-7 space-y-6">
            {options.map((o) => (
              <OptionPicker key={keyOf(o)} option={o} selected={picked[keyOf(o)]} isAvailable={isAvailable(keyOf(o))} imageFor={imageFor(keyOf(o))} onPick={(value) => pick(keyOf(o), value)} />
            ))}
          </div>
        )}
      </div>

      <aside className="min-w-0 lg:col-start-2 lg:row-start-2 xl:sticky xl:top-28 xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:self-start" aria-label="Buy">
        {buyBox}
      </aside>

      <div className="min-w-0 lg:col-start-2 lg:row-start-3 xl:row-start-2">
        {keySpecs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">Product details</h2>
            <dl className="mt-3 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-6 gap-y-2.5 text-[15px]">
              {keySpecs.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="font-medium text-white/80">{row.label}</dt>
                  <dd className="text-white/60">{row.value}</dd>
                </div>
              ))}
            </dl>
            {product.specs.length > keySpecs.length && (
              <a href="#specifications" className="mt-3 inline-block text-sm font-medium text-[#ff9a3d] hover:underline">
                See all {product.specs.length} specifications
              </a>
            )}
          </div>
        )}

        {points.length > 0 && (
          <div className={cx(keySpecs.length > 0 && "mt-8 border-t border-white/[0.08] pt-6")}>
            <h2 className="text-lg font-semibold tracking-tight text-white">About this item</h2>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-7 text-white/65">
              {points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
