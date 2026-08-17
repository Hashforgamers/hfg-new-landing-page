import Link from "next/link";
import {
  Swords,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trophy,
  UserX,
} from "lucide-react";
import {
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
  buildPageMetadata,
} from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Support",
  description:
    "Get Hash For Gamers app support for tournaments, match results, payments, cafe bookings, account access, privacy, and account deletion.",
  path: "/support",
  keywords: [
    "Hash For Gamers support",
    "Hash app support",
    "gaming tournament support",
    "esports tournament support",
    "iOS app support",
  ],
});

const supportEmail = "support@hashforgamers.co.in";
const supportPhone = "+91 9137757935";

const supportTopics = [
  {
    icon: Trophy,
    title: "Tournaments",
    text:
      "Help with tournament registration, brackets, match schedules, results, rankings, and prize-related questions.",
  },
  {
    icon: Swords,
    title: "Matches",
    text:
      "Support for room details, opponent coordination, result submissions, disputes, and match verification.",
  },
  {
    icon: ShieldCheck,
    title: "Payments",
    text:
      "Support for entry fees, payment status, invoices, failed transactions, and cafe booking charges.",
  },
  {
    icon: Headphones,
    title: "App Help",
    text:
      "Troubleshooting for login, OTP, profile, HashCoins, notifications, and app experience issues.",
  },
  {
    icon: UserX,
    title: "Account Requests",
    text:
      "Privacy questions, data requests, and permanent account deletion support for Hash users.",
  },
];

const faqItems = [
  {
    question: "How do I get support for the Hash iOS app?",
    answer:
      "Email us with your registered mobile number, device model, app version, tournament or booking details, and a short description of the issue. Screenshots are helpful when a match, payment, or login screen is involved.",
  },
  {
    question: "What should I include for tournament issues?",
    answer:
      "Share the tournament name, match round, team or player name, opponent details, and any screenshots that show the bracket, score, room, or result screen.",
  },
  {
    question: "Can I request account deletion from the web?",
    answer:
      "Yes. Use the delete account page to submit a verified deletion request, or email support if you cannot access your account.",
    link: "/delete-account",
    linkLabel: "Open delete account page",
  },
  {
    question: "Where can I read the privacy policy?",
    answer:
      "Our privacy policy explains what data Hash collects, how it is used, and how to contact us for privacy-related questions.",
    link: "/privacy-policy",
    linkLabel: "Open privacy policy",
  },
];

export default function SupportPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Support | ${SITE_NAME}`,
    url: `${SITE_URL}/support`,
    mainEntity: {
      "@type": "Organization",
      name: "Hash for Gamers Private Limited",
      url: SITE_URL,
      email: supportEmail,
      telephone: supportPhone,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: supportEmail,
          telephone: supportPhone,
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SITE_EMAIL,
          areaServed: "IN",
        },
      ],
    },
  };

  return (
    <main
      className="min-h-screen bg-[#050505] px-6 py-12 text-white md:px-12 lg:px-24"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(22,255,0,0.12), transparent 28%), radial-gradient(circle at 80% 8%, rgba(249,115,22,0.1), transparent 24%), linear-gradient(180deg, #050505 0%, #080808 44%, #000 100%)",
        backgroundPosition: "center top",
        backgroundSize: "cover",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex text-sm font-semibold uppercase tracking-[0.22em] text-[#16FF00] transition hover:text-white"
        >
          Hash For Gamers
        </Link>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.42em] text-[#16FF00]">
              Tournament First Support
            </p>
            <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.12em] text-white md:text-6xl">
              Support for Hash For Gamers
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              Need help with tournaments, matches, payments, account access,
              privacy, or cafe bookings? Contact our support team and we will
              help you get back into the competition.
            </p>
          </div>

          <div className="rounded-[8px] border border-[#16FF00]/25 bg-black/80 p-6">
            <h2 className="text-xl font-bold uppercase tracking-[0.12em] text-white">
              Contact
            </h2>
            <div className="mt-6 space-y-5 text-sm text-white/75">
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-start gap-3 transition hover:text-[#16FF00]"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#16FF00]" />
                <span>
                  <span className="block text-white">Support Email</span>
                  {supportEmail}
                </span>
              </a>
              <a
                href="tel:+919137757935"
                className="flex items-start gap-3 transition hover:text-[#16FF00]"
              >
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#16FF00]" />
                <span>
                  <span className="block text-white">Phone</span>
                  {supportPhone}
                </span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#16FF00]" />
                <span>
                  <span className="block text-white">Registered Office</span>
                  Hash for Gamers Private Limited
                  <br />
                  Mumbai, Maharashtra, India
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {supportTopics.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[8px] border border-white/10 bg-white/[0.045] p-6"
            >
              <Icon className="h-6 w-6 text-[#16FF00]" />
              <h2 className="mt-5 text-lg font-bold uppercase tracking-[0.12em] text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/68">{text}</p>
            </article>
          ))}
        </section>

        <section className="py-16">
          <h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white">
            Quick Answers
          </h2>
          <div className="mt-6 space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[8px] border border-white/10 bg-black/60 p-6"
              >
                <h3 className="text-base font-bold text-[#16FF00]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  {item.answer}
                </p>
                {item.link ? (
                  <Link
                    href={item.link}
                    className="mt-4 inline-flex text-sm font-semibold text-white underline decoration-[#16FF00]/60 underline-offset-4 transition hover:text-[#16FF00]"
                  >
                    {item.linkLabel}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
