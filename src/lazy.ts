/**
 * Lazy Evaluation
 * Lazy computed values that only compute when accessed
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Creates a lazy computed that only evaluates when accessed
 */
export function lazyComputed<T>(fn: () => T): Signal<T> {
  let cached: T | undefined;
  let isDirty = true;
  let dependencies: Set<Signal<any>> = new Set();

  const compute = (): T => {
    if (!isDirty && cached !== undefined) {
      return cached;
    }

    // Track dependencies
    const newDependencies = new Set<Signal<any>>();
    const context = {
      dependencies: newDependencies,
      onInvalidate: () => {
        isDirty = true;
      },
    };

    // This would need proper context tracking
    // For now, simplified version
    cached = fn();
    isDirty = false;
    dependencies = newDependencies;

    return cached;
  };

  return {
    (): T {
      return compute();
    },
    set: () => {
      throw new Error('Lazy computed is read-only');
    },
    update: () => {
      throw new Error('Lazy computed is read-only');
    },
    subscribe: (callback: (value: T) => void) => {
      // Subscribe to dependencies
      const unsubscribers: (() => void)[] = [];
      dependencies.forEach((dep) => {
        unsubscribers.push(
          dep.subscribe(() => {
            isDirty = true;
            callback(compute());
          })
        );
      });

      // Call once
      callback(compute());

      return () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    },
  } as Signal<T>;
}

