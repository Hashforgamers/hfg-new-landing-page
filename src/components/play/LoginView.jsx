"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { secureCall } from "@/lib/secure/client";
import { track } from "@/lib/analytics-client";
import { useAuth } from "./PlayShell";
import { Button, Eyebrow, Field, Input, Notice, Panel, SecureBadge, Select, Title } from "./ui";

const DIAL_CODES = ["+91", "+1", "+44", "+61", "+65", "+81", "+971", "+974"];

function safeNext(raw) {
  // Only same-site relative paths; blocks open redirects like //evil.com.
  if (typeof raw === "string" && /^\/(?!\/)[A-Za-z0-9/_\-?=&.%]*$/.test(raw) && !raw.startsWith("/login")) return raw;
  return "/book";
}

export default function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready, setUser } = useAuth();

  const [step, setStep] = useState("start"); // start | otp | signup
  const [dial, setDial] = useState("+91");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [profile, setProfile] = useState({ name: "", gameUserName: "", email: "", dob: "", gender: "", referralCode: "" });
  const [prefill, setPrefill] = useState({});
  const confirmation = useRef(null);
  const idTokenRef = useRef(null);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  useEffect(() => {
    if (!cooldown) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function finishLogin(idToken, method) {
    idTokenRef.current = idToken;
    const result = await secureCall("auth.login", { idToken });
    if (result.status === "signed_in") {
      setUser(result.user);
      router.replace(next);
      return;
    }
    setPrefill(result.prefill || {});
    setProfile((p) => ({ ...p, name: result.prefill?.name || p.name, email: result.prefill?.email || p.email }));
    setStep("signup");
    track("Login Started", { method, new_user: true });
  }

  async function onSendOtp(e) {
    e?.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 13) {
      setError("Enter a valid mobile number.");
      return;
    }
    setBusy("otp");
    try {
      const { sendOtp } = await import("@/lib/firebase-client");
      confirmation.current = await sendOtp(`${dial}${digits}`, "recaptcha-slot");
      setStep("otp");
      setCooldown(60);
      track("OTP Requested", { country_code: dial });
    } catch (err) {
      const { friendlyFirebaseError } = await import("@/lib/firebase-client");
      setError(friendlyFirebaseError(err));
      track("Login Failed", { method: "phone", stage: "send_otp", code: err?.code || "unknown" });
    } finally {
      setBusy("");
    }
  }

  async function onVerify(e) {
    e?.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy("verify");
    try {
      const { confirmOtp } = await import("@/lib/firebase-client");
      const idToken = await confirmOtp(confirmation.current, code);
      track("OTP Verified", {});
      await finishLogin(idToken, "phone");
    } catch (err) {
      const { friendlyFirebaseError } = await import("@/lib/firebase-client");
      setError(err?.code ? friendlyFirebaseError(err) : err.message);
      track("Login Failed", { method: "phone", stage: "verify", code: err?.code || "unknown" });
    } finally {
      setBusy("");
    }
  }

  async function onGoogle() {
    setError("");
    setBusy("google");
    try {
      const { signInWithGoogle } = await import("@/lib/firebase-client");
      const idToken = await signInWithGoogle();
      await finishLogin(idToken, "google");
    } catch (err) {
      const { friendlyFirebaseError } = await import("@/lib/firebase-client");
      setError(err?.code ? friendlyFirebaseError(err) : err.message);
      track("Login Failed", { method: "google", code: err?.code || "unknown" });
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
          name: profile.name,
          gameUserName: profile.gameUserName,
          email: prefill.email ? undefined : profile.email || undefined,
          dob: profile.dob || undefined,
          gender: profile.gender || undefined,
          referralCode: profile.referralCode || undefined,
        },
      });
      setUser(result.user);
      router.replace(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div>
        <Eyebrow>Player Access</Eyebrow>
        <Title className="mt-3">Enter the network</Title>
        <p className="mt-4 max-w-md font-sans text-sm leading-7 text-white/70">
          One Hash account for the app and the web. Book cafe slots, shop the marketplace and track every order from the same login.
        </p>
        <ul className="mt-6 space-y-2 font-sans text-sm text-white/60">
          <li>• Same account as the Hash app</li>
          <li>• Your bookings and orders sync across devices</li>
          <li>• Every request is encrypted end to end</li>
        </ul>
      </div>

      <Panel>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm font-bold uppercase tracking-[0.24em]">
            {step === "signup" ? "Create your profile" : step === "otp" ? "Verify code" : "Login / Sign up"}
          </p>
          <SecureBadge />
        </div>

        {error && (
          <div className="mb-4">
            <Notice>{error}</Notice>
          </div>
        )}

        {step === "start" && (
          <form onSubmit={onSendOtp} className="space-y-4">
            <Field label="Mobile number">
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <Select value={dial} onChange={(e) => setDial(e.target.value)} aria-label="Country code">
                    {DIAL_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <Input
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, "").slice(0, 15))}
                />
              </div>
            </Field>
            <Button type="submit" className="w-full" loading={busy === "otp"}>
              Send OTP
            </Button>
            <div className="flex items-center gap-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/30">
              <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
            </div>
            <Button variant="subtle" className="w-full" onClick={onGoogle} loading={busy === "google"}>
              Continue with Google
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="font-sans text-sm text-white/60">
              We sent a 6-digit code to {dial} {phone}.
            </p>
            <Field label="OTP">
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-xl tracking-[0.6em]"
                autoFocus
              />
            </Field>
            <Button type="submit" className="w-full" loading={busy === "verify"}>
              Verify & continue
            </Button>
            <div className="flex justify-between text-xs uppercase tracking-[0.2em]">
              <button type="button" className="text-white/50 hover:text-white" onClick={() => setStep("start")}>
                Change number
              </button>
              <button type="button" className="text-[#16FF00] disabled:text-white/30" disabled={cooldown > 0 || busy} onClick={onSendOtp}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {step === "signup" && (
          <form onSubmit={onSignup} className="space-y-4">
            <Field label="Full name">
              <Input required minLength={2} maxLength={60} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="Gamer tag" hint="3-30 letters, numbers, _ . -">
              <Input
                required
                pattern="[A-Za-z0-9_.\-]{3,30}"
                value={profile.gameUserName}
                onChange={(e) => setProfile({ ...profile, gameUserName: e.target.value.trim() })}
              />
            </Field>
            {!prefill.email && (
              <Field label="Email" hint="For booking receipts">
                <Input type="email" autoComplete="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth">
                <Input type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
              </Field>
              <Field label="Gender">
                <Select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>
            <Field label="Referral code (optional)">
              <Input maxLength={20} value={profile.referralCode} onChange={(e) => setProfile({ ...profile, referralCode: e.target.value.toUpperCase() })} />
            </Field>
            <Button type="submit" className="w-full" loading={busy === "signup"}>
              Create account
            </Button>
          </form>
        )}

        <div id="recaptcha-slot" />
        <p className="mt-5 font-sans text-[11px] leading-5 text-white/40">
          By continuing you agree to the Hash terms and privacy policy. Phone verification is protected by reCAPTCHA.
        </p>
      </Panel>
    </div>
  );
}
