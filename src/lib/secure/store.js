import "server-only";

/*
 * Small shared-state layer for replay protection and rate limiting.
 *
 * Production (multiple serverless instances): set UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN (any Redis REST endpoint with the Upstash API works).
 * Without them we fall back to per-instance memory, which still blocks replays
 * and floods that hit the same instance but is not a global guarantee.
 */

const memory = new Map();
const MAX_MEMORY_KEYS = 50_000;

function memorySweep(now) {
  if (memory.size < MAX_MEMORY_KEYS) return;
  for (const [key, entry] of memory) {
    if (entry.exp <= now) memory.delete(key);
  }
  if (memory.size >= MAX_MEMORY_KEYS) {
    const drop = Math.ceil(MAX_MEMORY_KEYS / 10);
    let i = 0;
    for (const key of memory.keys()) {
      memory.delete(key);
      if (++i >= drop) break;
    }
  }
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redisPipeline(commands) {
  const cfg = redisConfig();
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(1500),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return res.json();
}

/** Returns true the first time a key is seen within ttl; false on replay. */
export async function claimOnce(key, ttlSeconds) {
  const now = Date.now();
  if (redisConfig()) {
    try {
      const [result] = await redisPipeline([["SET", `hfg:once:${key}`, "1", "NX", "EX", String(ttlSeconds)]]);
      return result?.result === "OK";
    } catch {
      // Fail closed for replay protection would take the site down when Redis
      // blips; fall back to memory so replays on this instance are still caught.
    }
  }
  memorySweep(now);
  const existing = memory.get(`once:${key}`);
  if (existing && existing.exp > now) return false;
  memory.set(`once:${key}`, { exp: now + ttlSeconds * 1000 });
  return true;
}

/**
 * Fixed-window counter. Returns { allowed, remaining, resetSeconds }.
 */
export async function hit(bucket, limit, windowSeconds) {
  const now = Date.now();
  const windowId = Math.floor(now / (windowSeconds * 1000));
  const key = `rl:${bucket}:${windowId}`;
  const resetSeconds = windowSeconds - Math.floor((now / 1000) % windowSeconds);
  if (redisConfig()) {
    try {
      const [count] = await redisPipeline([
        ["INCR", `hfg:${key}`],
        ["EXPIRE", `hfg:${key}`, String(windowSeconds + 5)],
      ]);
      const value = Number(count?.result || 0);
      return { allowed: value <= limit, remaining: Math.max(0, limit - value), resetSeconds };
    } catch {
      // fall through to memory
    }
  }
  memorySweep(now);
  const entry = memory.get(key) || { count: 0, exp: now + windowSeconds * 1000 };
  entry.count += 1;
  memory.set(key, entry);
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetSeconds };
}

export function _resetMemoryForTests() {
  memory.clear();
}
