import "server-only";
import crypto from "node:crypto";
import { after, NextResponse } from "next/server";
import {
  b64u,
  decryptRequest,
  encryptResponse,
  openTicket,
  performHandshake,
  PROTOCOL_VERSION,
  rpcAad,
  rpcResponseAad,
  SecureConfigError,
} from "./server-crypto";
import { claimOnce, hit } from "./store";
import { ipBucket, log, noStoreHeaders, originAllowed, plainError, readJsonBody } from "./http";
import { clearSessionCookie, ensureAnonId, readSession, writeSessionCookie } from "./session";
import { resolveOp } from "@/lib/server/ops";
import { ValidationError } from "@/lib/server/validate";
import { UpstreamError } from "@/lib/server/upstream";
import { sendAnalytics } from "@/lib/server/analytics";

const CLOCK_SKEW_SECONDS = 90;
const NONCE_TTL_SECONDS = 2 * CLOCK_SKEW_SECONDS + 30;

/* ------------------------------------------------------------ handshake */
export async function handleHandshake(request) {
  if (!originAllowed(request)) return plainError(403, "origin", "Forbidden");
  const limited = await hit(`hs:${ipBucket(request)}`, 30, 60);
  if (!limited.allowed) return plainError(429, "rate_limited", "Too many requests", { "Retry-After": String(limited.resetSeconds) });

  const { value, error } = await readJsonBody(request, 2048);
  if (error || value.v !== PROTOCOL_VERSION) return plainError(400, "bad_request", "Bad handshake");
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(value.ts) || Math.abs(now - value.ts) > CLOCK_SKEW_SECONDS * 2) {
    // Tell the client our clock so it can correct a skewed device clock.
    return plainError(400, "clock_skew", "Device clock is out of sync", { "X-HFG-Server-Time": String(now) });
  }
  try {
    const result = performHandshake({ clientPublicKey: value.cpk, clientNonce: value.cn });
    const response = NextResponse.json({ ...result, now }, { headers: noStoreHeaders() });
    ensureAnonId(request, response);
    return response;
  } catch (err) {
    if (err instanceof SecureConfigError) {
      log("error", "secure.misconfigured", { message: err.message });
      return plainError(503, "unavailable", "Secure channel unavailable");
    }
    return plainError(400, "bad_request", "Bad handshake");
  }
}

