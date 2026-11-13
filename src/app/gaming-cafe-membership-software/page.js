import { permanentRedirect } from "next/navigation";

// Preserve the proposed URL while sending visitors and crawlers to the accurate page.
export default function GamingCafeMembershipRedirect() {
  permanentRedirect("/gaming-cafe-customer-management");
}
