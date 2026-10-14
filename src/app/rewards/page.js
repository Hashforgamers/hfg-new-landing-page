import AppShell from "@/components/AppShell";
import InfoCards from "@/components/landing/InfoCards";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import StoreButtons from "@/components/landing/StoreButtons";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "HashCoins Rewards",
  description:
    "Earn HashCoins on the Hash app every time you play, book a gaming cafe or refer a friend, and spend them on game passes, offers and gear.",
  path: "/rewards",
  keywords: ["HashCoins", "gaming rewards app India", "gaming cafe rewards", "refer and earn gaming"],
});

const EARN = [
  { title: "Play tournaments", body: "Join and finish matches to earn HashCoins on top of any prizes." },
  { title: "Book cafes", body: "Every cafe session booked through Hash earns you coins." },
  { title: "Refer friends", body: "Share your referral link. When friends join and play, you both earn." },
  { title: "Keep a streak", body: "Come back regularly to build streaks and unlock bonus coins." },
];

const SPEND = [
  { title: "Game passes", body: "Bundles of playtime at partner cafes for less." },
  { title: "Offers", body: "Exclusive deals from cafes and partners on Hash." },
  { title: "Gear", body: "Use coins towards gaming gear in the Hash Shop." },
];

export default function RewardsPage() {
  return (
    <AppShell>
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="HashCoins"
        lines={["Play more.", "Earn more."]}
        body="HashCoins are Hash's reward points. Earn them by playing, booking and bringing friends, then spend them on passes, offers and gear."
        image="/gta6-miami-sunset.jpg"
        placement="rewards_hero"
      />
      <InfoCards id="earn-title" title="Ways to earn" items={EARN} />
      <InfoCards id="spend-title" title="Ways to spend" items={SPEND} tone="pink" />
      <section className="bg-black px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-[1500px] text-center">
          <h2 className="font-display text-5xl uppercase leading-none text-white sm:text-7xl">Your wallet is in the app</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60">
            Coin values, rewards and offers change over time. The app shows your balance and what you can redeem today.
          </p>
          <StoreButtons className="mx-auto mt-8 justify-center" placement="rewards_bottom" />
        </div>
      </section>
    </AppShell>
  );
}
