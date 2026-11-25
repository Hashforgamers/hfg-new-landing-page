"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Search, ShoppingBag, SlidersHorizontal, Star, X } from "lucide-react";
import { track } from "@/lib/analytics-client";
import { productPath } from "@/lib/verticals";
import { Button, Empty, cx, inr } from "./ui";

const SWATCH = {
  black: "#111", white: "#f5f5f5", grey: "#8a8a8f", gray: "#8a8a8f", silver: "#c9cbd0", red: "#e53935", blue: "#5b8def", navy: "#1b2a4a",
  green: "#2e9d55", yellow: "#f6c945", orange: "#ff8a1f", pink: "#ff8fc1", purple: "#7b4ae2", gold: "#d4af37", brown: "#7a4e2d", beige: "#e3d5b8",
};
const swatch = (v) => SWATCH[String(v).toLowerCase().split(/[\s/-]+/).find((w) => SWATCH[w])] || "#555";
const off = (p) => (p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);

function MiniStars({ value }) {
  return (
    <span className="inline-flex items-center gap-px" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={cx("h-3.5 w-3.5", value - i >= 0.5 ? "fill-[#ffb02e] text-[#ffb02e]" : "text-white/20")} />
      ))}
    </span>
  );
}

export function ProductCard({ product, priority = false }) {
  const pct = off(product);
  const soldOut = product.available <= 0;
  return (
    <Link
      href={productPath(product)}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0e0e12] transition duration-300 hover:border-white/20 hover:bg-[#121217]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#141418]">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}
            loading={priority ? "eager" : "lazy"}
            className={cx("h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]", soldOut && "opacity-50")}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a1a20] to-[#0b0b0e]">
            <ShoppingBag className="h-8 w-8 text-white/25" aria-hidden />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">Photo coming soon</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {pct > 0 && !soldOut && <span className="rounded-full bg-[#ff3d5a] px-2.5 py-1 text-[11px] font-semibold text-white">{pct}% off</span>}
          {product.kind === "service" && <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">Service</span>}
          {soldOut && <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white/75 backdrop-blur-md">Sold out</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.category && <p className="text-[12px] font-medium text-white/40">{product.category}</p>}
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-white sm:text-[16px]">{product.title}</h3>
        {product.rating?.count > 0 && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-white/50">
            <MiniStars value={product.rating.average} />
            <span>{product.rating.count.toLocaleString("en-IN")}</span>
          </p>
        )}
        <div className="mt-auto pt-3">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[18px] font-semibold text-white">{inr(product.price)}</span>
            {pct > 0 && <span className="text-[13px] text-white/40 line-through">{inr(product.mrp)}</span>}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={cx("truncate text-[12px]", soldOut ? "text-white/40" : product.available <= 5 ? "text-[#ff9a3d]" : "text-white/45")}>
              {soldOut ? "Currently unavailable" : product.available <= 5 ? `Only ${product.available} left` : `by ${product.vendorName}`}
            </span>
            {product.colors?.length > 1 && (
              <span className="flex shrink-0 items-center gap-1" title={product.colors.join(", ")}>
                {product.colors.slice(0, 4).map((c) => (
                  <span key={c} className="h-3 w-3 rounded-full border border-white/25" style={{ background: swatch(c) }} aria-hidden />
                ))}
                <span className="sr-only">{product.colors.length} colours</span>
                {product.colors.length > 4 && <span className="text-[11px] text-white/45">+{product.colors.length - 4}</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

const SORTS = {
  featured: { label: "Featured", fn: () => 0 },
  low: { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  high: { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  rating: { label: "Avg. customer rating", fn: (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0) },
  discount: { label: "Biggest discount", fn: (a, b) => off(b) - off(a) },
};
const PRICES = [
  { id: "u1000", label: "Under ₹1,000", test: (p) => p < 1000 },
  { id: "1-25", label: "₹1,000 – ₹2,500", test: (p) => p >= 1000 && p <= 2500 },
  { id: "25-5", label: "₹2,500 – ₹5,000", test: (p) => p > 2500 && p <= 5000 },
  { id: "o5000", label: "Over ₹5,000", test: (p) => p > 5000 },
];

function FilterGroup({ title, children }) {
  return (
    <fieldset className="border-b border-white/[0.07] py-5 first:pt-0 last:border-0">
      <legend className="float-left mb-3 w-full text-[13px] font-semibold uppercase tracking-[0.12em] text-white/45">{title}</legend>
      <div className="clear-both space-y-1">{children}</div>
    </fieldset>
  );
}

function Option({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx("flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-[15px] transition", active ? "text-white" : "text-white/65 hover:text-white")}
    >
      <span className={cx("flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border", active ? "border-white bg-white text-black" : "border-white/25")}>
        {active && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
      </span>
      <span className="flex-1">{children}</span>
      {count != null && <span className="text-[13px] text-white/35">{count}</span>}
    </button>
  );
}

export default function MarketplaceGrid({ products }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [kind, setKind] = useState("");
  const [sellers, setSellers] = useState([]);
  const [sheet, setSheet] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("Store Viewed", { count: products.length });
    }
    try {
      const c = new URLSearchParams(window.location.search).get("category");
      if (c && products.some((p) => p.categoryId === c)) setCategory(c);
    } catch {}
  }, [products]);

  useEffect(() => {
    if (!sheet) return undefined;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [sheet]);

  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) if (p.categoryId) map.set(p.categoryId, { id: p.categoryId, name: p.category, count: (map.get(p.categoryId)?.count || 0) + 1, image: map.get(p.categoryId)?.image || p.thumbnail });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [products]);
  const allSellers = useMemo(() => [...new Set(products.map((p) => p.vendorName).filter(Boolean))].sort(), [products]);
  const hasServices = products.some((p) => p.kind === "service");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const band = PRICES.find((b) => b.id === price);
    return products
      .filter((p) => !category || p.categoryId === category)
      .filter((p) => !band || band.test(p.price))
      .filter((p) => !rating || (p.rating?.average || 0) >= rating)
      .filter((p) => !inStock || p.available > 0)
      .filter((p) => !kind || p.kind === kind)
      .filter((p) => !sellers.length || sellers.includes(p.vendorName))
      .filter((p) => !q || `${p.title} ${p.vendorName} ${p.category}`.toLowerCase().includes(q))
      .slice()
      .sort(SORTS[sort].fn);
  }, [products, category, price, rating, inStock, kind, sellers, query, sort]);

  const active = [
    category && { id: "category", label: categories.find((c) => c.id === category)?.name, clear: () => setCategory("") },
    price && { id: "price", label: PRICES.find((b) => b.id === price)?.label, clear: () => setPrice("") },
    rating && { id: "rating", label: `${rating}★ & up`, clear: () => setRating(0) },
    inStock && { id: "stock", label: "In stock", clear: () => setInStock(false) },
    kind && { id: "kind", label: kind === "service" ? "Services" : "Products", clear: () => setKind("") },
    ...sellers.map((s) => ({ id: `s-${s}`, label: s, clear: () => setSellers((x) => x.filter((y) => y !== s)) })),
  ].filter(Boolean);
  const clearAll = () => {
    setCategory("");
    setPrice("");
    setRating(0);
    setInStock(false);
    setKind("");
    setSellers([]);
  };

  const filters = (
    <div>
      {categories.length > 0 && (
        <FilterGroup title="Category">
          <Option active={!category} onClick={() => setCategory("")} count={products.length}>All</Option>
          {categories.map((c) => (
            <Option key={c.id} active={category === c.id} onClick={() => setCategory(category === c.id ? "" : c.id)} count={c.count}>
              {c.name}
            </Option>
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Price">
        {PRICES.map((b) => (
          <Option key={b.id} active={price === b.id} onClick={() => setPrice(price === b.id ? "" : b.id)}>
            {b.label}
          </Option>
        ))}
      </FilterGroup>
      <FilterGroup title="Customer rating">
        {[4, 3].map((r) => (
          <Option key={r} active={rating === r} onClick={() => setRating(rating === r ? 0 : r)}>
            <span className="inline-flex items-center gap-2">
              <MiniStars value={r} /> & up
            </span>
          </Option>
        ))}
      </FilterGroup>
      <FilterGroup title="Availability">
        <Option active={inStock} onClick={() => setInStock((x) => !x)}>
          In stock only
        </Option>
        {hasServices && (
          <>
            <Option active={kind === "product"} onClick={() => setKind(kind === "product" ? "" : "product")}>Products</Option>
            <Option active={kind === "service"} onClick={() => setKind(kind === "service" ? "" : "service")}>Services</Option>
          </>
        )}
      </FilterGroup>
      {allSellers.length > 1 && (
        <FilterGroup title="Seller">
          {allSellers.map((s) => (
            <Option key={s} active={sellers.includes(s)} onClick={() => setSellers((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))}>
              {s}
            </Option>
          ))}
        </FilterGroup>
      )}
    </div>
  );

  const deals = products.filter((p) => off(p) > 0 && p.available > 0).sort((a, b) => off(b) - off(a)).slice(0, 8);

  return (
    <div>
      {/* Search + sort bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search the marketplace</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headsets, controllers, sellers…"
            className="w-full rounded-full border border-white/10 bg-white/[0.05] py-3.5 pl-12 pr-5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-white/40"
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheet(true)}
            className="flex h-12 items-center gap-2 rounded-full border border-white/10 px-5 text-sm font-medium text-white/85 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{active.length ? ` (${active.length})` : ""}
          </button>
          <label className="flex items-center gap-2 text-sm text-white/45">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-12 rounded-full border border-white/10 bg-[#141418] px-5 text-sm text-white/85 outline-none focus:border-white/40"
            >
              {Object.entries(SORTS).map(([id, s]) => (
                <option key={id} value={id}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Shop by category */}
      {categories.length > 1 && (
        <div className="-mx-4 mt-6 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <ul className="flex gap-3">
            {categories.map((c) => (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setCategory(category === c.id ? "" : c.id)}
                  aria-pressed={category === c.id}
                  className={cx(
                    "flex items-center gap-3 rounded-2xl border py-2 pl-2 pr-5 text-left transition",
                    category === c.id ? "border-white bg-white text-black" : "border-white/[0.08] bg-white/[0.03] text-white hover:border-white/25",
                  )}
                >
                  <span className="h-11 w-11 overflow-hidden rounded-xl bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold">{c.name}</span>
                    <span className={cx("block text-[12px]", category === c.id ? "text-black/55" : "text-white/45")}>{c.count} {c.count === 1 ? "item" : "items"}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deals strip (only on the unfiltered view) */}
      {deals.length >= 3 && !active.length && !query && (
        <section className="mt-6" aria-labelledby="deals-title">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="deals-title" className="text-xl font-semibold tracking-tight text-white">Today&apos;s deals</h2>
            <button type="button" onClick={() => setSort("discount")} className="text-sm font-medium text-[#ff9a3d] hover:underline">
              See all deals
            </button>
          </div>
          <ul className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {deals.map((p) => (
              <li key={p.id} className="w-[150px] shrink-0 sm:w-[170px]">
                <Link href={productPath(p)} className="group block">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-[#141418]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.thumbnail && <img src={p.thumbnail} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />}
                  </div>
                  <p className="mt-2.5 flex items-center gap-2">
                    <span className="rounded-md bg-[#ff3d5a] px-1.5 py-0.5 text-[11px] font-semibold text-white">{off(p)}% off</span>
                    <span className="text-[12px] text-[#ff6b7f]">Limited deal</span>
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-white">
                    {inr(p.price)} <span className="text-[12px] font-normal text-white/40 line-through">{inr(p.mrp)}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-white/55">{p.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28">{filters}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-white/55" aria-live="polite">
              {visible.length ? `${visible.length} ${visible.length === 1 ? "result" : "results"}` : "No results"}
              {query.trim() && <> for <span className="text-white">“{query.trim()}”</span></>}
            </p>
            {active.map((f) => (
              <button key={f.id} type="button" onClick={f.clear} className="flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] text-white/85 hover:bg-white/[0.12]">
                {f.label} <X className="h-3.5 w-3.5" aria-label="Remove" />
              </button>
            ))}
            {active.length > 1 && (
              <button type="button" onClick={clearAll} className="text-[13px] font-medium text-[#ff9a3d] hover:underline">
                Clear all
              </button>
            )}
          </div>

          {visible.length ? (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-4">
              {visible.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5">
              <Empty title="Nothing matches these filters">
                <button type="button" onClick={() => { clearAll(); setQuery(""); }} className="font-semibold text-white underline underline-offset-2">
                  Clear filters
                </button>
              </Empty>
            </div>
          )}
        </div>
      </div>

      {/* Phone filters sheet */}
      {sheet && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close filters" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[28px] border-t border-white/10 bg-[#0e0e12]">
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-lg font-semibold text-white">Filters</p>
              <button type="button" onClick={() => setSheet(false)} className="rounded-full p-2 text-white/70 hover:bg-white/10" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{filters}</div>
            <div className="flex gap-3 border-t border-white/10 p-4">
              <Button variant="ghost" className="flex-1" onClick={clearAll}>
                Clear
              </Button>
              <Button className="flex-1" onClick={() => setSheet(false)}>
                Show {visible.length} {visible.length === 1 ? "result" : "results"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
