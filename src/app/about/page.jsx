import Link from "next/link";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import InfoCards from "@/components/landing/InfoCards";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { SITE_EMAIL, SITE_LOGO, SITE_NAME, SITE_SOCIALS, SITE_URL, breadcrumbLd, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "About Hash For Gamers",
  description:
    "Hash For Gamers is a Mumbai gaming company building India's tournament-first gaming app, gaming cafe booking and the tools cafes use to run every PC.",
  path: "/about",
});

const BUILD = [
  { title: "The Hash app", body: "Esports tournaments, gaming cafe bookings, squads and HashCoins rewards in one free app for Android and iOS." },
  { title: "Tools for cafes", body: "A kiosk that runs every PC, a dashboard for bookings, consoles and earnings, and self-serve onboarding for new cafes." },
  { title: "Games", body: "Mumbai Surfer, our free runner game set on Mumbai's Western Line local train route." },
];

const FACTS = [
  ["Company", "Hashforgamers Private Limited"],
  ["Based in", "Mira Road, Mumbai, Maharashtra, India"],
  ["Products", "Hash app (Android and iOS), Hash cafe dashboard and kiosk, Mumbai Surfer"],
  ["Contact", SITE_EMAIL],
];

export default function AboutPage() {
  return (
    <AppShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            url: `${SITE_URL}/about`,
            mainEntity: {
              "@type": "Organization",
              name: SITE_NAME,
              legalName: "Hashforgamers Private Limited",
              url: SITE_URL,
              logo: `${SITE_URL}${SITE_LOGO}`,
              email: SITE_EMAIL,
              sameAs: SITE_SOCIALS,
              address: { "@type": "PostalAddress", addressLocality: "Mira Road, Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
            },
          },
          breadcrumbLd("About", "/about"),
        ]}
      />
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="About Hash"
        heading="About Hash For Gamers"
        lines={["Built for", "India's gamers."]}
        body="Hash For Gamers is a gaming company from Mumbai. We build the Hash app, where players join esports tournaments, book gaming cafes and earn rewards, and the tools gaming cafes use to fill their stations and run them."
        image="/images/hero-poster.jpg"
        placement="about_hero"
      />
      <InfoCards id="about-build" title="What we build" items={BUILD} />
      <section className="bg-black px-4 py-24 sm:px-8" aria-labelledby="about-mission">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          <div>
            <h2 id="about-mission" className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">
              Our mission
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/75">
              Gaming in India runs on group chats, phone calls and walk-ins. We want finding a tournament, booking a PC or a
              PS5 near you, and getting paid when you win to take a few taps, and we want gaming cafes to spend their time
              on players instead of paperwork.
            </p>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/75">
              Questions or partnerships: <a href={`mailto:${SITE_EMAIL}`} className="underline hover:text-white">{SITE_EMAIL}</a>.
              Gaming cafe owners can start with the <Link href="/list-cafe" className="underline hover:text-white">cafe listing page</Link>.
            </p>
          </div>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {FACTS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-5">
                <dt className="font-tech text-[11px] uppercase tracking-[0.25em] text-[#ff9a3d]">{k}</dt>
                <dd className="text-base text-white/80">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </AppShell>
  );
}
