import "server-only";
import { upstream, UpstreamError } from "@/lib/server/upstream";
import { peekJwt } from "@/lib/server/jwt-peek";
import { clean, v } from "@/lib/server/validate";
import { hit } from "@/lib/secure/store";
import { hfgToken } from "@/lib/server/hfg-token";

/*
 * Hash Marketplace (Medusa 2) storefront, following
 * medusa-marketplace-demo/docs/HFG-STORE-API.md, HFG-DELIVERY-CHECKOUT.md and
 * HFG-RAZORPAY-CHECKOUT.md. The browser never sees the Medusa customer token
 * or the cart id; both live in the sealed session cookie.
 */

let configCache = null;
export async function storeConfig(requestId) {
  if (configCache && configCache.exp > Date.now()) return configCache.value;
  const { data } = await upstream("medusa", "/hash-store/config", { requestId, headers: { "X-Client-Source": "app" } });
  if (data?.version !== 1 || !String(data.publishable_api_key || "").startsWith("pk_") || !data.region_id || !data.sales_channel_id) {
    throw new UpstreamError(503, "The marketplace is temporarily unavailable. Please try again.");
  }
  configCache = { value: data, exp: Date.now() + 5 * 60_000 };
  return data;
}

async function medusa(ctx, path, { method = "GET", body, auth = false, retryOnKey = true } = {}) {
  const config = await storeConfig(ctx.requestId);
  try {
    const { data } = await upstream("medusa", path, {
      method,
      body,
      requestId: ctx.requestId,
      token: auth ? await customerToken(ctx) : undefined,
      headers: { "x-publishable-api-key": config.publishable_api_key },
      timeoutMs: 30000,
    });
    return data;
  } catch (error) {
    // Key rotated: refetch config once (reads only - writes are never replayed).
    if (retryOnKey && method === "GET" && error instanceof UpstreamError && error.status === 400 && /publishable/i.test(error.message)) {
      configCache = null;
      return medusa(ctx, path, { method, body, auth, retryOnKey: false });
    }
    if (auth && error instanceof UpstreamError && error.status === 401) {
      ctx.updateSession({ medusa: undefined, medusaExp: undefined });
    }
    throw error;
  }
}

async function exchange(ctx) {
  const { data } = await upstream("medusa", "/auth/customer/hfg", {
    method: "POST",
    body: { token: hfgToken(ctx) },
    requestId: ctx.requestId,
  });
  if (!data?.token) throw new UpstreamError(502, "Store sign-in failed. Please try again.");
  return data.token;
}

/** HFG token -> Medusa customer token, registering the commerce profile on first use. */
async function customerToken(ctx) {
  const now = Math.floor(Date.now() / 1000);
  if (ctx.session.medusa && ctx.session.medusaExp > now + 60) return ctx.session.medusa;
  const config = await storeConfig(ctx.requestId);
  let token = await exchange(ctx);
  if (!peekJwt(token).actor_id) {
    const profile = {};
    if (ctx.session.name) profile.first_name = clean(ctx.session.name).slice(0, 60);
    if (ctx.session.email) profile.email = ctx.session.email;
    if (/^\+?\d{8,15}$/.test(ctx.session.phone || "")) profile.phone = ctx.session.phone;
    try {
      await upstream("medusa", "/store/customers", {
        method: "POST",
        body: profile,
        token,
        requestId: ctx.requestId,
        headers: { "x-publishable-api-key": config.publishable_api_key },
      });
    } catch (error) {
      // A concurrent first-use may have created it already; re-exchange decides.
      if (!(error instanceof UpstreamError && [400, 409, 422].includes(error.status))) throw error;
    }
    token = await exchange(ctx);
    if (!peekJwt(token).actor_id) throw new UpstreamError(502, "Store account setup is still finishing. Please retry.");
    ctx.track("Store Account Created", {});
  }
  const exp = Number(peekJwt(token).exp) || now + 3600;
  ctx.updateSession({ medusa: token, medusaExp: Math.min(exp, ctx.session.exp) });
  return token;
}

/* -------------------------------------------------------- shaping */
const https = (u) => typeof u === "string" && u.startsWith("https://");
const money = (n) => (Number.isFinite(Number(n)) && Number(n) > 0 ? Number(n) : 0);

/** Card price: the live offer price when Hash computed one, else the list price. */
function cardPricing(pricing, fallback) {
  const now = money(pricing?.calculated_amount) || money(fallback);
  const was = money(pricing?.original_amount);
  return { price: now, mrp: was > now ? was : 0 };
}

