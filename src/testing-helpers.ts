/**
 * Testing Helpers
 * Additional utilities for testing signals
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Creates a signal spy for testing
 */
export function createSignalSpy<T>(sig: Signal<T>): {
  values: T[];
  calls: number;
  reset: () => void;
  unsubscribe: () => void;
} {
  const values: T[] = [];
  let calls = 0;

  const unsubscribe = sig.subscribe((value) => {
    values.push(value);
    calls++;
  });

  return {
    values,
    calls,
    reset: () => {
      values.length = 0;
      calls = 0;
    },
    unsubscribe,
  };
}

/**
 * Waits for a signal to match a predicate
 */
export async function waitForSignal<T>(
  sig: Signal<T>,
  predicate: (value: T) => boolean,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const value = sig();
      if (predicate(value)) {
        resolve(value);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for signal to match predicate`));
      } else {
        setTimeout(check, 10);
      }
    };

    const unsubscribe = sig.subscribe((value) => {
      if (predicate(value)) {
        unsubscribe();
        resolve(value);
      }
    });

    check();
  });
}

/**
 * Collects signal values over time
 */
export async function collectSignalValues<T>(
  sig: Signal<T>,
  count: number,
  timeout: number = 5000
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const values: T[] = [];
    const startTime = Date.now();

    const unsubscribe = sig.subscribe((value) => {
      values.push(value);
      if (values.length >= count) {
        unsubscribe();
        resolve(values);
      }
    });

    setTimeout(() => {
      if (values.length < count) {
        unsubscribe();
        reject(new Error(`Timeout: only collected ${values.length} of ${count} values`));
      }
    }, timeout);
  });
}

/**
 * Creates a test signal with controlled updates
 */
export function createTestSignal<T>(initialValue: T): Signal<T> & {
  setValue: (value: T) => void;
  getHistory: () => T[];
  clearHistory: () => void;
} {
  const sig = signal(initialValue);
  const history: T[] = [initialValue];

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    history.push(value);
    originalSet(value);
  };

  return Object.assign(sig, {
    setValue: sig.set,
    getHistory: () => [...history],
    clearHistory: () => {
      history.length = 0;
      history.push(sig());
    },
  });
}

/**
 * Mocks a signal for testing
 */
export function mockSignal<T>(
  initialValue: T,
  options: {
    delay?: number;
    shouldFail?: boolean;
  } = {}
): Signal<T> {
  const { delay = 0, shouldFail = false } = options;
  const sig = signal(initialValue);

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (shouldFail) {
      throw new Error('Mock signal set failed');
    }
    if (delay > 0) {
      setTimeout(() => {
        originalSet(value);
      }, delay);
    } else {
      originalSet(value);
    }
  };

  return sig;
}

/**
 * Creates a signal that tracks all reads
 */
export function trackSignalReads<T>(sig: Signal<T>): Signal<T> & {
  getReadCount: () => number;
  getReadHistory: () => T[];
  resetTracking: () => void;
} {
  let readCount = 0;
  const readHistory: T[] = [];

  const originalGet = sig.bind(sig);
  const trackedGet = (): T => {
    readCount++;
    const value = originalGet();
    readHistory.push(value);
    return value;
  };

  const trackedSig = trackedGet as Signal<T> & {
    getReadCount: () => number;
    getReadHistory: () => T[];
    resetTracking: () => void;
  };

  trackedSig.set = sig.set.bind(sig);
  trackedSig.update = sig.update.bind(sig);
  trackedSig.subscribe = sig.subscribe.bind(sig);
  trackedSig.getReadCount = () => readCount;
  trackedSig.getReadHistory = () => [...readHistory];
  trackedSig.resetTracking = () => {
    readCount = 0;
    readHistory.length = 0;
  };

  return trackedSig;
}

