import { loadCafes } from "@/lib/server/ops/booking";
import { SITE_URL } from "@/lib/site";
import { cafePath } from "@/lib/verticals";

// /book/sitemap.xml: every bookable cafe, rebuilt every few minutes so new
// listings are discoverable without a deploy.
export const revalidate = 300;

export default async function sitemap() {
  let cafes = [];
  try {
    cafes = await loadCafes();
  } catch {}
  const now = new Date();
  return [
    { url: `${SITE_URL}/book`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...cafes.map((c) => ({
      url: `${SITE_URL}${cafePath(c)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      ...(c.images?.length ? { images: c.images.slice(0, 3) } : {}),
    })),
  ];
}
