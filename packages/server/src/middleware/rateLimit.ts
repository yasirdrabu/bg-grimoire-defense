import { createMiddleware } from 'hono/factory';

export interface RateLimitConfig {
  windowMs: number; // time window in ms
  max: number; // max requests per window
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const hits = new Map<string, RateLimitEntry>();

  return createMiddleware(async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for') ??
      c.req.header('x-real-ip') ??
      'unknown';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + config.windowMs });
      await next();
      return;
    }

    if (entry.count >= config.max) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    entry.count++;
    await next();
  });
}
