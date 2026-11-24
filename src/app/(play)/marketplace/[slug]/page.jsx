import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Star } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { withQuery } from "@/lib/verticals";
import BuyBox, { ProductGallery } from "@/components/play/ProductDetail";
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

      <Container className="pb-16 pt-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="min-w-0 lg:sticky lg:top-[136px] lg:self-start">
            <ProductGallery images={images} title={product.title} />
          </div>

          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">
              {product.kind === "service" ? "Service" : product.category || "Gaming gear"}
            </p>
            <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-tight text-white">{product.title}</h1>
            {product.subtitle && <p className="mt-3 text-lg text-white/60">{product.subtitle}</p>}
            <p className="mt-3 text-[15px] text-white/50">
              Sold by <span className="text-white/80">{product.vendorName}</span>
              {product.rating?.count > 0 && (
                <span className="ml-3 inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-[#ffd23d] text-[#ffd23d]" aria-hidden />
                  {product.rating.average.toFixed(1)} ({product.rating.count})
                </span>
              )}
            </p>
            <p className="mt-8 text-[32px] font-semibold tracking-tight text-white">{inr(product.price)}</p>
            <p className="text-sm text-white/40">Inclusive of all taxes</p>

            <div className="mt-8">
              <BuyBox product={product} />
            </div>

            {product.description && (
              <section className="mt-12 border-t border-white/[0.08] pt-8" aria-labelledby="about-title">
                <h2 id="about-title" className="text-xl font-semibold tracking-tight text-white">About this {product.kind === "service" ? "service" : "product"}</h2>
                <div className="mt-4 whitespace-pre-line text-[15px] leading-7 text-white/65">{plain(product.description, 5000)}</div>
              </section>
            )}
          </div>
        </div>
      </Container>

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