export function productCard(p) {
  const { price, mrp } = cardPricing(p.pricing, p.price_inr);
  const colors = [];
  for (const variant of p.variants || []) {
    const c = variant?.options?.color;
    if (typeof c === "string" && c && !colors.includes(c)) colors.push(c);
  }
  const category = (p.categories || [])[0];
  return {
    id: p.product_id,
    variantId: p.variant_id,
    title: p.title,
    description: (p.description || "").slice(0, 400),
    kind: p.kind,
    vendorId: p.vendor_id,
    vendorName: p.vendor_name,
    price,
    mrp,
    available: Number(p.available || 0),
    thumbnail: https(p.thumbnail) ? p.thumbnail : https(p.gallery?.[0]?.url) ? p.gallery[0].url : "",
    rating: p.rating_summary ? { average: Number(p.rating_summary.average || 0), count: Number(p.rating_summary.count || 0) } : null,
    offer: p.offer || p.card_offer || null,
    category: category?.name || "",
    categoryId: category?.id || "",
    colors: colors.slice(0, 8),
    variantCount: (p.variants || []).length || 1,
  };
}

function cartView(cart) {
  if (!cart) return null;
  return {
    id: undefined, // never exposed
    email: cart.email || "",
    currency: cart.currency_code,
    items: (cart.items || []).map((i) => ({
      id: i.id,
      title: i.product_title || i.title,
      variantTitle: i.variant_title,
      thumbnail: i.thumbnail || "",
      quantity: i.quantity,
      unitPrice: Number(i.unit_price || 0),
      total: Number(i.total ?? i.subtotal ?? 0),
      productId: i.product_id,
    })),
    subtotal: Number(cart.item_subtotal ?? cart.subtotal ?? 0),
    shipping: Number(cart.shipping_total || 0),
    tax: Number(cart.tax_total || 0),
    discount: Number(cart.discount_total || 0),
    total: Number(cart.total || 0),
    shippingAddress: cart.shipping_address
      ? {
          first_name: cart.shipping_address.first_name || "",
          last_name: cart.shipping_address.last_name || "",
          address_1: cart.shipping_address.address_1 || "",
          address_2: cart.shipping_address.address_2 || "",
          city: cart.shipping_address.city || "",
          province: cart.shipping_address.province || "",
          postal_code: cart.shipping_address.postal_code || "",
          phone: cart.shipping_address.phone || "",
        }
      : null,
    hasShippingMethod: Boolean(cart.shipping_methods?.length),
  };
}

function requireCart(ctx) {
  if (!ctx.session.cartId) {
    const e = new Error("Your cart is empty.");
    e.status = 404;
    throw e;
  }
  return ctx.session.cartId;
}

function parseAddress(raw) {
  const a = v.object(raw, "address");
  return {
    first_name: clean(v.str(a.first_name, "first name", { max: 60 })),
    last_name: clean(v.optStr(a.last_name, "last name", { max: 60 })),
    address_1: clean(v.str(a.address_1, "address", { min: 4, max: 160 })),
    address_2: clean(v.optStr(a.address_2, "address line 2", { max: 160 })),
    city: clean(v.str(a.city, "city", { max: 60 })),
    province: clean(v.str(a.province, "state", { max: 60 })),
    postal_code: v.str(a.postal_code, "PIN code", { pattern: /^[1-9][0-9]{5}$/ }),
    country_code: "in",
    phone: v.phone(a.phone),
  };
}

async function loadCart(ctx) {
  const cartId = ctx.session.cartId;
  if (!cartId) return null;
  try {
    const data = await medusa(ctx, `/store/carts/${encodeURIComponent(cartId)}`, { auth: true });
    if (data?.cart?.completed_at) {
      ctx.updateSession({ cartId: undefined });
      return null;
    }
    return data?.cart || null;
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) {
      ctx.updateSession({ cartId: undefined });
      return null;
    }
    throw error;
  }
}

/* ------------------------------------------------------------- ops */
/* ------------------------------------------------------- catalogue */
const catalogCache = new Map();
async function cachedCatalog(key, ttlMs, loader) {
  const entry = catalogCache.get(key);
  if (entry && entry.exp > Date.now()) return entry.value;
  const value = await loader();
  catalogCache.set(key, { value, exp: Date.now() + ttlMs });
  if (catalogCache.size > 300) catalogCache.delete(catalogCache.keys().next().value);
  return value;
}

