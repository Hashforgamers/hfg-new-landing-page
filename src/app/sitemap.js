import { SITE_URL } from "@/lib/site";

const routes = [
  "",
  "/gaming-cafes",
  "/tournaments",
  "/shop",
  "/rewards",
  "/list-cafe",
  "/privacy-policy",
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
