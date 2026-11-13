import { permanentRedirect } from "next/navigation";

// Keep one canonical calculator URL while supporting the requested tools route.
export default function GamingCafeProfitCalculatorAlias() {
  permanentRedirect("/gaming-cafe-cost-calculator");
}
