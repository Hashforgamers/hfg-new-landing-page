import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Star } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { withQuery } from "@/lib/verticals";
import { ProductHero } from "@/components/play/ProductDetail";
import { ProductCard } from "@/components/play/MarketplaceGrid";
import { Breadcrumbs, Container, CrossSell, SectionHeading, breadcrumbsLd } from "@/components/play/parts";
import { loadProduct, loadProducts } from "@/lib/server/ops/store";
import { SITE_LOGO, SITE_URL, buildPageMetadata } from "@/lib/site";
import { STORE, productIdFromSlug, productPath } from "@/lib/verticals";

const inr = (n) => {
  const v = Number(n || 0);
  const digits = Math.abs(v - Math.round(v)) < 0.005 ? 0 : 2;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
};
const plain = (text, max) => {
  const s = String(text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : s;
};

async function getProduct(slug) {
  const id = productIdFromSlug(slug);
  if (!id) return null;
  try {
    return await loadProduct(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return buildPageMetadata({ title: "Product not found", path: `${STORE.root}/${slug}`, noIndex: true });
  const summary = plain(product.subtitle || product.description, 110);
  return buildPageMetadata({
    title: `${product.title}: Buy Online at ${inr(product.price)}`,
    description: `Buy ${product.title} for ${inr(product.price)} on the Hash Marketplace, sold by ${product.vendorName}.${summary ? ` ${summary}` : ""}`,
    path: productPath(product),
    image: product.images?.[0] || product.thumbnail || undefined,
    keywords: [product.title, `buy ${product.title}`, `${product.title} price`, product.vendorName].filter(Boolean),
  });
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const canonical = productPath(product);
  if (`${STORE.root}/${slug}` !== canonical) permanentRedirect(withQuery(canonical, await searchParams));

  let related = [];
  try {
    const all = await loadProducts();
    related = [
      ...all.filter((p) => p.id !== product.id && p.vendorId === product.vendorId),
      ...all.filter((p) => p.id !== product.id && p.vendorId !== product.vendorId && p.kind === product.kind),
    ].slice(0, 4);
  } catch {}

  const images = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const specLd = (product.specs || []).map((r) => ({ "@type": "PropertyValue", name: r.label, value: r.value }));
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: STORE.root },
    { name: product.title, href: canonical },
  ];
  const url = `${SITE_URL}${canonical}`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    url,
    sku: product.variantId || product.id,
    productID: product.id,
    image: images.length ? images : [`${SITE_URL}${SITE_LOGO}`],
    description: plain(product.description || product.subtitle || product.title, 5000),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category ? { category: product.category } : {}),
    ...(specLd.length ? { additionalProperty: specLd } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: Number(product.price).toFixed(2),
      priceCurrency: "INR",
      availability: product.available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: product.vendorName },
    },
    ...(product.rating?.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average.toFixed(1), reviewCount: product.rating.count } }
      : {}),
  };

  return (
    <>
      <JsonLd data={[productLd, breadcrumbsLd(crumbs, SITE_URL)]} />
      <Container className="pt-8">
        <Breadcrumbs items={crumbs} />
      </Container>

      <Container className="pb-12 pt-6">
        <ProductHero
          product={product}
          images={images}
          header={
            <>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">
                {product.kind === "service" ? "Service" : product.category || "Gaming gear"}
              </p>
              <h1 className="mt-4 text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-white">{product.title}</h1>
              {product.subtitle && <p className="mt-3 text-lg text-white/60">{product.subtitle}</p>}
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-white/50">
                <span>
                  Sold by <span className="text-white/85">{product.vendorName}</span>
                </span>
                {product.rating?.count > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#ffd23d] text-[#ffd23d]" aria-hidden />
                    {product.rating.average.toFixed(1)} ({product.rating.count} {product.rating.count === 1 ? "review" : "reviews"})
                  </span>
                )}
              </p>
            </>
          }
        />
      </Container>

      {(product.description || product.specs?.length > 0) && (
        <section className="border-t border-white/[0.06]">
          <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:gap-20">
            {product.description && (
              <div aria-labelledby="about-title">
                <h2 id="about-title" className="text-2xl font-semibold tracking-tight text-white">About this {product.kind === "service" ? "service" : "product"}</h2>
                <div className="mt-5 whitespace-pre-line text-[15px] leading-7 text-white/65">{plain(product.description, 5000)}</div>
              </div>
            )}
            {product.specs?.length > 0 && (
              <div aria-labelledby="specs-title">
                <h2 id="specs-title" className="text-2xl font-semibold tracking-tight text-white">Specifications</h2>
                <dl className="mt-5 divide-y divide-white/[0.08] overflow-hidden rounded-2xl border border-white/[0.08]">
                  {product.specs.map((row) => (
                    <div key={row.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3.5 text-[15px] odd:bg-white/[0.02]">
                      <dt className="text-white/50">{row.label}</dt>
                      <dd className="text-white/90">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <Container className="py-16">
            <SectionHeading title="You might also like." action={<Link href={STORE.root} className="text-[15px] font-semibold text-white hover:text-[#ff9a3d]">Shop all →</Link>} />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}><ProductCard product={p} /></li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CrossSell to="book" />
    </>
  );
}
