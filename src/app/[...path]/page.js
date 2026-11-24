import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import { buildPageMetadata } from "@/lib/site";

// Paths the Hash app opens (keep in sync with apple-app-site-association and
// the app's AndroidManifest). With the app installed the OS opens it before
// this page loads; without it, people land here instead of a 404.
const APP_ROOTS = new Set([
  "tournament", "tournaments", "contest", "team", "team-join", "cafe", "game",
  "profile", "host", "referral", "bookings", "wallet", "passes", "offer", "shop",
]);

export async function generateMetadata({ params }) {
  const { path } = await params;
  return buildPageMetadata({
    title: "Open in the Hash app",
    description: "This link opens in the Hash app. Get the app to continue.",
    path: `/${path.join("/")}`,
    noIndex: true,
  });
}

export default async function AppLinkPage({ params, searchParams }) {
  const { path } = await params;
  if (!APP_ROOTS.has(path[0]?.toLowerCase())) notFound();
  const query = new URLSearchParams(await searchParams).toString();
  // The custom scheme carries the same path, so this also works where
  // universal links were skipped (pasted URL, in-app browsers).
  const appLink = `hash://${path.map(encodeURIComponent).join("/")}${query ? `?${query}` : ""}`;
  return (
    <AppShell>
      <NavBar />
      <PageHero
        eyebrow="Hash app"
        lines={["Open this", "in the app."]}
        body="This link opens in the Hash app. If you have it, tap Open in Hash. If not, get it free and open the link again."
        image="/images/hero-poster.jpg"
        placement="app_link_hero"
      />
      <section className="bg-black px-4 pb-20 sm:px-8">
        <div className="mx-auto flex max-w-[1500px] justify-center">
          <a
            href={appLink}
            data-track="app_link_open_click"
            className="rounded-full bg-[#ff3d8b] px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Open in Hash
          </a>
        </div>
      </section>
    </AppShell>
  );
}
