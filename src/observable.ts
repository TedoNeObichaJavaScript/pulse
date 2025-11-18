/**
 * Signal Observables
 * Observable pattern integration
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type Observer<T> = {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

export interface Observable<T> {
  subscribe(observer: Observer<T> | ((value: T) => void)): {
    unsubscribe: () => void;
  };
}

/**
 * Converts a signal to an observable
 */
export function signalToObservable<T>(sig: Signal<T>): Observable<T> {
  return {
    subscribe: (observer: Observer<T> | ((value: T) => void)) => {
      const normalizedObserver: Observer<T> =
        typeof observer === 'function'
          ? { next: observer }
          : observer;

      const unsubscribe = sig.subscribe((value) => {
        try {
          normalizedObserver.next(value);
        } catch (error) {
          if (normalizedObserver.error) {
            normalizedObserver.error(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      });

      // Emit initial value
      normalizedObserver.next(sig());

      return {
        unsubscribe,
      };
    },
  };
}

/**
 * Converts an observable to a signal
 */
export function observableToSignal<T>(
  observable: Observable<T>,
  initialValue: T
): Signal<T> {
  const sig = signal(initialValue);
  const subscription = observable.subscribe({
    next: (value) => {
      sig.set(value);
    },
    error: (error) => {
      console.error('Observable error:', error);
    },
    complete: () => {
      // Signal remains at last value
    },
  });

  // Store subscription for cleanup if needed
  (sig as any)._subscription = subscription;

  return sig;
}

/**
 * Creates an observable from a signal
 */
export function fromSignal<T>(sig: Signal<T>): Observable<T> {
  return signalToObservable(sig);
}

