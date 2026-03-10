import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const title = `List Your Cafe | ${SITE_NAME}`;
const description =
  "Partner with Hash For Gamers and list your gaming cafe to reach premium players, cleaner bookings, and stronger visibility.";
const canonical = `${SITE_URL}/list-cafe`;

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="list gaming cafe, gaming cafe partner, gaming cafe leads, gaming cafe business India, partner with Hash For Gamers"
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
