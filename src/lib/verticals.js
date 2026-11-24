// URLs and copy shared by the Book (gaming cafes) and Store (marketplace) verticals.
// Readable, keyword-first URLs: /book/<cafe-name>-<area>-<id> and /marketplace/<product-name>-<id>.

export const BOOK = {
  id: "book",
  name: "Hash Book",
  short: "Book",
  root: "/book",
  tagline: "Book gaming cafes near you",
};

export const STORE = {
  id: "store",
  name: "Hash Marketplace",
  short: "Marketplace",
  root: "/marketplace",
  tagline: "Gaming gear and services",
};

export function slugify(text) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/** First meaningful locality from the cafe's address ("Andheri West, Maharashtra" -> "Andheri West"). */
export function cafeLocality(cafe) {
  return String(cafe?.area || "").split(",")[0].trim();
}

export function cafePath(cafe) {
  const slug = slugify([cafe.name, cafeLocality(cafe)].filter(Boolean).join(" "));
  return `${BOOK.root}/${slug ? `${slug}-` : ""}${cafe.id}`;
}

/** "/book/xyz-gaming-cafe-andheri-12" or the legacy "/book/12" -> 12 */
export function cafeIdFromSlug(slug) {
  const m = /(?:^|-)(\d{1,9})$/.exec(String(slug || ""));
  return m ? Number(m[1]) : null;
}

export function productPath(product) {
  const slug = slugify(product.title);
  return `${STORE.root}/${slug ? `${slug}-` : ""}${product.id}`;
}

export function productIdFromSlug(slug) {
  const m = /(prod_[A-Za-z0-9]+)$/.exec(String(slug || ""));
  return m ? m[1] : null;
}

export const CONSOLE_LABEL = {
  pc: "PC",
  ps: "PlayStation",
  playstation: "PlayStation",
  xbox: "Xbox",
  vr: "VR",
  racing: "Racing sim",
  other: "Gaming",
};

/** Keeps campaign params (utm_*, ref, gclid...) when redirecting to the canonical URL. */
export function withQuery(path, searchParams) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    if (/^(utm_[a-z]+|ref|gclid|fbclid|src)$/.test(key) && typeof value === "string") qs.set(key, value.slice(0, 100));
  }
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}
