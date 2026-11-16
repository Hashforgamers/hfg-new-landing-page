import { permanentRedirect } from "next/navigation";

// Legacy URL still in Google's index (GSC 404); send it to the current café onboarding page.
export default function OnboardRedirect() {
  permanentRedirect("/list-cafe");
}
