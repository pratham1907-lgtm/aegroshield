import { Redis } from '@upstash/redis';

const globalForRedis = globalThis as unknown as {
  upstashRedis: Redis | null | undefined;
  localCache: Map<string, { value: unknown; expiresAt: number }> | undefined;
};

const localFallbackCache =
  globalForRedis.localCache ?? new Map<string, { value: unknown; expiresAt: number }>();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.localCache = localFallbackCache;
}

function isPlaceholder(val?: string): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  return !trimmed || trimmed.startsWith('your_') || trimmed.includes('[');
}

/**
 * Singleton Upstash Redis client.
 * Gracefully returns null when UPSTASH_REDIS_REST_URL / TOKEN are absent in local dev.
 */
export function getRedisClient(): Redis | null {
  if (globalForRedis.upstashRedis !== undefined) {
    return globalForRedis.upstashRedis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (isPlaceholder(url) || isPlaceholder(token)) {
    globalForRedis.upstashRedis = null;
    return null;
  }

  try {
    const client = new Redis({
      url: url!,
      token: token!,
    });
    globalForRedis.upstashRedis = client;
    return client;
  } catch (err) {
    console.warn('[Redis] Failed to initialize Upstash client, using local fallback:', err);
    globalForRedis.upstashRedis = null;
    return null;
  }
}

/**
 * Reads a JSON value from Upstash Redis (or in-memory fallback when Redis is unconfigured).
 * Enforces a fast timeout so cache outages never block API latency.
 */
export async function getCachedJson<T>(key: string): Promise<T | null> {
  const client = getRedisClient();

  if (client) {
    try {
      const result = await Promise.race([
        client.get<T>(key),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 1000)),
      ]);
      if (result !== null && result !== undefined) {
        return result;
      }
    } catch (err) {
      console.warn(`[Redis] GET "${key}" warning:`, (err as Error)?.message || err);
    }
  }

  // Local fallback cache check
  const localHit = localFallbackCache.get(key);
  if (localHit) {
    if (localHit.expiresAt > Date.now()) {
      return localHit.value as T;
    }
    localFallbackCache.delete(key);
  }

  return null;
}

/**
 * Stores a JSON-serializable value in Upstash Redis (and local fallback) with TTL in seconds.
 */
export async function setCachedJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  // Always store in local in-process fallback with TTL cap (max 500 entries)
  if (localFallbackCache.size >= 500) {
    const firstKey = localFallbackCache.keys().next().value;
    if (firstKey) localFallbackCache.delete(firstKey);
  }
  localFallbackCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  const client = getRedisClient();
  if (!client) return;

  try {
    await Promise.race([
      client.set(key, value, { ex: ttlSeconds }),
      new Promise<void>(resolve => setTimeout(resolve, 1000)),
    ]);
  } catch (err) {
    console.warn(`[Redis] SET "${key}" warning:`, (err as Error)?.message || err);
  }
}

/**
 * Deletes a key from Upstash Redis and local fallback cache.
 */
export async function deleteCachedKey(key: string): Promise<void> {
  localFallbackCache.delete(key);
  const client = getRedisClient();
  if (!client) return;

  try {
    await Promise.race([
      client.del(key),
      new Promise<void>(resolve => setTimeout(resolve, 1000)),
    ]);
  } catch (err) {
    console.warn(`[Redis] DEL "${key}" warning:`, (err as Error)?.message || err);
  }
}

const SEMANTIC_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'in', 'for', 'of', 'to', 'on', 'and', 'or',
  'what', 'how', 'can', 'i', 'please', 'tell', 'me', 'about', 'give', 'best',
  'kya', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'par', 'aur', 'batao',
  'bataiye', 'kripya', 'kitna', 'kitni', 'chahiye', 'dalein', 'lagayein',
]);

/**
 * Normalizes a natural-language agricultural query into a stable semantic cache key
 * so equivalent phrasing ("wheat fertilizer dose" vs "what is the fertilizer dose for wheat?")
 * resolves to the exact same Redis cache entry.
 */
export function buildSemanticCacheKey(prefix: string, query: string, variant: string = 'en'): string {
  const tokens = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0 && !SEMANTIC_STOPWORDS.has(token));

  const uniqueSorted = Array.from(new Set(tokens)).sort();
  const signature = uniqueSorted.length > 0 ? uniqueSorted.join('_') : 'general';
  return `${prefix}:${variant}:${signature.slice(0, 140)}`;
}
