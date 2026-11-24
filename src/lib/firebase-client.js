/*
 * Firebase Auth on the web - same identity provider the HFG app uses
 * (project hash-ee6fc). Loaded lazily so the landing pages don't pay for it.
 *
 * Firebase talks directly to Google over TLS (OTP SMS, Google sign-in); that
 * traffic is Google's protocol and cannot be wrapped by our gateway layer.
 * Only the resulting short-lived ID token reaches our gateway, encrypted.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hash-ee6fc.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hash-ee6fc",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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

let verifier = null;

export async function sendOtp(phoneE164, containerId) {
  const { auth, authMod } = await loadAuth();
  if (!verifier) {
    verifier = new authMod.RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  try {
    return await authMod.signInWithPhoneNumber(auth, phoneE164, verifier);
  } catch (error) {
    try {
      verifier.clear();
    } catch {}
    verifier = null;
    throw error;
  }
}

export async function confirmOtp(confirmation, code) {
  const cred = await confirmation.confirm(code);
  return cred.user.getIdToken(true);
}

export async function signInWithGoogle() {
  const { auth, authMod } = await loadAuth();
  const provider = new authMod.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await authMod.signInWithPopup(auth, provider);
  return cred.user.getIdToken(true);
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
    "auth/invalid-phone-number": "That phone number doesn't look right.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/invalid-verification-code": "That code is incorrect.",
    "auth/code-expired": "That code expired. Request a new one.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups and try again.",
    "auth/network-request-failed": "Network problem. Check your connection and try again.",
    "auth/unauthorized-domain": "This site isn't authorised for login yet.",
    "auth/captcha-check-failed": "Verification failed. Please refresh and try again.",
    "auth/quota-exceeded": "OTP service is busy. Please try again later.",
  };
  return map[code] || error?.message || "Something went wrong. Please try again.";
}
