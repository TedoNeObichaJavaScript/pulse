/**
 * Reactive Streams/Operators
 * RxJS-like operators for signals
 */

import type { Signal } from './signal';
import { computed } from './computed';
import { signal } from './signal';

/**
 * Maps signal values through a transformation
 */
export function map<T, U>(sig: Signal<T>, fn: (value: T) => U): Signal<U> {
  return computed(() => fn(sig()));
}

/**
 * Filters signal values based on predicate
 */
export function filter<T>(
  sig: Signal<T>,
  predicate: (value: T) => boolean
): Signal<T | undefined> {
  return computed(() => {
    const value = sig();
    return predicate(value) ? value : undefined;
  });
}

/**
 * Combines multiple signals
 */
export function combineLatest<T extends readonly Signal<any>[]>(
  ...signals: T
): Signal<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  return computed(() => {
    return signals.map((sig) => sig()) as any;
  });
}

/**
 * Takes first N values
 */
export function take<T>(sig: Signal<T>, count: number): Signal<T | undefined> {
  let taken = 0;
  return computed(() => {
    if (taken < count) {
      taken++;
      return sig();
    }
    return undefined;
  });
}

/**
 * Skips first N values
 */
export function skip<T>(sig: Signal<T>, count: number): Signal<T> {
  let skipped = 0;
  return computed(() => {
    if (skipped < count) {
      skipped++;
      return sig();
    }
    return sig();
  });
}

/**
 * Distinct values only
 */
export function distinct<T>(sig: Signal<T>): Signal<T> {
  let lastValue: T | undefined;
  return computed(() => {
    const value = sig();
    if (value !== lastValue) {
      lastValue = value;
      return value;
    }
    return lastValue!;
  });
}

/**
 * Distinct by key selector
 */
export function distinctBy<T, K>(
  sig: Signal<T>,
  keySelector: (value: T) => K
): Signal<T> {
  const seen = new Set<K>();
  return computed(() => {
    const value = sig();
    const key = keySelector(value);
    if (!seen.has(key)) {
      seen.add(key);
      return value;
    }
    // Return previous value if key already seen
    return value;
  });
}

/**
 * Throttles signal updates
 */
export function throttle<T>(sig: Signal<T>, delay: number): Signal<T> {
  let lastUpdate = 0;
  let lastValue: T = sig();
  return computed(() => {
    const now = Date.now();
    if (now - lastUpdate >= delay) {
      lastUpdate = now;
      lastValue = sig();
    }
    return lastValue;
  });
}

/**
 * Debounces signal updates
 */
export function debounce<T>(sig: Signal<T>, delay: number): Signal<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastValue: T = sig();
  const debounced = signal<T>(lastValue);

  sig.subscribe((value) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      debounced.set(value);
      timeoutId = null;
    }, delay);
  });

  return debounced;
}

/**
 * Scans (accumulates) values over time
 */
export function scan<T, U>(
  sig: Signal<T>,
  accumulator: (acc: U, value: T) => U,
  seed: U
): Signal<U> {
  let acc = seed;
  return computed(() => {
    acc = accumulator(acc, sig());
    return acc;
  });
}

/**
 * Samples signal at intervals
 */
export function sample<T>(sig: Signal<T>, interval: number): Signal<T> {
  let lastValue: T = sig();
  const sampled = signal<T>(lastValue);

  setInterval(() => {
    sampled.set(sig());
  }, interval);

  return sampled;
}

/**
 * Delays signal updates
 */
export function delay<T>(sig: Signal<T>, delayMs: number): Signal<T> {
  const delayed = signal<T>(sig());

  sig.subscribe((value) => {
    setTimeout(() => {
      delayed.set(value);
    }, delayMs);
  });

  return delayed;
}

