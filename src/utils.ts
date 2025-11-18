/**
 * Utility functions for signals
 */

import type { Signal } from './signal';
import { signal } from './signal';
import { debounceMiddleware, throttleMiddleware } from './middleware';

/**
 * Creates a debounced signal that delays updates
 */
export function debouncedSignal<T>(
  initialValue: T,
  delay: number
): Signal<T> {
  return signal(initialValue, {
    middleware: [debounceMiddleware(delay)],
  });
}

/**
 * Creates a throttled signal that limits update frequency
 */
export function throttledSignal<T>(
  initialValue: T,
  delay: number
): Signal<T> {
  return signal(initialValue, {
    middleware: [throttleMiddleware(delay)],
  });
}

/**
 * Creates a signal that only updates when condition is met
 */
export function conditionalSignal<T>(
  initialValue: T,
  condition: (value: T) => boolean
): Signal<T> {
  return signal(initialValue, {
    middleware: [
      (value, next, sig) => {
        if (condition(value)) {
          return next(value);
        }
        return sig(); // Return current value if condition not met
      },
    ],
  });
}

