import Link from "next/link";

// Server-safe layout pieces for the Book and Marketplace verticals.

export const GRADIENT_TEXT = "bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent";

export function Container({ className = "", children }) {
  return <div className={`mx-auto w-full max-w-[1600px] px-4 sm:px-8 ${className}`}>{children}</div>;
}

/**
 * Compact page header for the Book and Marketplace landings: a full-width image band
 * (same art direction as the home hero), one Anton headline, one line of copy, and an
 * optional row of children. Short on purpose so listings start above the fold.
 */
export function VerticalHero({ title, accent, subtitle, image = "/images/hero-poster.jpg", children }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/30" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-black to-transparent" aria-hidden="true" />
      <Container className="py-10 sm:py-14 lg:py-16">
        <h1 className="font-display text-[clamp(2.4rem,5.2vw,4.75rem)] uppercase leading-[0.92] text-white">
          {title} {accent && <span className={GRADIENT_TEXT}>{accent}</span>}
        </h1>
        {subtitle && <p className="mt-4 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">{subtitle}</p>}
        {children}
      </Container>
    </section>
  );
}

export function SectionHeading({ kicker, title, body, id, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">{kicker}</p>}
        <h2 id={id} className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[40px] sm:leading-[1.1]">
          {title}
        </h2>
        {body && <p className="mt-3 max-w-2xl text-[17px] leading-7 text-white/55">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-white/45">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.href || item.name} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-white">
                {item.name}
              </Link>
            ) : (
              <span className="text-white/70" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FaqList({ items }) {
  return (
    <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-medium text-white">
            {f.q}
            <span className="text-2xl leading-none text-white/40 transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/60">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbsLd(items, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };
}

/** Slim cross-link between the two verticals. */
export function CrossSell({ to }) {
  const book = to === "book";
  return (
    <Container className="py-8 sm:py-10">
      <Link
        href={book ? "/book" : "/marketplace"}
        className="group flex flex-col gap-4 rounded-[28px] border border-white/[0.08] bg-[#0e0e12] px-6 py-6 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <span className="font-display text-[clamp(1.6rem,3vw,2.4rem)] uppercase leading-none text-white">
          {book ? "Play at a cafe near you" : "Gear up before you play"}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition group-hover:bg-[#ff3d8b] group-hover:text-white">
          {book ? "Book a cafe" : "Shop the marketplace"} <span aria-hidden>→</span>
        </span>
      </Link>
    </Container>
  );
}
