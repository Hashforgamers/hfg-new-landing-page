// Visual walk-through of every player flow (book, marketplace, account) at
// phone, tablet and desktop widths, against the mock backends.
//
//   NEXT_PUBLIC_HFG_SECURE_PINS=<pin> npm run build
//   TEST_IDENTITY_PEM="$(cat key.pem)" MOCK_RICH=1 node tests/e2e/flows.mjs <out-dir>
//
// Writes one screenshot per step and a layout report (horizontal overflow,
// overlapping controls, console errors) to <out-dir>/report.json.
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createMockBackends, firebaseIdToken, PROJECT_ID, BACKEND_JWT_SECRET, BACKEND_PUBLIC_PEM } from "./mock-backends.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || "playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.resolve(process.argv[2] || "/tmp/flows");
const only = process.argv[3] ? process.argv[3].split(",") : null;
fs.mkdirSync(out, { recursive: true });
const BASE = "http://localhost:3100";

const privateKey = crypto.createPrivateKey(process.env.TEST_IDENTITY_PEM);
const cookieKeys = `c1:${crypto.randomBytes(32).toString("base64")}`;
const mock = createMockBackends();
await new Promise((r) => mock.server.listen(4010, r));
const env = {
  ...process.env,
  NODE_ENV: "production",
  HFG_SECURE_IDENTITY_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }),
  HFG_SECURE_TICKET_KEYS: `t1:${crypto.randomBytes(32).toString("base64")}`,
  HFG_SESSION_COOKIE_KEYS: cookieKeys,
  HFG_ALLOWED_ORIGINS: BASE,
  HFG_USER_ONBOARD_URL: "http://localhost:4010",
  HFG_BOOKING_URL: "http://localhost:4010",
  HFG_VENDOR_URL: "http://localhost:4010",
  HASH_MEDUSA_URL: "http://localhost:4010",
  FIREBASE_PROJECT_ID: PROJECT_ID,
  HFG_ALLOW_TEST_OVERRIDES: "true",
  FIREBASE_JWKS_URL_OVERRIDE: "http://localhost:4010/jwks",
  RAZORPAY_KEY_ID: "rzp_test_key",
  HFG_SERVICE_JWT_SECRET: BACKEND_JWT_SECRET,
  WALLET_CREDIT_INTERNAL_TOKEN: "test-credit-token",
  HFG_SERVICE_PUBLIC_KEY: BACKEND_PUBLIC_PEM,
};
const web = spawn(path.join(root, "node_modules/.bin/next"), ["start", "-p", "3100"], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
web.stdout.on("data", (d) => (serverLog += d));
web.stderr.on("data", (d) => (serverLog += d));
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(`${BASE}/robots.txt`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 300));
}

const VIEWPORTS = [
  ["phone", { width: 390, height: 844 }],
  ["tablet", { width: 820, height: 1180 }],
  ["desktop", { width: 1440, height: 900 }],
  ["wide", { width: 1920, height: 1080 }],
].filter(([name]) => !process.env.VIEWPORTS || process.env.VIEWPORTS.split(",").includes(name));
const tomorrowLabel = "Tomorrow";
const report = [];

/** Layout checks run inside the page. */
async function inspect(page) {
  return page.evaluate(() => {
    const issues = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1) issues.push(`page scrolls sideways: ${document.documentElement.scrollWidth}px > ${vw}px`);
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05;
    };
    // Elements poking out past the right edge (ignoring intentional scrollers).
    for (const el of document.querySelectorAll("main *")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && !el.closest("[data-scroller], .overflow-x-auto, .overflow-hidden")) {
        issues.push(`offscreen: <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> right=${Math.round(r.right)}`);
        if (issues.length > 12) break;
      }
    }
    // Interactive controls overlapping each other.
    const ctrls = [...document.querySelectorAll("a, button, input, select")].filter(visible);
    const rects = ctrls.map((el) => [el, el.getBoundingClientRect()]);
    let overlaps = 0;
    for (let i = 0; i < rects.length && overlaps < 8; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const [a, ra] = rects[i];
        const [b, rb] = rects[j];
        if (a.contains(b) || b.contains(a)) continue;
        const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (x > 4 && y > 4) {
          const fixed = (el) => { for (let n = el; n; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === "fixed" || p === "sticky") return true; } return false; };
          if (fixed(a) !== fixed(b)) continue; // sticky bars legitimately float over content
          overlaps++;
          issues.push(`overlap: "${(a.innerText || a.getAttribute("aria-label") || a.tagName).trim().slice(0, 30)}" × "${(b.innerText || b.getAttribute("aria-label") || b.tagName).trim().slice(0, 30)}"`);
          if (overlaps >= 8) break;
        }
      }
    }
    // Nested interactive elements (<a><button>) are invalid and break focus.
    const nested = document.querySelectorAll("a button, button a, a a, button button").length;
    if (nested) issues.push(`nested interactive elements: ${nested}`);
    // Text clipped by its box.
    for (const el of document.querySelectorAll("main button, main a")) {
      if (visible(el) && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") issues.push(`clipped text: "${el.innerText.trim().slice(0, 30)}"`);
    }
    const mains = document.querySelectorAll("main").length;
    if (mains > 1) issues.push(`${mains} <main> elements`);
    return issues;
  });
}

