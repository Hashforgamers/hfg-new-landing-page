// Visual smoke test: renders the new pages against the mock backends.
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || "playwright");
import { createMockBackends, firebaseIdToken, PROJECT_ID } from "./mock-backends.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = process.argv[2] || "/tmp";
// Build with NEXT_PUBLIC_HFG_SECURE_PINS matching TEST_IDENTITY_PEM (pins are inlined at build time).
const privateKey = crypto.createPrivateKey(process.env.TEST_IDENTITY_PEM);
const mock = createMockBackends();
await new Promise((r) => mock.server.listen(4010, r));
const env = {
  ...process.env, NODE_ENV: "production",
  HFG_SECURE_IDENTITY_PRIVATE_KEY: privateKey.export({ type: "pkcs8", format: "pem" }),
  HFG_SECURE_TICKET_KEYS: `t1:${crypto.randomBytes(32).toString("base64")}`,
  HFG_SESSION_COOKIE_KEYS: `c1:${crypto.randomBytes(32).toString("base64")}`,
  HFG_ALLOWED_ORIGINS: "http://localhost:3100",
  HFG_USER_ONBOARD_URL: "http://localhost:4010", HFG_BOOKING_URL: "http://localhost:4010", HFG_VENDOR_URL: "http://localhost:4010", HASH_MEDUSA_URL: "http://localhost:4010",
  FIREBASE_PROJECT_ID: PROJECT_ID, HFG_ALLOW_TEST_OVERRIDES: "true", FIREBASE_JWKS_URL_OVERRIDE: "http://localhost:4010/jwks",
};
// The pin is a build-time public env: rebuild is done by the caller with it set.
const web = spawn(path.join(root, "node_modules/.bin/next"), ["start", "-p", "3100"], { cwd: root, env, stdio: "inherit" });
await new Promise((r) => setTimeout(r, 4000));
const browser = await chromium.launch();
try {
  for (const [name, viewport] of [["desktop", { width: 1366, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    // External images are unreachable in CI: serve local artwork in their place.
    const local = ["hero-poster.jpg", "retro-car.jpg", "og-home.jpg"];
    let n = 0;
    await ctx.route(/res\.cloudinary\.com/, (r) => r.fulfill({ path: path.join(root, "public/images", local[n++ % local.length]) }));
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of ["/book", "/book/7", "/marketplace", "/marketplace/prod_r0", "/login", "/"]) {
      await page.goto(`http://localhost:3100${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      if (route === "/book/7") {
        await page.getByRole("button", { name: /PS5/ }).first().click().catch(() => {});
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole("button", { name: "Tomorrow" }).click().catch(() => {});
        await page.waitForTimeout(800);
        await page.getByRole("button", { name: /10:00 PM/ }).first().click().catch(() => {});
        await page.waitForTimeout(1200);
      }
      await page.screenshot({ path: `${out}/${name}${route.replace(/\//g, "_") || "_home"}.png`, fullPage: route !== "/" });
    }
    console.log(name, "errors:", JSON.stringify(errors.slice(0, 8)));
    await ctx.close();
  }
} finally {
  await browser.close();
  web.kill();
  mock.server.close();
}
void firebaseIdToken;
