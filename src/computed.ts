import { getCurrentContext, setCurrentContext, withContext } from './context';
import type { Signal } from './signal';
import { withErrorHandling } from './error-handling';

/**
 * A computed value that automatically updates when dependencies change
 */
export interface Computed<T> {
  (): T;
  subscribe(callback: (value: T) => void): () => void;
}

type ComputedState<T> = {
  fn: () => T;
  value: T | undefined;
  subscribers: Set<(value: T) => void>;
  dependencies: Set<{ subscribe: (callback: () => void) => () => void }>;
  isDirty: boolean;
  unsubscribe: (() => void) | null;
};

/**
 * Creates a computed value that automatically tracks dependencies
 */
export function computed<T>(fn: () => T): Computed<T> {
  const state: ComputedState<T> = {
    fn,
    value: undefined,
    subscribers: new Set(),
    dependencies: new Set(),
    isDirty: true,
    unsubscribe: null,
  };

  const compute = (): T => {
    // If already computed and not dirty, return cached value
    if (!state.isDirty && state.value !== undefined) {
      return state.value;
    }

    // Unsubscribe from old dependencies
    if (state.unsubscribe) {
      state.unsubscribe();
      state.unsubscribe = null;
    }
    state.dependencies.clear();

    // Set up context for dependency tracking
    const context = {
      dependencies: state.dependencies,
      onInvalidate: () => {
        state.isDirty = true;
        // Notify subscribers that the computed value has changed
        state.subscribers.forEach((callback) => {
          callback(state.value as T);
        });
      },
    };

    // Compute the value while tracking dependencies, with error handling
    try {
      const computedValue = withContext(context, fn);
      state.value = computedValue;
    } catch (error) {
      // Error handling is done by withErrorHandling wrapper
      // If we get here, re-throw or use last known value
      if (state.value === undefined) {
        throw error;
      }
      // Return last known value on error
      return state.value;
    }

    // Subscribe to all dependencies
    const unsubscribers: (() => void)[] = [];
    state.dependencies.forEach((dep) => {
      unsubscribers.push(
        dep.subscribe(() => {
          state.isDirty = true;
          // Recompute immediately to get new value for subscribers
          const oldValue = state.value;
          try {
            // Recompute to get new value
            const newValue = compute();
            // Only notify if value actually changed
            if (newValue !== oldValue) {
              state.subscribers.forEach((callback) => {
                try {
                  callback(newValue);
                } catch (error) {
                  console.error('Error in computed subscriber:', error);
                }
              });
            }
          } catch (error) {
            // On error, notify with old value
            state.subscribers.forEach((callback) => {
              try {
                callback(oldValue as T);
              } catch (err) {
                console.error('Error in computed subscriber:', err);
              }
            });
          }
        })
      );
    });

    state.unsubscribe = () => {
      unsubscribers.forEach((unsub) => unsub());
    };

    state.isDirty = false;
    return state.value;
  };

  // Create a dependency tracker object for this computed
  const dependencyTracker = {
    subscribe: (callback: () => void) => {
      // When computed value changes, call the callback
      const subscriber = (value: T) => {
        callback();
      };
      state.subscribers.add(subscriber);
      // Compute once to set up dependencies
      compute();
      // Return unsubscribe function
      return () => {
        state.subscribers.delete(subscriber);
      };
    },
  };

  const get = (): T => {
    const context = getCurrentContext();
    if (context) {
      // Track this computed as a dependency
      context.dependencies.add(dependencyTracker);
    }
    return compute();
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    // Compute once to set up dependencies
    compute();
    state.subscribers.add(callback);
    return () => {
      state.subscribers.delete(callback);
    };
  };

  const computedFn = get as Computed<T>;
  computedFn.subscribe = subscribe;

  return computedFn;
}

