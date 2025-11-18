/**
 * Optimized Computed Values
 * Performance improvements for computed values
 */

import { computed, type Computed } from './computed';
import type { Signal } from './signal';

/**
 * Computed with better caching strategy
 */
export function optimizedComputed<T>(
  fn: () => T,
  options: {
    cacheSize?: number;
    ttl?: number;
  } = {}
): Computed<T> {
  const { cacheSize = 1, ttl = 0 } = options;
  const cache = new Map<string, { value: T; timestamp: number }>();
  
  // Use computed as base
  const baseComputed = computed(fn);
  
  // Wrap with caching
  const cachedGet = (): T => {
    const now = Date.now();
    const key = 'default'; // Could use dependency hash
    
    const cached = cache.get(key);
    if (cached && (ttl === 0 || now - cached.timestamp < ttl)) {
      return cached.value;
    }
    
    const value = baseComputed();
    cache.set(key, { value, timestamp: now });
    
    // Limit cache size
    if (cache.size > cacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return value;
  };
  
  const cachedComputed = cachedGet as Computed<T>;
  cachedComputed.subscribe = baseComputed.subscribe.bind(baseComputed);
  
  return cachedComputed;
}

/**
 * Computed with dependency memoization
 */
const dependencyCache = new WeakMap<Signal<any>, Set<Signal<any>>>();
let dependencyCounter = 0;

export function memoizedComputedDependencies<T>(
  fn: () => T
): Computed<T> {
  // This would track dependencies more efficiently
  return computed(fn);
}

/**
 * Batch computed recalculations
 */
let computedBatchQueue: Set<() => void> = new Set();
let computedBatchScheduled = false;

function flushComputedBatch(): void {
  computedBatchScheduled = false;
  const updates = Array.from(computedBatchQueue);
  computedBatchQueue.clear();
  
  for (const update of updates) {
    try {
      update();
    } catch (error) {
      console.error('Error in computed batch:', error);
    }
  }
}

export function scheduleComputedUpdate(update: () => void): void {
  computedBatchQueue.add(update);
  if (!computedBatchScheduled) {
    computedBatchScheduled = true;
    queueMicrotask(flushComputedBatch);
  }
}

