export const SITE_URL = "https://hashforgamers.co.in";
export const SITE_LOGO = "/images/hash-logo.png?v=20260311-0146";
export const SITE_DOWNLOAD_URL = "https://onelink.to/85rrgg";
export const SITE_OG_IMAGE = "/images/hash-logo.png?v=20260311-0146";
export const SITE_EMAIL = "support@hashforgamers.com";
export const SITE_INSTAGRAM = "https://instagram.com/hashforgamers";
export const SITE_TWITTER = "https://twitter.com/hashforgamers";
export const SITE_LINKEDIN = "https://linkedin.com/company/hashforgamers";
export const SITE_YOUTUBE = "https://youtube.com/@hashforgamers";

export const SITE_NAME = "Hash For Gamers";
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const SITE_DESCRIPTION =
  "Hash For Gamers is the premium gaming platform for players who want elite cafes, faster bookings, stronger identity, and a better gaming lifestyle in India.";

export const SITE_KEYWORDS = [
  "Hash For Gamers",
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
