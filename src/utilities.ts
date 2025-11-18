/**
 * Signal Utilities
 * Helper functions for common operations
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Clones a signal value (deep clone)
 */
export function cloneSignalValue<T>(sig: Signal<T>): T {
  const value = sig();
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => cloneSignalValue({ () { return item; } } as Signal<any>)) as T;
  }
  const cloned = {} as T;
  for (const key in value) {
    (cloned as any)[key] = cloneSignalValue({ () { return (value as any)[key]; } } as Signal<any>);
  }
  return cloned;
}

/**
 * Deep clones a signal
 */
export function cloneSignal<T>(sig: Signal<T>): Signal<T> {
  return signal(cloneSignalValue(sig));
}

/**
 * Merges multiple signals into one
 */
export function mergeSignals<T extends Record<string, any>>(
  ...signals: Array<Signal<Partial<T>>>
): Signal<T> {
  return signal(
    signals.reduce((acc, sig) => ({ ...acc, ...sig() }), {} as T)
  ) as Signal<T>;
}

/**
 * Gets the difference between two signal values
 */
export function signalDiff<T>(
  sig1: Signal<T>,
  sig2: Signal<T>
): Partial<T> {
  const val1 = sig1();
  const val2 = sig2();

  if (typeof val1 !== 'object' || typeof val2 !== 'object' || val1 === null || val2 === null) {
    return val1 !== val2 ? (val2 as Partial<T>) : {};
  }

  const diff: Partial<T> = {};
  const allKeys = new Set([...Object.keys(val1), ...Object.keys(val2)]);

  for (const key of allKeys) {
    if ((val1 as any)[key] !== (val2 as any)[key]) {
      (diff as any)[key] = (val2 as any)[key];
    }
  }

  return diff;
}

/**
 * Checks if two signals have the same value
 */
export function signalsEqual<T>(
  sig1: Signal<T>,
  sig2: Signal<T>,
  equals?: (a: T, b: T) => boolean
): boolean {
  const val1 = sig1();
  const val2 = sig2();
  return equals ? equals(val1, val2) : val1 === val2;
}

/**
 * Creates a signal from a promise
 */
export function promiseSignal<T>(
  promise: Promise<T>
): Signal<T | null> & {
  loading: Signal<boolean>;
  error: Signal<Error | null>;
} {
  const sig = signal<T | null>(null);
  const loading = signal(true);
  const error = signal<Error | null>(null);

  promise
    .then((value) => {
      sig.set(value);
      loading.set(false);
    })
    .catch((err) => {
      error.set(err instanceof Error ? err : new Error(String(err)));
      loading.set(false);
    });

  return Object.assign(sig, {
    loading,
    error,
  });
}

/**
 * Creates a signal that updates from an event target
 */
export function eventSignal<T = any>(
  target: EventTarget,
  eventName: string
): Signal<T | null> {
  const sig = signal<T | null>(null);

  const handler = (event: Event) => {
    sig.set((event as any).detail || (event as any).data || event);
  };

  target.addEventListener(eventName, handler);

  return sig;
}

/**
 * Creates a signal from a getter function
 */
export function getterSignal<T>(
  getter: () => T,
  updateInterval?: number
): Signal<T> {
  const sig = signal(getter());

  if (updateInterval) {
    setInterval(() => {
      sig.set(getter());
    }, updateInterval);
  }

  return sig;
}

/**
 * Creates a signal that syncs with another signal with transformation
 */
export function syncSignal<T, U>(
  source: Signal<T>,
  transform: (value: T) => U,
  reverseTransform?: (value: U) => T
): Signal<U> {
  const sig = signal(transform(source()));

  source.subscribe((value) => {
    sig.set(transform(value));
  });

  if (reverseTransform) {
    const originalSet = sig.set.bind(sig);
    sig.set = (value: U) => {
      originalSet(value);
      source.set(reverseTransform(value));
    };
  }

  return sig;
}

