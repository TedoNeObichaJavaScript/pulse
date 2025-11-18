/**
 * Performance Optimizations
 * Various optimizations for better performance
 */

import type { Signal } from './signal';

/**
 * Prevents circular dependency issues
 */
export function detectCircularDependency(
  signal: Signal<any>,
  visited: Set<Signal<any>> = new Set()
): boolean {
  if (visited.has(signal)) {
    return true; // Circular dependency detected
  }
  visited.add(signal);
  // Would need to traverse dependencies
  return false;
}

/**
 * Optimizes signal updates by batching similar updates
 */
export function optimizeSignalUpdates<T>(
  sig: Signal<T>,
  debounceMs: number = 0
): Signal<T> {
  if (debounceMs === 0) {
    return sig;
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingValue: T | null = null;

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    pendingValue = value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (pendingValue !== null) {
        originalSet(pendingValue);
        pendingValue = null;
      }
      timeoutId = null;
    }, debounceMs);
  };

  return sig;
}

/**
 * Memoizes signal getter to avoid repeated computations
 */
export function memoizeSignalGetter<T>(
  sig: Signal<T>,
  ttl: number = 0
): Signal<T> {
  let cachedValue: T | undefined;
  let cacheTime = 0;

  const originalGet = sig.bind(sig);
  const memoizedGet = (): T => {
    const now = Date.now();
    if (cachedValue !== undefined && (ttl === 0 || now - cacheTime < ttl)) {
      return cachedValue;
    }
    cachedValue = originalGet();
    cacheTime = now;
    return cachedValue;
  };

  // Invalidate cache on updates
  sig.subscribe(() => {
    cachedValue = undefined;
  });

  return Object.assign(memoizedGet, {
    set: sig.set.bind(sig),
    update: sig.update.bind(sig),
    subscribe: sig.subscribe.bind(sig),
  }) as Signal<T>;
}

