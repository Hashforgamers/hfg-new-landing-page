import { headers } from "next/headers";
import PlayShell from "@/components/play/PlayShell";

// New player flows (booking, marketplace, account). Kept in a route group so
// the existing landing pages are untouched and the auth state survives
// navigation between these pages.
export default async function PlayLayout({ children }) {
  // Reading the per-request CSP nonce makes these pages render dynamically,
  // which lets Next attach the nonce to its own scripts.
  await headers();
  return <PlayShell>{children}</PlayShell>;
}
