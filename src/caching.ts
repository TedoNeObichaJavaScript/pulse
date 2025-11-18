/**
 * Signal Caching
 * Smart caching with TTL and invalidation
 */

import type { Signal } from './signal';
import { computed } from './computed';

export interface CacheOptions {
  /**
   * Time to live in milliseconds (default: Infinity)
   */
  ttl?: number;
  /**
   * Maximum cache size (default: Infinity)
   */
  maxSize?: number;
  /**
   * Custom cache key generator
   */
  keyGenerator?: (...args: any[]) => string;
}

type CacheEntry<T> = {
  value: T;
  timestamp: number;
  accessCount: number;
};

/**
 * Creates a cached computed value
 */
export function cachedComputed<T>(
  fn: () => T,
  options: CacheOptions = {}
): Signal<T> {
  const { ttl = Infinity, maxSize = Infinity } = options;
  const cache = new Map<string, CacheEntry<T>>();

  const getCacheKey = (): string => {
    // Simple key based on function dependencies
    // In a real implementation, this would track dependencies
    return 'default';
  };

  const getCached = (): T | null => {
    const key = getCacheKey();
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL
    if (ttl !== Infinity && Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return entry.value;
  };

  const setCached = (value: T): void => {
    const key = getCacheKey();

    // Check max size
    if (cache.size >= maxSize && !cache.has(key)) {
      // Remove least recently used
      let lruKey: string | null = null;
      let lruCount = Infinity;

      for (const [k, entry] of cache.entries()) {
        if (entry.accessCount < lruCount) {
          lruCount = entry.accessCount;
          lruKey = k;
        }
      }

      if (lruKey) {
        cache.delete(lruKey);
      }
    }

    cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0,
    });
  };

  return computed(() => {
    const cached = getCached();
    if (cached !== null) {
      return cached;
    }

    const value = fn();
    setCached(value);
    return value;
  }) as Signal<T>;
}

/**
 * Invalidates cache for a computed
 */
export function invalidateCache(sig: Signal<any>): void {
  // This would need to be integrated with the cache implementation
  // For now, it's a placeholder
}

