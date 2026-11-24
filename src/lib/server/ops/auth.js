import "server-only";
import { TokenError, verifyFirebaseIdToken } from "@/lib/server/firebase-verify";
import { upstream, UpstreamError } from "@/lib/server/upstream";
import { peekJwt } from "@/lib/server/jwt-peek";
import { clean, v } from "@/lib/server/validate";
import { newSession, publicProfile } from "@/lib/secure/session";
import { hit } from "@/lib/secure/store";

const useGateway = () => Boolean(process.env.HFG_GATEWAY_HMAC_SECRET) && process.env.HFG_AUTH_MODE !== "legacy";

async function verifyIdToken(idToken) {
  try {
    return await verifyFirebaseIdToken(v.str(idToken, "idToken", { max: 4096 }));
  } catch (error) {
    if (error instanceof TokenError) {
      const e = new Error(error.message);
      e.status = 401;
      throw e;
    }
    throw error;
  }
}

/** Resolves the HFG account for a verified Firebase identity. */
async function fetchHfgAccount(identity, idToken, requestId) {
  try {
    if (useGateway()) {
      // Hardened path: hfg-user-onboard re-verifies the ID token with the
      // Firebase Admin SDK (incl. revocation) and checks our HMAC signature.
      const { data } = await upstream("userOnboard", "/api/web/auth/session", {
        method: "POST",
        body: { id_token: idToken },
        signGateway: true,
        requestId,
      });
      return data;
    }
    // Compatibility path: same contract the mobile app uses today. The ID
    // token was verified above, so the fid is proven to belong to this user.
    const { data } = await upstream("userOnboard", `/api/users/fid/${encodeURIComponent(identity.uid)}`, { requestId });
    return data;
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) return null;
    throw error;
  }
}

function sessionFromAccount(account, identity) {
  const token = account?.token;
  const user = account?.user;
  if (!token || !user?.id) {
    const e = new Error("Sign-in failed. Please try again.");
    e.status = 502;
    throw e;
  }
  const claims = peekJwt(token);
  return newSession({ user, hfgToken: token, hfgTokenExp: Number(claims.exp) || undefined, fid: identity.uid });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** hfg-user-onboard validates dob as DD-Mon-YYYY (e.g. 09-Apr-2000). */
function toBackendDob(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!MONTHS[m - 1] || d < 1 || d > 31) {
    const e = new Error("date of birth is invalid");
    e.status = 400;
    throw e;
  }
  return `${String(d).padStart(2, "0")}-${MONTHS[m - 1]}-${y}`;
}

export const authOps = {
  "auth.session": {
    auth: "none",
    limit: { perIp: 120 },
    async run(ctx) {
      return { user: publicProfile(ctx.session) };
    },
  },

  "auth.login": {
    auth: "none",
    limit: { perIp: 10 },
    async run(ctx, args) {
      const identity = await verifyIdToken(args.idToken);
      const perUser = await hit(`login-uid:${identity.uid}`, 6, 60);
      if (!perUser.allowed) {
        const e = new Error("Too many sign-in attempts. Please wait a minute.");
        e.status = 429;
        throw e;
      }
      const account = await fetchHfgAccount(identity, args.idToken, ctx.requestId);
      if (!account) {
        ctx.track("Signup Started", { method: identity.provider });
        return {
          status: "needs_signup",
          prefill: { name: identity.name, email: identity.email, phone: identity.phone },
        };
      }
      const session = sessionFromAccount(account, identity);
      ctx.setSession(session);
      ctx.identify(session, { method: identity.provider });
      ctx.track("Login Successful", { login_method: identity.provider });
      return { status: "signed_in", user: publicProfile(session) };
    },
  },

  "auth.signup": {
    auth: "none",
    limit: { perIp: 5 },
    async run(ctx, args) {
      const identity = await verifyIdToken(args.idToken);
      const p = v.object(args.profile, "profile");
      const name = clean(v.str(p.name, "name", { min: 2, max: 60 }));
      const gameUserName = v.str(p.gameUserName, "gamer tag", { min: 3, max: 30, pattern: /^[A-Za-z0-9_.-]+$/ });
      const email = identity.email || (p.email ? v.email(p.email) : "");
      const dob = p.dob ? toBackendDob(v.str(p.dob, "date of birth", { pattern: /^\d{4}-\d{2}-\d{2}$/ })) : "";
      const gender = p.gender ? v.oneOf(p.gender, "gender", ["male", "female", "other", "prefer_not_to_say"]) : "";
      const referral = p.referralCode ? v.str(p.referralCode, "referral code", { max: 20, pattern: /^[A-Za-z0-9]+$/ }) : "";
      // Phone comes only from the verified token for phone sign-in.
      const phone = identity.phone || (p.phone ? v.phone(p.phone) : "");

      // Identical payload to HFG-frontend signup_controller.dart.
      const userData = {
        fid: identity.uid,
        avatar_path: "",
        name,
        gender,
        dob,
        gameUserName,
        referral_code: referral,
        contact: {
          physicalAddress: {
            address_type: "home",
            addressLine1: "",
            addressLine2: "",
            pincode: "",
            State: "",
            Country: "India",
            is_active: true,
          },
          electronicAddress: { mobileNo: phone, emailId: email },
        },
      };

      try {
        if (useGateway()) {
          await upstream("userOnboard", "/api/web/auth/signup", {
            method: "POST",
            body: { id_token: args.idToken, profile: userData },
            signGateway: true,
            requestId: ctx.requestId,
          });
        } else {
          await upstream("userOnboard", "/api/users", { method: "POST", body: userData, requestId: ctx.requestId });
        }
      } catch (error) {
        // USER_EXISTS is recovered below by a normal login.
        if (!(error instanceof UpstreamError && error.status === 409 && /exist/i.test(error.message))) throw error;
      }

      const account = await fetchHfgAccount(identity, args.idToken, ctx.requestId);
      if (!account) {
        const e = new Error("Your account is being created. Please sign in again in a moment.");
        e.status = 503;
        throw e;
      }
      const session = sessionFromAccount(account, identity);
      ctx.setSession(session);
      ctx.identify(session, { method: identity.provider });
      ctx.track("Signup Completed", { referral_used: Boolean(referral) });
      return { status: "signed_in", user: publicProfile(session) };
    },
  },

  "auth.logout": {
    auth: "none",
    limit: { perIp: 30 },
    async run(ctx) {
      if (ctx.session) ctx.track("Logout", {});
      ctx.clearSession();
      return { status: "signed_out" };
    },
  },
};
