import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: "Hash",
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    categories: ["games", "entertainment", "lifestyle"],
    lang: "en-IN",
    icons: [
      {
        src: SITE_OG_IMAGE,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: `${SITE_URL}/images/features.png`,
        sizes: "1536x1024",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
