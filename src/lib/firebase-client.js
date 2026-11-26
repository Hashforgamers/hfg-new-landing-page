/*
 * Firebase Auth on the web - same identity provider the HFG app uses
 * (project hash-ee6fc). The SDK is loaded lazily so the landing pages don't
 * pay for it; the login page warms it up as soon as it mounts.
 *
 * Firebase talks directly to Google over TLS (Google and Apple sign-in); that
 * traffic is Google's protocol and cannot be wrapped by our gateway layer.
 * Only the resulting short-lived ID token reaches our gateway, encrypted.
 *
 * Why the warm-up matters: browsers only let a page open a pop-up while they
 * still consider it "part of" the tap. iOS Safari (and most mobile browsers)
 * are strict about it. If the first tap has to download the SDK and load
 * Firebase's helper iframe before calling window.open, the pop-up is blocked;
 * after a refresh everything is cached and it works. So:
 *   1. preloadAuth() downloads + initialises everything on page load,
 *   2. signIn() calls signInWithPopup with no await in front of it once ready,
 *   3. if a pop-up is still blocked (or the browser can't do pop-ups at all,
 *      e.g. some in-app browsers), we fall back to a full-page redirect and
 *      finish the sign-in with completeRedirectSignIn() when the page returns.
 */

import { FIREBASE_CONFIG as config } from "@/lib/site";

const REDIRECT_METHOD_KEY = "hfg.login.redirectMethod";

let authPromise = null;
let loaded = null; // { auth, authMod } once ready, so a tap can use it synchronously
let redirectPromise = null;

async function getAuthModule() {
  const [{ initializeApp, getApps }, authMod] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
  if (!config.apiKey || !config.appId) throw new Error("Login is not configured yet.");
  const app = getApps()[0] || initializeApp(config);
  const auth = authMod.getAuth(app);
  // Keep Firebase's own session only for this tab: our gateway issues the
  // real website session cookie, so nothing long-lived sits in localStorage.
  await authMod.setPersistence(auth, authMod.browserSessionPersistence);
  auth.useDeviceLanguage();
  // Waits for Firebase's own start-up, which on Safari and mobile browsers
  // includes loading the pop-up helper iframe.
  await auth.authStateReady();
  return { auth, authMod };
}

function loadAuth() {
  if (!authPromise) {
    authPromise = getAuthModule()
      .then((mod) => {
        loaded = mod;
        return mod;
      })
      .catch((error) => {
        authPromise = null;
        throw error;
      });
  }
  return authPromise;
}

/** Start loading the SDK in the background (call on page load / hover / touch). */
export function preloadAuth() {
  return loadAuth().catch(() => null);
}

/** True once a tap can open the sign-in pop-up immediately. */
export function isAuthReady() {
  return Boolean(loaded);
}

function buildProvider(authMod, method) {
  if (method === "apple") {
    // Sign in with Apple, as in the app (login_controller.appleSignIn): email + name scopes.
    const provider = new authMod.OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    provider.setCustomParameters({ locale: "en_IN" });
    return provider;
  }
  // Google sign-in, as in the app (login_controller.googleSignIn).
  const provider = new authMod.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

async function toSession(user) {
  return {
    idToken: await user.getIdToken(true),
    // Prefill for first-time signup only; the server trusts the verified token, not these.
    profile: { name: user.displayName || "", email: user.email || "", phone: user.phoneNumber || "" },
  };
}

// Errors where a pop-up can't work in this browser, but a full-page redirect can.
const REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported",
]);

async function startRedirect({ auth, authMod }, provider, method) {
  try {
    sessionStorage.setItem(REDIRECT_METHOD_KEY, method);
  } catch {
    /* storage disabled: we still finish the sign-in, just without the method label */
  }
  await authMod.signInWithRedirect(auth, provider);
  // The page is navigating away; never resolve so the UI stays in "Connecting…".
  return new Promise(() => {});
}

