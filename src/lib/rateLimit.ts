import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from '@/lib/redis';

/**
 * Lightweight in-memory sliding window rate limiter fallback for local dev or Redis outages.
 * Tracks requests per identifier (userId or IP address).
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const upstashLimiterCache = new Map<string, Ratelimit>();

const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Synchronous in-memory rate limit check (used as fallback when Upstash Redis is unconfigured).
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInSec: number } {
  purgeExpiredRecords();

  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetInSec = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSec: resetInSec > 0 ? resetInSec : 1,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Distributed sliding-window rate limiter powered by Upstash Redis (@upstash/ratelimit).
 * Gracefully falls back to in-memory sliding window when Upstash credentials are missing.
 */
export async function checkDistributedRateLimit(
  identifier: string,
  limit: number = 20,
  windowSeconds: number = 60,
  prefix: string = 'aegroshield:rl'
): Promise<{ allowed: boolean; remaining: number; resetInSec: number; source: 'upstash' | 'memory' }> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const limiterKey = `${prefix}:${limit}:${windowSeconds}`;
      let limiter = upstashLimiterCache.get(limiterKey);
      if (!limiter) {
        limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
          analytics: false,
          prefix,
        });
        upstashLimiterCache.set(limiterKey, limiter);
      }

      const result = await Promise.race([
        limiter.limit(identifier),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 1000)),
      ]);

      if (result) {
        const resetInSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        return {
          allowed: result.success,
          remaining: result.remaining,
          resetInSec,
          source: 'upstash',
        };
      }
    } catch (err) {
      console.warn('[RateLimit] Upstash limit check failed, falling back to memory:', (err as Error)?.message || err);
    }
  }

  const mem = checkRateLimit(`${prefix}:${identifier}`, limit, windowSeconds * 1000);
  return { ...mem, source: 'memory' };
}
