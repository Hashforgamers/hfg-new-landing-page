import { getAllPosts } from "@/lib/blog";
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
    url: "/tournaments",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: "/blog",
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: "/rewards",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: "/gaming-cafe-cost-calculator",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: "/list-cafe",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/mumbai-surfer",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/about",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: "/terms",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: "/privacy-policy",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: "/support",
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

export default function sitemap() {
  const lastModified = new Date();

  const pages = routes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...pages, ...posts];
}
