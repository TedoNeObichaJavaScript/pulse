/**
 * Optimistic Updates
 * Optimistic UI updates with rollback on error
 */

import { signal, type Signal } from './signal';
import { batch } from './batch';

export interface OptimisticUpdate<T> {
  optimisticValue: T;
  rollback: () => void;
  commit: () => void;
}

export interface OptimisticSignal<T> extends Signal<T> {
  optimistic: (value: T, updateFn: () => Promise<T>) => Promise<T>;
  rollback: () => void;
  isOptimistic: Signal<boolean>;
}

/**
 * Creates an optimistic signal
 */
export function optimisticSignal<T>(initialValue: T): OptimisticSignal<T> {
  const sig = signal(initialValue);
  const isOptimistic = signal(false);
  let previousValue: T = initialValue;
  let rollbackFn: (() => void) | null = null;

  const optimistic = async (value: T, updateFn: () => Promise<T>): Promise<T> => {
    previousValue = sig();
    isOptimistic.set(true);
    sig.set(value);

    rollbackFn = () => {
      sig.set(previousValue);
      isOptimistic.set(false);
    };

    try {
      const result = await updateFn();
      sig.set(result);
      isOptimistic.set(false);
      rollbackFn = null;
      return result;
    } catch (error) {
      if (rollbackFn) {
        rollbackFn();
        rollbackFn = null;
      }
      throw error;
    }
  };

  const rollback = () => {
    if (rollbackFn) {
      rollbackFn();
      rollbackFn = null;
    }
  };

  Object.assign(sig, {
    optimistic,
    rollback,
    isOptimistic,
  });

  return sig as OptimisticSignal<T>;
}

/**
 * Creates an optimistic update function
 */
export function createOptimisticUpdate<T>(
  signal: Signal<T>
): (value: T, updateFn: () => Promise<T>) => Promise<T> {
  let previousValue: T = signal();
  let rollbackFn: (() => void) | null = null;

  return async (value: T, updateFn: () => Promise<T>): Promise<T> => {
    previousValue = signal();
    signal.set(value);

    rollbackFn = () => {
      signal.set(previousValue);
    };

    try {
      const result = await updateFn();
      rollbackFn = null;
      return result;
    } catch (error) {
      if (rollbackFn) {
        rollbackFn();
        rollbackFn = null;
      }
      throw error;
    }
  };
}

/**
 * Batches optimistic updates
 */
export function optimisticBatch<T>(
  updates: Array<{ signal: Signal<any>; value: any; updateFn: () => Promise<any> }>
): Promise<T[]> {
  const rollbacks: Array<() => void> = [];
  const previousValues: any[] = [];

  // Apply all optimistic updates
  batch(() => {
    updates.forEach(({ signal, value }, index) => {
      previousValues[index] = signal();
      signal.set(value);
      rollbacks.push(() => {
        signal.set(previousValues[index]);
      });
    });
  });

  // Execute all updates
  return Promise.all(updates.map(({ updateFn }) => updateFn()))
    .then((results) => {
      rollbacks.length = 0;
      return results as T[];
    })
    .catch((error) => {
      // Rollback all on error
      batch(() => {
        rollbacks.forEach((rollback) => rollback());
      });
      throw error;
    });
}

/**
 * Creates an optimistic mutation
 */
export function optimisticMutation<T, R>(
  mutateFn: (value: T) => Promise<R>,
  onError?: (error: Error) => void
): (signal: Signal<T>, value: T) => Promise<R> {
  return async (signal: Signal<T>, value: T): Promise<R> => {
    const previousValue = signal();
    signal.set(value);

    try {
      const result = await mutateFn(value);
      return result;
    } catch (error) {
      signal.set(previousValue);
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      throw err;
    }
  };
}

