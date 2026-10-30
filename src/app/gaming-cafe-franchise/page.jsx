import Link from "next/link";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/landing/FaqSection";
import FranchiseCompare from "@/components/landing/FranchiseCompare";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { SITE_FRANCHISE_URL, breadcrumbLd, buildPageMetadata } from "@/lib/site";

const PATH = "/gaming-cafe-franchise";

export const metadata = buildPageMetadata({
  title: "Gaming Cafe Franchise in India",
  description:
    "Open a Hash gaming cafe franchise in India: Hash branding and interiors, setup and equipment help, launch marketing, official tournaments and bookings from day one.",
  path: PATH,
  keywords: [
    "gaming cafe franchise India",
    "gaming cafe franchise",
    "gaming zone franchise",
    "gaming zone franchise cost",
    "gaming lounge franchise",
    "esports cafe franchise",
  ],
});

const FAQS = [
  { q: "What do I get with a Hash gaming cafe franchise?", a: "Hash branding, signage and interior design, a setup plan and help sourcing equipment, launch marketing to gamers nearby, official Hash tournaments at your venue, staff training and an operating playbook, priority support, the Hash kiosk and dashboard installed and configured, and a listing in the Hash app from day one." },
  { q: "Do I own the cafe?", a: "Yes. With a Hash franchise you own and run the cafe; Hash provides the brand, setup help, marketing, tournaments and software." },
  { q: "How much does a gaming cafe franchise cost in India?", a: "It depends mostly on the number of PCs and consoles, the city and the size of the space. A 10-PC, 2-PS5 cafe in a tier 2 city costs about ₹24.5 lakh to set up by our calculator's estimate. Email us with your city, planned stations and budget for Hash franchise terms." },
  { q: "Can I list my existing cafe instead?", a: "Yes. If you already run a cafe, you can list it on Hash to get bookings and use the kiosk and dashboard without becoming a franchise." },
  { q: "How do I apply?", a: "Send a franchise enquiry with your city, planned number of PCs and consoles, budget and phone number, and the Hash team will get back to you." },
];

export default function GamingCafeFranchisePage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbLd("Gaming Cafe Franchise", PATH)} />
      <ScrollProgress />
      <NavBar />
      <PageHero
        eyebrow="Hash franchise"
        heading="Gaming cafe franchise in India"
        lines={["Open a cafe", "with Hash."]}
        body="Run your own gaming cafe under the Hash brand, with interiors, setup help, launch marketing, official tournaments and bookings from the Hash app from day one."
        image="/images/hero-poster.jpg"
        placement="franchise_hero"
        actions={
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={SITE_FRANCHISE_URL} data-track="franchise_enquiry_click" data-track-placement="franchise_hero" className="rounded-full bg-white px-8 py-3 font-display text-lg uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white">
              Send a franchise enquiry
            </a>
            <Link href="/gaming-cafe-cost-calculator" className="rounded-full border border-white/40 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-white hover:text-black">
              Estimate your setup cost
            </Link>
          </div>
        }
      />
      <FranchiseCompare />
      <FaqSection id="franchise-faq" title="Franchise questions" faqs={FAQS} />
    </AppShell>
  );
}
