import "server-only";

/**
 * Reads a JWT payload WITHOUT verifying it. Only for choosing UI paths and
 * cookie lifetimes for tokens we just received from our own backends over
 * TLS; never use the result as proof of identity.
 */
export function peekJwt(token) {
  try {
    const [, payload] = String(token).split(".");
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}
