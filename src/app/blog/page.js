import Link from "next/link";
import AppShell from "@/components/AppShell";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import TiltCard from "@/components/landing/TiltCard";
import { BLOG_CATEGORIES, formatDate, getAllPosts, readingMinutes } from "@/lib/blog";
import { breadcrumbLd, buildPageMetadata } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

export const metadata = buildPageMetadata({
  title: "Gaming News & Esports Blog",
  description:
    "Daily gaming news from Hash For Gamers: Indian esports, BGMI and Valorant, GTA VI, gaming cafes, PC hardware and the business of esports.",
  path: "/blog",
  keywords: ["gaming news India", "esports news India", "BGMI news", "GTA 6 news", "gaming cafe news"],
});

export default function BlogIndex() {
  const posts = getAllPosts();
  const [lead, ...rest] = posts;
  return (
    <AppShell>
      <JsonLd data={breadcrumbLd("Blog", "/blog")} />
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="Hash blog · Updated daily"
        lines={["Gaming news,", "every day."]}
        body="Indian esports, GTA, gaming cafes, hardware and the business of games, written for players and cafe owners."
        image="/images/hero-poster.jpg"
        actions={<span />}
      />
      <section className="bg-black px-4 pb-24 sm:px-8" aria-label="Posts">
        <div className="mx-auto max-w-[1500px]">
          {!posts.length && <p className="py-20 text-center text-white/50">The first stories land soon.</p>}
          {lead && (
            <Reveal>
              <Link
                href={`/blog/${lead.slug}`}
                className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-[#ff3d8b]/15 via-white/[0.03] to-transparent p-6 transition hover:border-[#ff3d8b]/60 sm:p-10"
              >
                <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-[#ff9a3d]">
                  Latest · {BLOG_CATEGORIES[lead.category] ?? lead.category} · {formatDate(lead.date)}
                </p>
                <h2 className="mt-4 max-w-4xl font-display text-4xl uppercase leading-[0.95] text-white group-hover:text-[#ff9a3d] sm:text-6xl">
                  {lead.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{lead.description}</p>
                <span className="font-tech mt-6 inline-block text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {readingMinutes(lead)} min read →
                </span>
              </Link>
            </Reveal>
          )}
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={(i % 3) * 0.06} className="h-full">
                  <TiltCard className="h-full">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 transition hover:border-[#ff3d8b]/60"
                    >
                      <div>
                        <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-[#ff9a3d]">
                          {BLOG_CATEGORIES[p.category] ?? p.category} · {formatDate(p.date)}
                        </p>
                        <h3 className="mt-3 font-display text-3xl uppercase leading-none text-white group-hover:text-[#ff9a3d]">
                          {p.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-white/65">{p.description}</p>
                      </div>
                      <span className="font-tech mt-6 text-[10px] uppercase tracking-[0.2em] text-white/45">
                        {readingMinutes(p)} min read →
                      </span>
                    </Link>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
