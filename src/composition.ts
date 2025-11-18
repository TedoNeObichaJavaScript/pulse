/**
 * Signal Composition
 * Higher-order signals and composition utilities
 */

import type { Signal } from './signal';
import { signal } from './signal';
import { computed, type Computed } from './computed';

/**
 * Composes multiple signals into one
 */
export function composeSignals<T extends Record<string, Signal<any>>>(
  signals: T
): Computed<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  return computed(() => {
    const result: any = {};
    for (const [key, sig] of Object.entries(signals)) {
      result[key] = sig();
    }
    return result;
  });
}

/**
 * Creates a signal that depends on multiple signals
 */
export function combineSignals<T extends readonly Signal<any>[]>(
  ...signals: T
): Computed<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  return computed(() => {
    return signals.map((sig) => sig()) as any;
  });
}

/**
 * Creates a signal from a function that takes multiple signals
 */
export function deriveSignal<T, U extends readonly Signal<any>[]>(
  fn: (...values: { [K in keyof U]: U[K] extends Signal<infer V> ? V : never }) => T,
  ...signals: U
): Computed<T> {
  return computed(() => {
    const values = signals.map((sig) => sig()) as any;
    return fn(...values);
  });
}

/**
 * Creates a signal that switches between multiple signals
 */
export function switchSignal<T>(
  condition: Signal<number>,
  ...signals: Signal<T>[]
): Computed<T> {
  return computed(() => {
    const index = condition();
    if (index >= 0 && index < signals.length) {
      return signals[index]();
    }
    throw new Error(`Invalid signal index: ${index}`);
  });
}

/**
 * Creates a signal that merges multiple signals with a merge function
 */
export function mergeSignalsWith<T, U>(
  mergeFn: (values: T[]) => U,
  ...signals: Signal<T>[]
): Computed<U> {
  return computed(() => {
    const values = signals.map((sig) => sig());
    return mergeFn(values);
  });
}

/**
 * Creates a signal that picks values from another signal
 */
export function pickSignal<T, K extends keyof T>(
  sig: Signal<T>,
  ...keys: K[]
): Computed<Pick<T, K>> {
  return computed(() => {
    const value = sig();
    const result: any = {};
    for (const key of keys) {
      result[key] = value[key];
    }
    return result;
  });
}

/**
 * Creates a signal that omits keys from another signal
 */
export function omitSignal<T, K extends keyof T>(
  sig: Signal<T>,
  ...keys: K[]
): Computed<Omit<T, K>> {
  return computed(() => {
    const value = sig();
    const result: any = { ...value };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  });
}

/**
 * Creates a signal that maps over an array signal
 */
export function mapSignal<T, U>(
  sig: Signal<T[]>,
  mapper: (item: T, index: number) => U
): Computed<U[]> {
  return computed(() => {
    return sig().map(mapper);
  });
}

/**
 * Creates a signal that filters an array signal
 */
export function filterSignal<T>(
  sig: Signal<T[]>,
  predicate: (item: T, index: number) => boolean
): Computed<T[]> {
  return computed(() => {
    return sig().filter(predicate);
  });
}

/**
 * Creates a signal that reduces an array signal
 */
export function reduceSignal<T, U>(
  sig: Signal<T[]>,
  reducer: (acc: U, item: T, index: number) => U,
  initial: U
): Computed<U> {
  return computed(() => {
    return sig().reduce(reducer, initial);
  });
}

