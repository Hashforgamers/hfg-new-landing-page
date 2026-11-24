import "server-only";
import { isProd } from "./http";
import { openCookie, randomId, sealCookie } from "./server-crypto";

/*
 * The login session lives in a sealed (AES-256-GCM), HttpOnly, SameSite=Strict
 * cookie. Backend bearer tokens (HFG JWT, Medusa customer JWT) and the cart id
 * stay inside it, so page JavaScript - and therefore XSS - never sees them.
 */

export const AUTH_COOKIE = isProd ? "__Host-hfg_auth" : "hfg_auth";
export const ANON_COOKIE = isProd ? "__Host-hfg_aid" : "hfg_aid";
const MAX_SESSION_SECONDS = 12 * 60 * 60;

export function readSession(request) {
  const raw = request.cookies.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  const session = openCookie(raw);
  if (!session || typeof session !== "object") return null;
  const now = Math.floor(Date.now() / 1000);
  if (!session.exp || session.exp <= now) return null;
  return session;
}

export function newSession({ user, hfgToken, hfgTokenExp, fid }) {
  const now = Math.floor(Date.now() / 1000);
  const exp = Math.min(now + MAX_SESSION_SECONDS, hfgTokenExp || now + MAX_SESSION_SECONDS);
  return {
    v: 1,
    sid: randomId(12),
    uid: Number(user.id),
    fid,
    name: user.name || "",
    handle: user.gameUserName || "",
    avatar: user.avatar_path || "",
    email: user.email || user?.contact?.electronicAddress?.emailId || "",
    phone: user.phone || user?.contact?.electronicAddress?.mobileNo || "",
    hfg: hfgToken,
    hfgExp: hfgTokenExp,
    iat: now,
    exp,
  };
}

export function writeSessionCookie(response, session) {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = Math.max(0, session.exp - now);
  response.cookies.set({
    name: AUTH_COOKIE,
    value: sealCookie(session),
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge,
    priority: "high",
  });
}

export function clearSessionCookie(response) {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/** Anonymous analytics id (random, not linked to identity until login). */
export function ensureAnonId(request, response) {
  const existing = request.cookies.get(ANON_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{16,40}$/.test(existing)) return existing;
  const id = randomId(16);
  response.cookies.set({
    name: ANON_COOKIE,
    value: id,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return id;
}

export function publicProfile(session) {
  if (!session) return null;
  const phone = String(session.phone || "");
  return {
    name: session.name,
    handle: session.handle,
    avatar: session.avatar,
    email: session.email ? maskEmail(session.email) : "",
    phone: phone ? `${phone.slice(0, 3)}••••${phone.slice(-3)}` : "",
    hasStoreAccount: Boolean(session.medusa),
  };
}

function maskEmail(email) {
  const [local, domain] = String(email).split("@");
  if (!domain) return "";
  return `${local.slice(0, 2)}•••@${domain}`;
}
