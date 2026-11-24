/*
 * Firebase Auth on the web - same identity provider the HFG app uses
 * (project hash-ee6fc). Loaded lazily so the landing pages don't pay for it.
 *
 * Firebase talks directly to Google over TLS (Google and Apple sign-in); that
 * traffic is Google's protocol and cannot be wrapped by our gateway layer.
 * Only the resulting short-lived ID token reaches our gateway, encrypted.
 */

import { FIREBASE_CONFIG as config } from "@/lib/site";

let authPromise = null;

async function getAuthModule() {
  const [{ initializeApp, getApps }, authMod] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
  if (!config.apiKey || !config.appId) throw new Error("Login is not configured yet.");
  const app = getApps()[0] || initializeApp(config);
  const auth = authMod.getAuth(app);
  // Keep Firebase's own session only for this tab: our gateway issues the
  // real website session cookie, so nothing long-lived sits in localStorage.
  await authMod.setPersistence(auth, authMod.browserSessionPersistence);
  auth.useDeviceLanguage();
  return { auth, authMod };
}

function loadAuth() {
  if (!authPromise) {
    authPromise = getAuthModule().catch((error) => {
      authPromise = null;
      throw error;
    });
  }
  return authPromise;
}

async function popupSignIn(provider) {
  const { auth, authMod } = await loadAuth();
  const cred = await authMod.signInWithPopup(auth, provider);
  const user = cred.user;
  return {
    idToken: await user.getIdToken(true),
    // Prefill for first-time signup only; the server trusts the verified token, not these.
    profile: { name: user.displayName || "", email: user.email || "", phone: user.phoneNumber || "" },
  };
}

/** Google sign-in, as in the app (login_controller.googleSignIn). */
export async function signInWithGoogle() {
  const { authMod } = await loadAuth();
  const provider = new authMod.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return popupSignIn(provider);
}

/** Sign in with Apple, as in the app (login_controller.appleSignIn): email + name scopes. */
export async function signInWithApple() {
  const { authMod } = await loadAuth();
  const provider = new authMod.OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  provider.setCustomParameters({ locale: "en_IN" });
  return popupSignIn(provider);
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
  };
  return map[code] || error?.message || "Something went wrong. Please try again.";
}
