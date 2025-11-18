/**
 * Performance Improvements
 * Various performance optimizations
 */

import type { Signal } from './signal';
import { batch } from './batch';

/**
 * Debounces signal reads (useful for expensive computations)
 */
export function debounceReads<T>(
  sig: Signal<T>,
  delay: number
): Signal<T> {
  let cachedValue: T = sig();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const originalGet = sig.bind(sig);

  return {
    (): T {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        cachedValue = originalGet();
        timeoutId = null;
      }, delay);
      return cachedValue;
    },
    set: sig.set.bind(sig),
    update: sig.update.bind(sig),
    subscribe: sig.subscribe.bind(sig),
  } as Signal<T>;
}

/**
 * Optimizes signal by using Object.freeze for immutability checks
 */
export function immutableSignal<T extends Record<string, any>>(
  initialValue: T
): Signal<T> {
  const sig = signal(initialValue);

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    originalSet(Object.freeze({ ...value }));
  };

  return sig;
}

/**
 * Creates a signal that batches rapid updates
 */
export function autoBatchSignal<T>(
  initialValue: T,
  batchWindow: number = 16 // ~1 frame at 60fps
): Signal<T> {
  const sig = signal(initialValue);
  let pendingValue: T = initialValue;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    pendingValue = value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      originalSet(pendingValue);
      timeoutId = null;
    }, batchWindow);
  };

  return sig;
}

