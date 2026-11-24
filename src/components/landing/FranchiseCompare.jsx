import { Check, Minus } from 'lucide-react';
import MaskHeading from '@/components/landing/MaskHeading';
import Reveal from '@/components/landing/Reveal';
import WipeReveal from '@/components/landing/WipeReveal';
import { FRANCHISE_ROWS } from '@/lib/landing';
import { SITE_FRANCHISE_URL, SITE_ONBOARD_URL } from '@/lib/site';

function Cell({ value, highlight }) {
  if (value === true) {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
          highlight ? 'bg-black text-[#ffd23d]' : 'bg-white/15 text-white'
        }`}
      >
        <Check size={16} strokeWidth={3} aria-label="Included" />
      </span>
    );
  }
  if (value === false) {
    return <Minus size={18} className="text-white/30" aria-label="Not included" />;
  }
  return <span className={`text-xs font-semibold ${highlight ? 'text-black' : 'text-white/70'}`}>{value}</span>;
}

// "Your own cafe vs Hash franchise" comparison with the franchise CTA.
export default function FranchiseCompare() {
  return (
    <section id="franchise" className="relative overflow-hidden bg-black px-4 py-24 sm:px-8" aria-labelledby="franchise-title">
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[#ffd23d]/15 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Reveal>
            <p className="font-tech mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#ff9a3d]">Hash franchise</p>
          </Reveal>
          <MaskHeading id="franchise-title" className="font-display text-6xl uppercase leading-[0.9] text-white sm:text-8xl">
            Open as a Hash cafe
          </MaskHeading>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/75">
              Starting from scratch? A Hash franchise gives you the brand, the setup plan and the players, on top of
              everything a listed cafe already gets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SITE_FRANCHISE_URL}
                data-track="franchise_enquiry_click"
                className="rounded-full bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] px-8 py-3.5 font-display text-xl uppercase tracking-wide text-black shadow-[0_0_40px_rgba(255,154,61,0.45)] transition hover:brightness-110"
              >
                Get Hash franchise
              </a>
              <a
                href={SITE_ONBOARD_URL}
                data-track="cafe_onboard_click"
                data-track-placement="franchise_compare"
                className="rounded-full border border-white/40 px-8 py-3.5 font-display text-xl uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
              >
                List my own cafe
              </a>
            </div>
          </Reveal>
        </div>

        <WipeReveal>
          <div className="overflow-hidden rounded-2xl border border-white/15">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">What you get running your own cafe on Hash compared with a Hash franchise</caption>
              <thead>
                <tr>
                  <th scope="col" className="font-tech bg-white/[0.04] p-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
                    What you get
                  </th>
                  <th scope="col" className="w-[26%] bg-white/[0.04] p-4 text-center font-display text-xl uppercase text-white sm:text-2xl">
                    Your own cafe
                  </th>
                  <th
                    scope="col"
                    className="w-[26%] bg-gradient-to-b from-[#ff9a3d] to-[#ffd23d] p-4 text-center font-display text-xl uppercase text-black sm:text-2xl"
                  >
                    Hash franchise
                  </th>
                </tr>
              </thead>
              <tbody>
                {FRANCHISE_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th scope="row" className="p-4 text-sm font-normal leading-5 text-white/85">
                      {row.label}
                    </th>
                    <td className="p-4 text-center">
                      <span className="inline-flex justify-center">
                        <Cell value={row.own} />
                      </span>
                    </td>
                    <td className="bg-[#ffd23d] p-4 text-center">
                      <span className="inline-flex justify-center">
                        <Cell value={row.franchise} highlight />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-white/40">
            Franchise terms, fees and availability vary by city. Talk to the Hash team for details.
          </p>
        </WipeReveal>
      </div>
    </section>
  );
}
