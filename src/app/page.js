import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import NavBar from "@/components/landing/NavBar";
import Reveal from "@/components/landing/Reveal";
import HeroVideo from "@/components/landing/HeroVideo";
import { FadeUp, HeroScene, RevealLine } from "@/components/landing/HeroParallax";
import Parallax from "@/components/landing/Parallax";
import ScrollBand from "@/components/landing/ScrollBand";
import TiltCard from "@/components/landing/TiltCard";
import MaskHeading from "@/components/landing/MaskHeading";
import WipeReveal from "@/components/landing/WipeReveal";
import SmoothScroll from "@/components/landing/SmoothScroll";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { JOURNEYS, DASHBOARD_SCREENS, KIOSK_POINTS, MARKET_BRANDS, MARKET_CATEGORIES, FAQS, FEATURES, GAMES, STEPS, TICKER } from "@/lib/landing";
import CafeDashboard from "@/components/landing/CafeDashboard";
import PathGate from "@/components/landing/PathGate";
import { PATH_BOOT_SCRIPT } from "@/lib/paths";
import { DEFAULT_PRICES as CALC_PRICES, DEFAULTS as CALC_DEFAULTS, calculate, inrShort } from "@/lib/calculator";
import GrowthVisual from "@/components/landing/GrowthVisual";
import FranchiseCompare from "@/components/landing/FranchiseCompare";
import MobileDownloadBar from "@/components/landing/MobileDownloadBar";
import {
  SITE_APP_STORE_URL,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_LOGO,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_FRANCHISE_URL,
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

const CALC_EXAMPLE = calculate(CALC_DEFAULTS, CALC_PRICES);

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
    <p className="font-tech mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#ff9a3d]">{children}</p>
  );
}

