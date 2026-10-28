import { Redis } from "@upstash/redis";
import { env } from "./env.js";

// Redis is optional: if the keys are missing the app still works (no cache, no rate limit).
export const redis =
  env.UPSTASH_URL && env.UPSTASH_TOKEN ? new Redis({ url: env.UPSTASH_URL, token: env.UPSTASH_TOKEN }) : null;

export async function cacheGet(key) {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSec = 3600) {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSec });
  } catch {
    /* cache failures must never break a request */
  }
}

// Fixed-window counter. Fails open if Redis is down.
export async function hit(key, limit, windowSec) {
  if (!redis) return { ok: true, remaining: limit };
  try {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, windowSec);
    return { ok: n <= limit, remaining: Math.max(0, limit - n) };
  } catch {
    return { ok: true, remaining: limit };
  }
}
