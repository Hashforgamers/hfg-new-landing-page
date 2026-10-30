import Image from "next/image";
import Script from "next/script";
import AppShell from "@/components/AppShell";
import AdSlot from "@/components/landing/AdSlot";
import GameEmbed from "@/components/landing/GameEmbed";
import InfoCards from "@/components/landing/InfoCards";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { SITE_NAME, SITE_URL, buildPageMetadata } from "@/lib/site";

const PATH = "/mumbai-surfer";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8804377047878009";
// AdSense ad unit ids (AdSense > Ads > By ad unit > "Mumbai Surfer - left/right/bottom").
const AD_SLOTS = {
  left: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT || "8418228172",
  right: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT || "7105146509",
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || "7177745808",
};
const PLAY_URL ="https://play.google.com/store/apps/details?id=com.hashforgamers.mumbaisurfer";
const DESCRIPTION =
  "Play Mumbai Surfer free in your browser or on Android: an endless runner on Mumbai's Western Line local train route. Run from Churchgate to Dahanu Road, dodge locals, jump barriers and surf train roofs. No ads, no in-app purchases.";

export const metadata = buildPageMetadata({
  title: "Mumbai Surfer: Play the Local Train Runner Game Online",
  description: DESCRIPTION,
  path: PATH,
  image: "/images/mumbai-surfer/og.jpg",
  keywords: [
    "Mumbai Surfer",
    "Mumbai Surfer game",
    "Mumbai local train game",
    "Indian endless runner game",
    "train surfer game India",
    "Western Line game",
    "offline runner game Android",
    "play Mumbai Surfer online",
    "free browser runner game",
  ],
});

const FEATURES = [
  { title: "The real line", body: "11 chapters and all 37 Western Line stations in order, from Churchgate to Dahanu Road." },
  { title: "Run, jump, surf", body: "Swipe to switch tracks, jump barriers, roll under signboards and run along the roofs of local trains." },
  { title: "Pure Mumbai", body: "Monsoon rain, Diwali lights, Ganpati, chai sellers, station announcements and Marathi boards." },
  { title: "Free and fair", body: "No ads, no in-app purchases, no account. Plays offline." },
];

const SHOTS = [
  { src: "tc_chase", alt: "Dabba Dada running on the tracks with the ticket inspector chasing" },
  { src: "vada_pav_trail", alt: "Collecting a trail of coins between local trains" },
  { src: "close_call", alt: "Dodging an oncoming local train" },
  { src: "night_train", alt: "Running past a local train at night" },
];

const schema = {
  "@context": "https://schema.org",
  "@type": ["VideoGame", "MobileApplication"],
  name: "Mumbai Surfer: Local Train Run",
  description: DESCRIPTION,
  url: `${SITE_URL}${PATH}`,
  image: `${SITE_URL}/images/mumbai-surfer/feature.jpg`,
  screenshot: SHOTS.map((s) => `${SITE_URL}/images/mumbai-surfer/${s.src}.jpg`),
  genre: ["Arcade", "Endless runner"],
  gamePlatform: ["Web browser", "Android"],
  operatingSystem: "Android, Web",
  applicationCategory: "GameApplication",
  installUrl: PLAY_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

export default function MumbaiSurferPage() {
  return (
    <AppShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="A Hash game · Play free in your browser"
        lines={["Mumbai", "Surfer."]}
        body="Grab your tiffin crate and run the Western Line. Race Dabba Dada from Churchgate to Dahanu Road, station by station, with the ticket inspector right behind you."
        image="/images/mumbai-surfer/feature.jpg"
        actions={
          <a
            href={PLAY_URL}
            data-track="game_download_click"
            data-track-store="google_play"
            data-track-placement="mumbai_surfer_hero"
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-display text-lg uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Get it on Google Play
          </a>
        }
      />
      {ADSENSE_CLIENT && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <section id="play" className="bg-black px-4 pb-20 sm:px-8" aria-label="Play Mumbai Surfer">
        <div className="mx-auto grid max-w-[1040px] items-start gap-10 xl:grid-cols-[160px_1fr_160px]">
          <AdSlot slot={AD_SLOTS.left} className="sticky top-28 hidden h-[620px] xl:flex" format="vertical" />
          {/* Pinned to the middle column so it stays put when an unfilled side ad is hidden. */}
          <div className="xl:col-start-2">
            <GameEmbed src="/games/mumbai-surfer/index.html" poster="/images/mumbai-surfer/tc_chase.jpg" title="Mumbai Surfer" />
            <p className="mx-auto mt-4 max-w-[600px] text-center text-sm text-white/55">
              Swipe or use the arrow keys: left and right to switch tracks, up to jump, down to roll.{" "}
              <a href="/games/mumbai-surfer/index.html" className="underline hover:text-white">Open full screen</a>
            </p>
          </div>
          <AdSlot slot={AD_SLOTS.right} className="sticky top-28 hidden h-[620px] xl:col-start-3 xl:flex" format="vertical" />
        </div>
        <AdSlot slot={AD_SLOTS.bottom} className="mx-auto mt-12 h-[110px] max-w-[728px]" format="horizontal" />
      </section>
      <InfoCards id="mumbai-surfer-features" title="What's in the game" items={FEATURES} />
      <section className="bg-black px-4 py-20 sm:px-8" aria-label="Screenshots">
        <ul className="mx-auto grid max-w-[1500px] grid-cols-2 gap-4 lg:grid-cols-4">
          {SHOTS.map((s) => (
            <li key={s.src}>
              <Image
                src={`/images/mumbai-surfer/${s.src}.jpg`}
                alt={s.alt}
                width={675}
                height={1200}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="h-auto w-full rounded-2xl border border-white/10"
              />
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
