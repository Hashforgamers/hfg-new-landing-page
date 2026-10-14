export const SITE_URL = "https://www.hashforgamers.com";
export const SITE_LOGO = "/images/hash-logo.png?v=20260311-0146";
export const SITE_DOWNLOAD_URL = "https://onelink.to/85rrgg";
export const SITE_ANDROID_PACKAGE = "com.hfg.hash";
export const SITE_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${SITE_ANDROID_PACKAGE}`;
export const SITE_APP_STORE_ID = "6750488424";
export const SITE_APP_STORE_URL = `https://apps.apple.com/in/app/hash-gaming-esports-network/id${SITE_APP_STORE_ID}`;
export const SITE_OG_IMAGE = "/images/og-home.jpg";
// Self-serve onboarding for gaming cafe owners.
export const SITE_ONBOARD_URL = "https://onboard.hashforgamers.com";
export const SITE_EMAIL = "support@hashforgamers.com";
// Franchise enquiries go to the support inbox until there is a dedicated form.
export const SITE_FRANCHISE_URL = `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(
  "Hash franchise enquiry"
)}&body=${encodeURIComponent(
  "Hi Hash team,\n\nI'd like to know more about the Hash franchise.\n\nCity:\nPlanned number of PCs and consoles:\nBudget:\nPhone:\n"
)}`;
export const SITE_INSTAGRAM = "https://instagram.com/hashforgamers";
export const SITE_TWITTER = "https://twitter.com/hashforgamers";
export const SITE_LINKEDIN = "https://linkedin.com/company/hashforgamers";
export const SITE_YOUTUBE = "https://youtube.com/@hashforgamers";

// Analytics IDs carried over from the previous site; override per environment if needed.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-B1QNYHZ26Z";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "3210237032478677";

export const SITE_NAME = "Hash For Gamers";
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const SITE_DESCRIPTION =
  "Join esports tournaments, book gaming cafes near you, build your squad and earn HashCoins. Hash For Gamers is India's tournament-first gaming app for Android and iOS.";

export const SITE_KEYWORDS = [
  "Hash For Gamers",
  "esports tournaments India",
  "online gaming tournaments India",
  "BGMI tournament app",
  "Valorant tournaments India",
  "gaming tournament app",
  "gaming cafe near me",
  "gaming cafes India",
  "book gaming cafe",
  "book gaming cafe in India",
  "find gaming cafes near me",
  "gaming cafe app India",
  "gaming stations booking",
  "esports cafes",
  "gaming community India",
  "PC gaming cafe booking",
  "console gaming cafe",
  "Hash app",
  "premium gaming brand India",
  "elite gaming cafes",
  "premium gaming platform",
];

export const SITE_SOCIALS = [
  SITE_INSTAGRAM,
  SITE_TWITTER,
  SITE_LINKEDIN,
  SITE_YOUTUBE,
];

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = SITE_OG_IMAGE,
  keywords = [],
  noIndex = false,
}) {
  const canonicalPath = path === "/" ? "" : path;
  const url = `${SITE_URL}${canonicalPath}`;
  const resolvedTitle = title || SITE_NAME;
  const fullTitle = resolvedTitle === SITE_NAME ? SITE_NAME : `${resolvedTitle} | ${SITE_NAME}`;

  return {
    title: resolvedTitle,
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${resolvedTitle} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
