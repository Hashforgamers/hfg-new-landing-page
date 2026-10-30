import Image from "next/image";
import { FadeUp, RevealLine } from "@/components/landing/HeroParallax";
import StoreButtons from "@/components/landing/StoreButtons";

// Shared hero for inner pages: eyebrow, two-line headline (second line in the brand gradient),
// intro copy, and either app store buttons or custom actions.
// With `heading`, the small line above the slogan is the H1 (the phrase people search for) and the slogan is styled text.
export default function PageHero({ eyebrow, heading, lines, body, image, imageClass = "object-cover opacity-30", placement, actions, aside }) {
  const Big = heading ? "p" : "h1";
  const Small = heading ? "h1" : "p";
  return (
    <section className="relative overflow-hidden bg-black px-4 pb-20 pt-32 sm:px-8 sm:pt-40">
      {image && <Image src={image} alt="" fill priority sizes="100vw" className={imageClass} />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black" />
      <div
        className="pointer-events-none absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-[#ff3d8b]/20 blur-[140px]"
        aria-hidden="true"
      />
      <div className={`relative mx-auto grid max-w-[1500px] gap-12 ${aside ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : ""}`}>
        <div>
          <FadeUp>
            <Small className="font-tech mb-4 text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">{heading ?? eyebrow}</Small>
          </FadeUp>
          <Big className="font-display text-[clamp(3.2rem,9vw,8rem)] uppercase leading-[0.86] text-white">
            {lines.map((line, i) => (
              <RevealLine
                key={line}
                delay={0.1 + i * 0.15}
                className={i === lines.length - 1 ? "bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent" : ""}
              >
                {line}
              </RevealLine>
            ))}
          </Big>
          <FadeUp delay={0.45}>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{body}</p>
            {actions ?? <StoreButtons className="mt-8" placement={placement} />}
          </FadeUp>
        </div>
        {aside && <FadeUp delay={0.3}>{aside}</FadeUp>}
      </div>
    </section>
  );
}
