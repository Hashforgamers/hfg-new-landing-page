"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { track } from "@/lib/analytics-client";
import { cafeLocality, cafePath } from "@/lib/verticals";
import { Chip, Empty, cx, formatTime } from "./ui";

function openNow(cafe) {
  if (!cafe.opens || !cafe.closes) return null;
  const now = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  const o = cafe.opens.slice(0, 5);
  const c = cafe.closes.slice(0, 5);
  return o <= c ? now >= o && now < c : now >= o || now < c;
}

export function CafeCard({ cafe, priority = false }) {
  const [open, setOpen] = useState(null);
  useEffect(() => setOpen(openNow(cafe)), [cafe]);
  const locality = cafeLocality(cafe);
  return (
    <Link
      href={cafePath(cafe)}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0e0e12] transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[4/3] bg-gradient-to-br from-[#2a0838] via-black to-[#3b1a0a]">
        {cafe.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cafe.images[0]}
            alt={`${cafe.name}${locality ? `, ${locality}` : ""}`}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-4xl uppercase text-white/15">{cafe.name.slice(0, 2)}</div>
        )}
        {open !== null && (
          <span
            className={cx(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md",
              open ? "bg-emerald-500/20 text-emerald-200" : "bg-black/60 text-white/60",
            )}
          >
            {open ? "Open now" : "Closed now"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-white">{cafe.name}</h3>
        {locality && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/50">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {cafe.area}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="text-white/45">{cafe.opens && cafe.closes ? `${formatTime(cafe.opens)} – ${formatTime(cafe.closes)}` : ""}</span>
          <span className="font-semibold text-white transition group-hover:text-[#ff9a3d]">Book →</span>
        </div>
      </div>
    </Link>
  );
}

export default function CafeDirectory({ cafes }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("Cafe List Viewed", { count: cafes.length });
    }
  }, [cafes.length]);

  const areas = useMemo(() => {
    const counts = new Map();
    for (const c of cafes) {
      const key = c.state || "";
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name]) => name);
  }, [cafes]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cafes.filter((c) => {
      if (area && c.state !== area) return false;
      if (!q) return true;
      return [c.name, c.area, c.addressLine, c.pincode].join(" ").toLowerCase().includes(q);
    });
  }, [cafes, query, area]);

  useEffect(() => {
    if (!query) return undefined;
    const t = setTimeout(() => track("Cafe Searched", { query_length: query.length, results: visible.length }), 800);
    return () => clearTimeout(t);
  }, [query, visible.length]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
          <span className="sr-only">Search cafes</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by cafe, area or pincode"
            className="w-full rounded-full border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-white/40"
          />
        </label>
        {areas.length > 1 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
            <Chip active={!area} onClick={() => setArea("")} className="shrink-0">
              All
            </Chip>
            {areas.map((a) => (
              <Chip key={a} active={area === a} onClick={() => setArea(a)} className="shrink-0">
                {a}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-white/45" aria-live="polite">
        {visible.length} {visible.length === 1 ? "cafe" : "cafes"}
      </p>

      {visible.length ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((cafe, i) => (
            <li key={cafe.id}>
              <CafeCard cafe={cafe} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <Empty title="No cafes match that search">Try a different area or pincode.</Empty>
        </div>
      )}
    </div>
  );
}