/** Raw Hash catalogue rows (gallery, specifications, variants), cached. */
async function loadCatalog(requestId) {
  return cachedCatalog("catalog", 5 * 60_000, async () => {
    const ctx = { requestId };
    const all = [];
    for (let offset = 0; offset < 1000; offset += 100) {
      const data = await medusa(ctx, `/store/hash/products?limit=100&offset=${offset}`);
      const page = data?.products || [];
      all.push(...page);
      if (page.length < 100 || all.length >= Number(data?.count || 0)) break;
    }
    return all;
  });
}

/** Every listed product (public), for the server-rendered store pages and the sitemap. */
export async function loadProducts(requestId) {
  return (await loadCatalog(requestId)).map(productCard);
}

/** Category specification definitions ({key, label, unit, type}) by key, as the app uses them. */
async function loadSpecDefinitions(requestId) {
  return cachedCatalog("categories", 10 * 60_000, async () => {
    try {
      const data = await medusa({ requestId }, "/store/hash/categories");
      return (data?.categories || []).map((c) => ({ id: c.id, name: c.name, handle: c.handle, specifications: Array.isArray(c.specifications) ? c.specifications : [] }));
    } catch {
      return [];
    }
  });
}

/** Public categories for the store filters. */
export async function loadCategories(requestId) {
  return (await loadSpecDefinitions(requestId)).map(({ id, name, handle }) => ({ id, name, handle }));
}

function specText(value, def) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.filter((x) => x !== "" && x != null).join(", ");
  if (typeof value === "number") return def?.unit ? `${value} ${def.unit}` : String(value);
  if (typeof value === "string") return value.trim();
  return "";
}

/** One product with its gallery and full description, or null. */
const DETAIL_FIELDS = [
  "*images",
  "*options",
  "*options.values",
  "*variants",
  "*variants.options",
  "*variants.calculated_price",
  "+variants.inventory_quantity",
  "+variants.manage_inventory",
  "+variants.allow_backorder",
  "*categories",
  "*type",
  "*tags",
  "+metadata",
  "+weight",
  "+length",
  "+width",
  "+height",
  "+material",
  "+origin_country",
].join(",");

// Metadata keys that are internal plumbing, not product facts.
const HIDDEN_META = /^(hash|vendor|seller|listing|approval|review|cloudinary|_|sku$|brand$|spec)/i;

