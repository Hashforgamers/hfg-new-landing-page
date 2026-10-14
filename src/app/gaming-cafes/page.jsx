import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import InfoCards from "@/components/landing/InfoCards";
import MaskHeading from "@/components/landing/MaskHeading";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Book Gaming Cafes Near You",
  description:
    "Find gaming cafes near you on the Hash app. Compare PC, PlayStation, Xbox, VR and racing setups, book a slot in advance and walk in to play.",
  path: "/gaming-cafes",
  keywords: ["gaming cafe near me", "book gaming cafe", "gaming zone near me", "PS5 cafe near me", "gaming cafe booking app"],
});

const STEPS = [
  { title: "Find a cafe", body: "Open the Hash app to see gaming cafes near you with their setups, timings and photos." },
  { title: "Pick your setup", body: "Choose a PC, PlayStation, Xbox, VR or racing rig and a time slot that suits you." },
  { title: "Book in advance", body: "Pay with Hash Pay or at the cafe. Your slot is held for you." },
  { title: "Walk in and play", body: "Show up, start your session on the kiosk and play. No waiting at the counter." },
];

const SETUPS = ["Gaming PCs", "PlayStation", "Xbox", "VR", "Racing rigs", "Private rooms"];

export default function GamingCafesPage() {
  return (
    <AppShell>
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="Gaming cafes on Hash"
        lines={["Your next session,", "booked."]}
        body="Find gaming cafes near you, see which PCs and consoles they have, and lock your slot before you leave home."
        image="/gta6-miami-sunset.jpg"
        placement="gaming_cafes_hero"
        aside={
          <div className="mx-auto w-full max-w-[340px] rotate-3">
            <Image
              src="/images/app/cafes-near-you.webp"
              alt="Hash app showing verified gaming cafes near you with directions"
              width={720}
              height={1460}
              priority
              className="h-auto w-full rounded-[28px] border-4 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
            />
          </div>
        }
      />
      <InfoCards id="cafe-steps" title="How booking works" items={STEPS} />

      <section className="bg-black px-4 py-24 sm:px-8" aria-labelledby="setups-title">
        <div className="mx-auto max-w-[1500px]">
          <MaskHeading id="setups-title" className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">
            What you can play
          </MaskHeading>
          <ul className="mt-10 flex flex-wrap gap-3">
            {SETUPS.map((s, i) => (
              <li key={s}>
                <Reveal delay={i * 0.05} y={16}>
                  <span className="inline-block rounded-full border border-white/20 px-6 py-3 font-display text-2xl uppercase text-white transition hover:border-[#ff3d8b] hover:bg-[#ff3d8b]">
                    {s}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-white/50">Setups vary by cafe. The app shows what each one has.</p>
          <StoreButtons className="mt-10" placement="gaming_cafes_bottom" />
        </div>
      </section>

      <section className="bg-[#ff3d8b] px-4 py-16 text-black sm:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-6">
          <h2 className="font-display text-4xl uppercase leading-none sm:text-6xl">Own a gaming cafe?</h2>
          <Link
            href="/list-cafe"
            data-track="cafe_onboard_click"
            data-track-placement="gaming_cafes"
            className="rounded-full bg-black px-8 py-3.5 font-display text-xl uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
          >
            List your cafe
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
