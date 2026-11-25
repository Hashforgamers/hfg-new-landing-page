import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { withQuery } from "@/lib/verticals";
import { ProductView, Stars } from "@/components/play/ProductDetail";
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
    ].slice(0, 5);
  } catch {}

  const images = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const specLd = (product.specs || []).map((r) => ({ "@type": "PropertyValue", name: r.label, value: r.value }));
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: STORE.root },
    ...(product.categoryId ? [{ name: product.category, href: `${STORE.root}?category=${encodeURIComponent(product.categoryId)}` }] : []),
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

  const service = product.kind === "service";
  const extra = [
    ["Sold by", product.vendorName],
    ["Category", service ? "Service" : product.category],
    product.variants?.length > 1 ? ["Options", `${product.variants.length} (${(product.options || []).map((o) => o.title).join(", ")})`] : null,
    ["Product ID", product.id],
  ].filter((r) => r && r[1]);

  return (
    <>
      <JsonLd data={[productLd, breadcrumbsLd(crumbs, SITE_URL)]} />

      <Container className="pb-12 pt-6 sm:pt-8">
        <ProductView product={product} crumbs={<div className="mb-5 hidden lg:block"><Breadcrumbs items={crumbs} /></div>} />
      </Container>

      <section className="border-t border-white/[0.06]" id="specifications" aria-labelledby="specs-title">
        <Container className="py-12 sm:py-16">
          <h2 id="specs-title" className="text-2xl font-semibold tracking-tight text-white">Product information</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
            {product.specs?.length > 0 && (
              <div>
                <h3 className="text-[15px] font-medium text-white/60">Technical details</h3>
                <SpecTable rows={product.specs.map((r) => [r.label, r.value])} />
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-medium text-white/60">Additional information</h3>
              <SpecTable rows={extra} />
            </div>
          </div>
        </Container>
      </section>

      {(product.description || product.rating?.count > 0) && (
        <section className="border-t border-white/[0.06]">
          <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
            {product.description && (
              <div aria-labelledby="about-title">
                <h2 id="about-title" className="text-2xl font-semibold tracking-tight text-white">Product description</h2>
                <div className="mt-5 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-white/65">{plain(product.description, 5000)}</div>
              </div>
            )}
            <div id="ratings" className="scroll-mt-28" aria-labelledby="ratings-title">
              <h2 id="ratings-title" className="text-2xl font-semibold tracking-tight text-white">Customer ratings</h2>
              {product.rating?.count > 0 ? (
                <div className="mt-5 rounded-[28px] border border-white/[0.08] bg-[#0e0e12] p-6">
                  <p className="flex items-center gap-3">
                    <span className="text-4xl font-semibold text-white">{product.rating.average.toFixed(1)}</span>
                    <span>
                      <Stars value={product.rating.average} className="h-5 w-5" />
                      <span className="mt-1 block text-sm text-white/50">{product.rating.count.toLocaleString("en-IN")} verified ratings</span>
                    </span>
                  </p>
                  <p className="mt-4 text-sm text-white/50">Ratings come from players who bought through Hash. Rate your order from the Hash app after delivery.</p>
                </div>
              ) : (
                <p className="mt-5 text-[15px] text-white/50">No ratings yet. Buyers can rate it from the Hash app after delivery.</p>
              )}
            </div>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <Container className="py-12 sm:py-16">
            <SectionHeading title="Customers also viewed" action={<Link href={STORE.root} className="text-[15px] font-semibold text-white hover:text-[#ff9a3d]">Shop all →</Link>} />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
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

function SpecTable({ rows }) {
  return (
    <table className="mt-3 w-full overflow-hidden rounded-2xl text-[15px]">
      <tbody className="divide-y divide-white/[0.06]">
        {rows.map(([label, value]) => (
          <tr key={label} className="odd:bg-white/[0.03]">
            <th scope="row" className="w-[42%] px-5 py-3.5 text-left align-top font-normal text-white/50">{label}</th>
            <td className="px-5 py-3.5 align-top text-white/90">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