// Top-of-page intro for the cafe-owner and franchise paths (the gamer path keeps the main hero).
function PathIntro({ eyebrow, title, body, primary, secondary }) {
  return (
    <section className="relative overflow-hidden bg-black px-4 pb-16 pt-36 sm:px-8 sm:pt-44">
      <Parallax speed={0.3} scale className="absolute -inset-y-24 inset-x-0">
        <Image src="/images/dashboard/overview.webp" alt="" fill priority sizes="100vw" className="object-cover object-left-top opacity-25" />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
      <div className="relative mx-auto max-w-[1600px]">
        <FadeUp>
          <Eyebrow>{eyebrow}</Eyebrow>
        </FadeUp>
        <h1 className="max-w-5xl font-display text-[clamp(3.2rem,10vw,9rem)] uppercase leading-[0.86] text-white">
          {title.map((line, i) => (
            <RevealLine key={line} delay={0.1 + i * 0.15} className={i === title.length - 1 ? "bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent" : ""}>
              {line}
            </RevealLine>
          ))}
        </h1>
        <FadeUp delay={0.45}>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={primary.href}
              data-track={primary.track}
              data-track-placement="path_intro"
              className="rounded-full bg-white px-8 py-3.5 font-display text-xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
            >
              {primary.label}
            </a>
            <a
              href={secondary.href}
              data-track={secondary.track}
              data-track-placement="path_intro"
              className="rounded-full border border-white/40 px-8 py-3.5 font-display text-xl uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              {secondary.label}
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black" aria-labelledby="hero-title">
      <HeroScene
        background={
          <>
            <HeroVideo poster="/images/retro-car.jpg" sources={HERO_VIDEO_SOURCES} />
            {/* Vice-style sunset grade: pink → orange haze over a deep purple floor */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff3d8b]/25 via-transparent to-[#3b0a45]/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </>
        }
      >
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-16 pt-32 sm:px-8 sm:pb-24">
          <FadeUp>
            <Eyebrow>Free on Android &amp; iOS · Made in India</Eyebrow>
          </FadeUp>
          <h1
            id="hero-title"
            className="font-display text-[clamp(3.5rem,13vw,13rem)] uppercase leading-[0.85] text-white"
          >
            <RevealLine delay={0.1}>Compete.</RevealLine>
            <RevealLine
              delay={0.25}
              className="bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent"
            >
              Book. Win.
            </RevealLine>
          </h1>
          <FadeUp delay={0.5}>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Esports tournaments, gaming cafe bookings, squads and rewards in one app. Hash For Gamers is where
              India&apos;s players compete and get paid.
            </p>
          </FadeUp>
          <FadeUp delay={0.65}>
            <StoreButtons className="mt-8" placement="hero" />
          </FadeUp>
        </div>
      </HeroScene>

      <a
        href="#features"
        className="font-tech absolute bottom-6 right-6 z-20 hidden flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60 transition hover:text-white sm:flex"
      >
        Scroll
        <span className="relative h-12 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-white" />
        </span>
      </a>
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
            <MaskHeading id="features-title" className="font-display text-6xl uppercase leading-none text-white sm:text-8xl">
              Your whole scene
            </MaskHeading>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/70">
            From tournament brackets to the PC you&apos;ll sit at tonight, Hash runs your gaming life from one place.
          </p>
        </Reveal>

        <div className="grid auto-rows-[280px] grid-flow-dense gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <WipeReveal key={f.id} delay={(i % 4) * 0.12} className={SIZE_CLASSES[f.size]}>
              <TiltCard className="h-full">
              <article
                id={f.id === "tournaments" ? "tournaments" : undefined}
                className="group relative h-full overflow-hidden rounded-sm bg-[#120818]"
              >
                {f.image && (
                  <Parallax speed={f.fit === "contain" ? -0.08 : 0.12} className="absolute -inset-y-10 inset-x-0">
                  <Image
                    src={f.image}
                    alt={f.alt || ""}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    className={`transition duration-700 group-hover:scale-105 ${
                      f.fit === "contain" ? "object-contain object-right p-6 pl-[45%] opacity-30 sm:opacity-100" : "object-cover"
                    }`}
                  />
                  </Parallax>
                )}
                <div className={`absolute inset-0 bg-gradient-to-tr ${f.accent} via-black/40 to-transparent`} />
                <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                  <p className="font-tech text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80">{f.kicker}</p>
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
              </TiltCard>
            </WipeReveal>
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
          <MaskHeading id="games-title" className="font-display text-6xl uppercase leading-none text-white sm:text-8xl">
            Games on Hash
          </MaskHeading>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 border-l border-t border-white/10 lg:grid-cols-4">
          {GAMES.map((g, i) => (
            <li key={g.name} className="border-b border-r border-white/10">
              <Reveal delay={(i % 4) * 0.06} y={20} className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors duration-300 hover:bg-[#ff3d8b] sm:p-8">
                <span className="font-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 group-hover:text-black/70">
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
          <MaskHeading id="showcase-title" className="font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl">
            The city is your arena
          </MaskHeading>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/80">
            Browse tonight&apos;s tournaments, see which cafes have free PCs and consoles, invite your squad and track
            your wallet without switching apps.
          </p>
          <StoreButtons className="mt-8" placement="app_showcase" />
        </Reveal>
        <div className="relative mx-auto flex h-[560px] w-full max-w-[520px] justify-center">
          <Parallax speed={0.25} rotate={4} className="absolute left-0 top-10 w-[48%]">
          <Reveal className="-rotate-6" delay={0.1}>
            <Image
              src="/images/app/tournaments.webp"
              alt="Hash app tournaments screen with live and upcoming esports tournaments"
              width={720}
              height={1460}
              sizes="260px"
              className="h-auto w-full rounded-[28px] border-4 border-white/10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </Reveal>
          </Parallax>
          <Parallax speed={-0.2} rotate={-4} className="absolute right-0 top-0 w-[48%]">
          <Reveal className="rotate-6" delay={0.2}>
            <Image
              src="/images/app/tournament-detail.webp"
              alt="Hash app tournament detail with prize pool, slots, teams, rules and leaderboard"
              width={720}
              height={1460}
              sizes="260px"
              className="h-auto w-full rounded-[28px] border-4 border-white/10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            />
          </Reveal>
          </Parallax>
        </div>
      </div>
    </section>
  );
}

function Marketplace() {
  const brands = [...MARKET_BRANDS, ...MARKET_BRANDS];
  return (
    <section id="marketplace" className="relative overflow-hidden bg-black py-24" aria-labelledby="market-title">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[#ff9a3d]/15 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <Eyebrow>Hash Marketplace</Eyebrow>
            </Reveal>
            <MaskHeading
              id="market-title"
              className="max-w-4xl font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl"
            >
              Gear up to win
            </MaskHeading>
          </div>
          <Reveal delay={0.15} className="max-w-md">
            <p className="text-sm leading-7 text-white/70">
              Gaming gear in the Hash app, from the brands gamers already trust. Spend your HashCoins at checkout.
            </p>
            <Link
              href="/shop"
              data-track="shop_click"
              data-track-placement="marketplace"
              className="mt-5 inline-block rounded-full border border-white px-7 py-2.5 font-display text-lg uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              Explore Hash Shop
            </Link>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {MARKET_CATEGORIES.map((c, i) => (
            <li key={c.title}>
              <WipeReveal delay={i * 0.07} className="h-full">
                <TiltCard className="h-full">
                  <div className="group flex h-full min-h-[180px] flex-col justify-between rounded-sm bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 transition-colors duration-300 hover:from-[#ff3d8b] hover:to-[#ff9a3d]">
                    <span className="font-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9a3d] group-hover:text-black/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-3xl uppercase leading-none text-white group-hover:text-black">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-white/60 group-hover:text-black/75">{c.body}</p>
                    </div>
                  </div>
                </TiltCard>
              </WipeReveal>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-16 border-y border-white/10 py-8">
        <p className="font-tech mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-white/45">
          Brands gamers play with
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="animate-ticker flex w-max items-center gap-16 whitespace-nowrap pr-16" aria-label="Gaming brands">
            {brands.map((b, i) => (
              <li
                key={i}
                aria-hidden={i >= MARKET_BRANDS.length}
                className="group flex items-center gap-4 opacity-45 transition-opacity duration-300 hover:opacity-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/brands/${b.logo}.svg`}
                  alt={i < MARKET_BRANDS.length ? `${b.name} logo` : ""}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-12 w-12 invert sm:h-14 sm:w-14"
                />
                <span className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">{b.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 px-4 text-center text-[10px] leading-4 text-white/30">
          Brand names and logos are trademarks of their respective owners. Product availability varies.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#ff3d8b] px-4 py-24 text-black sm:px-8" aria-labelledby="how-title">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <MaskHeading id="how-title" className="font-display text-6xl uppercase leading-none sm:text-8xl">
            How it works
          </MaskHeading>
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

function CafeDashboardTour() {
  return (
    <section
      id="for-cafes"
      className="relative overflow-hidden bg-[#0b0414] px-4 py-24 sm:px-8"
      aria-labelledby="dashboard-title"
    >
      <div
        className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-[#ff3d8b]/20 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px]">
        <Reveal>
          <Eyebrow>For gaming cafe owners</Eyebrow>
        </Reveal>
        <MaskHeading
          id="dashboard-title"
          className="max-w-5xl font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl"
        >
          Run your cafe from one screen
        </MaskHeading>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75">
            The Hash cafe dashboard handles bookings, consoles, customers and pricing, so you spend less time on
            registers and more on the floor.
          </p>
        </Reveal>
        <WipeReveal className="mt-14" delay={0.1}>
          <CafeDashboard screens={DASHBOARD_SCREENS} />
        </WipeReveal>
      </div>
    </section>
  );
}

function KioskShowcase() {
  return (
    <section id="kiosk" className="relative overflow-hidden bg-black px-4 py-24 sm:px-8" aria-labelledby="kiosk-title">
      <div
        className="pointer-events-none absolute -left-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#3b6bff]/20 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px]">
        <Reveal>
          <Eyebrow>Hash Kiosk for Windows</Eyebrow>
        </Reveal>
        <MaskHeading
          id="kiosk-title"
          className="max-w-5xl font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl"
        >
          Every PC on autopilot
        </MaskHeading>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75">
            Install the Hash kiosk app on each gaming PC. It locks the machine, starts sessions from the Hash app,
            tracks time and hands the PC back when the session ends.
          </p>
        </Reveal>

        <div className="relative mt-16 lg:pb-24">
          <WipeReveal className="lg:w-[78%]">
            <TiltCard>
              <figure className="overflow-hidden rounded-xl border border-white/15 shadow-[0_40px_120px_rgba(59,107,255,0.3)]">
                <Image
                  src="/images/kiosk/launcher.webp"
                  alt="Hash kiosk game launcher showing game cover art, the selected game and session time left"
                  width={1800}
                  height={1090}
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="h-auto w-full"
                />
              </figure>
            </TiltCard>
          </WipeReveal>

          <Parallax
            speed={-0.18}
            className="relative z-10 mt-6 lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[46%]"
          >
            <Reveal delay={0.2}>
              <figure className="overflow-hidden rounded-xl border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
                <Image
                  src="/images/kiosk/lock.webp"
                  alt="Hash kiosk lock screen with a QR code to scan in the Hash app and an access code entry"
                  width={1800}
                  height={1030}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="h-auto w-full"
                />
              </figure>
            </Reveal>
          </Parallax>
        </div>

        <ol className="mt-16 grid gap-px bg-white/10 md:grid-cols-3">
          {KIOSK_POINTS.map((k, i) => (
            <li key={k.title} className="bg-black">
              <Reveal delay={i * 0.1} className="h-full p-6 sm:p-8">
                <span className="font-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9a3d]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-3xl uppercase leading-none text-white sm:text-4xl">{k.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{k.body}</p>
                {i === 2 && (
                  <Image
                    src="/images/kiosk/admin.webp"
                    alt="Hash kiosk staff panel with buttons to add 15, 30 or 60 minutes or end the session"
                    width={1800}
                    height={263}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="mt-5 h-auto w-full rounded-md border border-white/15"
                  />
                )}
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs leading-6 text-white/40">
          Game artwork shown belongs to its respective publishers and appears as it does in the kiosk launcher.
        </p>
      </div>
    </section>
  );
}

function CalculatorTeaser() {
  return (
    <section className="relative overflow-hidden bg-[#ff3d8b] px-4 py-20 text-black sm:px-8" aria-labelledby="calc-teaser-title">
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <Reveal>
            <p className="font-tech mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-black/70">
              Planning a new cafe?
            </p>
          </Reveal>
          <MaskHeading
            id="calc-teaser-title"
            className="font-display text-6xl uppercase leading-[0.9] sm:text-8xl"
          >
            What will your cafe cost?
          </MaskHeading>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xl text-base leading-7 text-black/75">
              Pick your PCs, consoles and city. The calculator shows setup cost, monthly expenses, earnings and
              break-even, with Amazon and Flipkart links for every price.
            </p>
            <Link
              href="/gaming-cafe-cost-calculator"
              data-track="calculator_open_click"
              data-track-placement="home_teaser_button"
              className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 font-display text-xl uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              Open the cost calculator
            </Link>
          </Reveal>
        </div>
        <WipeReveal>
          <TiltCard>
            <Link
              href="/gaming-cafe-cost-calculator"
              data-track="calculator_open_click"
              data-track-placement="home_teaser_card"
              className="block rounded-2xl bg-black p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8"
              aria-label="Example estimate. Open the cost calculator"
            >
              <p className="font-tech text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff9a3d]">
                Example: 10 PCs + 2 PS5s, tier 2 city
              </p>
              <p className="mt-2 bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text font-display text-7xl leading-none text-transparent sm:text-8xl">
                {inrShort(CALC_EXAMPLE.setupTotal)}
              </p>
              <p className="mt-1 text-sm text-white/60">estimated setup cost</p>
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
                {[
                  ["Monthly costs", inrShort(CALC_EXAMPLE.monthlyTotal)],
                  ["Monthly earnings", inrShort(CALC_EXAMPLE.revenue)],
                  ["Break-even", CALC_EXAMPLE.breakEven ? `${CALC_EXAMPLE.breakEven} mo` : "n/a"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-tech text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{k}</dt>
                    <dd className="mt-1 font-display text-2xl sm:text-3xl">{v}</dd>
                  </div>
                ))}
              </dl>
            </Link>
          </TiltCard>
        </WipeReveal>
      </div>
    </section>
  );
}

function ForCafes() {
  return (
    <section id="fill-every-seat" className="relative overflow-hidden bg-black px-4 py-28 sm:px-8" aria-labelledby="cafes-title">
      <Parallax speed={0.3} scale className="absolute -inset-y-24 inset-x-0">
        <Image src="/gta6-miami-sunset.jpg" alt="" fill sizes="100vw" className="object-cover opacity-40" />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
      <div className="relative mx-auto grid max-w-[1600px] items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Ready when you are</Eyebrow>
          <MaskHeading id="cafes-title" className="max-w-3xl font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl">
            Fill every seat
          </MaskHeading>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80">
            Empty PCs earn nothing. List your gaming cafe on Hash to get advance bookings, host tournaments and reach
            players nearby. Sign up online, verify with OTP, upload your documents and go live.
          </p>
          <a
            href={SITE_ONBOARD_URL}
            data-track="cafe_onboard_click"
            data-track-placement="fill_every_seat"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-display text-xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
          >
            List your cafe
          </a>
          <a
            href="#franchise"
            data-track="franchise_section_click"
            data-track-placement="fill_every_seat"
            className="ml-3 mt-8 inline-block rounded-full bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] px-8 py-3 font-display text-xl uppercase tracking-wide text-black transition hover:brightness-110"
          >
            Get Hash franchise
          </a>
        </Reveal>
        <Reveal delay={0.15}>
          <TiltCard>
            <GrowthVisual />
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="bg-black px-4 py-24 sm:px-8" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <MaskHeading id="faq-title" className="font-display text-6xl uppercase leading-none text-white sm:text-7xl">
            FAQ
          </MaskHeading>
        </Reveal>
        <div className="divide-y divide-white/15 border-y border-white/15">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group py-6">
              <summary
                data-track="faq_open"
                data-track-question={q}
                className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl uppercase text-white sm:text-3xl"
              >
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
          <MaskHeading as="span" className="block">Get Hash.</MaskHeading>
          <MaskHeading as="span" className="block">Get in the game.</MaskHeading>
        </h2>
        <div className="mt-10 flex justify-center [&_a:first-child]:bg-black [&_a:first-child]:text-white [&_a:last-child]:border-black [&_a:last-child]:text-black">
          <StoreButtons className="justify-center" placement="final_cta" />
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
      <script dangerouslySetInnerHTML={{ __html: PATH_BOOT_SCRIPT }} />
      <PathGate cards={JOURNEYS} />
      <SmoothScroll />
      <ScrollProgress />
      <NavBar />

      <div data-audience="gamer">
        <Hero />
      </div>
      <div data-audience="cafe">
        <PathIntro
          eyebrow="For gaming cafe owners"
          title={["More players.", "Less admin."]}
          body="Hash sends gamers to your cafe, runs every PC with the kiosk app and puts bookings, consoles, customers and pricing on one dashboard."
          primary={{ label: "List my cafe", href: SITE_ONBOARD_URL, track: "cafe_onboard_click" }}
          secondary={{ label: "See the dashboard", href: "#for-cafes", track: "path_intro_click" }}
        />
      </div>
      <div data-audience="franchise">
        <PathIntro
          eyebrow="Hash franchise"
          title={["Open a cafe", "with Hash."]}
          body="Start a Hash-branded gaming cafe with a setup plan, launch marketing, tournaments and the full Hash software stack from day one."
          primary={{ label: "Get Hash franchise", href: SITE_FRANCHISE_URL, track: "franchise_enquiry_click" }}
          secondary={{ label: "Compare options", href: "#franchise", track: "path_intro_click" }}
        />
      </div>

      <Ticker />

      <div data-audience="gamer">
        <FeatureGrid />
        <ScrollBand top="Compete · Book · Win · Compete · Book · Win ·" bottom="Squad up · Earn HashCoins · Squad up · Earn HashCoins ·" />
        <Games />
        <AppShowcase />
        <HowItWorks />
        <Marketplace />
      </div>

      <div data-audience="franchise">
        <FranchiseCompare />
      </div>
      <div data-audience="cafe franchise">
        <ScrollBand top="Fill every seat · Host tournaments ·" bottom="Go live on Hash · Fill every seat ·" />
      </div>
      <div data-audience="cafe">
        <CafeDashboardTour />
      </div>
      <div data-audience="cafe franchise">
        <KioskShowcase />
        <CalculatorTeaser />
      </div>
      <div data-audience="cafe">
        <ForCafes />
      </div>

      <Faq />

      <div data-audience="gamer">
        <FinalCta />
        <MobileDownloadBar />
      </div>
    </AppShell>
  );
}
