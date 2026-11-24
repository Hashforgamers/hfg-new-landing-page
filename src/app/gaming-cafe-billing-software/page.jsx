import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import FaqSection from "@/components/landing/FaqSection";
import { SITE_NAME, SITE_ONBOARD_URL, SITE_SUPPORT_WHATSAPP_URL, SITE_URL, breadcrumbLd, buildPageMetadata } from "@/lib/site";

const PATH = "/gaming-cafe-billing-software";
const description = "Gaming cafe billing software for India: manage PC and console sessions, set hourly rates, add time at the desk and track earnings from one dashboard.";
const faqs = [
  { q: "How does gaming cafe billing software work?", a: "It applies your rates to timed gaming sessions, records starts and ends, and gives staff a view of active sessions and earnings. Hash combines session timing and cafe operations in its kiosk and dashboard." },
  { q: "Can I set different rates for PCs and consoles?", a: "Yes. Hash lets cafe owners set prices by station type and update them as their offers or operating hours change." },
  { q: "Can staff extend a gaming session?", a: "Yes. Staff can add time or end an active session from the desk, while the kiosk returns the PC to its locked state when time runs out." },
  { q: "How can I try Hash for my cafe?", a: "Start self-onboarding or request a callback. The team can help you add your stations, pricing and cafe details." },
];

export const metadata = buildPageMetadata({
  title: "Gaming Cafe Billing Software for PCs & Consoles",
  description,
  path: PATH,
  keywords: ["gaming cafe billing software", "gaming cafe billing system", "gaming cafe session billing", "gaming parlour billing software India"],
});

export default function GamingCafeBillingPage() {
  return <AppShell>
    <JsonLd data={[
      { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Hash gaming cafe billing software", applicationCategory: "BusinessApplication", operatingSystem: "Windows, Web", description, url: `${SITE_URL}${PATH}`, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } },
      breadcrumbLd("Gaming Cafe Billing Software", PATH),
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ]} />
    <NavBar />
    <PageHero eyebrow="For gaming cafe owners" heading="Gaming cafe billing software" lines={["Time every session.", "Know every sale."]} body="Set rates for PCs, consoles and other stations, manage active sessions from one dashboard, and let the Hash kiosk lock PCs when paid time ends." image="/images/dashboard/pricing.webp" placement="cafe_billing_hero" actions={<div className="mt-8 flex flex-wrap gap-3"><a href={SITE_ONBOARD_URL} data-track="cafe_onboard_click" data-track-placement="cafe_billing_hero" className="rounded-full bg-white px-8 py-3 font-display text-lg uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white">Start onboarding</a><Link href="/list-cafe" className="rounded-full border border-white/40 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-white hover:text-black">Request a callback</Link><a href={SITE_SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" data-track-placement="cafe_billing_hero" className="rounded-full border border-[#25d366]/60 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-[#25d366] hover:text-black">WhatsApp Hash</a></div>} />
    <section className="bg-black px-4 py-20 sm:px-8"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2"><Image src="/images/dashboard/pricing.webp" alt="Hash dashboard for setting gaming cafe session prices" width={1470} height={780} className="h-auto w-full rounded-2xl border border-white/10" /><div><h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Clear rates. Timed sessions.</h2><p className="mt-5 leading-7 text-white/70">Set hourly prices for each station type, keep an eye on live sessions, and let staff add time or close sessions from the desk. The kiosk handles the PC lock screen when play time ends.</p><p className="mt-4 leading-7 text-white/70">Hash also helps players discover your cafe and book ahead. See the <Link className="underline" href="/gaming-cafe-software">full gaming cafe management software</Link> or estimate your <Link className="underline" href="/gaming-cafe-cost-calculator">gaming cafe costs</Link>.</p></div></div></section>
    <FaqSection id="billing-faq" title="Billing software questions" faqs={faqs} />
  </AppShell>;
}
