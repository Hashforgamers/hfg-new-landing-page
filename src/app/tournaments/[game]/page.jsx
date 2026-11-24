import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/landing/FaqSection";
import InfoCards from "@/components/landing/InfoCards";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { TOURNAMENT_GAMES, getTournamentGame } from "@/lib/games";
import { SITE_URL, buildPageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return TOURNAMENT_GAMES.map((g) => ({ game: g.slug }));
}

export async function generateMetadata({ params }) {
  const g = getTournamentGame((await params).game);
  if (!g) return {};
  return buildPageMetadata({ title: g.title, description: g.description, path: `/tournaments/${g.slug}`, keywords: g.keywords });
}

export default async function GameTournamentsPage({ params }) {
  const g = getTournamentGame((await params).game);
  if (!g) notFound();
  const others = TOURNAMENT_GAMES.filter((o) => o.slug !== g.slug);
  return (
    <AppShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Esports Tournaments", item: `${SITE_URL}/tournaments` },
            { "@type": "ListItem", position: 3, name: `${g.name} Tournaments`, item: `${SITE_URL}/tournaments/${g.slug}` },
          ],
        }}
      />
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow={`${g.name} on Hash`}
        heading={`${g.name} tournaments in India`}
        lines={g.lines}
        body={g.intro}
        image="/images/hero-poster.jpg"
        placement={`tournaments_${g.slug}_hero`}
      />
      <InfoCards id={`${g.slug}-steps`} title={`How to join a ${g.name} tournament`} items={g.steps} />

      <section className="bg-black px-4 py-24 sm:px-8" aria-labelledby={`${g.slug}-format`}>
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          <div>
            <h2 id={`${g.slug}-format`} className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">
              How {g.name} tournaments work
            </h2>
            <StoreButtons className="mt-8" placement={`tournaments_${g.slug}_format`} />
          </div>
          <ul className="space-y-5">
            {g.format.map((f) => (
              <li key={f} className="flex gap-4 text-base leading-8 text-white/80">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff3d8b]" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection id={`${g.slug}-faq`} title={`${g.name} tournament questions`} faqs={g.faqs} />

      <section className="bg-black px-4 py-16 sm:px-8" aria-labelledby="more-games">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="more-games" className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">
            More tournaments on Hash
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/tournaments/${o.slug}`} className="inline-block rounded-full border border-white/20 px-5 py-2 font-display text-lg uppercase text-white transition hover:border-white hover:bg-white hover:text-black">
                  {o.name} tournaments
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tournaments" className="inline-block rounded-full border border-white/20 px-5 py-2 font-display text-lg uppercase text-white transition hover:border-white hover:bg-white hover:text-black">
                All esports tournaments
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-6 text-white/40">Game titles are trademarks of their respective owners. Hash is not affiliated with the game publishers.</p>
        </div>
      </section>
    </AppShell>
  );
}
