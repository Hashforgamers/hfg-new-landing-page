import Image from "next/image";
import AppShell from "@/components/AppShell";
import NavBar from "@/components/landing/NavBar";
import Reveal from "@/components/landing/Reveal";
import HeroVideo from "@/components/landing/HeroVideo";
import StoreButtons from "@/components/landing/StoreButtons";
import { FAQS, FEATURES, GAMES, STEPS, TICKER } from "@/lib/landing";
import MobileDownloadBar from "@/components/landing/MobileDownloadBar";
import {
  SITE_APP_STORE_URL,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_LOGO,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_ONBOARD_URL,
  SITE_PLAY_STORE_URL,
  SITE_SOCIALS,
  SITE_URL,
  buildPageMetadata,
} from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Hash For Gamers: Esports Tournaments & Gaming Cafe Booking App in India",
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: ["gaming booking app India", "gaming cafe reservation app", "esports app India"],
});

// Add the hero clip here once it's in public/videos/, e.g. { src: "/videos/hero.mp4", type: "video/mp4" }.
// With no sources the poster image is shown on its own.
const HERO_VIDEO_SOURCES = [];

const SIZE_CLASSES = {
  lg: "sm:col-span-2 sm:row-span-2",
  md: "sm:col-span-2",
  tall: "sm:row-span-2",
  sm: "",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_LOGO}`,
    email: SITE_EMAIL,
    sameAs: SITE_SOCIALS,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
  },
  {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Android, iOS",
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}${SITE_OG_IMAGE}`,
    downloadUrl: [SITE_PLAY_STORE_URL, SITE_APP_STORE_URL],
    installUrl: SITE_PLAY_STORE_URL,
    featureList: FEATURES.map((f) => f.title),
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
];

