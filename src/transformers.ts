/**
 * Signal Transformers
 * Map/filter/reduce operations on signals
 */

import type { Signal } from './signal';
import { computed, type Computed } from './computed';

/**
 * Maps a signal value through a transformation function
 */
export function mapSignal<T, U>(
  sig: Signal<T>,
  fn: (value: T) => U
): Signal<U> {
  return computed(() => fn(sig())) as Signal<U>;
}

/**
 * Filters signal values based on a predicate
 * Returns a computed that only updates when predicate is true
 */
export function filterSignal<T>(
  sig: Signal<T>,
  predicate: (value: T) => boolean
): Signal<T | undefined> {
  return computed(() => {
    const value = sig();
    return predicate(value) ? value : undefined;
  }) as Signal<T | undefined>;
}

/**
 * Reduces signal values over time
 */
export function reduceSignal<T, U>(
  sig: Signal<T>,
  reducer: (accumulator: U, current: T) => U,
  initialValue: U
): Computed<U> {
  let accumulator = initialValue;
  return computed(() => {
    accumulator = reducer(accumulator, sig());
    return accumulator;
  });
}

/**
 * Chains multiple transformations
 */
export function pipeSignal<T>(
  sig: Signal<T>,
  ...transformers: Array<(value: any) => any>
): Computed<any> {
  return computed(() => {
    let value: any = sig();
    for (const transformer of transformers) {
      value = transformer(value);
    }
    return value;
  });
}

/**
 * Combines multiple signals into one
 */
export function combineSignals<T extends readonly Signal<any>[]>(
  ...signals: T
): Signal<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  return computed(() => {
    return signals.map((sig) => sig()) as any;
  }) as any;
}

/**
 * Zips multiple signals into tuples
 */
export function zipSignals<T extends readonly Signal<any>[]>(
  ...signals: T
): Signal<{ [K in keyof T]: T[K] extends Signal<infer U> ? U : never }> {
  return combineSignals(...signals);
}