/* ------------------------------------------------------------------ rpc */
export async function handleRpc(request) {
  if (!originAllowed(request)) return plainError(403, "origin", "Forbidden");
  const bucket = ipBucket(request);
  const global = await hit(`rpc:${bucket}`, 240, 60);
  if (!global.allowed) return plainError(429, "rate_limited", "Too many requests", { "Retry-After": String(global.resetSeconds) });

  let ticket;
  try {
    ticket = openTicket(request.headers.get("x-hfg-ticket"));
  } catch (err) {
    if (err instanceof SecureConfigError) return plainError(503, "unavailable", "Secure channel unavailable");
    ticket = null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (!ticket || ticket.v !== PROTOCOL_VERSION || ticket.exp <= now) {
    return plainError(401, "handshake_required", "Session expired");
  }

  const { value: env, error } = await readJsonBody(request, 96 * 1024);
  if (error || env.v !== PROTOCOL_VERSION || env.sid !== ticket.sid) {
    return plainError(400, "bad_request", "Bad envelope");
  }
  if (!Number.isInteger(env.ts) || Math.abs(now - env.ts) > CLOCK_SKEW_SECONDS) {
    return plainError(401, "handshake_required", "Stale request", { "X-HFG-Server-Time": String(now) });
  }
  if (typeof env.n !== "string" || !/^[A-Za-z0-9_-]{22}$/.test(env.n)) return plainError(400, "bad_request", "Bad nonce");

  const kc = b64u.dec(ticket.kc);
  const ks = b64u.dec(ticket.ks);
  let call;
  try {
    call = decryptRequest(kc, env, rpcAad({ sid: env.sid, ts: env.ts, n: env.n }));
  } catch {
    log("warn", "secure.decrypt_failed", { ip: bucket });
    return plainError(400, "bad_request", "Bad envelope");
  }
  // Replay check AFTER authentication so attackers can't burn nonces.
  if (!(await claimOnce(`n:${env.sid}:${env.n}`, NONCE_TTL_SECONDS))) {
    log("warn", "secure.replay_blocked", { ip: bucket });
    return plainError(409, "replay", "Duplicate request");
  }

  const requestId = crypto.randomUUID();
  let session = readSession(request);
  let sessionDirty = false;
  let sessionCleared = false;
  const analytics = [];
  let attribution = null;

  const ctx = {
    request,
    requestId,
    ipBucket: bucket,
    get session() {
      return session;
    },
    setSession(next) {
      session = next;
      sessionDirty = true;
      sessionCleared = false;
    },
    updateSession(patch) {
      if (!session) return;
      session = { ...session, ...patch };
      for (const [k, val] of Object.entries(patch)) if (val === undefined) delete session[k];
      sessionDirty = true;
    },
    clearSession() {
      session = null;
      sessionCleared = true;
      sessionDirty = false;
    },
    track(name, props = {}) {
      analytics.push({ type: "track", name, props, ts: new Date().toISOString() });
    },
    identify(s, traits = {}) {
      analytics.push({ type: "identify", props: { login_method: traits.method || "", has_handle: Boolean(s.handle) }, ts: new Date().toISOString() });
    },
    setAttribution(utm) {
      attribution = utm;
    },
  };

  let status = 200;
  let result;
  let opName = "unknown";
  try {
    if (!call || typeof call !== "object") throw new ValidationError("Bad call");
    const [name, op] = resolveOp(call.op);
    opName = name;
    if (!op) throw Object.assign(new Error("Unknown operation"), { status: 404 });

    const perOp = await hit(`op:${name}:${bucket}`, op.limit?.perIp ?? 60, 60);
    if (!perOp.allowed) throw Object.assign(new Error("Too many requests. Please slow down."), { status: 429 });
    if (op.auth === "user") {
      if (!session) throw Object.assign(new Error("Please sign in to continue."), { status: 401, code: "auth_required" });
      if (op.limit?.perUser) {
        const perUser = await hit(`opu:${name}:${session.uid}`, op.limit.perUser, 60);
        if (!perUser.allowed) throw Object.assign(new Error("Too many requests. Please slow down."), { status: 429 });
      }
    }
    const data = await op.run(ctx, call.args && typeof call.args === "object" ? call.args : {});
    result = { ok: true, data };
  } catch (err) {
    status = err instanceof ValidationError ? 400 : err instanceof UpstreamError ? mapUpstream(err.status) : err.status || 500;
    if (status === 401 && err instanceof UpstreamError && session) {
      // Backend rejected our stored token: the login is no longer valid.
      ctx.clearSession();
    }
    const message = status >= 500 && !(err instanceof UpstreamError) && !err.status ? "Something went wrong. Please try again." : err.message;
    if (status >= 500) log("error", "rpc.failed", { op: opName, requestId, status, error: err?.name, message: err instanceof UpstreamError ? err.message : undefined });
    result = { ok: false, status, error: { code: err.code || codeFor(status), message } };
    if (opName !== "analytics.track") {
      ctx.track("API Error", {
        op: opName,
        status,
        code: String(err.code || codeFor(status)).slice(0, 40),
        upstream_status: err instanceof UpstreamError ? err.status || 0 : 0,
        signed_in: Boolean(session),
      });
    }
  }

  log("info", "rpc", { op: opName, status, requestId, ip: bucket, uid: session ? "y" : "n" });

  const body = encryptResponse(ks, { ...result, rid: requestId }, rpcResponseAad({ sid: env.sid, n: env.n }));
  // Encrypted responses always travel as HTTP 200 so the outcome of an
  // operation is not visible to anyone observing traffic metadata.
  const response = NextResponse.json(body, { headers: noStoreHeaders() });
  if (sessionCleared) clearSessionCookie(response);
  else if (sessionDirty && session) writeSessionCookie(response, session);
  const anonId = ensureAnonId(request, response);

  if (analytics.length) {
    const ua = request.headers.get("user-agent") || "";
    const context = { userAgent: ua.slice(0, 200), ...(attribution ? { campaign: attribution } : {}), page: { referrer: (request.headers.get("referer") || "").replace(/[?#].*$/, "").slice(0, 200) } };
    // Runs after the response is sent; analytics never slows down or breaks checkout.
    const uid = session?.uid;
    after(() => sendAnalytics(analytics, { anonId, uid, context }).catch(() => {}));
  }
  return response;
}

function mapUpstream(status) {
  if (status === 404 || status === 409 || status === 400 || status === 403 || status === 422 || status === 429) return status === 422 ? 400 : status;
  if (status === 401) return 401;
  return 503;
}

function codeFor(status) {
  return (
    {
      400: "invalid",
      401: "auth_required",
      403: "forbidden",
      404: "not_found",
      409: "conflict",
      429: "rate_limited",
      503: "unavailable",
    }[status] || "error"
  );
}