async function login(context) {
  // Do the real encrypted handshake + auth.login from Node, then hand the
  // sealed session cookie to the browser (the Firebase popup can't run here).
  process.env.NEXT_PUBLIC_HFG_SECURE_PINS = process.env.NEXT_PUBLIC_HFG_SECURE_PINS || "";
  const jar = new Map();
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const full = typeof url === "string" && url.startsWith("/") ? `${BASE}${url}` : url;
    const headers = new Headers(init.headers || {});
    headers.set("Origin", BASE);
    if (jar.size) headers.set("Cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    const { keepalive, credentials, ...rest } = init;
    void keepalive; void credentials;
    const res = await real(full, { ...rest, headers });
    for (const c of res.headers.getSetCookie?.() || []) {
      const [pair] = c.split(";");
      const [k, ...v] = pair.split("=");
      if (v.join("=")) jar.set(k.trim(), v.join("="));
    }
    return res;
  };
  const src = fs.readFileSync(path.join(root, "src/lib/secure/client.js"), "utf8");
  const tmp = path.join(here, `.client-${crypto.randomBytes(4).toString("hex")}.mjs`);
  fs.writeFileSync(tmp, src);
  try {
    const { secureCall } = await import(tmp);
    await secureCall("auth.login", { idToken: firebaseIdToken({ uid: "fid-existing-1", email: "p@example.com", provider: "google.com" }) });
  } finally {
    fs.unlinkSync(tmp);
    globalThis.fetch = real;
  }
  const auth = [...jar].find(([k]) => k.includes("hfg_auth"));
  if (!auth) throw new Error("login failed: no session cookie");
  await context.addCookies([{ name: auth[0], value: auth[1], domain: "localhost", path: "/", secure: true, httpOnly: true, sameSite: "Strict" }]);
}

async function newContext(browser, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const local = ["hero-poster.jpg", "retro-car.jpg", "og-home.jpg"];
  let n = 0;
  await ctx.route(/res\.cloudinary\.com/, (r) => {
    // Optional per-photo fixtures (e.g. one set per colour) by file name; else cycle the site artwork.
    const own = process.env.FIXTURES && path.join(process.env.FIXTURES, path.basename(new URL(r.request().url()).pathname));
    if (own && fs.existsSync(own)) return r.fulfill({ path: own });
    return r.fulfill({ path: path.join(root, "public/images", local[n++ % local.length]) });
  });
  // Fake Razorpay: "pays" instantly with a valid test signature.
  await ctx.exposeBinding("__rzpSign", (_src, orderId) => {
    const paymentId = `pay_${crypto.randomBytes(5).toString("hex")}`;
    return { paymentId, signature: crypto.createHmac("sha256", "rzp_secret").update(`${orderId}|${paymentId}`).digest("hex") };
  });
  await ctx.route(/checkout\.razorpay\.com/, (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `window.Razorpay = function (o) { this.o = o; };
        window.Razorpay.prototype.on = function () {};
        window.Razorpay.prototype.open = async function () {
          const s = await window.__rzpSign(this.o.order_id);
          setTimeout(() => this.o.handler({ razorpay_payment_id: s.paymentId, razorpay_order_id: this.o.order_id, razorpay_signature: s.signature }), 300);
        };`,
    }),
  );
  return ctx;
}

