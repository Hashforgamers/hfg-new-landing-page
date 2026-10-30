import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/landing/FaqSection";
import InfoCards from "@/components/landing/InfoCards";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { DASHBOARD_SCREENS, KIOSK_POINTS } from "@/lib/landing";
import { SITE_NAME, SITE_ONBOARD_URL, SITE_URL, breadcrumbLd, buildPageMetadata } from "@/lib/site";

const PATH = "/gaming-cafe-software";

export const metadata = buildPageMetadata({
  title: "Gaming Cafe Management Software India",
  description:
    "Hash gaming cafe software: a kiosk that locks every PC until a session starts, online bookings from gamers nearby, and one dashboard for sessions, consoles, pricing and earnings.",
  path: PATH,
  keywords: [
    "gaming cafe management software",
    "gaming cafe software",
    "gaming cafe billing software",
    "gaming lounge management software",
    "gaming cafe management system",
    "PC gaming cafe software",
    "gaming center software India",
  ],
});

const FAQS = [
  { q: "What is gaming cafe management software?", a: "It runs the business side of a gaming cafe: starting and ending sessions on each PC or console, taking bookings, setting prices and tracking customers and earnings. Hash does this with a kiosk app on every PC and one dashboard for the whole cafe." },
  { q: "How does the Hash kiosk control PCs?", a: "Each PC stays on the Hash lock screen until a session starts. Gamers unlock it by scanning a QR code in the Hash app or typing their booking code, and the PC locks itself again when time runs out." },
  { q: "Can staff add time or end a session?", a: "Yes. From the desk, staff can add 15, 30 or 60 minutes or end a session on any station." },
  { q: "Does it work for PlayStation, Xbox, VR and racing rigs?", a: "Yes. Link your PCs, PlayStations, Xboxes, VR and racing rigs to the dashboard, see which are free and manage them in one place." },
  { q: "Can I set my own prices?", a: "Yes. Set slot rates per console type, run offers and squad pricing, and change them any time from the dashboard." },
  { q: "Do I get bookings from players?", a: "Cafes on Hash are listed in the Hash app, where gamers nearby can find you, see your setups and book a slot in advance." },
  { q: "How do I get started?", a: "Request a callback on the list your cafe page or onboard yourself: verify your email, add your cafe details and documents, install the kiosk and set your prices." },
];

const KIOSK = KIOSK_POINTS.map(({ title, body }) => ({ title, body }));

export default function GamingCafeSoftwarePage() {
  return (
    <AppShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Hash cafe dashboard and kiosk",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Windows, Web",
            description: metadata.description,
            url: `${SITE_URL}${PATH}`,
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          breadcrumbLd("Gaming Cafe Software", PATH),
        ]}
      />
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="For gaming cafe owners"
        heading="Gaming cafe management software"
        lines={["Run every PC.", "From one screen."]}
        body="Hash locks every PC until a session starts, brings you bookings from gamers nearby, and puts sessions, consoles, customers, pricing and earnings on one dashboard."
        image="/images/hero-poster.jpg"
        placement="cafe_software_hero"
        actions={
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={SITE_ONBOARD_URL} data-track="cafe_onboard_click" data-track-placement="cafe_software_hero" className="rounded-full bg-white px-8 py-3 font-display text-lg uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white">
              Onboard your cafe
            </a>
            <Link href="/list-cafe" className="rounded-full border border-white/40 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-white hover:text-black">
              Request a callback
            </Link>
          </div>
        }
      />
      <InfoCards id="kiosk-points" title="The Hash kiosk" items={KIOSK} />

      <section className="bg-black px-4 py-24 sm:px-8" aria-labelledby="dashboard-title">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="dashboard-title" className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">
            The cafe dashboard
          </h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-2">
            {DASHBOARD_SCREENS.map((s) => (
              <li key={s.title}>
                <Image src={s.image} alt={s.alt} width={1470} height={780} sizes="(min-width: 768px) 50vw, 100vw" className="h-auto w-full rounded-2xl border border-white/10" />
                <h3 className="mt-5 font-display text-3xl uppercase leading-none text-white">{s.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">{s.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl text-sm leading-7 text-white/60">
            Planning a new cafe? Work out setup cost, monthly profit and break-even with the{" "}
            <Link href="/gaming-cafe-cost-calculator" className="underline hover:text-white">gaming cafe cost calculator</Link>, or see what a{" "}
            <Link href="/gaming-cafe-franchise" className="underline hover:text-white">Hash franchise</Link> includes.
          </p>
        </div>
      </section>

      <FaqSection id="cafe-software-faq" title="Software questions" faqs={FAQS} />
    </AppShell>
  );
}
