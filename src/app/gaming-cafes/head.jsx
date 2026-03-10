import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const title = `Gaming Cafes | ${SITE_NAME}`;
const description =
  "Discover premium gaming cafe experiences, compare setups, and explore faster booking through Hash For Gamers.";
const canonical = `${SITE_URL}/gaming-cafes`;

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="gaming cafes, gaming cafe booking, book gaming cafe in India, premium gaming cafes, PC gaming cafe"
      />
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
