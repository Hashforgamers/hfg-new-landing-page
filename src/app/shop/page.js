import AppShell from "@/components/AppShell";
import InfoCards from "@/components/landing/InfoCards";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { MARKET_BRANDS, MARKET_CATEGORIES } from "@/lib/landing";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Hash Shop: Gaming Gear",
  description:
    "Hash Shop is bringing gaming headsets, mice, keyboards, monitors, controllers and chairs to the Hash app, with HashCoins at checkout. Coming soon.",
  path: "/shop",
  // Hidden from search until the shop launches; remove this line then.
  noIndex: true,
  keywords: ["gaming gear India", "gaming accessories", "Hash Shop", "buy gaming headset"],
});

export default function ShopPage() {
  const brands = [...MARKET_BRANDS, ...MARKET_BRANDS];
  return (
    <AppShell>
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="Hash Shop · Coming soon"
        lines={["Gear up", "to win."]}
        body="Gaming gear is coming to the Hash app, and you'll be able to spend your HashCoins at checkout. Get the app to be first in line when it opens."
        image="/images/hero-poster.jpg"
        placement="shop_hero"
      />
      <InfoCards id="shop-categories" title="What's coming" items={MARKET_CATEGORIES} />
      <section className="overflow-hidden border-y border-white/10 bg-black py-10">
        <p className="font-tech mb-6 text-center text-[11px] uppercase tracking-[0.3em] text-white/45">Brands gamers play with</p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="animate-ticker flex w-max items-center gap-16 whitespace-nowrap pr-16" aria-label="Gaming brands">
            {brands.map((b, i) => (
              <li key={i} aria-hidden={i >= MARKET_BRANDS.length} className="flex items-center gap-4 opacity-45">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/brands/${b.logo}.svg`} alt={i < MARKET_BRANDS.length ? `${b.name} logo` : ""} width={48} height={48} loading="lazy" className="h-12 w-12 invert" />
                <span className="font-display text-3xl uppercase tracking-wide text-white">{b.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 px-4 text-center text-[10px] leading-4 text-white/30">
          Brand names and logos are trademarks of their respective owners. Product availability will vary.
        </p>
      </section>
      <section className="bg-black px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-[1500px] text-center">
          <h2 className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">Be first in line</h2>
          <StoreButtons className="mx-auto mt-8 justify-center" placement="shop_bottom" />
        </div>
      </section>
    </AppShell>
  );
}
