import { buildPageMetadata } from "@/lib/site";
import CafeDirectory from "@/components/play/CafeDirectory";

export const metadata = buildPageMetadata({
  title: "Book a Gaming Cafe",
  description: "Find a Hash partner gaming cafe, pick your console and slot, and book in seconds.",
  path: "/book",
  keywords: ["book gaming cafe online", "gaming cafe slots", "PS5 cafe booking", "PC gaming cafe near me"],
});

export default function BookPage() {
  return <CafeDirectory />;
}
