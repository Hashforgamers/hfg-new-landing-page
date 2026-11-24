"use client";

import { Loader2 } from "lucide-react";

/*
 * Small design-system pieces for the booking / marketplace / account pages.
 * They reuse the landing site's language: black canvas, Orbitron, glass
 * panels (border-white/10, bg-white/[0.04]), #16FF00 accent, wide tracking.
 */

export const ACCENT = "#16FF00";

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Panel({ className = "", children, ...rest }) {
  return (
    <div
      className={cx("rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md md:p-7", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }) {
  return (
    <p className={cx("text-[11px] font-semibold uppercase tracking-[0.42em] text-[#16FF00]", className)}>{children}</p>
  );
}

export function Title({ children, className = "", as: Tag = "h1" }) {
  return (
    <Tag className={cx("text-2xl font-black uppercase tracking-[0.12em] text-white md:text-4xl", className)}>{children}</Tag>
  );
}

export function Button({ children, variant = "primary", loading = false, className = "", disabled, ...rest }) {
  const styles = {
    primary:
      "border border-[#16FF00]/60 bg-[#16FF00] text-black hover:bg-[#3dff2e] disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40",
    ghost:
      "border border-[#16FF00]/40 bg-[#16FF00]/10 text-[#16FF00] hover:bg-[#16FF00] hover:text-black disabled:opacity-40",
    subtle: "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10 disabled:opacity-40",
    danger: "border border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-40",
  };
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] transition disabled:cursor-not-allowed",
        styles[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-white/40">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

export function Input({ className = "", ...rest }) {
  return (
    <input
      className={cx(
        "w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-sans text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#16FF00]/60 focus:ring-2 focus:ring-[#16FF00]/20",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select
      className={cx(
        "w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-sans text-sm text-white outline-none focus:border-[#16FF00]/60",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Chip({ active, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(active)}
      className={cx(
        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-30",
        active ? "border-[#16FF00] bg-[#16FF00] text-black" : "border-white/15 bg-white/5 text-white/80 hover:border-[#16FF00]/50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm uppercase tracking-[0.3em] text-white/50" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-[#16FF00]" aria-hidden />
      {label}
    </div>
  );
}

export function Notice({ tone = "error", children, action }) {
  const tones = {
    error: "border-red-400/30 bg-red-500/10 text-red-200",
    info: "border-sky-400/30 bg-sky-500/10 text-sky-100",
    success: "border-[#16FF00]/30 bg-[#16FF00]/10 text-[#b6ffad]",
    warn: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  };
  return (
    <div className={cx("flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 font-sans text-sm", tones[tone])} role={tone === "error" ? "alert" : "status"}>
      <span>{children}</span>
      {action}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-14 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-white">{title}</p>
      {children && <div className="mt-3 font-sans text-sm text-white/60">{children}</div>}
    </div>
  );
}

export const inr = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));

export function formatTime(hhmmss) {
  if (!hhmmss) return "";
  const [h, m] = String(hhmmss).split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

export function SecureBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/50">
      <span className="h-1.5 w-1.5 rounded-full bg-[#16FF00]" aria-hidden />
      End-to-end encrypted
    </span>
  );
}
