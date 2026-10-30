import fs from "node:fs";
import path from "node:path";

// Blog posts are JSON files in content/blog/, written by the daily blog bot (scripts/blog-bot/).
// Shape: { slug, title, description, date (ISO), category, tags[], body[], sources[] }
// body blocks: { type: "p" | "h2", text } or { type: "ul", items: [] }.

const DIR = path.join(process.cwd(), "content", "blog");

export const BLOG_CATEGORIES = {
  esports: "Indian esports",
  gta: "GTA",
  games: "Games & releases",
  mobile: "Mobile gaming",
  industry: "Gaming industry",
  business: "Esports business",
  cafes: "Gaming cafes",
  hardware: "PC & hardware",
};

function readPost(file) {
  const post = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"));
  return { ...post, slug: post.slug || file.replace(/\.json$/, "") };
}

export function getAllPosts() {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug) {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

export function readingMinutes(post) {
  const words = post.body
    .map((b) => (b.items ? b.items.join(" ") : b.text || ""))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
