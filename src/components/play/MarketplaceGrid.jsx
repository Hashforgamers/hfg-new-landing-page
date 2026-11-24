"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { Button, Empty, Eyebrow, Notice, SecureBadge, Spinner, Title, inr } from "./ui";

const PAGE = 24;

export function ProductCard({ product }) {
  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#16FF00]/50"
    >
      <div className="relative aspect-square bg-gradient-to-br from-purple-900/40 via-black to-[#16FF00]/10">
        {product.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/30">Hash Gear</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
          {product.kind === "service" ? "Service" : "Product"}
        </span>
        {product.available <= 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-black/80 py-2 text-center text-[10px] uppercase tracking-[0.3em] text-red-300">Sold out</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm font-bold uppercase tracking-[0.08em] text-white">{product.title}</p>
        <p className="mt-1 font-sans text-xs text-white/50">by {product.vendorName}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-[#16FF00]">{inr(product.price)}</span>
          {product.rating?.count > 0 && (
            <span className="flex items-center gap-1 font-sans text-xs text-white/60">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden /> {product.rating.average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MarketplaceGrid() {
  const [products, setProducts] = useState(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (offset = 0) => {
    setError("");
    try {
      const data = await secureCall("store.products", { limit: PAGE, offset });
      setProducts((prev) => (offset ? [...(prev || []), ...data.products] : data.products));
      setCount(data.count);
      if (!offset) track("Store Viewed", { count: data.count });
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const visible = (products || []).filter((p) => filter === "all" || p.kind === filter);

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Hash Marketplace</Eyebrow>
          <Title className="mt-3">Gear up</Title>
          <p className="mt-3 max-w-xl font-sans text-sm leading-7 text-white/70">
            Gaming gear and services from verified Hash partners. Prices set by sellers, secure Razorpay checkout, tracked delivery.
          </p>
        </div>
        <SecureBadge />
      </div>

      <div className="mt-8 flex gap-2">
        {[
          ["all", "All"],
          ["product", "Products"],
          ["service", "Services"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              filter === id ? "border-[#16FF00] bg-[#16FF00] text-black" : "border-white/15 text-white/70 hover:border-[#16FF00]/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {error && <Notice action={<Button variant="subtle" onClick={() => load(0)}>Retry</Button>}>{error}</Notice>}
        {!products && !error && <Spinner label="Loading store" />}
        {products && !visible.length && <Empty title="Nothing here yet">New partner listings land here as soon as Hash approves them.</Empty>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {products && products.length < count && (
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              loading={loadingMore}
              onClick={async () => {
                setLoadingMore(true);
                await load(products.length);
                setLoadingMore(false);
              }}
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
