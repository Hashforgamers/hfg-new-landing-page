import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/games/", "/account", "/login", "/marketplace/cart"],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/book/sitemap.xml`, `${SITE_URL}/marketplace/sitemap.xml`],
    host: SITE_URL,
  };
}
