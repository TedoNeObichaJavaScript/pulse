/**
 * Signal Selectors
 * Selector pattern for derived state
 */

import type { Signal } from './signal';
import { computed, type Computed } from './computed';

export type Selector<T, R> = (state: T) => R;

/**
 * Creates a selector that derives state from a signal
 */
export function createSelector<T, R>(
  sig: Signal<T>,
  selector: Selector<T, R>
): Computed<R> {
  return computed(() => selector(sig()));
}

/**
 * Creates a memoized selector
 */
export function createMemoizedSelector<T, R>(
  sig: Signal<T>,
  selector: Selector<T, R>,
  equalityFn?: (a: R, b: R) => boolean
): Computed<R> {
  let lastInput: T | undefined;
  let lastOutput: R | undefined;

  return computed(() => {
    const currentInput = sig();
    
    if (lastInput === currentInput && lastOutput !== undefined) {
      return lastOutput;
    }

    const output = selector(currentInput);
    
    if (equalityFn && lastOutput !== undefined) {
      if (equalityFn(lastOutput, output)) {
        return lastOutput;
      }
    }

    lastInput = currentInput;
    lastOutput = output;
    return output;
  });
}

/**
 * Creates a selector with multiple inputs
 */
export function createCombinedSelector<T extends readonly Signal<any>[], R>(
  signals: T,
  selector: (...values: { [K in keyof T]: T[K] extends Signal<infer U> ? U : never }) => R
): Computed<R> {
  return computed(() => {
    const values = signals.map((sig) => sig()) as any;
    return selector(...values);
  });
}

