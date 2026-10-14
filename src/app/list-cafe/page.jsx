import Image from "next/image";
import AppShell from "@/components/AppShell";
import CafeLeadForm from "@/components/landing/CafeLeadForm";
import { FadeUp, RevealLine } from "@/components/landing/HeroParallax";
import MaskHeading from "@/components/landing/MaskHeading";
import NavBar from "@/components/landing/NavBar";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import TiltCard from "@/components/landing/TiltCard";
import { SITE_ONBOARD_URL, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "List Your Gaming Cafe on Hash",
  description:
    "List your gaming cafe on Hash For Gamers to get advance bookings, run every PC with the Hash kiosk, host tournaments and manage it all from one dashboard. Request a callback or onboard yourself.",
  path: "/list-cafe",
  keywords: ["list gaming cafe", "gaming cafe software India", "gaming cafe booking system", "gaming cafe management"],
});

const PERKS = [
  { title: "Bookings from day one", body: "Gamers near you find your cafe in the Hash app and book PCs and consoles in advance." },
  { title: "Hash kiosk on every PC", body: "PCs stay locked until a session starts, then hand back automatically when time runs out." },
  { title: "One dashboard", body: "Live sessions, consoles, customers, pricing and earnings, from your phone or the desk." },
  { title: "Tournaments at your venue", body: "Host events that fill quiet hours and bring new players through the door." },
];

const STEPS = [
  { n: "01", title: "Request a callback", body: "Fill the form or start the self-onboarding." },
  { n: "02", title: "Verify your cafe", body: "Confirm your email with an OTP and add cafe details and documents." },
  { n: "03", title: "Set up", body: "Install the kiosk on your PCs, add consoles and set your prices." },
  { n: "04", title: "Go live", body: "Your cafe appears in the Hash app and bookings start." },
];

export default function ListCafePage() {
  return (
    <AppShell>
      <ScrollProgress />
      <NavBar />

      <section id="list-cafe-top" className="relative overflow-hidden bg-black px-4 pb-20 pt-32 sm:px-8 sm:pt-40">
        <Image
          src="/images/dashboard/overview.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-left-top opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
        <div
          className="pointer-events-none absolute -right-40 top-20 h-[560px] w-[560px] rounded-full bg-[#ff3d8b]/20 blur-[140px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-[1500px] items-start gap-12 lg:grid-cols-[1fr_0.95fr]">
          <div className="lg:pt-6">
            <FadeUp>
              <p className="font-tech mb-4 text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">For gaming cafe owners</p>
            </FadeUp>
            <h1 className="font-display text-[clamp(3.2rem,9vw,8rem)] uppercase leading-[0.86] text-white">
              <RevealLine delay={0.1}>List your cafe</RevealLine>
              <RevealLine
                delay={0.25}
                className="bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent"
              >
                on Hash.
              </RevealLine>
            </h1>
            <FadeUp delay={0.45}>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
                More bookings, locked and timed PCs, tournaments and one dashboard for the whole floor. Tell us about your
                cafe and the Hash team will get you set up.
              </p>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  ["35+", "Cafes on Hash"],
                  ["10K+", "Gamers"],
                  ["15+", "Tournaments"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/50">{l}</dt>
                    <dd className="mt-1 font-display text-4xl text-white sm:text-5xl">{n}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 text-sm text-white/60">
                Prefer to do it yourself?{" "}
                <a
                  href={SITE_ONBOARD_URL}
                  data-track="cafe_onboard_click"
                  data-track-placement="list_cafe_hero"
                  className="font-semibold text-[#ff9a3d] underline underline-offset-4 hover:text-white"
                >
                  Start self-onboarding
                </a>
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.3}>
            <CafeLeadForm />
          </FadeUp>
        </div>
      </section>

      <section className="bg-[#0b0414] px-4 py-24 sm:px-8" aria-labelledby="perks-title">
        <div className="mx-auto max-w-[1500px]">
          <MaskHeading id="perks-title" className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">
            What you get
          </MaskHeading>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.08} className="h-full">
                  <TiltCard className="h-full">
                    <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6">
                      <span className="font-tech text-[11px] uppercase tracking-[0.25em] text-[#ff9a3d]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 font-display text-3xl uppercase leading-none text-white">{p.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/70">{p.body}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#ff3d8b] px-4 py-24 text-black sm:px-8" aria-labelledby="steps-title">
        <div className="mx-auto max-w-[1500px]">
          <MaskHeading id="steps-title" className="font-display text-5xl uppercase leading-none sm:text-7xl">
            Live in four steps
          </MaskHeading>
          <ol className="mt-12 grid gap-px bg-black/20 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.n} className="bg-[#ff3d8b]">
                <Reveal delay={i * 0.1} className="p-6 sm:p-8">
                  <span className="font-display text-7xl leading-none text-black/25">{s.n}</span>
                  <h3 className="mt-4 font-display text-3xl uppercase">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/75">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap gap-3">
            <a
              href="#list-cafe-top"
              className="rounded-full bg-black px-8 py-3.5 font-display text-xl uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              Request a callback
            </a>
            <a
              href="/gaming-cafe-cost-calculator"
              data-track="calculator_open_click"
              data-track-placement="list_cafe"
              className="rounded-full border border-black px-8 py-3.5 font-display text-xl uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
            >
              Cost calculator
            </a>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
