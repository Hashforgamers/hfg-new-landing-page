import JsonLd from "@/components/JsonLd";
import MarketplaceGrid from "@/components/play/MarketplaceGrid";
import { Container, CrossSell, FaqList, breadcrumbsLd, faqLd } from "@/components/play/parts";
import { loadProducts } from "@/lib/server/ops/store";
import { SITE_URL, buildPageMetadata } from "@/lib/site";
import { STORE, productPath } from "@/lib/verticals";

export const metadata = buildPageMetadata({
  title: "Hash Marketplace: Buy Gaming Gear & Accessories Online",
  description:
    "Shop gaming headsets, controllers, accessories and services from verified Hash partners. Secure checkout with UPI or card and tracked delivery across India.",
  path: STORE.root,
  keywords: ["buy gaming gear online India", "gaming accessories", "gaming headset price", "controller online", "Hash marketplace"],
});

const FAQS = [
  { q: "Who sells on the Hash Marketplace?", a: "Gaming cafes, stores and service providers that partner with Hash. Each seller sets their own prices and ships the order." },
  { q: "How do I track my order?", a: "Open My account and select the order. You'll see each step, the courier and tracking number once it ships." },
  { q: "What is the completion code?", a: "A one-time code you share with the seller only after you receive your order or service. Sharing it confirms delivery." },
  { q: "Can I cancel an order?", a: "Yes, you can request a cancellation from the order page before it's delivered. Refunds are reviewed by Hash." },
];

export default async function MarketplacePage() {
  let products = [];
  try {
    products = await loadProducts();
  } catch {
    products = [];
  }
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: STORE.root },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbsLd(crumbs, SITE_URL),
          faqLd(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Hash Marketplace",
            numberOfItems: products.length,
            itemListElement: products.slice(0, 100).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${productPath(p)}`, name: p.title })),
          },
        ]}
      />

      <section id="shop" className="scroll-mt-28" aria-labelledby="store-title">
        <Container className="pb-12 pt-8 sm:pt-10">
          <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">Hash Marketplace</p>
              <h1 id="store-title" className="mt-3 text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-tight text-white">
                Gaming gear from verified partners.
              </h1>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
              {["Verified sellers", "Secure UPI and card checkout", "Tracked delivery across India"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff9a3d]" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-7">
            {products.length ? (
              <MarketplaceGrid products={products} />
            ) : (
              <p className="rounded-[28px] border border-white/[0.08] p-10 text-center text-white/55">New partner listings are on their way. Check back soon.</p>
            )}
          </div>
        </Container>
      </section>

      <CrossSell to="book" />

      <section className="border-t border-white/[0.06]">
        <Container className="grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 className="text-xl font-semibold tracking-tight text-white">Questions about buying on Hash</h2>
          <FaqList items={FAQS} />
        </Container>
      </section>
    </>
  );
}
