import AppShell from '@/components/AppShell';
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeatureSection";
import IndiaGamingSection from "@/components/GameSection";
import HashShop from "@/components/HashShop";
import Hero from "@/components/Hero";
import ProblemsSection from "@/components/ProblemSection";
import StorySection from "@/components/StorySection";
import TryNow from "@/components/TryNow";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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
    title: "Spawn In",
    subtitle:
      "A cinematic first frame, bold title reveal, and a clean lead-in to the Hash world.",
    accent: "#F97316",
    align: "left",
    Component: Hero,
  },
  {
    id: "about",
    chapter: "Chapter 02",
    title: "Pick Your Night",
    subtitle:
      "The story shifts from vibe to utility: book a station fast, skip the chaos, keep the energy high.",
    accent: "#22C55E",
    align: "right",
    Component: AboutSection,
  },
  {
    id: "try-now",
    chapter: "Chapter 03",
    title: "No Queue Arc",
    subtitle:
      "This section lands like a mission beat: instant clarity, fast action, and zero friction.",
    accent: "#EAB308",
    align: "left",
    Component: TryNow,
  },
  {
    id: "features",
    chapter: "Chapter 04",
    title: "Gear Up",
    subtitle:
      "The feature canvas now reads like a reveal panel instead of a flat screenshot drop.",
    accent: "#38BDF8",
    align: "right",
    Component: FeaturesSection,
  },
  {
    id: "shop",
    chapter: "Chapter 05",
    title: "Street Supply",
    subtitle:
      "Hash Shop gets a slower cinematic pass so the products feel introduced, not just shown.",
    accent: "#FB7185",
    align: "left",
    Component: HashShop,
  },
  {
    id: "problems",
    chapter: "Chapter 06",
    title: "Boss Fight",
    subtitle:
      "Pain points arrive with tension, then resolve into the Hash pitch as a payoff beat.",
    accent: "#A855F7",
    align: "right",
    Component: ProblemsSection,
  },
  {
    id: "finale",
    chapter: "Final Chapter",
    title: "Join The Movement",
    subtitle:
      "A warm sunset-style finale with a softer landing, stronger close, and clear CTA momentum.",
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
      logo: `${SITE_URL}/images/hash-logo.png`,
    },
  };

  return (
    <AppShell>
      <div className="min-h-screen w-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {storySections.map(
          ({ id, chapter, title, subtitle, accent, align, Component }, index) => (
            <StorySection
              key={id}
              id={id}
              chapter={chapter}
              title={title}
              subtitle={subtitle}
              accent={accent}
              align={align}
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
