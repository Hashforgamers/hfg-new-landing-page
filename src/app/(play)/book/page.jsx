import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import CafeDirectory from "@/components/play/CafeDirectory";
import { Container, CrossSell, FaqList, VerticalHero, breadcrumbsLd, faqLd } from "@/components/play/parts";
import { loadCafes } from "@/lib/server/ops/booking";
import { SITE_URL, buildPageMetadata } from "@/lib/site";
import { BOOK, cafeLocality, cafePath } from "@/lib/verticals";

export const metadata = buildPageMetadata({
  title: "Book Gaming Cafes Online: Slots, Prices & Consoles",
  description:
    "Book a gaming cafe near you on Hash. Compare PC, PS5, Xbox and VR setups, see live slots and prices, and pay online or at the cafe.",
  path: BOOK.root,
  keywords: ["book gaming cafe online", "gaming cafe near me", "PS5 cafe booking", "PC gaming cafe slots", "gaming zone booking"],
});

const FAQS = [
  {
    q: "How do I book a gaming cafe on Hash?",
    a: "Open the cafe's page, choose a console, pick a date and one or more time slots, then pay online or choose pay at cafe. Your booking shows up in the Hash app and under My bookings on the website.",
  },
  {
    q: "Can I pay at the cafe instead of online?",
    a: "Yes, at cafes that allow it. You'll see a Pay at the cafe option at checkout when it's available.",
  },
  {
    q: "Is it the same account as the Hash app?",
    a: "Yes. Sign in with the same Apple or Google account you use in the app, and your bookings, wallet and orders are shared.",
  },
  {
    q: "What if a slot fills up while I'm booking?",
    a: "Prices and availability are checked again before you pay. If a slot is taken, you'll be asked to pick another and nothing is charged.",
  },
];

export default async function BookPage() {
  let cafes = [];
  try {
    cafes = await loadCafes();
  } catch {
    cafes = [];
  }
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Book a gaming cafe", href: BOOK.root },
  ];

  // Area index: plain links every crawler can follow (and people can scan).
  const byState = new Map();
  for (const c of cafes) {
    const key = c.state || "Other";
    if (!byState.has(key)) byState.set(key, []);
    byState.get(key).push(c);
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbsLd(crumbs, SITE_URL),
          faqLd(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Gaming cafes you can book on Hash",
            numberOfItems: cafes.length,
            itemListElement: cafes.slice(0, 100).map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}${cafePath(c)}`,
              name: c.name,
            })),
          },
        ]}
      />

      <VerticalHero
        title="Book a gaming"
        accent="cafe near you"
        subtitle="Live slots and prices at Hash partner cafes. Pick a console, choose a time, play."
      />

      <section id="cafes" className="scroll-mt-28" aria-label="Gaming cafes">
        <Container className="py-8 sm:py-10">
          {cafes.length ? (
            <CafeDirectory cafes={cafes} />
          ) : (
            <p className="rounded-[28px] border border-white/[0.08] p-10 text-center text-white/55">
              We couldn&apos;t load cafes right now. Please refresh in a moment.
            </p>
          )}
        </Container>
      </section>

      <CrossSell to="marketplace" />

      <section className="border-t border-white/[0.06]">
        <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          {byState.size > 0 && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Gaming cafes by area</h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {[...byState.entries()].map(([state, list]) => (
                  <div key={state}>
                    <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-white/40">{state}</h3>
                    <ul className="mt-3 space-y-2">
                      {list.map((c) => (
                        <li key={c.id}>
                          <Link href={cafePath(c)} className="text-[15px] text-white/65 transition hover:text-white">
                            {c.name}
                            {cafeLocality(c) ? `, ${cafeLocality(c)}` : ""}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Questions</h2>
            <div className="mt-4">
              <FaqList items={FAQS} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
