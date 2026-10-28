import { hit } from "../config/redis.js";

// Upstash-backed limiter. keyFn picks what to count (user id, ip...).
export const limit = (name, max, windowSec, keyFn = (req) => req.user?.id || req.ip) => async (req, res, next) => {
  const { ok } = await hit(`rl:${name}:${keyFn(req)}`, max, windowSec);
  if (!ok) return res.status(429).json({ error: `Too many requests. Try again in ${windowSec >= 60 ? Math.ceil(windowSec / 60) + " min" : windowSec + "s"}.` });
  next();
};
