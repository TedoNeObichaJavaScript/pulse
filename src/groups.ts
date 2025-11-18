/**
 * Signal Groups
 * Group related signals together with batch operations
 */

import type { Signal } from './signal';
import { batch } from './batch';

export interface SignalGroup {
  /**
   * Get all signals in the group
   */
  getSignals(): Signal<any>[];
  /**
   * Batch update all signals in the group
   */
  batchUpdate(updates: Record<string, any>): void;
  /**
   * Subscribe to all signals in the group
   */
  subscribe(callback: (values: Record<string, any>) => void): () => void;
  /**
   * Get current values of all signals
   */
  getValues(): Record<string, any>;
  /**
   * Reset all signals to their initial values
   */
  reset(): void;
}

/**
 * Creates a signal group
 */
export function signalGroup(
  signals: Record<string, Signal<any>>,
  initialValues?: Record<string, any>
): SignalGroup {
  const signalMap = new Map<string, Signal<any>>();
  const initialMap = new Map<string, any>();

  for (const [key, sig] of Object.entries(signals)) {
    signalMap.set(key, sig);
    if (initialValues && key in initialValues) {
      initialMap.set(key, initialValues[key]);
    } else {
      initialMap.set(key, sig());
    }
  }

  const getSignals = (): Signal<any>[] => {
    return Array.from(signalMap.values());
  };

  const batchUpdate = (updates: Record<string, any>): void => {
    batch(() => {
      for (const [key, value] of Object.entries(updates)) {
        const sig = signalMap.get(key);
        if (sig) {
          sig.set(value);
        }
      }
    });
  };

  const subscribe = (
    callback: (values: Record<string, any>) => void
  ): (() => void) => {
    const unsubscribers: (() => void)[] = [];

    for (const [key, sig] of signalMap.entries()) {
      unsubscribers.push(
        sig.subscribe(() => {
          callback(getValues());
        })
      );
    }

    // Call once with initial values
    callback(getValues());

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  };

  const getValues = (): Record<string, any> => {
    const values: Record<string, any> = {};
    for (const [key, sig] of signalMap.entries()) {
      values[key] = sig();
    }
    return values;
  };

  const reset = (): void => {
    batch(() => {
      for (const [key, sig] of signalMap.entries()) {
        const initialValue = initialMap.get(key);
        if (initialValue !== undefined) {
          sig.set(initialValue);
        }
      }
    });
  };

  return {
    getSignals,
    batchUpdate,
    subscribe,
    getValues,
    reset,
  };
}

