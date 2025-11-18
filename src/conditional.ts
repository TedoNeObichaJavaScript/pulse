/**
 * Conditional Subscriptions
 * Subscribe only when conditions are met
 */

import type { Signal } from './signal';
import { effect } from './effect';

/**
 * Subscribes to a signal only when a condition is met
 */
export function conditionalSubscribe<T>(
  sig: Signal<T>,
  condition: (value: T) => boolean,
  callback: (value: T) => void
): () => void {
  return effect(() => {
    const value = sig();
    if (condition(value)) {
      callback(value);
    }
  });
}

/**
 * Creates an effect that only runs when condition is met
 */
export function conditionalEffect<T>(
  sig: Signal<T>,
  condition: (value: T) => boolean,
  fn: (value: T) => void | (() => void)
): () => void {
  let cleanup: (() => void) | undefined;

  return effect(() => {
    const value = sig();
    if (condition(value)) {
      if (cleanup) {
        cleanup();
        cleanup = undefined;
      }
      const result = fn(value);
      cleanup = typeof result === 'function' ? result : undefined;
    } else {
      if (cleanup) {
        cleanup();
        cleanup = undefined;
      }
    }
  });
}