async function popupThenRedirect(mod, method) {
  const provider = buildProvider(mod.authMod, method);
  let cred;
  try {
    // Must be the first thing that runs in this tick (see note at the top).
    cred = await mod.authMod.signInWithPopup(mod.auth, provider);
  } catch (error) {
    if (REDIRECT_FALLBACK_CODES.has(error?.code)) return startRedirect(mod, provider, method);
    throw error;
  }
  return toSession(cred.user);
}

/**
 * Sign in with "apple" or "google". Call straight from the click handler,
 * with no await before it, so the pop-up counts as part of the tap.
 */
export function signIn(method) {
  if (loaded) return popupThenRedirect(loaded, method);
  return loadAuth().then((mod) => popupThenRedirect(mod, method));
}

export function signInWithGoogle() {
  return signIn("google");
}

export function signInWithApple() {
  return signIn("apple");
}

/**
 * If this page load is the return leg of a redirect sign-in, finish it and
 * return { idToken, profile, method }. Otherwise null. Also warms up the SDK.
 */
export function completeRedirectSignIn() {
  if (!redirectPromise) {
    redirectPromise = (async () => {
      const mod = await loadAuth();
      let method = "";
      try {
        method = sessionStorage.getItem(REDIRECT_METHOD_KEY) || "";
      } catch {
        /* ignore */
      }
      try {
        const result = await mod.authMod.getRedirectResult(mod.auth);
        if (!result?.user) return null;
        const providerId = result.providerId || result.user.providerData?.[0]?.providerId || "";
        return { ...(await toSession(result.user)), method: method || (providerId === "apple.com" ? "apple" : "google") };
      } finally {
        try {
          sessionStorage.removeItem(REDIRECT_METHOD_KEY);
        } catch {
          /* ignore */
        }
      }
    })().catch((error) => {
      redirectPromise = null;
      throw error;
    });
  }
  return redirectPromise;
}

/** Fresh ID token for the currently signed-in Firebase user (signup step). */
export async function currentIdToken() {
  const { auth } = await loadAuth();
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken(true);
}

export async function signOutFirebase() {
  if (!authPromise) return;
  const { auth, authMod } = await loadAuth();
  await authMod.signOut(auth);
}

/*
 * In-app browsers (Instagram, Facebook, Snapchat, LinkedIn, X, TikTok, Android
 * WebViews...). Google refuses sign-in inside embedded browsers
 * ("disallowed_useragent"), and many of them can't open pop-ups.
 */
const IN_APP_BROWSERS = [
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
  [/Messenger/i, "Messenger"],
  [/Snapchat/i, "Snapchat"],
  [/LinkedInApp/i, "LinkedIn"],
  [/Twitter|TwitterAndroid/i, "X"],
  [/musical_ly|BytedanceWebview|TikTok/i, "TikTok"],
  [/\bLine\//i, "LINE"],
  [/Pinterest/i, "Pinterest"],
  [/; wv\)/i, "in-app"],
];

export function inAppBrowserName(ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  for (const [re, name] of IN_APP_BROWSERS) if (re.test(ua)) return name;
  return "";
}

export function isAndroid(ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  return /Android/i.test(ua);
}

export function friendlyFirebaseError(error) {
  const code = error?.code || "";
  const map = {
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/account-exists-with-different-credential": "This email already uses a different sign-in method. Try the other button.",
    "auth/operation-not-allowed": "This sign-in method isn't switched on yet.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups and try again.",
    "auth/network-request-failed": "Network problem. Check your connection and try again.",
    "auth/unauthorized-domain": "This site isn't authorised for login yet.",
    "auth/web-storage-unsupported": "Your browser is blocking the storage sign-in needs. Turn off private mode or allow cookies for this site, then try again.",
    "auth/internal-error": "Sign-in couldn't start in this browser. Try again, or open the site in Safari or Chrome.",
  };
  return map[code] || error?.message || "Something went wrong. Please try again.";
}
