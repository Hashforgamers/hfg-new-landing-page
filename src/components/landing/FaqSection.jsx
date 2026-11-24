import JsonLd from "@/components/JsonLd";
import MaskHeading from "@/components/landing/MaskHeading";

// Question-and-answer list (same look as the calculator's FAQ) plus its FAQPage schema,
// so every page with questions is eligible for "People also ask".
export default function FaqSection({ id, title = "Questions", faqs, aside }) {
  return (
    <section className="bg-[#0b0414] px-4 py-24 sm:px-8" aria-labelledby={id}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <MaskHeading id={id} className="font-display text-6xl uppercase leading-none text-white sm:text-7xl">
            {title}
          </MaskHeading>
          {aside}
        </div>
        <div className="divide-y divide-white/15 border-y border-white/15">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group py-6">
              <summary data-track="faq_open" data-track-question={q} className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl uppercase text-white sm:text-3xl">
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
