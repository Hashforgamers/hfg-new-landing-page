"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import { SITE_DOWNLOAD_URL, SITE_LOGO } from "@/lib/site";
import { BOOK, STORE } from "@/lib/verticals";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { cx } from "./ui";

const AuthContext = createContext({ user: null, ready: false, refresh: async () => {}, logout: async () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

/** Sends people to /login and back to where they were. */
export function useRequireLogin() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    // Keep the query and #section (e.g. /account#orders) so people land exactly where they were.
    const here = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}${window.location.hash}` : pathname;
    router.push(`/login?next=${encodeURIComponent(here || BOOK.root)}`);
  }, [router, pathname]);
}

const GLOBAL_NAV = [
  { href: BOOK.root, label: "Book a cafe" },
  { href: STORE.root, label: "Marketplace" },
  { href: "/#tournaments", label: "Tournaments" },
  { href: "/blog", label: "News" },
];

const LOCAL_NAV = {
  book: [
    { href: BOOK.root, label: "Cafes", exact: true },
    { href: "/account#bookings", label: "My bookings" },
  ],
  store: [
    { href: STORE.root, label: "Shop", exact: true },
    { href: "/marketplace/cart", label: "Cart" },
    { href: "/account#orders", label: "Orders" },
  ],
};

function verticalFor(pathname = "") {
  if (pathname.startsWith(BOOK.root)) return BOOK;
  if (pathname.startsWith(STORE.root)) return STORE;
  return null;
}

function TopBar() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const vertical = verticalFor(pathname);

  useEffect(() => setOpen(false), [pathname]);

  const accountLabel = user ? user.handle || user.name?.split(" ")[0] || "Account" : "Sign in";
  const accountHref = user ? "/account" : `/login?next=${encodeURIComponent(pathname || BOOK.root)}`;

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8" aria-label="Main">
          <Link href="/" className="flex items-center gap-2" aria-label="Hash For Gamers home">
            <Image src={SITE_LOGO} alt="" width={36} height={36} className="h-9 w-9" />
            <span className="font-display text-2xl uppercase tracking-wide text-white">Hash</span>
          </Link>

          <ul className="font-tech hidden items-center gap-7 md:flex">
            {GLOBAL_NAV.map((item) => {
              const active = item.href.startsWith("/") && !item.href.startsWith("/#") && pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx("text-[11px] uppercase tracking-[0.2em] transition", active ? "text-white" : "text-white/60 hover:text-white")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/marketplace/cart"
              aria-label="Cart"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
            </Link>
            {ready && (
              <Link
                href={accountHref}
                className="font-body hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <User className="h-[18px] w-[18px]" />
                {accountLabel}
              </Link>
            )}
            <a
              href={SITE_DOWNLOAD_URL}
              data-track="app_download_click"
              data-track-placement="play_nav"
              className="hidden rounded-full bg-white px-4 py-1.5 font-display text-base uppercase tracking-wide text-black transition hover:bg-[#ff3d8b] hover:text-white sm:inline-flex"
            >
              Get the app
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <nav className="border-t border-white/[0.06] px-4 pb-6 pt-2 md:hidden" aria-label="Mobile">
            {[...GLOBAL_NAV, { href: accountHref, label: user ? "My account" : "Sign in" }].map((item) => (
              <Link key={item.href} href={item.href} className="block py-3 font-display text-3xl uppercase text-white">
                {item.label}
              </Link>
            ))}
            {user && (
              <button type="button" onClick={logout} className="font-body mt-2 block py-2 text-sm text-white/50">
                Sign out
              </button>
            )}
          </nav>
        )}
      </div>

      {vertical && (
        <div className="border-b border-white/[0.06] bg-[#0a0a0c]/85 backdrop-blur-xl">
          <div className="font-body mx-auto flex h-12 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8">
            <Link href={vertical.root} className="text-[17px] font-semibold tracking-tight text-white sm:text-xl">
              {vertical.name}
            </Link>
            <ul className="flex items-center gap-4 sm:gap-6">
              {LOCAL_NAV[vertical.id].map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cx("text-[13px] transition", active ? "text-white" : "text-white/60 hover:text-white")}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {vertical.id === "book" && (
                <li>
                  {/* On a cafe page this jumps to its booking panel; elsewhere to the cafe list. */}
                  <Link
                    href={pathname.length > BOOK.root.length + 1 ? "#book" : `${BOOK.root}#cafes`}
                    className="rounded-full bg-white px-3.5 py-1 text-[13px] font-semibold text-black transition hover:bg-[#ff3d8b] hover:text-white"
                  >
                    {pathname.length > BOOK.root.length + 1 ? "Book a slot" : "Book now"}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

const reported = new Set();

function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) track("Page Viewed", { path: pathname });
  }, [pathname]);
  useReportWebVitals((metric) => {
    if (reported.has(metric.id)) return;
    reported.add(metric.id);
    if (["LCP", "INP", "CLS", "TTFB"].includes(metric.name)) {
      track("Web Vitals", { metric: metric.name, value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), rating: metric.rating });
    }
  });
  useEffect(() => {
    const onError = (event) => track("Client Error", { message: String(event?.message || event?.reason?.message || "error").slice(0, 120) });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
    };
  }, []);
  return null;
}

export default function PlayShell({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const data = await secureCall("auth.session");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await secureCall("auth.logout");
      const { signOutFirebase } = await import("@/lib/firebase-client");
      await signOutFirebase();
    } catch {}
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ user, ready, refresh, logout, setUser }), [user, ready, refresh, logout]);

  return (
    <AuthContext.Provider value={value}>
      <AppShell>
        <div className="font-body relative min-h-screen bg-black text-white">
          <TopBar />
          <Analytics />
          <div className="relative">{children}</div>
        </div>
      </AppShell>
    </AuthContext.Provider>
  );
}
