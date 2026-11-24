import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import CafeDirectory from "@/components/play/CafeDirectory";
import { Container, CrossSell, FaqList, SectionHeading, VerticalHero, breadcrumbsLd, faqLd } from "@/components/play/parts";
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

const STEPS = [
  { n: "01", title: "Pick a cafe", body: "Search by area or pincode and see what each cafe has: consoles, hours and amenities." },
  { n: "02", title: "Choose a console and time", body: "Live availability for every PC, PlayStation, Xbox, VR and racing station. Book one slot or several." },
  { n: "03", title: "Pay and play", body: "Pay with UPI, card or your Hash Wallet, or pay at the counter where the cafe allows it." },
];

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
        kicker="Hash Book"
        lines={["Book a gaming", "cafe near you."]}
        body="Live slots and prices for PC, PlayStation, Xbox, VR and racing setups at Hash partner cafes. Book in under a minute."
      />

      <section id="cafes" className="scroll-mt-32">
        <Container className="py-14 sm:py-20">
          <SectionHeading kicker="Cafes" title="Find your cafe." />
          <div className="mt-8">
            {cafes.length ? (
              <CafeDirectory cafes={cafes} />
            ) : (
              <p className="rounded-[28px] border border-white/[0.08] p-10 text-center text-white/55">
                We couldn&apos;t load cafes right now. Please refresh in a moment.
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.06] bg-[#060608]">
        <Container className="py-16 sm:py-24">
          <SectionHeading kicker="How it works" title="Three taps to your seat." />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-[28px] border border-white/[0.08] bg-[#0e0e12] p-7">
                <p className="font-display text-5xl text-white/15">{s.n}</p>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-white/55">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {byState.size > 0 && (
        <section className="border-t border-white/[0.06]">
          <Container className="py-16 sm:py-20">
            <SectionHeading kicker="By location" title="Gaming cafes by area." />
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {[...byState.entries()].map(([state, list]) => (
                <div key={state}>
                  <h3 className="text-[15px] font-semibold text-white">Gaming cafes in {state}</h3>
                  <ul className="mt-3 space-y-2">
                    {list.map((c) => (
                      <li key={c.id}>
                        <Link href={cafePath(c)} className="text-[15px] text-white/55 transition hover:text-white">
                          {c.name}
                          {cafeLocality(c) ? `, ${cafeLocality(c)}` : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-white/[0.06]">
        <Container className="py-16 sm:py-20">
          <SectionHeading kicker="FAQ" title="Questions, answered." />
          <div className="mt-8">
            <FaqList items={FAQS} />
          </div>
        </Container>
      </section>

      <CrossSell to="marketplace" />
    </>
  );
}
