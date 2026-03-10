import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const title = `Rewards | ${SITE_NAME}`;
const description =
  "Hash rewards and loyalty features are in development. Follow Hash For Gamers for upcoming premium perks and progression systems.";
const canonical = `${SITE_URL}/rewards`;

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${SITE_URL}${SITE_OG_IMAGE}`} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${SITE_OG_IMAGE}`} />
    </>
  );
}
