"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import { SITE_LOGO } from "@/lib/site";
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
    router.push(`/login?next=${encodeURIComponent(pathname || "/book")}`);
  }, [router, pathname]);
}

const NAV = [
  { href: "/book", label: "Book a Cafe" },
  { href: "/marketplace", label: "Marketplace" },
];

function TopBar() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Hash For Gamers home">
          <Image src={SITE_LOGO} alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
          <span className="hidden text-sm font-black uppercase tracking-[0.22em] text-white sm:inline">Hash</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition",
                pathname?.startsWith(item.href) ? "bg-[#16FF00] text-black" : "text-white/70 hover:text-[#16FF00]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/marketplace/cart"
            aria-label="Cart"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-[#16FF00]/60 hover:text-[#16FF00]"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
          {ready && user ? (
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-full border border-[#16FF00]/40 bg-[#16FF00]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#16FF00] transition hover:bg-[#16FF00] hover:text-black sm:inline-flex"
            >
              <User className="h-4 w-4" />
              {user.handle || user.name?.split(" ")[0] || "Account"}
            </Link>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname || "/book")}`}
              className="hidden rounded-full border border-[#16FF00]/40 bg-[#16FF00]/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#16FF00] transition hover:bg-[#16FF00] hover:text-black sm:inline-flex"
            >
              Login
            </Link>
          )}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-black/95 px-4 py-4 md:hidden" aria-label="Mobile">
          {[...NAV, user ? { href: "/account", label: "My Account" } : { href: "/login", label: "Login" }].map((item) => (
            <Link key={item.href} href={item.href} className="block py-3 text-sm font-bold uppercase tracking-[0.22em] text-white/80 hover:text-[#16FF00]">
              {item.label}
            </Link>
          ))}
          {user && (
            <button type="button" onClick={logout} className="block py-3 text-sm font-bold uppercase tracking-[0.22em] text-white/50">
              Logout
            </button>
          )}
        </nav>
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
        <div className="relative min-h-screen bg-black text-white">
          <div
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(22,255,0,0.10),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(116,77,224,0.16),transparent_30%)]"
            aria-hidden
          />
          <TopBar />
          <Analytics />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-8 md:pt-12">{children}</div>
        </div>
      </AppShell>
    </AuthContext.Provider>
  );
}
