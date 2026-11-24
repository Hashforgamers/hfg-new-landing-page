"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Search } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { Button, Empty, Eyebrow, Input, Notice, SecureBadge, Spinner, Title, formatTime } from "./ui";

export default function CafeDirectory() {
  const [cafes, setCafes] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    setError("");
    try {
      const data = await secureCall("cafes.list");
      setCafes(data.cafes);
      track("Cafe List Viewed", { count: data.cafes.length });
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (query.length < 2) return undefined;
    const t = setTimeout(() => track("Cafe Searched", { query_length: query.length }), 800);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    if (!cafes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return cafes;
    return cafes.filter((c) => [c.name, c.area, c.addressLine, c.pincode, c.state].join(" ").toLowerCase().includes(q));
  }, [cafes, query]);

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Book a Cafe</Eyebrow>
          <Title className="mt-3">Pick your battleground</Title>
          <p className="mt-3 max-w-xl font-sans text-sm leading-7 text-white/70">
            Live slots from Hash partner cafes. Choose a console, lock a time and pay online or at the counter.
          </p>
        </div>
        <SecureBadge />
      </div>

      <div className="relative mt-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
        <Input className="pl-11" placeholder="Search by cafe, area or PIN code" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search cafes" />
      </div>

      <div className="mt-8">
        {error && <Notice action={<Button variant="subtle" onClick={load}>Retry</Button>}>{error}</Notice>}
        {!cafes && !error && <Spinner label="Finding cafes" />}
        {cafes && !filtered.length && <Empty title="No cafes match">Try a different area or PIN code.</Empty>}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cafe) => (
            <Link
              key={cafe.id}
              href={`/book/${cafe.id}`}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#16FF00]/50"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-[#16FF00]/20 via-black to-purple-900/40">
                {cafe.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cafe.images[0]} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
                )}
                {cafe.payAtCafe && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#16FF00]">
                    Pay at cafe
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-base font-black uppercase tracking-[0.12em] text-white">{cafe.name}</p>
                {cafe.area && (
                  <p className="mt-2 flex items-center gap-2 font-sans text-sm text-white/60">
                    <MapPin className="h-4 w-4 shrink-0 text-[#16FF00]" aria-hidden /> {cafe.area}
                  </p>
                )}
                {cafe.opens && cafe.closes && (
                  <p className="mt-1 flex items-center gap-2 font-sans text-sm text-white/50">
                    <Clock className="h-4 w-4 shrink-0" aria-hidden /> {formatTime(cafe.opens)} – {formatTime(cafe.closes)}
                  </p>
                )}
                {cafe.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cafe.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-[#16FF00]">Book now →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
