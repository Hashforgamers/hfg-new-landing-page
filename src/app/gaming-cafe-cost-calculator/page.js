import AppShell from "@/components/AppShell";
import CafeCalculator from "@/components/landing/CafeCalculator";
import MaskHeading from "@/components/landing/MaskHeading";
import NavBar from "@/components/landing/NavBar";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { DEFAULT_PRICES, DEFAULTS, PRICES_CHECKED, calculate, inrShort } from "@/lib/calculator";
import { SITE_NAME, SITE_ONBOARD_URL, SITE_URL, buildPageMetadata } from "@/lib/site";

const PATH = "/gaming-cafe-cost-calculator";
const example = calculate(DEFAULTS, DEFAULT_PRICES);

export const metadata = buildPageMetadata({
  title: "Gaming Cafe Cost Calculator India: Setup Cost, Profit and Break-even",
  description:
    "Free gaming cafe cost calculator for India. Pick your PCs, PS5s, Xbox, VR and racing rigs to see setup cost, monthly expenses, earnings and break-even, with Amazon and Flipkart price links.",
  path: PATH,
  keywords: [
    "gaming cafe cost calculator",
    "gaming cafe setup cost in India",
    "how to start a gaming cafe in India",
    "gaming zone investment",
    "gaming cafe profit",
    "gaming cafe business plan",
  ],
});

const FAQS = [
  {
    q: "How much does it cost to open a gaming cafe in India?",
    a: `It depends mostly on how many stations you run and where. With this calculator's defaults (${DEFAULTS.pcs} mid-range gaming PCs and ${DEFAULTS.ps5} PlayStation 5 consoles in a tier 2 city with standard interiors) the estimate is about ${inrShort(example.setupTotal)}. A small budget setup can be much less and a premium metro cafe several times more.`,
  },
  {
    q: "What is included in the setup cost?",
    a: "Gaming PCs with monitors and peripherals, consoles with TVs and extra controllers, VR and racing rigs, chairs and desks, interiors and wiring, air conditioning, networking and UPS, a three-month rent deposit, and licences and registration.",
  },
  {
    q: "Where do the equipment prices come from?",
    a: `They are typical Indian street prices last checked in ${PRICES_CHECKED}. Every price is editable, and each item links to an Amazon.in and Flipkart search so you can check today's price and type it in.`,
  },
  {
    q: "How is monthly profit estimated?",
    a: "Earnings are your hourly rate times hours open times the share of seats filled, with consoles, VR and racing rigs billed above the PC rate. Monthly costs cover rent, staff, electricity, internet and software, and repairs. Profit is the difference, and break-even is setup cost divided by monthly profit.",
  },
  {
    q: "How long does a gaming cafe take to break even?",
    a: "It varies with occupancy more than anything else. Well-run cafes commonly take around one and a half to three years. Filling off-peak hours with advance bookings and tournaments shortens it.",
  },
  {
    q: "How does Hash help a new gaming cafe?",
    a: "Hash lists your cafe to players nearby for advance bookings, runs each PC with the Hash kiosk app, and gives you a dashboard for sessions, pricing and customers. You can onboard your cafe online.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gaming Cafe Cost Calculator",
    url: `${SITE_URL}${PATH}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Gaming Cafe Cost Calculator", item: `${SITE_URL}${PATH}` },
    ],
  },
];

export default function Page() {
  return (
    <AppShell>
      {jsonLd.map((data) => (
        <script key={data["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
      <ScrollProgress />
      <NavBar />

      <section className="relative overflow-hidden bg-black px-4 pb-16 pt-40 sm:px-8 sm:pt-48">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-[#ff3d8b]/20 blur-[150px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1600px]">
          <Reveal>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#ff9a3d]">
              Free tool for cafe owners
            </p>
          </Reveal>
          <MaskHeading
            as="h1"
            className="max-w-6xl font-display text-[clamp(3.2rem,10vw,9rem)] uppercase leading-[0.88] text-white"
          >
            Gaming cafe cost calculator
          </MaskHeading>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Planning a gaming cafe in India? Build your floor below and see what it costs to set up, what it costs to
              run each month, and how soon it can pay for itself.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-black px-4 pb-24 sm:px-8" aria-label="Calculator">
        <div className="mx-auto max-w-[1600px]">
          <CafeCalculator />
        </div>
      </section>

      <section className="bg-[#0b0414] px-4 py-24 sm:px-8" aria-labelledby="calc-faq-title">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <MaskHeading id="calc-faq-title" className="font-display text-6xl uppercase leading-none text-white sm:text-7xl">
              How it works
            </MaskHeading>
            <a
              href={SITE_ONBOARD_URL}
              className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-display text-xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
            >
              List your cafe on Hash
            </a>
          </div>
          <div className="divide-y divide-white/15 border-y border-white/15">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl uppercase text-white sm:text-3xl">
                  <h3>{q}</h3>
                  <span className="text-3xl text-[#ff9a3d] transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
