import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { FadeUp } from "@/components/landing/HeroParallax";
import NavBar from "@/components/landing/NavBar";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { BLOG_CATEGORIES, formatDate, getAllPosts, getPost, readingMinutes } from "@/lib/blog";
import { SITE_LOGO, SITE_NAME, SITE_URL, buildPageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildPageMetadata({ title: post.title, description: post.description, path: `/blog/${slug}`, keywords: post.tags });
}

// Turns "[text](/path)" in post text into links, so guides can link to other pages on the site.
function Linked({ text }) {
  return text.split(/(\[[^\]]+\]\(\/[^)\s]*\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\((\/[^)\s]*)\)$/);
    return m ? (
      <Link key={i} href={m[2]} className="text-white underline decoration-[#ff3d8b] underline-offset-4 hover:text-[#ff9a3d]">
        {m[1]}
      </Link>
    ) : (
      part
    );
  });
}

function Block({ block }) {
  if (block.type === "h2") return <h2 className="mt-12 font-display text-3xl uppercase leading-none text-white sm:text-4xl">{block.text}</h2>;
  if (block.type === "ul")
    return (
      <ul className="mt-5 space-y-2">
        {block.items.map((it) => (
          <li key={it} className="flex gap-3 text-lg leading-8 text-white/80">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff3d8b]" aria-hidden="true" />
            <span>
              <Linked text={it} />
            </span>
          </li>
        ))}
      </ul>
    );
  return (
    <p className="mt-5 text-lg leading-8 text-white/80">
      <Linked text={block.text} />
    </p>
  );
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const more = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}${SITE_LOGO}` } },
    keywords: (post.tags || []).join(", "),
  };

  return (
    <AppShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollProgress />
      <NavBar />
      <article className="relative overflow-hidden bg-black px-4 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div className="pointer-events-none absolute -left-40 -top-20 h-[520px] w-[520px] rounded-full bg-[#ff3d8b]/15 blur-[140px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[780px]">
          <FadeUp>
            <Link href="/blog" className="font-tech text-[10px] uppercase tracking-[0.25em] text-white/50 hover:text-white">
              ← All news
            </Link>
            <p className="font-tech mt-8 text-[10px] uppercase tracking-[0.25em] text-[#ff9a3d]">
              {BLOG_CATEGORIES[post.category] ?? post.category} · {formatDate(post.date)} · {readingMinutes(post)} min read
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5rem)] uppercase leading-[0.92] text-white">{post.title}</h1>
            <p className="mt-6 text-xl leading-8 text-white/70">{post.description}</p>
          </FadeUp>
          <div className="mt-10 border-t border-white/10 pt-2">
            {post.body.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
          {post.sources?.length > 0 && (
            <aside className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-white/50">Sources</p>
              <ul className="mt-3 space-y-2">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener nofollow" className="text-sm text-[#ff9a3d] underline-offset-4 hover:text-white hover:underline">
                      {s.title}
                    </a>
                    {s.publisher && <span className="text-sm text-white/40"> · {s.publisher}</span>}
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] p-8 text-black">
            <p className="font-display text-4xl uppercase leading-none">Play it, don&apos;t just read it.</p>
            <p className="mt-2 text-sm text-black/75">Join tournaments and book gaming cafes on Hash.</p>
            <div className="mt-6 [&_a:first-child]:bg-black [&_a:first-child]:text-white [&_a:last-child]:border-black [&_a:last-child]:text-black">
              <StoreButtons placement="blog_post" />
            </div>
          </div>
        </div>
        {more.length > 0 && (
          <div className="relative mx-auto mt-20 max-w-[1100px]">
            <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-white/50">More news</p>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group block h-full rounded-2xl border border-white/10 p-5 transition hover:border-[#ff3d8b]/60">
                    <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-[#ff9a3d]">{formatDate(p.date)}</p>
                    <p className="mt-2 font-display text-2xl uppercase leading-none text-white group-hover:text-[#ff9a3d]">{p.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </AppShell>
  );
}
