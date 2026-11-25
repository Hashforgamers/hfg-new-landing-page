"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { ShoppingBag, User } from "lucide-react";
import AppShell from "@/components/AppShell";
import NavBar from "@/components/landing/NavBar";
import { BOOK } from "@/lib/verticals";
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

/** Cart and account controls added to the main site header on these pages. */
function HeaderActions() {
  const { user, ready } = useAuth();
  const pathname = usePathname() || "";
  const accountLabel = user ? user.handle || user.name?.split(" ")[0] || "Account" : "Sign in";
  const accountHref = user ? "/account" : `/login?next=${encodeURIComponent(pathname || BOOK.root)}`;
  return (
    <>
      <Link
        href="/marketplace/cart"
        aria-label="Cart"
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <ShoppingBag className="h-[18px] w-[18px]" />
      </Link>
      <Link
        href={ready ? accountHref : "/account"}
        aria-label={user ? "My account" : "Sign in"}
        className="font-body flex h-10 w-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:w-auto sm:px-3"
      >
        <User className="h-[18px] w-[18px]" />
        <span className={cx("hidden max-w-[9rem] truncate sm:inline", !ready && "invisible")}>{accountLabel}</span>
      </Link>
    </>
  );
}

/**
 * New pages open at the top. Next keeps the old scroll offset when the next page
 * starts short (e.g. /login while its form loads), which left people looking at
 * the footer. Back/forward keeps the browser's own scroll restoration.
 */
function ScrollReset() {
  const pathname = usePathname();
  const fromHistory = useRef(false);
  const first = useRef(true);
  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (first.current) {
      // Hard loads and reloads keep the browser's own position.
      first.current = false;
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const reported = new Set();

function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) track("Page Viewed", { path: pathname });
    // Lets the home page skip "Choose your path" for people who already book or shop.
    try {
      localStorage.setItem("hash-play-visit", pathname.startsWith("/marketplace") || pathname.startsWith("/cart") ? "shop" : "book");
    } catch {}
  }, [pathname]);
  useReportWebVitals((metric) => {
    if (reported.has(metric.id)) return;
    reported.add(metric.id);
    if (["LCP", "INP", "CLS", "TTFB"].includes(metric.name)) {
      track("Web Vitals", { metric: metric.name, value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), rating: metric.rating });
    }
  });
  useEffect(() => {
    const onError = (event) =>
      track("Client Error", {
        message: String(event?.message || event?.reason?.message || "error").slice(0, 120),
        source: String(event?.filename || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 80),
        kind: event?.type === "unhandledrejection" ? "promise" : "error",
      });
    // Failed API calls, by op and status, so drop-offs show their cause.
    const onApiError = (event) => track("Request Failed", event.detail || {});
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    window.addEventListener("hfg:api-error", onApiError);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
      window.removeEventListener("hfg:api-error", onApiError);
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

  useEffect(() => {
    const onSignedOut = () => setUser(null);
    window.addEventListener("hfg:signed-out", onSignedOut);
    return () => window.removeEventListener("hfg:signed-out", onSignedOut);
  }, []);

  const value = useMemo(() => ({ user, ready, refresh, logout, setUser }), [user, ready, refresh, logout]);

  return (
    <AuthContext.Provider value={value}>
      <AppShell compactFooter>
        <div className="font-body relative min-h-screen bg-black text-white">
          <NavBar actions={<HeaderActions />} />
          <ScrollReset />
          <Analytics />
          {/* The site header is fixed; keep content clear of it. */}
          <div className="relative pt-16 sm:pt-20">{children}</div>
        </div>
      </AppShell>
    </AuthContext.Provider>
  );
}
