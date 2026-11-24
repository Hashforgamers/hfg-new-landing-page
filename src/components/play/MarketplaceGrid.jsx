"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { track } from "@/lib/analytics-client";
import { productPath } from "@/lib/verticals";
import { Chip, Empty, inr } from "./ui";

export function ProductCard({ product, priority = false }) {
  return (
    <Link
      href={productPath(product)}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0e0e12] transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1a1a20] to-black">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail}
            alt={product.title}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl uppercase text-white/15">Hash</div>
        )}
        {product.kind === "service" && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">Service</span>
        )}
        {product.available <= 0 && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/70 py-1.5 text-center text-xs font-medium text-white/70 backdrop-blur-md">Sold out</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-white">{product.title}</h3>
        <p className="mt-1 text-sm text-white/45">{product.vendorName}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-[17px] font-semibold text-white">{inr(product.price)}</span>
          {product.rating?.count > 0 && (
            <span className="flex items-center gap-1 text-sm text-white/55">
              <Star className="h-3.5 w-3.5 fill-[#ffd23d] text-[#ffd23d]" aria-hidden /> {product.rating.average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

const SORTS = {
  featured: () => 0,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
};

export default function MarketplaceGrid({ products }) {
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("Store Viewed", { count: products.length });
    }
  }, [products.length]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => kind === "all" || p.kind === kind)
      .filter((p) => !q || `${p.title} ${p.vendorName}`.toLowerCase().includes(q))
      .slice()
      .sort(SORTS[sort]);
  }, [products, kind, query, sort]);

  const hasServices = products.some((p) => p.kind === "service");

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
          <span className="sr-only">Search the marketplace</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products and sellers"
            className="w-full rounded-full border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-5 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-white/40"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {hasServices &&
            [
              ["all", "All"],
              ["product", "Products"],
              ["service", "Services"],
            ].map(([id, label]) => (
              <Chip key={id} active={kind === id} onClick={() => setKind(id)}>
                {label}
              </Chip>
            ))}
          <label className="ml-1">
            <span className="sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-white/10 bg-[#141418] px-4 py-2 text-sm text-white/80 outline-none"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/45" aria-live="polite">
        {visible.length} {visible.length === 1 ? "item" : "items"}
      </p>

      {visible.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <Empty title="Nothing matches that search">New partner listings land here as soon as Hash approves them.</Empty>
        </div>
      )}
    </div>
  );
}
