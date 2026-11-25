"use client";

import { useState } from "react";
import { Gamepad2, Images } from "lucide-react";
import { Lightbox } from "./ProductDetail";
import { cx } from "./ui";

/**
 * Cafe photos, kept compact so the booking flow stays in view. Desktop: one main
 * photo with up to two beside it, in a fixed-height block. Phone: a swipe strip.
 * Any photo opens the full-screen viewer with zoom.
 */
export default function CafeGallery({ images, name }) {
  const [open, setOpen] = useState(-1);
  if (!images?.length) return <CafePhotoPlaceholder />;
  const side = images.slice(1, 3);
  const alt = (i) => (i === 0 ? `${name} gaming cafe` : `${name} photo ${i + 1}`);

  return (
    <div className="relative">
      {/* Phone and tablet: swipe strip */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden">
        {images.map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} className={cx("aspect-[16/10] shrink-0 snap-center overflow-hidden rounded-[20px] bg-white/[0.04]", images.length === 1 ? "w-full" : "w-[85%] sm:w-[60%]")} aria-label={`Open photo ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt(i)} loading={i < 2 ? "eager" : "lazy"} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Desktop: main photo + up to two beside it */}
      <div className={cx("hidden h-[320px] gap-2 overflow-hidden rounded-[24px] lg:grid xl:h-[360px]", side.length ? "grid-cols-3 grid-rows-2" : "grid-cols-1")}>
        <button type="button" onClick={() => setOpen(0)} className={cx("group overflow-hidden bg-white/[0.04]", side.length && "col-span-2 row-span-2")} aria-label="Open photo 1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt={alt(0)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        </button>
        {side.map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i + 1)} className={cx("group overflow-hidden bg-white/[0.04]", side.length === 1 && "row-span-2")} aria-label={`Open photo ${i + 2}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt(i + 1)} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-full bg-black/70 px-3.5 py-2 text-[13px] font-medium text-white backdrop-blur-md transition hover:bg-black/85 lg:flex"
        >
          <Images className="h-4 w-4" aria-hidden /> All {images.length} photos
        </button>
      )}

      {open >= 0 && <Lightbox images={images} index={open} setIndex={(f) => setOpen((i) => (typeof f === "function" ? f(i) : f))} title={name} onClose={() => setOpen(-1)} />}
    </div>
  );
}

/** Same branded artwork as the cafe card, at the gallery's size, for cafes without photos yet. */
function CafePhotoPlaceholder() {
  return (
    <div className="relative flex aspect-[16/10] flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-[#2a0838] via-black to-[#3b1a0a] sm:rounded-[24px] lg:aspect-auto lg:h-[320px] xl:h-[360px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/hero-poster.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-35 blur-[2px]" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" aria-hidden />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/50 backdrop-blur-md">
        <Gamepad2 className="h-7 w-7 text-white/85" aria-hidden />
      </span>
      <span className="relative text-[12px] font-medium uppercase tracking-[0.16em] text-white/55">Hash partner cafe</span>
      <span className="relative text-sm text-white/45">Photos coming soon</span>
    </div>
  );
}
