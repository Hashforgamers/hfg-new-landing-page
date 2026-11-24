import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import FaqSection from "@/components/landing/FaqSection";
import { SITE_NAME, SITE_ONBOARD_URL, SITE_SUPPORT_WHATSAPP_URL, SITE_URL, breadcrumbLd, buildPageMetadata } from "@/lib/site";

const PATH = "/gaming-cafe-customer-management";
const description = "Gaming cafe customer management software for India. Track player visits, spend and loyalty tiers alongside bookings, sessions and cafe operations.";
const faqs = [
  { q: "What does gaming cafe customer management software do?", a: "It helps a cafe keep customer details and visit activity organized so staff can recognize returning players and manage bookings and sessions more consistently." },
  { q: "Can players book sessions at my cafe?", a: "Cafes listed on Hash can be discovered in the Hash app, where nearby gamers can view the setup and book available PC and console slots." },
  { q: "Can I manage sessions and customers together?", a: "Hash brings customer visit and spend history, bookings, live sessions, stations, pricing and earnings into the cafe dashboard, with a kiosk app for PC session access." },
  { q: "How do I get started?", a: "Start self-onboarding to add your cafe details, verify your account, add stations and set prices, or request a callback for help." },
];

export const metadata = buildPageMetadata({
  title: "Gaming Cafe Customer Management & Loyalty Tiers",
  description,
  path: PATH,
  keywords: ["gaming cafe customer management", "gaming cafe customer tracking", "gaming cafe loyalty software", "gaming lounge customer management"],
});

export default function GamingCafeCustomerManagementPage() {
  return <AppShell>
    <JsonLd data={[
      { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Hash gaming cafe customer management", applicationCategory: "BusinessApplication", operatingSystem: "Windows, Web", description, url: `${SITE_URL}${PATH}`, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } },
      breadcrumbLd("Gaming Cafe Customer Management", PATH),
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ]} />
    <NavBar />
    <PageHero eyebrow="For gaming cafe owners" heading="Gaming cafe customer management" lines={["Know your regulars.", "Grow every visit."]} body="See player visits, spend and loyalty tiers alongside advance bookings and active sessions, with one dashboard for staff and a kiosk for timed PC access." image="/images/dashboard/gamers.webp" placement="cafe_customer_management_hero" actions={<div className="mt-8 flex flex-wrap gap-3"><a href={SITE_ONBOARD_URL} data-track="cafe_onboard_click" data-track-placement="cafe_customer_management_hero" className="rounded-full bg-white px-8 py-3 font-display text-lg uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white">Start onboarding</a><Link href="/list-cafe" className="rounded-full border border-white/40 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-white hover:text-black">Request a callback</Link><a href={SITE_SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" data-track-placement="cafe_customer_management_hero" className="rounded-full border border-[#25d366]/60 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-[#25d366] hover:text-black">WhatsApp Hash</a></div>} />
    <section className="bg-black px-4 py-20 sm:px-8"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2"><div><h2 className="font-display text-4xl uppercase text-white sm:text-5xl">Make each visit easier to manage.</h2><p className="mt-5 leading-7 text-white/70">Give your team a shared view of customers, bookings and sessions. Players can find your venue in the Hash app and book ahead, while staff manage stations and pricing from the cafe dashboard.</p><p className="mt-4 leading-7 text-white/70">Explore the <Link className="underline" href="/gaming-cafe-software">full gaming cafe software</Link>, or see the <Link className="underline" href="/gaming-cafe-billing-software">billing and session tools</Link>.</p></div><Image src="/images/dashboard/gamers.webp" alt="Hash cafe dashboard showing gaming cafe customers" width={1470} height={780} className="h-auto w-full rounded-2xl border border-white/10" /></div></section>
    <FaqSection id="customer-management-faq" title="Customer management questions" faqs={faqs} />
  </AppShell>;
}
