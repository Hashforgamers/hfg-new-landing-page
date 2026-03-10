import AppShell from '@/components/AppShell';
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeatureSection";
import IndiaGamingSection from "@/components/GameSection";
import HashShop from "@/components/HashShop";
import Hero from "@/components/Hero";
import HowItWorksSection from "@/components/HowItWorksSection";
import ProblemsSection from "@/components/ProblemSection";
import StorySection from "@/components/StorySection";
import TrustSection from "@/components/TrustSection";
import TryNow from "@/components/TryNow";
import { SITE_DESCRIPTION, SITE_DOWNLOAD_URL, SITE_LOGO, SITE_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const storySections = [
  {
    id: "hero",
    chapter: "Chapter 01",
    title: "Premium Spawn",
    subtitle:
      "Hash should feel like the premium front door to gaming culture, not another basic utility app.",
    accent: "#F97316",
    align: "left",
    cardPlacement: "lower-left",
    Component: Hero,
  },
  {
    id: "about",
    chapter: "Chapter 02",
    title: "Elite Flow",
    subtitle:
      "Hash moves from flex to function: find the right battleground, reserve faster, and own the night with one premium flow.",
    accent: "#22C55E",
    align: "right",
    Component: AboutSection,
  },
  {
    id: "trust",
    chapter: "Chapter 03",
    title: "Premium Signal",
    subtitle:
      "Strong positioning, clear traction language, and operator value make Hash feel credible, serious, and built to lead.",
    accent: "#16FF00",
    align: "left",
    Component: TrustSection,
  },
  {
    id: "how-it-works",
    chapter: "Chapter 04",
    title: "Lock The Slot",
    subtitle:
      "The flow should be instant to understand: discover, reserve, arrive, dominate.",
    accent: "#14B8A6",
    align: "right",
    Component: HowItWorksSection,
  },
  {
    id: "try-now",
    chapter: "Chapter 05",
    title: "Zero Friction",
    subtitle:
      "Hash removes every low-status booking ritual between intent and play.",
    accent: "#EAB308",
    align: "left",
    Component: TryNow,
  },
  {
    id: "features",
    chapter: "Chapter 06",
    title: "The Stack",
    subtitle:
      "This is the premium system behind the brand: bookings, identity, rewards, and community built into one stack.",
    accent: "#38BDF8",
    align: "right",
    Component: FeaturesSection,
  },
  {
    id: "shop",
    chapter: "Chapter 07",
    title: "Hash Gear",
    subtitle:
      "Hash Gear extends the brand beyond bookings into a premium gaming lifestyle layer.",
    accent: "#FB7185",
    align: "left",
    Component: HashShop,
  },
  {
    id: "problems",
    chapter: "Chapter 08",
    title: "Why Winners Switch",
    subtitle:
      "Once the friction is obvious, the premium answer becomes obvious too: one platform that upgrades the whole gaming routine.",
    accent: "#A855F7",
    align: "right",
    Component: ProblemsSection,
  },
  {
    id: "finale",
    chapter: "Final Chapter",
    title: "Enter The Premium Tier",
    subtitle:
      "The close should feel inevitable: install Hash, enter the network, and play in a different league.",
    accent: "#F59E0B",
    align: "left",
    Component: IndiaGamingSection,
  },
];

export default function Page() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: `${SITE_URL}${SITE_LOGO}`,
    },
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Android, iOS",
    downloadUrl: SITE_DOWNLOAD_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}${SITE_OG_IMAGE}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: `${SITE_URL}${SITE_LOGO}`,
    },
  };

  return (
    <AppShell>
      <div className="min-h-screen w-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
        {storySections.map(
          ({ id, chapter, title, subtitle, accent, align, cardPlacement, Component }, index) => (
            <StorySection
              key={id}
              id={id}
              chapter={chapter}
              title={title}
              subtitle={subtitle}
              accent={accent}
              align={align}
              cardPlacement={cardPlacement}
              showSeparator={index < storySections.length - 1}
            >
              <Component />
            </StorySection>
          )
        )}
      </div>
    </AppShell>
  );
}
