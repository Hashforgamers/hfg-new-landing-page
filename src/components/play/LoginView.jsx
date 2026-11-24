"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { SITE_LOGO } from "@/lib/site";
import { useAuth } from "./PlayShell";
import { Button, Field, Input, Notice, SecureBadge, cx } from "./ui";

function safeNext(raw) {
  // Only same-site relative paths; blocks open redirects like //evil.com.
  if (typeof raw === "string" && /^\/(?!\/)[A-Za-z0-9/_\-?=&.%#]*$/.test(raw) && !raw.startsWith("/login")) return raw;
  return "/book";
}

// Same idea as the app's signup screen (_generateGamerUsername): name + gaming word + 3 digits.
const WORDS = ["Ninja", "Sniper", "Phoenix", "Shadow", "Blaze", "Storm", "Pixel", "Vortex", "Ghost", "Striker", "Nova", "Raven", "Quantum", "Glitch", "Bolt"];
function gamerTag(name) {
  const base = String(name || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 14) || "Player";
  return `${base}${WORDS[Math.floor(Math.random() * WORDS.length)]}${100 + Math.floor(Math.random() * 900)}`;
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 17 20" className="h-[18px] w-[18px]" aria-hidden fill="currentColor">
      <path d="M14.2 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1ZM11.7 3c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5Z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.7H.9v2.3A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.9 10.8a5.4 5.4 0 0 1 0-3.5V5H.9a9 9 0 0 0 0 8.1l3-2.3Z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.4l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z" />
    </svg>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <span className="text-[13px] text-white/50">{label}</span>
      <span className="truncate text-[15px] text-white">{value || "—"}</span>
    </div>
  );
}

export default function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready, setUser } = useAuth();

  const [step, setStep] = useState("start"); // start | signup
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [identity, setIdentity] = useState({ name: "", email: "", method: "" });
  const [form, setForm] = useState({ name: "", gameUserName: "", mobile: "", referralCode: "" });
  const idTokenRef = useRef(null);

  useEffect(() => {
    if (ready && user && step === "start") router.replace(next);
  }, [ready, user, next, router, step]);

  const destination = useMemo(() => (next.startsWith("/marketplace") ? "the Hash Marketplace" : "Hash"), [next]);

  async function signIn(method) {
    setError("");
    setBusy(method);
    track("Login Started", { method });
    try {
      const fb = await import("@/lib/firebase-client");
      const { idToken, profile } = method === "apple" ? await fb.signInWithApple() : await fb.signInWithGoogle();
      idTokenRef.current = idToken;
      const result = await secureCall("auth.login", { idToken });
      if (result.status === "signed_in") {
        setUser(result.user);
        track("Login Successful", { method });
        router.replace(next);
        return;
      }
      const name = result.prefill?.name || profile.name || "";
      setIdentity({ name, email: result.prefill?.email || profile.email || "", method });
      setForm((f) => ({ ...f, name, gameUserName: gamerTag(name) }));
      setStep("signup");
      track("Signup Started", { method });
    } catch (err) {
      const { friendlyFirebaseError } = await import("@/lib/firebase-client");
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setError(err?.code ? friendlyFirebaseError(err) : err.message);
      }
      track("Login Failed", { method, code: err?.code || "unknown" });
    } finally {
      setBusy("");
    }
  }

  async function onSignup(e) {
    e.preventDefault();
    setError("");
    setBusy("signup");
    try {
      const { currentIdToken } = await import("@/lib/firebase-client");
      const idToken = (await currentIdToken()) || idTokenRef.current;
      const result = await secureCall("auth.signup", {
        idToken,
        profile: {
          name: identity.name || form.name,
          gameUserName: form.gameUserName,
          phone: `+91${form.mobile}`,
          referralCode: form.referralCode || undefined,
        },
      });
      setUser(result.user);
      track("Signup Completed", { method: identity.method });
      router.replace(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="font-body mx-auto flex min-h-[70vh] max-w-[440px] flex-col justify-center py-6">
      <div className="text-center">
        <Image src={SITE_LOGO} alt="" width={56} height={56} className="mx-auto h-14 w-14" />
        <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-tight text-white">
          {step === "signup" ? "Finish your profile" : "Sign in to Hash"}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-white/55">
          {step === "signup"
            ? "One last step. This is the same profile you'll see in the Hash app."
            : `Use the account you have in the Hash app to continue to ${destination}.`}
        </p>
      </div>

      <div className="mt-10">
        {error && (
          <div className="mb-4">
            <Notice>{error}</Notice>
          </div>
        )}

        {step === "start" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn("apple")}
              disabled={Boolean(busy)}
              className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-white text-[16px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              <AppleLogo />
              {busy === "apple" ? "Connecting…" : "Continue with Apple"}
            </button>
            <button
              type="button"
              onClick={() => signIn("google")}
              disabled={Boolean(busy)}
              className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-transparent text-[16px] font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.04] disabled:opacity-50"
            >
              <GoogleLogo />
              {busy === "google" ? "Connecting…" : "Continue with Google"}
            </button>
            <p className="pt-4 text-center text-xs leading-5 text-white/40">
              New to Hash? Continue and we&apos;ll set up your account. By continuing you agree to the{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-white">Terms</Link> and{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-white">Privacy Policy</Link>.
            </p>
          </div>
        )}

        {step === "signup" && (
          <form onSubmit={onSignup} className="space-y-5">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] px-5">
              {identity.name ? <InfoRow label="Name" value={identity.name} /> : null}
              <InfoRow label="Email" value={identity.email} />
              <InfoRow label="Signed in with" value={identity.method === "apple" ? "Apple" : "Google"} />
            </div>

            {!identity.name && (
              <Field label="Name">
                <Input
                  required
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, gameUserName: form.gameUserName || gamerTag(e.target.value) })}
                />
              </Field>
            )}
            <Field label="Game username" hint="This is how other players see you. You can change it.">
              <div className="flex gap-2">
                <Input
                  required
                  pattern="[A-Za-z0-9_.\-]{3,30}"
                  value={form.gameUserName}
                  onChange={(e) => setForm({ ...form, gameUserName: e.target.value.trim() })}
                />
                <button
                  type="button"
                  className="shrink-0 rounded-2xl bg-white/[0.06] px-4 text-sm text-white/80 hover:bg-white/[0.12]"
                  onClick={() => setForm({ ...form, gameUserName: gamerTag(identity.name || form.name) })}
                >
                  Shuffle
                </button>
              </div>
            </Field>
            <Field label="Mobile number" hint="For booking updates from the cafe.">
              <div className="flex items-center gap-2">
                <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white/70">+91</span>
                <Input
                  required
                  inputMode="numeric"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
              </div>
            </Field>
            <Field label="Referral code (optional)">
              <Input maxLength={20} value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} />
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={busy === "signup"}>
              Create account
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-white/45 hover:text-white"
              onClick={async () => {
                const { signOutFirebase } = await import("@/lib/firebase-client");
                await signOutFirebase().catch(() => {});
                setStep("start");
              }}
            >
              Use a different account
            </button>
          </form>
        )}
      </div>

      <div className={cx("mt-10 flex justify-center")}>
        <SecureBadge />
      </div>
    </div>
  );
}