function titleCase(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/** Spec rows from the product's own fields and its public metadata. */
function specRows(p) {
  const rows = [];
  const push = (label, value) => {
    const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
    if (text && text.length <= 200 && !rows.some((r) => r.label === label)) rows.push({ label, value: text });
  };
  push("Brand", p.metadata?.brand);
  // Structured specs if the seller supplied them: {"specs": {"DPI": "26000"}} or [{label, value}].
  const specs = p.metadata?.specs || p.metadata?.specifications;
  if (Array.isArray(specs)) specs.forEach((s) => s && push(titleCase(s.label || s.name || ""), s.value));
  else if (specs && typeof specs === "object") Object.entries(specs).forEach(([k, v]) => push(titleCase(k), v));
  for (const [k, v] of Object.entries(p.metadata || {})) {
    if (!HIDDEN_META.test(k) && (typeof v === "string" || typeof v === "number")) push(titleCase(k), v);
  }
  if (p.material) push("Material", p.material);
  if (p.weight) push("Weight", `${p.weight} g`);
  if (p.length && p.width && p.height) push("Dimensions", `${p.length} × ${p.width} × ${p.height} mm`);
  if (p.origin_country) push("Country of origin", String(p.origin_country).toUpperCase());
  if (p.categories?.length) push("Category", p.categories.map((c) => c.name).join(", "));
  return rows.slice(0, 24);
}

function variantView(variant, card) {
  const price = Number(variant.calculated_price?.calculated_amount ?? NaN);
  const managed = variant.manage_inventory !== false;
  const stock = managed && typeof variant.inventory_quantity === "number" ? Math.max(0, variant.inventory_quantity) : null;
  return {
    id: variant.id,
    title: variant.title || "",
    options: Object.fromEntries((variant.options || []).filter((o) => o?.option?.title || o?.option_id).map((o) => [o.option?.title || o.option_id, o.value])),
    price: Number.isFinite(price) && price > 0 ? price : card.price,
    // The listing's own variant uses the Hash listing stock; others use Medusa inventory.
    available: variant.id === card.variantId ? card.available : stock ?? (variant.allow_backorder ? 10 : card.available),
    mrp: 0,
    images: https(variant.metadata?.image) ? [variant.metadata.image] : [],
  };
}

/** Product detail from the Hash catalogue: per-colour photos, SKU options and specifications. */
function hashDetail(raw, card, categories) {
  const defs = new Map();
  for (const c of categories) {
    if (!(raw.categories || []).some((x) => x.id === c.id)) continue;
    for (const d of c.specifications) if (d?.key && !defs.has(d.key)) defs.set(d.key, d);
  }
  const label = (key) => defs.get(key)?.label || titleCase(key);
  const variants = (raw.variants || [])
    .filter((v) => v?.id)
    .map((v) => {
      const { price, mrp } = cardPricing(v.pricing, (v.prices || []).find((x) => x.currency_code === "inr")?.amount);
      return {
        id: v.id,
        title: v.title || "",
        sku: v.sku || "",
        options: v.options && typeof v.options === "object" ? v.options : {},
        price: price || card.price,
        mrp,
        available: Math.max(0, Number(v.available ?? 0)),
        images: (v.images || []).filter(https),
      };
    });
  const axes = Object.keys(variants[0]?.options || {});
  const options = axes
    .map((key) => ({ key, title: label(key), values: [...new Set(variants.map((v) => v.options[key]).filter((x) => typeof x === "string" && x))] }))
    .filter((o) => o.values.length > 1 || variants.length > 1);
  // Specifications in the category's own order (as the app shows them), then any extras.
  const values = raw.specifications && typeof raw.specifications === "object" ? raw.specifications : {};
  const keys = [...[...defs.keys()].filter((k) => k in values), ...Object.keys(values).filter((k) => !defs.has(k))];
  const specs = [];
  for (const key of keys) {
    if (options.some((o) => o.key === key)) continue;
    const text = specText(values[key], defs.get(key));
    if (text && text.length <= 300) specs.push({ label: label(key), value: text });
  }
  const gallery = (raw.gallery || []).map((g) => g?.url).filter(https);
  const images = [...gallery, raw.thumbnail].filter((u, i, all) => https(u) && all.indexOf(u) === i);
  const first = variants.find((v) => v.id === card.variantId) || variants[0];
  return {
    ...card,
    price: first?.price || card.price,
    mrp: first?.mrp || card.mrp,
    description: raw.description || card.description,
    images: images.slice(0, 20),
    subtitle: "",
    category: card.category,
    brand: typeof values.brand === "string" ? values.brand : "",
    model: typeof values.model === "string" ? values.model : "",
    options: variants.length > 1 ? options : [],
    variants: variants.length > 1 ? variants : variants.map((v) => ({ ...v })),
    specs,
  };
}

export async function loadProduct(productId, requestId) {
  if (!/^prod_[A-Za-z0-9]+$/.test(productId)) return null;
  return cachedCatalog(`product:${productId}`, 2 * 60_000, async () => {
    const ctx = { requestId };
    const catalog = await loadCatalog(requestId);
    const raw = catalog.find((p) => p.product_id === productId);
    if (!raw) return null;
    const card = productCard(raw);
    if (Array.isArray(raw.variants) && raw.variants.length) return hashDetail(raw, card, await loadSpecDefinitions(requestId));

    // Older catalogue rows without SKU data: read the Medusa product itself.
    const config = await storeConfig(requestId);
    const base = `/store/products/${productId}?region_id=${encodeURIComponent(config.region_id)}`;
    const detail = await medusa(ctx, `${base}&fields=${encodeURIComponent(DETAIL_FIELDS)}`)
      .catch(() => medusa(ctx, base))
      .catch(() => null);
    const p = detail?.product || {};
    const images = [...(p.images || []).map((i) => i.url), p.thumbnail, card.thumbnail].filter((u, i, all) => https(u) && all.indexOf(u) === i);
    const variants = (p.variants || []).map((v) => variantView(v, card)).filter((v) => v.id);
    const options = (p.options || [])
      .map((o) => ({ key: o.title, title: o.title, values: [...new Set((o.values || []).map((x) => x.value).filter(Boolean))] }))
      .filter((o) => o.title && o.values.length > 1);
    return {
      ...card,
      description: p.description || card.description,
      images: images.slice(0, 12),
      subtitle: p.subtitle || "",
      category: card.category || p.categories?.[0]?.name || p.type?.value || "",
      brand: p.metadata?.brand || "",
      model: "",
      handle: p.handle || "",
      options: variants.length > 1 ? options : [],
      variants: variants.length > 1 ? variants : [],
      specs: specRows(p),
    };
  });
}

export const storeOps = {
  "store.products": {
    auth: "none",
    limit: { perIp: 90 },
    async run(ctx, args) {
      const limit = args.limit ? v.int(args.limit, "limit", { max: 48 }) : 24;
      const offset = args.offset ? v.int(args.offset, "offset", { min: 0, max: 10000 }) : 0;
      const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (args.vendorId) qs.set("vendor_id", v.str(args.vendorId, "vendorId", { max: 60, pattern: /^hv_[A-Za-z0-9_]+$/ }));
      const data = await medusa(ctx, `/store/hash/products?${qs}`);
      return { products: (data?.products || []).map(productCard), count: Number(data?.count || 0), limit, offset };
    },
  },

  "store.product": {
    auth: "none",
    limit: { perIp: 120 },
    async run(ctx, args) {
      const productId = v.str(args.productId, "productId", { max: 60, pattern: /^prod_[A-Za-z0-9]+$/ });
      const product = await loadProduct(productId, ctx.requestId);
      if (!product) {
        const e = new Error("This product is not available right now.");
        e.status = 404;
        throw e;
      }
      ctx.track("Product Viewed", { product_id: productId, vendor_id: product.vendorId, price: product.price });
      return { product };
    },
  },

  "store.cart.get": {
    auth: "user",
    limit: { perIp: 90 },
    async run(ctx) {
      return { cart: cartView(await loadCart(ctx)) };
    },
  },

  "store.cart.add": {
    auth: "user",
    limit: { perIp: 40, perUser: 30 },
    async run(ctx, args) {
      const variantId = v.str(args.variantId, "variantId", { max: 60, pattern: /^variant_[A-Za-z0-9]+$/ });
      const quantity = v.int(args.quantity ?? 1, "quantity", { max: 10 });
      const config = await storeConfig(ctx.requestId);
      let cart = await loadCart(ctx);
      try {
        if (!cart) {
          const body = { region_id: config.region_id, sales_channel_id: config.sales_channel_id, items: [{ variant_id: variantId, quantity }] };
          if (ctx.session.email) body.email = ctx.session.email;
          const data = await medusa(ctx, "/store/carts", { method: "POST", body, auth: true });
          cart = data?.cart;
          ctx.updateSession({ cartId: cart?.id });
        } else {
          const data = await medusa(ctx, `/store/carts/${cart.id}/line-items`, { method: "POST", body: { variant_id: variantId, quantity }, auth: true });
          cart = data?.cart;
        }
      } catch (error) {
        if (error instanceof UpstreamError && /vendor/i.test(error.message)) {
          error.code = "mixed_vendor";
          error.message = "Your cart has items from another seller. Check out or clear it to add this one.";
        }
        throw error;
      }
      ctx.track("Product Added", { variant_id: variantId, quantity });
      return { cart: cartView(cart) };
    },
  },

  "store.cart.update": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx, args) {
      const cartId = requireCart(ctx);
      const itemId = v.str(args.itemId, "itemId", { max: 60, pattern: /^cali_[A-Za-z0-9]+$/ });
      const quantity = v.int(args.quantity, "quantity", { min: 0, max: 10 });
      if (quantity === 0) {
        await medusa(ctx, `/store/carts/${cartId}/line-items/${itemId}`, { method: "DELETE", auth: true });
        ctx.track("Product Removed", {});
      } else {
        await medusa(ctx, `/store/carts/${cartId}/line-items/${itemId}`, { method: "POST", body: { quantity }, auth: true });
      }
      return { cart: cartView(await loadCart(ctx)) };
    },
  },

  "store.cart.clear": {
    auth: "user",
    limit: { perIp: 20 },
    async run(ctx) {
      ctx.updateSession({ cartId: undefined });
      return { cart: null };
    },
  },

  /** Saves the address, prices delivery and selects it. Returns final totals. */
  "store.checkout.prepare": {
    auth: "user",
    limit: { perIp: 20, perUser: 15 },
    async run(ctx, args) {
      const cartId = requireCart(ctx);
      const address = parseAddress(args.address);
      const email = ctx.session.email || v.email(args.email);
      await medusa(ctx, `/store/carts/${cartId}`, {
        method: "POST",
        body: { email, shipping_address: address, billing_address: address },
        auth: true,
      });

      const policy = await medusa(ctx, `/store/hash/carts/${cartId}/delivery`, { auth: true });
      if (policy?.missing_package_product_ids?.length) {
        const e = new Error("The seller hasn't finished delivery details for an item. Please try again later.");
        e.status = 409;
        throw e;
      }
      const options = await medusa(ctx, `/store/shipping-options?cart_id=${cartId}`, { auth: true });
      const option = (options?.shipping_options || []).find((o) => o.provider_id === (policy?.provider_id || "hash_delivery_hash_delivery"));
      if (!option) {
        const e = new Error("Delivery isn't available to this PIN code yet.");
        e.status = 409;
        throw e;
      }
      const calc = await medusa(ctx, `/store/shipping-options/${option.id}/calculate`, {
        method: "POST",
        body: { cart_id: cartId, data: {} },
        auth: true,
      });
      const deliveryAmount = Number(calc?.shipping_option?.calculated_price?.calculated_amount ?? calc?.shipping_option?.amount ?? 0);
      const selected = await medusa(ctx, `/store/carts/${cartId}/shipping-methods`, {
        method: "POST",
        body: { option_id: option.id, data: {} },
        auth: true,
      });
      ctx.track("Checkout Started", { delivery_payer: policy?.payer || "customer" });
      return {
        cart: cartView(selected?.cart),
        delivery: { payer: policy?.payer || "customer", amount: policy?.payer === "seller" ? 0 : deliveryAmount, vendorName: policy?.vendor_name || "" },
      };
    },
  },

  /** Creates the Razorpay session for the cart's current server total. */
  "store.checkout.pay": {
    auth: "user",
    limit: { perIp: 15, perUser: 10 },
    async run(ctx) {
      const cartId = requireCart(ctx);
      const cart = await loadCart(ctx);
      if (!cart?.shipping_methods?.length) {
        const e = new Error("Please confirm your delivery address first.");
        e.status = 409;
        throw e;
      }
      const config = await storeConfig(ctx.requestId);
      const providers = await medusa(ctx, `/store/payment-providers?region_id=${config.region_id}`, { auth: true });
      if (!(providers?.payment_providers || []).some((p) => p.id === "pp_razorpay_razorpay")) {
        const e = new Error("Online payment isn't enabled for the marketplace yet.");
        e.status = 503;
        throw e;
      }
      const collection = await medusa(ctx, "/store/payment-collections", { method: "POST", body: { cart_id: cartId }, auth: true });
      const pcId = collection?.payment_collection?.id;
      const withSession = await medusa(ctx, `/store/payment-collections/${pcId}/payment-sessions`, {
        method: "POST",
        body: { provider_id: "pp_razorpay_razorpay", data: {} },
        auth: true,
      });
      const session = (withSession?.payment_collection?.payment_sessions || []).find((s) => s.provider_id === "pp_razorpay_razorpay");
      const data = session?.data || {};
      if (!data.id || !data.amount || !data.key_id) {
        const e = new Error("Payment could not be started. Please try again.");
        e.status = 502;
        throw e;
      }
      ctx.track("Payment Initiated", { amount: Number(data.amount) / 100, payment_method_selected: "razorpay", flow: "marketplace" });
      return {
        // data.amount is already paise - never multiply again.
        checkout: {
          key: data.key_id,
          orderId: data.id,
          amount: Number(data.amount),
          currency: data.currency || "INR",
          name: "Hash Marketplace",
          description: `${cart.items?.length || 0} item(s)`,
          prefill: { name: ctx.session.name || "", email: cart.email || "", contact: cart.shipping_address?.phone || "" },
        },
        total: Number(cart.total || 0),
      };
    },
  },

  "store.checkout.complete": {
    auth: "user",
    limit: { perIp: 30, perUser: 20 },
    async run(ctx) {
      const cartId = requireCart(ctx);
      const data = await medusa(ctx, `/store/carts/${cartId}/complete`, { method: "POST", body: {}, auth: true });
      if (data?.type === "order" && data.order?.id) {
        ctx.updateSession({ cartId: undefined });
        ctx.track("Order Completed", { order_id: data.order.id, total: Number(data.order.total || 0), currency: data.order.currency_code });
        return { status: "order", orderId: data.order.id, displayId: data.order.display_id };
      }
      // Payment still pending capture: keep the same cart/session and retry.
      return { status: "pending", message: data?.error?.message || "Payment is still being verified. Retrying shortly." };
    },
  },

  "store.orders": {
    auth: "user",
    limit: { perIp: 60 },
    async run(ctx) {
      const data = await medusa(ctx, "/store/orders?limit=20&offset=0&order=-created_at", { auth: true });
      return {
        orders: (data?.orders || []).map((o) => ({
          id: o.id,
          displayId: o.display_id,
          createdAt: o.created_at,
          total: Number(o.total || 0),
          currency: o.currency_code,
          status: o.status,
          items: (o.items || []).map((i) => ({ title: i.product_title || i.title, quantity: i.quantity, thumbnail: i.thumbnail || "" })),
        })),
      };
    },
  },

  "store.order": {
    auth: "user",
    limit: { perIp: 120 },
    async run(ctx, args) {
      const orderId = v.str(args.orderId, "orderId", { max: 60, pattern: /^order_[A-Za-z0-9]+$/ });
      const [detail, hash] = await Promise.all([
        medusa(ctx, `/store/orders/${orderId}`, { auth: true }),
        medusa(ctx, `/store/hash/orders/${orderId}`, { auth: true }).catch((error) => {
          if (error instanceof UpstreamError && error.status === 404) return null; // reconciliation lag
          throw error;
        }),
      ]);
      const o = detail?.order || {};
      const h = hash?.order || {};
      const tracking = hash?.tracking || h.tracking || null;
      return {
        order: {
          id: o.id,
          displayId: o.display_id,
          createdAt: o.created_at,
          total: Number(o.total || 0),
          currency: o.currency_code,
          items: (o.items || []).map((i) => ({ title: i.product_title || i.title, quantity: i.quantity, total: Number(i.total || 0), thumbnail: i.thumbnail || "" })),
          address: tracking?.delivery_address || o.shipping_address || null,
          paid: Boolean(h.paid),
          completedAt: h.completed_at || null,
          completionEligible: Boolean(h.completion_eligible),
          stage: tracking?.status || null,
          kind: tracking?.kind || null,
          onHold: Boolean(tracking?.on_hold),
          courier: tracking?.courier || "",
          trackingNumber: tracking?.tracking_number || "",
          expectedDelivery: tracking?.expected_delivery || "",
          cancellation: tracking?.cancellation ? { status: tracking.cancellation.status } : null,
          timeline: (tracking?.timeline || [])
            .map((t) => ({ id: String(t.id), status: t.status, at: t.at, note: typeof t.note === "string" ? t.note.slice(0, 300) : "" }))
            .sort((a, b) => String(a.at).localeCompare(String(b.at))),
          trackingUrl: typeof tracking?.tracking_url === "string" && tracking.tracking_url.startsWith("https://") ? tracking.tracking_url : "",
        },
      };
    },
  },

  "store.order.cancel": {
    auth: "user",
    limit: { perIp: 10, perUser: 5 },
    async run(ctx, args) {
      const orderId = v.str(args.orderId, "orderId", { max: 60, pattern: /^order_[A-Za-z0-9]+$/ });
      const reason = clean(v.str(args.reason, "reason", { min: 3, max: 300 }));
      const data = await medusa(ctx, `/store/hash/orders/${orderId}/cancellation`, { method: "POST", body: { reason }, auth: true });
      ctx.track("Order Cancellation Requested", { order_id: orderId });
      return { cancellation: { status: data?.cancellation?.status || "requested" } };
    },
  },

  "store.order.otp": {
    auth: "user",
    limit: { perIp: 10, perUser: 5 },
    async run(ctx, args) {
      const orderId = v.str(args.orderId, "orderId", { max: 60, pattern: /^order_[A-Za-z0-9]+$/ });
      const perOrder = await hit(`otp:${ctx.session.uid}:${orderId}`, 2, 60);
      if (!perOrder.allowed) {
        const e = new Error("Please wait a minute before requesting another code.");
        e.status = 429;
        throw e;
      }
      const data = await medusa(ctx, `/store/hash/orders/${orderId}/otp`, { method: "POST", body: {}, auth: true });
      ctx.track("Completion OTP Requested", { order_id: orderId });
      return { code: data?.code, expiresAt: data?.expires_at, instruction: data?.instruction };
    },
  },
};
