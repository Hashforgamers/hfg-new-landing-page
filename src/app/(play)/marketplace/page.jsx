import JsonLd from "@/components/JsonLd";
import MarketplaceGrid from "@/components/play/MarketplaceGrid";
import { Container, CrossSell, FaqList, SectionHeading, VerticalHero, breadcrumbsLd, faqLd } from "@/components/play/parts";
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

const PROMISES = [
  { title: "Verified sellers", body: "Every seller is a Hash partner, reviewed before their listings go live." },
  { title: "Secure checkout", body: "Pay with UPI, cards or netbanking through Razorpay. Every request is encrypted." },
  { title: "Tracked delivery", body: "Follow your order to your door. Share a one-time code only when it arrives." },
];

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

      <VerticalHero
        kicker="Hash Marketplace"
        lines={["Gear up.", "Play better."]}
        body="Gaming gear and services from verified Hash partners, with secure checkout and tracked delivery across India."
        glow="#ff9a3d"
      />

      <section id="shop" className="scroll-mt-32">
        <Container className="py-14 sm:py-20">
          <SectionHeading kicker="Shop" title="All products." />
          <div className="mt-8">
            {products.length ? (
              <MarketplaceGrid products={products} />
            ) : (
              <p className="rounded-[28px] border border-white/[0.08] p-10 text-center text-white/55">
                New partner listings are on their way. Check back soon.
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.06] bg-[#060608]">
        <Container className="py-16 sm:py-24">
          <SectionHeading kicker="Why Hash" title="Shop with confidence." />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {PROMISES.map((p) => (
              <li key={p.title} className="rounded-[28px] border border-white/[0.08] bg-[#0e0e12] p-7">
                <h3 className="text-xl font-semibold tracking-tight text-white">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-white/55">{p.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-white/[0.06]">
        <Container className="py-16 sm:py-20">
          <SectionHeading kicker="FAQ" title="Questions, answered." />
          <div className="mt-8">
            <FaqList items={FAQS} />
          </div>
        </Container>
      </section>

      <CrossSell to="book" />
    </>
  );
}