const browser = await chromium.launch();
try {
  for (const [vname, viewport] of VIEWPORTS) {
    if (only && !only.includes(vname)) continue;
    let step = 0;
    const ctx = await newContext(browser, viewport);
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && !/favicon|Failed to load resource/.test(m.text()) && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    async function shot(name, { full = true } = {}) {
      await page.waitForTimeout(500);
      step++;
      const file = `${vname}-${String(step).padStart(2, "0")}-${name}.png`;
      await page.screenshot({ path: path.join(out, file), fullPage: full });
      const issues = await inspect(page);
      report.push({ viewport: vname, step: file, url: page.url().replace(BASE, ""), issues, errors: errors.splice(0) });
    }
    const go = (url) => page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
    const click = async (locator) => {
      await locator.first().scrollIntoViewIfNeeded().catch(() => {});
      await locator.first().click({ timeout: 5000 });
    };

    // ---- Book: logged out
    await go("/book");
    await shot("book-landing");
    if (process.env.MOCK_RICH) {
      await go("/book/23");
      await shot("cafe-no-photos", { full: false });
      await go("/book");
    }
    await click(page.locator("#cafes a[href^='/book/']"));
    await page.waitForLoadState("networkidle");
    await shot("cafe-page");
    await go("/book/7");
    await page.waitForLoadState("networkidle");
    const aside = page.locator("#book");
    await click(aside.getByRole("button", { name: /PS5|PC|Xbox/ }));
    await click(aside.getByRole("button", { name: tomorrowLabel }));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot("cafe-booking-started", { full: false });
    await page.evaluate(() => window.scrollTo(0, 700));
    await shot("cafe-booking-scrolled", { full: false });
    await click(aside.locator("[aria-label='Time'] button:not([disabled]), section[aria-label='Date and time'] .grid button:not([disabled])"));
    await page.waitForTimeout(900);
    await aside.scrollIntoViewIfNeeded();
    await shot("cafe-slot-picked-logged-out", { full: false });
    await shot("cafe-slot-picked-full");
    await click(aside.getByRole("button", { name: /Sign in to book/ }));
    await page.waitForURL(/\/login/);
    await page.waitForLoadState("networkidle");
    // Coming from a scrolled cafe page, sign-in must open at the top.
    const loginScroll = await page.evaluate(() => window.scrollY);
    if (loginScroll > 0) throw new Error(`login opened scrolled to ${loginScroll}px`);
    await shot("login");

    // ---- Log in, come back: draft should restore
    // Signing in sends the player back to the cafe with their pick restored.
    const loginUrl = page.url();
    await login(ctx);
    await page.goto(loginUrl, { waitUntil: "networkidle" });
    await page.waitForURL(/\/book\//);
    await page.waitForTimeout(1500);
    await aside.scrollIntoViewIfNeeded();
    await shot("cafe-after-login", { full: false });
    // pick a slot if the draft didn't restore
    if (!(await aside.getByRole("button", { name: /Pay|Confirm booking/ }).count())) {
      await click(aside.getByRole("button", { name: /PS5|PC|Xbox/ }));
      await click(aside.getByRole("button", { name: tomorrowLabel }));
      await page.waitForTimeout(800);
      await click(aside.locator("section[aria-label='Date and time'] .grid button:not([disabled])"));
      await page.waitForTimeout(900);
    }
    await click(aside.getByRole("button", { name: /^Pay|Confirm booking/ }));
    await page.waitForTimeout(2500);
    await aside.scrollIntoViewIfNeeded();
    await shot("booking-confirmed", { full: false });

    // ---- Account
    await go("/account");
    await page.waitForTimeout(800);
    await shot("account-bookings");
    await go("/account#passes");
    await page.waitForTimeout(900);
    await shot("account-passes-catalog");
    await click(page.getByRole("button", { name: /^Wallet/ }).first());
    await page.waitForTimeout(1200);
    await shot("account-passes-owned");
    await go("/account#wallet");
    await page.waitForTimeout(800);
    await shot("account-wallet");
    // With a Neon Arena pass, booking there offers "Pay with" the pass.
    await go("/book/neon-arena-bandra-7");
    await page.waitForTimeout(1200);
    await click(aside.getByRole("button", { name: /PS5|PC|Xbox/ }));
    await click(aside.getByRole("button", { name: tomorrowLabel }));
    await page.waitForTimeout(800);
    await click(aside.locator("section[aria-label='Date and time'] .grid button:not([disabled])"));
    await page.waitForTimeout(900);
    await aside.scrollIntoViewIfNeeded();
    await shot("cafe-pay-with-pass");
    await go("/account#orders");
    await page.waitForTimeout(800);
    await shot("account-orders-via-link");

    // ---- Marketplace
    await go("/marketplace");
    await shot("marketplace");
    await click(page.locator("#shop a[href$='prod_1']"));
    await page.waitForLoadState("networkidle");
    await shot("product");
    // Colour pick switches the photos to that colour's set.
    const blue = page.getByRole("button", { name: /^Color Blue/ });
    if (await blue.count()) {
      await click(blue);
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("product-blue", { full: false });
    }
    await click(page.getByRole("button", { name: "Add to cart" }));
    await page.waitForTimeout(1000);
    await shot("product-added", { full: false });
    await go("/marketplace/cart");
    await page.waitForTimeout(1000);
    await shot("cart");
    const fill = async (label, value) => page.getByLabel(label, { exact: true }).fill(value);
    await fill("First name", "Asha");
    await fill("Address", "12 MG Road");
    await fill("City", "Bengaluru");
    await fill("State", "Karnataka");
    await fill("PIN code", "560001");
    await fill("Phone", "9876543210");
    await click(page.getByRole("button", { name: /Save address and continue/ }));
    await page.waitForTimeout(1200);
    await shot("cart-delivery");
    await click(page.getByRole("button", { name: /^Pay/ }));
    await page.waitForTimeout(3500);
    await shot("order-placed");
    const track = page.getByRole("link", { name: /Track order/ }).or(page.getByRole("button", { name: /Track order/ }));
    if (await track.count()) {
      await click(track);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await shot("order-tracker");
    }

    // ---- Mobile menu
    if (vname === "phone") {
      await go("/book");
      await click(page.getByRole("button", { name: "Open menu" }));
      await shot("menu", { full: false });
    }
    await ctx.close();
  }
  // ---- Site header at every desktop width: nothing wraps, nothing touches the logo.
  if (!only || only.includes("header")) {
    for (const width of [1024, 1280, 1440, 1920]) {
      const ctx = await newContext(browser, { width, height: 900 });
      const page = await ctx.newPage();
      for (const url of ["/blog", "/book", "/marketplace"]) {
        await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(400);
        const file = `header-${width}${url.replace(/\//g, "_")}.png`;
        await page.screenshot({ path: path.join(out, file), clip: { x: 0, y: 0, width, height: 110 } });
        const issues = await page.evaluate(() => {
          const nav = document.querySelector('header nav[aria-label="Main"]');
          if (!nav) return ["no main nav"];
          const out = [];
          const items = [...nav.querySelectorAll("a, button")].filter((el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== "none");
          for (const el of items) {
            const r = el.getBoundingClientRect();
            const lh = parseFloat(getComputedStyle(el).lineHeight) || 16;
            if (r.height > lh * 1.8 && !el.querySelector("img, svg")) out.push(`wraps: "${el.innerText.trim()}"`);
          }
          for (let i = 0; i < items.length; i++)
            for (let j = i + 1; j < items.length; j++) {
              const a = items[i].getBoundingClientRect(), b = items[j].getBoundingClientRect();
              if (items[i].contains(items[j]) || items[j].contains(items[i])) continue;
              const gap = Math.max(a.left, b.left) - Math.min(a.right, b.right);
              const sameRow = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4;
              if (sameRow && gap < 8) out.push(`too close: "${items[i].innerText.trim() || items[i].getAttribute("aria-label")}" / "${items[j].innerText.trim() || items[j].getAttribute("aria-label")}" (${Math.round(gap)}px)`);
            }
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) out.push("page scrolls sideways");
          return out;
        });
        report.push({ viewport: `header-${width}`, step: file, url, issues, errors: [] });
      }
      await ctx.close();
    }
  }
} catch (err) {
  console.error("FLOW FAILED:", err.message);
  report.push({ fatal: err.message });
} finally {
  await browser.close();
  web.kill();
  mock.server.close();
  fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  for (const r of report) {
    if (r.fatal) console.log("FATAL", r.fatal);
    else if (r.issues.length || r.errors.length) console.log(r.step, r.url, "\n   ", [...r.issues, ...r.errors.map((e) => `console: ${e.slice(0, 160)}`)].join("\n    "));
    else console.log(r.step, "ok");
  }
  if (process.env.SHOW_SERVER_LOG) console.log(serverLog.slice(-3000));
}