function Eyebrow({ children }) {
  return (
    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#ff9a3d]">{children}</p>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden" aria-labelledby="hero-title">
      <HeroVideo poster="/images/retro-car.jpg" sources={HERO_VIDEO_SOURCES} />
      {/* Vice-style sunset grade: pink → orange haze over a deep purple floor */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff3d8b]/25 via-transparent to-[#3b0a45]/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-16 pt-32 sm:px-8 sm:pb-24">
        <div>
          <Eyebrow>Free on Android &amp; iOS · Made in India</Eyebrow>
          <h1
            id="hero-title"
            className="font-display text-[clamp(3.5rem,13vw,13rem)] uppercase leading-[0.85] text-white"
          >
            <span className="block">Compete.</span>
            <span className="block bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent">
              Book. Win.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Esports tournaments, gaming cafe bookings, squads and rewards in one app. Hash For Gamers is where
            India&apos;s players compete and get paid.
          </p>
          <StoreButtons className="mt-8" />
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[#ff3d8b] py-3" aria-hidden="true">
      <div className="animate-ticker flex w-max gap-10 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="font-display text-2xl uppercase tracking-wide text-black">
            {t} <span className="ml-10">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureGrid() {
  return (
    <section id="features" className="bg-black px-4 py-24 sm:px-8" aria-labelledby="features-title">
      <div className="mx-auto max-w-[1600px]">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Everything in one app</Eyebrow>
            <h2 id="features-title" className="font-display text-6xl uppercase leading-none text-white sm:text-8xl">
              Your whole scene
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/70">
            From tournament brackets to the PC you&apos;ll sit at tonight, Hash runs your gaming life from one place.
          </p>
        </Reveal>

        <div className="grid auto-rows-[280px] grid-flow-dense gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.id} delay={(i % 4) * 0.08} className={SIZE_CLASSES[f.size]}>
              <article
                id={f.id === "tournaments" ? "tournaments" : undefined}
                className="group relative h-full overflow-hidden rounded-sm bg-[#120818]"
              >
                {f.image && (
                  <Image
                    src={f.image}
                    alt={f.alt || ""}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    className={`transition duration-700 group-hover:scale-105 ${
                      f.fit === "contain" ? "object-contain object-right p-6 pl-[45%] opacity-30 sm:opacity-100" : "object-cover"
                    }`}
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-tr ${f.accent} via-black/40 to-transparent`} />
                <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80">{f.kicker}</p>
                  <h3
                    className={`mt-2 font-display uppercase leading-[0.9] text-white ${
                      f.size === "lg" ? "text-5xl sm:text-6xl xl:text-8xl" : "text-4xl xl:text-5xl"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p className={`mt-3 text-sm leading-6 text-white/85 ${f.size === "lg" ? "max-w-sm" : "max-w-xs"}`}>
                    {f.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Games() {
  return (
    <section className="border-y border-white/10 bg-[#0b0414] px-4 py-24 sm:px-8" aria-labelledby="games-title">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <Eyebrow>Pick your game</Eyebrow>
          <h2 id="games-title" className="font-display text-6xl uppercase leading-none text-white sm:text-8xl">
            Games on Hash
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 border-l border-t border-white/10 lg:grid-cols-4">
          {GAMES.map((g, i) => (
            <li key={g.name} className="border-b border-r border-white/10">
              <Reveal delay={(i % 4) * 0.06} y={20} className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors duration-300 hover:bg-[#ff3d8b] sm:p-8">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 group-hover:text-black/70">
                  {String(i + 1).padStart(2, "0")} · {g.type}
                </span>
                <h3 className="font-display text-3xl uppercase leading-none text-white group-hover:text-black sm:text-5xl">
                  {g.name}
                </h3>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-6 text-white/40">
          Game titles are trademarks of their respective owners. Tournament line-ups change weekly; check the app for
          what&apos;s live near you.
        </p>
      </div>
    </section>
  );
}

function AppShowcase() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-black via-[#2a0838] to-[#ff3d8b] px-4 py-28 sm:px-8"
      aria-labelledby="showcase-title"
    >
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>The Hash app</Eyebrow>
          <h2 id="showcase-title" className="font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl">
            The city is your arena
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/80">
            Browse tonight&apos;s tournaments, see which cafes have free PCs and consoles, invite your squad and track
            your wallet without switching apps.
          </p>
          <StoreButtons className="mt-8" />
        </Reveal>
        <div className="relative mx-auto flex h-[560px] w-full max-w-[520px] justify-center">
          <Reveal className="absolute left-0 top-10 w-[48%] -rotate-6" delay={0.1}>
            <Image
              src="/images/app/tournaments.webp"
              alt="Hash app tournaments screen with live and upcoming esports tournaments"
              width={720}
              height={1460}
              sizes="260px"
              className="h-auto w-full rounded-[28px] border-4 border-white/10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </Reveal>
          <Reveal className="absolute right-0 top-0 w-[48%] rotate-6" delay={0.2}>
            <Image
              src="/images/app/tournament-detail.webp"
              alt="Hash app tournament detail with prize pool, slots, teams, rules and leaderboard"
              width={720}
              height={1460}
              sizes="260px"
              className="h-auto w-full rounded-[28px] border-4 border-white/10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#ff3d8b] px-4 py-24 text-black sm:px-8" aria-labelledby="how-title">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <h2 id="how-title" className="font-display text-6xl uppercase leading-none sm:text-8xl">
            How it works
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-px bg-black/20 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="bg-[#ff3d8b]">
              <Reveal delay={i * 0.1} className="p-6 sm:p-8">
                <span className="font-display text-8xl leading-none text-black/25">{s.n}</span>
                <h3 className="mt-4 font-display text-4xl uppercase">{s.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/75">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ForCafes() {
  return (
    <section className="relative overflow-hidden bg-black px-4 py-28 sm:px-8" aria-labelledby="cafes-title">
      <Image
        src="/gta6-miami-sunset.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <Reveal className="relative mx-auto max-w-[1600px]">
        <Eyebrow>For gaming cafe owners</Eyebrow>
        <h2 id="cafes-title" className="max-w-3xl font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl">
          Fill every seat
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/80">
          List your gaming cafe on Hash to get advance bookings, host tournaments and reach players nearby. Sign up online, verify with OTP, upload your documents and go live.
        </p>
        <a
          href={SITE_ONBOARD_URL}
          className="mt-8 inline-block rounded-full border border-white px-8 py-3 font-display text-xl uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
        >
          List your cafe
        </a>
      </Reveal>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="bg-black px-4 py-24 sm:px-8" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 id="faq-title" className="font-display text-6xl uppercase leading-none text-white sm:text-7xl">
            FAQ
          </h2>
        </Reveal>
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
  );
}

function FinalCta() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] px-4 py-28 text-center sm:px-8"
      aria-labelledby="cta-title"
    >
      <Reveal className="mx-auto max-w-4xl">
        <h2 id="cta-title" className="font-display text-[clamp(3.5rem,11vw,10rem)] uppercase leading-[0.85] text-black">
          Get Hash. <br /> Get in the game.
        </h2>
        <div className="mt-10 flex justify-center [&_a:first-child]:bg-black [&_a:first-child]:text-white [&_a:last-child]:border-black [&_a:last-child]:text-black">
          <StoreButtons className="justify-center" />
        </div>
      </Reveal>
    </section>
  );
}

export default function Page() {
  return (
    <AppShell>
      {jsonLd.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <NavBar />
      <Hero />
      <Ticker />
      <FeatureGrid />
      <Games />
      <AppShowcase />
      <HowItWorks />
      <ForCafes />
      <Faq />
      <FinalCta />
      <MobileDownloadBar />
    </AppShell>
  );
}
