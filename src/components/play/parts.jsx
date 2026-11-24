import Link from "next/link";

// Server-safe layout pieces for the Book and Marketplace verticals.

export const GRADIENT_TEXT = "bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent";

export function Container({ className = "", children }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-4 sm:px-8 ${className}`}>{children}</div>;
}

/** Vertical landing hero: Orbitron kicker, Anton two-line headline (second line in the brand gradient), Inter intro. */
export function VerticalHero({ kicker, lines, body, children, glow = "#ff3d8b" }) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
        style={{ background: glow }}
        aria-hidden="true"
      />
      <Container className="relative pb-16 pt-16 sm:pb-20 sm:pt-24">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">{kicker}</p>
        <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] uppercase leading-[0.88] text-white">
          {lines.map((line, i) => (
            <span key={line} className={`block ${i === lines.length - 1 ? GRADIENT_TEXT : ""}`}>
              {line}
            </span>
          ))}
        </h1>
        {body && <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">{body}</p>}
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

/** Cross-link band between the two verticals (and back to Hash). */
export function CrossSell({ to }) {
  const book = to === "book";
  return (
    <section className="border-t border-white/[0.06]">
      <Container className="py-16 sm:py-20">
        <Link
          href={book ? "/book" : "/marketplace"}
          className="group relative block overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0e0e12] p-8 transition hover:border-white/20 sm:p-12"
        >
          <div
            className={`pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-[120px] ${book ? "bg-[#ff3d8b]/30" : "bg-[#ff9a3d]/30"}`}
            aria-hidden
          />
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">{book ? "Hash Book" : "Hash Marketplace"}</p>
          <p className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-[0.9] text-white">
            {book ? "Play at a cafe near you." : "Gear up before you play."}
          </p>
          <p className="mt-4 max-w-xl text-[17px] leading-7 text-white/60">
            {book
              ? "Find gaming cafes, compare consoles and prices, and lock in your slot in under a minute."
              : "Headsets, controllers, accessories and services from verified Hash partners, with tracked delivery."}
          </p>
          <span className="mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-white">
            {book ? "Find a cafe" : "Shop the marketplace"}
            <span className="transition group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </span>
        </Link>
      </Container>
    </section>
  );
}
