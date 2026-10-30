import { Eye, FileText, IndianRupee, Lock, Mail, Settings, ShieldCheck, XCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { FadeUp, RevealLine } from "@/components/landing/HeroParallax";
import NavBar from "@/components/landing/NavBar";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Read how Hash For Gamers collects, uses, and protects user data across the website and platform.",
  path: "/privacy-policy",
});

const PRIVACY_EMAIL = "privacy@hashforgamers.co.in";

// Policy wording is legal text: change it only with sign-off.
const SECTIONS = [
  {
    id: "introduction",
    icon: ShieldCheck,
    title: "Introduction",
    content:
      'This Privacy Policy describes how Hashforgamers Pvt Ltd and its affiliates ("we", "our", "us") collect, use, and protect your data through https://hashforgamers.co.in/. Data is stored and processed in India.',
  },
  {
    id: "collection",
    icon: Eye,
    title: "Collection",
    content:
      "We collect personal data such as name, contact details, date of birth, identity proof, and payment details when required.",
  },
  {
    id: "usage",
    icon: Settings,
    title: "Usage",
    content: "Data is used to provide services, improve experience, prevent fraud, and communicate relevant updates.",
  },
  {
    id: "security",
    icon: Lock,
    title: "Security",
    content: "We follow reasonable security practices to protect your personal data from unauthorized access or misuse.",
  },
  {
    id: "platform-nature",
    icon: FileText,
    title: "Platform Nature",
    content: "Hashforgamers is not a gaming service provider. We only enable ticket bookings for partner gaming cafés.",
  },
  {
    id: "refund-policy",
    icon: XCircle,
    title: "Refund Policy",
    content: "All bookings are final. Hashforgamers does not provide refunds.",
  },
  {
    id: "pricing",
    icon: IndianRupee,
    title: "Pricing",
    content: "Pricing details are transparently displayed on the respective game listings.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <AppShell>
      <ScrollProgress />
      <NavBar />

      <section className="relative overflow-hidden bg-black px-4 pb-16 pt-32 sm:px-8 sm:pt-40">
        <div
          className="pointer-events-none absolute -left-40 -top-20 h-[520px] w-[520px] rounded-full bg-[#ff3d8b]/20 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[#7c3aed]/20 blur-[140px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1300px]">
          <FadeUp>
            <p className="font-tech mb-4 text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">Legal</p>
          </FadeUp>
          <h1 className="font-display text-[clamp(3.2rem,9vw,8rem)] uppercase leading-[0.86] text-white">
            <RevealLine delay={0.1}>Privacy</RevealLine>
            <RevealLine
              delay={0.25}
              className="bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d] bg-clip-text text-transparent"
            >
              Policy.
            </RevealLine>
          </h1>
          <FadeUp delay={0.45}>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Your privacy matters. Here&apos;s how we protect your data.
            </p>
            <p className="font-tech mt-4 text-[11px] uppercase tracking-[0.3em] text-white/45">
              Last updated <time dateTime="2026-10-15">15 October 2026</time>
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="bg-black px-4 pb-24 sm:px-8">
        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Policy sections" className="hidden lg:block">
            <div className="sticky top-28 border-l border-white/10 pl-5">
              <p className="font-tech mb-4 text-[10px] uppercase tracking-[0.3em] text-white/45">On this page</p>
              <ol className="space-y-3">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-baseline gap-3 text-sm text-white/60 transition hover:text-white"
                    >
                      <span className="font-tech text-[10px] text-[#ff9a3d]/70 group-hover:text-[#ff9a3d]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {SECTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={s.id} id={s.id} className="scroll-mt-28">
                    <Reveal y={24} className="grid gap-4 py-8 sm:grid-cols-[80px_1fr] sm:py-10">
                      <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                        <span className="font-tech text-[11px] uppercase tracking-[0.25em] text-[#ff9a3d]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-[#ff9a3d]">
                          <Icon size={18} aria-hidden="true" />
                        </span>
                      </div>
                      <div>
                        <h2 className="font-display text-3xl uppercase leading-none text-white sm:text-4xl">{s.title}</h2>
                        <p className="mt-4 max-w-3xl text-base leading-8 text-white/75">{s.content}</p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ol>

            <Reveal className="mt-12">
              <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#ff3d8b]/15 via-white/[0.03] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-[#ff9a3d]">Questions about your data?</p>
                  <p className="mt-2 font-display text-3xl uppercase leading-none text-white sm:text-4xl">Talk to us</p>
                  <p className="mt-2 text-sm text-white/65">For any privacy-related queries, contact us at {PRIVACY_EMAIL}.</p>
                </div>
                <a
                  href={`mailto:${PRIVACY_EMAIL}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-display text-xl uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white"
                >
                  <Mail size={18} aria-hidden="true" /> Email privacy team
                </a>
              </div>
            </Reveal>
            <p className="mt-6 text-sm text-white/50">
              Want your account and data removed?{" "}
              <a href="/delete-account" className="text-[#ff9a3d] underline underline-offset-4 hover:text-white">
                Request account deletion
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
