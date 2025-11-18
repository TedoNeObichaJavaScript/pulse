/**
 * Signal Testing Utilities
 * Helpers for testing signals in test suites
 */

import type { Signal } from './signal';

/**
 * Waits for a signal to match a condition
 */
export async function waitForSignal<T>(
  sig: Signal<T>,
  condition: (value: T) => boolean,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const value = sig();
      if (condition(value)) {
        resolve(value);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for signal condition after ${timeout}ms`));
        return;
      }

      setTimeout(check, 10);
    };

    // Check immediately
    check();

    // Also subscribe for faster updates
    const unsubscribe = sig.subscribe((value) => {
      if (condition(value)) {
        unsubscribe();
        resolve(value);
      }
    });
  });
}

/**
 * Gets all signal values over time
 */
export function collectSignalValues<T>(
  sig: Signal<T>,
  duration: number = 1000
): Promise<T[]> {
  return new Promise((resolve) => {
    const values: T[] = [sig()];
    const unsubscribe = sig.subscribe((value) => {
      values.push(value);
    });

    setTimeout(() => {
      unsubscribe();
      resolve(values);
    }, duration);
  });
}

/**
 * Mocks a signal for testing
 */
export function mockSignal<T>(value: T): Signal<T> {
  let currentValue = value;
  const subscribers = new Set<(value: T) => void>();

  return {
    (): T {
      return currentValue;
    },
    set: (newValue: T) => {
      currentValue = newValue;
      subscribers.forEach((callback) => callback(newValue));
    },
    update: (fn: (value: T) => T) => {
      currentValue = fn(currentValue);
      subscribers.forEach((callback) => callback(currentValue));
    },
    subscribe: (callback: (value: T) => void) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
  };
}

/**
 * Asserts signal value
 */
export function expectSignal<T>(
  sig: Signal<T>,
  expected: T
): void {
  const actual = sig();
  if (actual !== expected) {
    throw new Error(`Expected signal value ${expected}, got ${actual}`);
  }
}

