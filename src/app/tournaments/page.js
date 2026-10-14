import Image from "next/image";
import AppShell from "@/components/AppShell";
import InfoCards from "@/components/landing/InfoCards";
import MaskHeading from "@/components/landing/MaskHeading";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import Parallax from "@/components/landing/Parallax";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { GAMES } from "@/lib/landing";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Esports Tournaments in India",
  description:
    "Join esports tournaments on the Hash app: BGMI, Valorant, Free Fire, EA FC and more. Register solo or with your squad, get room details and see results and rankings live.",
  path: "/tournaments",
  keywords: ["esports tournaments India", "BGMI tournament", "Valorant tournament India", "Free Fire tournament", "online gaming tournament app"],
});

const STEPS = [
  { title: "Pick a tournament", body: "Browse upcoming and live tournaments in the Compete tab, filtered by game." },
  { title: "Register", body: "Join solo or invite your squad with a link. Free and paid entries are marked clearly." },
  { title: "Play your match", body: "Room details, schedules and brackets appear in the app before match time." },
  { title: "Climb the board", body: "Results post, rankings update and rewards land in your wallet." },
];

export default function TournamentsPage() {
  return (
    <AppShell>
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="Hash tournaments"
        lines={["Compete.", "Climb. Win."]}
        body="Daily esports tournaments with real brackets, live results and rankings. Register solo or bring your squad."
        image="/images/hero-poster.jpg"
        placement="tournaments_hero"
        aside={
          <div className="mx-auto w-full max-w-[340px] -rotate-3">
            <Image
              src="/images/app/tournaments.webp"
              alt="Hash app Compete tab with a live tournament and upcoming tournaments"
              width={720}
              height={1460}
              priority
              className="h-auto w-full rounded-[28px] border-4 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
            />
          </div>
        }
      />
      <InfoCards id="tournament-steps" title="How it works" items={STEPS} />

      <section className="bg-black px-4 py-24 sm:px-8" aria-labelledby="t-games-title">
        <div className="mx-auto max-w-[1500px]">
          <MaskHeading id="t-games-title" className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">
            Games on Hash
          </MaskHeading>
          <ul className="mt-12 grid grid-cols-2 border-l border-t border-white/10 lg:grid-cols-4">
            {GAMES.map((g, i) => (
              <li key={g.name} className="border-b border-r border-white/10">
                <Reveal delay={(i % 4) * 0.06} y={20} className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors duration-300 hover:bg-[#ff3d8b] sm:p-8">
                  <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/50 group-hover:text-black/70">{g.type}</span>
                  <h3 className="font-display text-3xl uppercase leading-none text-white group-hover:text-black sm:text-5xl">{g.name}</h3>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-6 text-white/40">Game titles are trademarks of their respective owners. Line-ups change weekly.</p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b0414] px-4 py-24 sm:px-8" aria-labelledby="t-detail-title">
        <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-2">
          <div>
            <MaskHeading id="t-detail-title" className="font-display text-5xl uppercase leading-[0.9] text-white sm:text-7xl">
              Everything in one place
            </MaskHeading>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
              Entry fee, prize pool, slots, teams, rules, room details and the leaderboard for every tournament, right in the app.
            </p>
            <StoreButtons className="mt-8" placement="tournaments_bottom" />
          </div>
          <Parallax speed={-0.15} className="mx-auto w-full max-w-[340px]">
            <Image
              src="/images/app/tournament-detail.webp"
              alt="Hash app tournament detail with entry fee, prize pool, slots and tabs for teams, rules and leaderboard"
              width={720}
              height={1460}
              className="h-auto w-full rotate-3 rounded-[28px] border-4 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
            />
          </Parallax>
        </div>
      </section>
    </AppShell>
  );
}
