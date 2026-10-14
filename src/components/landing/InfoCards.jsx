import MaskHeading from "@/components/landing/MaskHeading";
import Reveal from "@/components/landing/Reveal";
import TiltCard from "@/components/landing/TiltCard";

// Numbered card grid used by inner pages ("How it works", "What you get" and similar).
export default function InfoCards({ id, title, items, tone = "dark" }) {
  const pink = tone === "pink";
  return (
    <section className={`${pink ? "bg-[#ff3d8b] text-black" : "bg-[#0b0414] text-white"} px-4 py-24 sm:px-8`} aria-labelledby={id}>
      <div className="mx-auto max-w-[1500px]">
        <MaskHeading id={id} className="font-display text-5xl uppercase leading-none sm:text-7xl">
          {title}
        </MaskHeading>
        <ul className={`mt-12 grid gap-4 sm:grid-cols-2 ${items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {items.map((it, i) => (
            <li key={it.title}>
              <Reveal delay={i * 0.08} className="h-full">
                <TiltCard className="h-full">
                  <div
                    className={`h-full rounded-2xl p-6 ${
                      pink ? "bg-black/10" : "border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02]"
                    }`}
                  >
                    <span className={`font-tech text-[11px] uppercase tracking-[0.25em] ${pink ? "text-black/60" : "text-[#ff9a3d]"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-display text-3xl uppercase leading-none">{it.title}</h3>
                    <p className={`mt-3 text-sm leading-6 ${pink ? "text-black/75" : "text-white/70"}`}>{it.body}</p>
                  </div>
                </TiltCard>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
