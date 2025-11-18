/**
 * Performance Optimizations
 * Various performance improvements
 */

import type { Signal } from './signal';
import { batch } from './batch';

/**
 * Optimizes multiple signal reads by batching
 */
export function batchReads<T>(signals: Signal<T>[]): T[] {
  return batch(() => {
    return signals.map((sig) => sig());
  });
}

/**
 * Creates a signal that only updates when value actually changes (deep comparison)
 */
export function optimizedSignal<T>(
  initialValue: T,
  options: {
    deepEqual?: boolean;
    customEqual?: (a: T, b: T) => boolean;
  } = {}
): Signal<T> {
  const { deepEqual: useDeepEqual = false, customEqual } = options;

  let lastValue: T = initialValue;

  const equals = customEqual || (useDeepEqual ? deepEqualImpl : undefined);

  return {
    (): T {
      return lastValue;
    },
    set: (value: T) => {
      if (equals ? !equals(lastValue, value) : lastValue !== value) {
        lastValue = value;
      }
    },
    update: (fn: (value: T) => T) => {
      const newValue = fn(lastValue);
      if (equals ? !equals(lastValue, newValue) : lastValue !== newValue) {
        lastValue = newValue;
      }
    },
    subscribe: () => {
      return () => {}; // No-op for this simplified version
    },
  } as Signal<T>;
}

function deepEqualImpl<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqualImpl((a as any)[key], (b as any)[key])) return false;
  }

  return true;
}

/**
 * Prevents unnecessary re-renders by using requestAnimationFrame
 */
export function rafSignal<T>(sig: Signal<T>): Signal<T> {
  let rafId: number | null = null;
  let pendingValue: T = sig();

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    pendingValue = value;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        originalSet(pendingValue);
        rafId = null;
      });
    }
  };

  return sig;
}

