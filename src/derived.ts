import { computed, type Computed } from './computed';
import type { Store } from './store';

/**
 * A derived store - a computed value that returns an object/record
 * Automatically updates when dependencies change
 */
export interface DerivedStore<T extends Record<string, any>> extends Computed<T> {
  // Inherits all Computed methods
}

/**
 * Creates a derived store from one or more dependencies
 * The store automatically updates when any dependency changes
 */
export function derived<T extends Record<string, any>>(
  fn: () => T
): DerivedStore<T> {
  return computed(fn) as DerivedStore<T>;
}

/**
 * Creates a derived store from multiple sources
 * Useful when combining multiple signals/stores into one
 */
export function derivedFrom<T extends Record<string, any>>(
  sources: Record<string, (() => any) | Store<any>>,
  fn?: (values: Record<string, any>) => T
): DerivedStore<T> {
  if (fn) {
    return computed(() => {
      const values: Record<string, any> = {};
      for (const [key, source] of Object.entries(sources)) {
        values[key] = typeof source === 'function' ? (source as () => any)() : (source as any)();
      }
      return fn(values);
    }) as DerivedStore<T>;
  } else {
    // If no transform function, just combine the sources
    return computed(() => {
      const result = {} as T;
      for (const [key, source] of Object.entries(sources)) {
        result[key as keyof T] = (typeof source === 'function' ? (source as () => any)() : (source as any)()) as any;
      }
      return result;
    }) as DerivedStore<T>;
  }
}

