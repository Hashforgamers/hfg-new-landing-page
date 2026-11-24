import { buildPageMetadata } from "@/lib/site";
import MarketplaceGrid from "@/components/play/MarketplaceGrid";

export const metadata = buildPageMetadata({
  title: "Hash Marketplace",
  description: "Shop gaming gear and services from verified Hash partners with secure checkout and tracked delivery.",
  path: "/marketplace",
  keywords: ["gaming gear India", "gaming accessories online", "Hash marketplace"],
});

export default function MarketplacePage() {
  return <MarketplaceGrid />;
}
