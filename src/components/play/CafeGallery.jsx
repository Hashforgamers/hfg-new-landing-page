"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { Lightbox } from "./ProductDetail";
import { cx } from "./ui";

/**
 * Cafe photos. Desktop: a fixed-height mosaic (one large + up to four small) so no
 * single photo takes over the page. Phone: a swipeable strip. Any photo opens a
 * full-screen viewer with zoom.
 */
export default function CafeGallery({ images, name }) {
  const [open, setOpen] = useState(-1);
  if (!images?.length) return null;
  const shown = images.slice(0, 5);
  const cols = shown.length === 1 ? "" : shown.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4 lg:grid-rows-2";

  return (
    <div className="relative">
      {/* Phone and tablet: swipe strip */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden">
        {images.map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} className="aspect-[16/10] w-[85%] shrink-0 snap-center overflow-hidden rounded-[20px] bg-white/[0.04] sm:w-[60%]" aria-label={`Open photo ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={i === 0 ? `${name} gaming cafe` : `${name} photo ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Desktop: mosaic */}
      <div className={cx("hidden h-[440px] gap-2 overflow-hidden rounded-[28px] lg:grid", cols, shown.length === 1 && "h-[380px]")}>
        {shown.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            className={cx("group relative overflow-hidden bg-white/[0.04]", shown.length > 2 && i === 0 && "col-span-2 row-span-2", shown.length === 3 && i > 0 && "col-span-2", shown.length === 4 && i === 3 && "col-span-2")}
            aria-label={`Open photo ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={i === 0 ? `${name} gaming cafe` : `${name} photo ${i + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black lg:flex"
        >
          <Images className="h-4 w-4" aria-hidden /> Show all {images.length} photos
        </button>
      )}
      {open >= 0 && <Lightbox images={images} index={open} setIndex={(f) => setOpen((i) => (typeof f === "function" ? f(i) : f))} title={name} onClose={() => setOpen(-1)} />}
    </div>
  );
}
