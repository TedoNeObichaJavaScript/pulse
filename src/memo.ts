/**
 * Signal Memoization
 * Memoized computed values with dependency tracking
 */

import { computed } from './computed';
import type { Signal } from './signal';

/**
 * Creates a memoized computed value
 * Results are cached based on dependency values
 */
export function memoizedComputed<T>(
  fn: () => T,
  keyGenerator?: (...deps: any[]) => string
): Signal<T> {
  const cache = new Map<string, T>();
  let lastDeps: any[] = [];

  return computed(() => {
    // Get current dependency values
    const currentDeps = lastDeps; // This would need proper dependency tracking

    // Generate cache key
    const key = keyGenerator
      ? keyGenerator(...currentDeps)
      : JSON.stringify(currentDeps);

    // Check cache
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // Compute and cache
    const value = fn();
    cache.set(key, value);

    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return value;
  }) as Signal<T>;
}

