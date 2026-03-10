import { SITE_URL } from "@/lib/site";

const routes = [
  {
    url: "",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: "/gaming-cafes",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "/list-cafe",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/privacy-policy",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
