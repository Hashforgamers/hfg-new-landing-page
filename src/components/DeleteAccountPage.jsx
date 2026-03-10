"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

const theme = {
  primary: "#8E543E",
  accent: "#E3B998",
  surface: "rgba(15, 10, 8, 0.8)",
};

export default function DeleteAccountPage({ initialToken = "" }) {
  const [token, setToken] = useState(initialToken);
  const [confirmText, setConfirmText] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const canSubmit =
    token.trim().length > 0 &&
    consentChecked &&
    confirmText.trim().toUpperCase() === "DELETE";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const payload = await response.json();

      setResult({
        type: response.ok ? "success" : "error",
        message:
          payload.message ||
          (response.ok
            ? "Your account has been deleted."
            : "We could not delete your account."),
      });

      if (response.ok) {
        setConfirmText("");
        setConsentChecked(false);
      }
    } catch {
      setResult({
        type: "error",
        message: "Network error while deleting the account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen px-6 py-16 text-white"
      style={{
        background:
          "radial-gradient(circle at top, rgba(142,84,62,0.35), transparent 35%), linear-gradient(180deg, #050505 0%, #120d0a 100%)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-[0.35em]"
            style={{ color: theme.accent }}
          >
            Hash For Gamers
          </p>
          <h1
            className="mb-4 text-4xl font-black uppercase md:text-5xl"
            style={{ color: theme.primary }}
          >
            Delete Account
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[#f2d7c3] md:text-base">
            Use this page to permanently delete your Hash account and the
            associated user data from our platform. This action cannot be
            undone.
          </p>
        </div>

        <div
          className="rounded-3xl border p-8 shadow-2xl backdrop-blur-xl"
          style={{
            backgroundColor: theme.surface,
            borderColor: "rgba(227,185,152,0.2)",
          }}
        >
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-300" />
            <div>
              <h2 className="mb-2 text-lg font-semibold text-red-200">
                Permanent action
              </h2>
              <p className="text-sm leading-6 text-red-100/85">
                Deleting your account removes your user profile, wallet,
                passes, tokens, notifications, and linked contact details from
                the `hfg-user-onboard` service.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-[#f0c7aa]">
                Authorization Token
              </label>
              <textarea
                rows={6}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste the bearer token from the Hash app or open this page with ?token=..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8E543E]"
              />
              <p className="mt-2 text-xs leading-5 text-[#d4b39b]">
                This page does not create a login session. It forwards your
                token to the existing delete-user API.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-[#f0c7aa]">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8E543E]"
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#f7e6d8]">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#8E543E]"
              />
              <span>
                I understand this will permanently delete my Hash account and
                cannot be reversed.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-bold uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(90deg, #8E543E 0%, #B56D4F 50%, #8E543E 100%)",
              }}
            >
              <Trash2 className="h-4 w-4" />
              {isSubmitting ? "Deleting..." : "Delete My Account"}
            </button>
          </form>

          {result && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                result.type === "success"
                  ? "border-green-400/20 bg-green-500/10 text-green-100"
                  : "border-red-400/20 bg-red-500/10 text-red-100"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p>{result.message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-[#d9b59a]">
          Need help with deletion? Contact{" "}
          <a
            href="mailto:support@hashforgamers.co.in"
            className="underline"
            style={{ color: theme.primary }}
          >
            support@hashforgamers.co.in
          </a>{" "}
          or review our{" "}
          <Link
            href="/privacy-policy"
            className="underline"
            style={{ color: theme.primary }}
          >
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
