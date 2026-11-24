"use client";

import { Loader2 } from "lucide-react";

/*
 * Design pieces for the Book and Store verticals. They follow the main
 * hashforgamers.com language (Anton display headlines, Orbitron kickers,
 * Inter body, black canvas, pink -> orange -> yellow brand gradient, white
 * pill buttons) with a calmer, product-page finish: large radii, generous
 * spacing, hairline borders and quiet surfaces.
 */

export const BRAND_GRADIENT = "bg-gradient-to-r from-[#ff3d8b] via-[#ff9a3d] to-[#ffd23d]";
export const GRADIENT_TEXT = `${BRAND_GRADIENT} bg-clip-text text-transparent`;

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Panel({ className = "", children, as: Tag = "div", padded = true, ...rest }) {
  return (
    <Tag className={cx("rounded-[28px] border border-white/[0.08] bg-[#0e0e12]", padded && "p-6 md:p-8", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className = "", as: Tag = "p" }) {
  return <Tag className={cx("font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]", className)}>{children}</Tag>;
}

/** Big Anton headline, as on the main site. */
export function Display({ children, className = "", as: Tag = "h1" }) {
  return <Tag className={cx("font-display uppercase leading-[0.9] text-white", className)}>{children}</Tag>;
}

/** Product-page heading: Inter, tight, sentence case. */
export function Title({ children, className = "", as: Tag = "h2" }) {
  return <Tag className={cx("font-body text-2xl font-semibold tracking-tight text-white md:text-3xl", className)}>{children}</Tag>;
}

export function Label({ children, className = "" }) {
  return <p className={cx("font-body text-xs font-medium uppercase tracking-[0.14em] text-white/45", className)}>{children}</p>;
}

const BUTTON = {
  primary: "bg-white text-black hover:bg-[#ff3d8b] hover:text-white disabled:bg-white/15 disabled:text-white/40",
  accent: `${BRAND_GRADIENT} text-black hover:brightness-110 disabled:opacity-40`,
  ghost: "border border-white/25 text-white hover:border-white hover:bg-white hover:text-black disabled:opacity-40",
  subtle: "bg-white/[0.06] text-white hover:bg-white/[0.12] disabled:opacity-40",
  danger: "border border-red-400/40 text-red-300 hover:bg-red-500/15 disabled:opacity-40",
};

export function Button({ children, variant = "primary", size = "md", loading = false, className = "", disabled, type = "button", ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        "font-body inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 disabled:cursor-not-allowed",
        size === "lg" ? "min-h-[52px] px-8 text-base" : size === "sm" ? "min-h-[36px] px-4 text-sm" : "min-h-[46px] px-6 text-[15px]",
        BUTTON[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** A link that looks like Button (never wrap a Button in a Link: nested controls break focus). */
export function buttonClass({ variant = "primary", size = "md", className = "" } = {}) {
  return cx(
    "font-body inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200",
    size === "lg" ? "min-h-[52px] px-8 text-base" : size === "sm" ? "min-h-[36px] px-4 text-sm" : "min-h-[46px] px-6 text-[15px]",
    BUTTON[variant],
    className,
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="font-body block">
      <span className="mb-2 block text-[13px] font-medium text-white/70">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-white/40">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

const CONTROL =
  "font-body w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-white/40 focus:bg-white/[0.06]";

export function Input({ className = "", ...rest }) {
  return <input className={cx(CONTROL, className)} {...rest} />;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={cx(CONTROL, "appearance-none bg-[#141418]", className)} {...rest}>
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
        "font-body rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30",
        active ? "bg-white text-black" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]",
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
    <div className="font-body flex items-center justify-center gap-3 py-16 text-sm text-white/50" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-[#ff9a3d]" aria-hidden />
      {label}
    </div>
  );
}

export function Notice({ tone = "error", children, action }) {
  const tones = {
    error: "border-red-400/25 bg-red-500/[0.08] text-red-200",
    info: "border-white/10 bg-white/[0.04] text-white/80",
    success: "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-100",
    warn: "border-amber-400/25 bg-amber-500/[0.08] text-amber-100",
  };
  return (
    <div className={cx("font-body flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm", tones[tone])} role={tone === "error" ? "alert" : "status"}>
      <span>{children}</span>
      {action}
    </div>
  );
}

export function Empty({ title, children, bare = false }) {
  return (
    <div className={cx("font-body px-6 text-center", bare ? "py-10" : "rounded-[28px] border border-dashed border-white/15 py-16")}>
      <p className="text-lg font-semibold text-white">{title}</p>
      {children && <div className="mt-2 text-sm text-white/55">{children}</div>}
    </div>
  );
}

/** ₹1,499 for whole rupees, ₹1,499.50 otherwise. */
export const inr = (value) => {
  const n = Number(value || 0);
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 }).format(n);
};

export function formatTime(hhmmss) {
  if (!hhmmss) return "";
  const [h, m] = String(hhmmss).split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

export function SecureBadge({ className = "" }) {
  return (
    <span className={cx("font-body inline-flex items-center gap-1.5 text-xs text-white/45", className)}>
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden fill="currentColor">
        <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5H6V4.5a2 2 0 1 1 4 0V6Z" />
      </svg>
      Encrypted end to end
    </span>
  );
}
