import { Orbitron } from 'next/font/google';
import "./globals.css";
import BackgroundMusic from '@/components/BackgroundMusic';
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_KEYWORDS, SITE_NAME, SITE_OG_IMAGE, SITE_SOCIALS, SITE_TITLE_TEMPLATE, SITE_URL } from '@/lib/site';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  title: {
    default: SITE_NAME,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "gaming",
  classification: "Gaming platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  robots: {
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
  icons: {
    icon: [
      { url: SITE_OG_IMAGE, type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [SITE_OG_IMAGE],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-title": SITE_NAME,
    "mobile-web-app-capable": "yes",
    "theme-color": "#050505",
    "color-scheme": "dark",
    "contact:email": SITE_EMAIL,
    "profile:same_as": SITE_SOCIALS.join(","),
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={orbitron.variable}>
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
