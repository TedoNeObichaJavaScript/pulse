import { signal, type Signal } from './signal';
import { getCurrentContext, withContext } from './context';

/**
 * An async computed value that handles promises
 */
export interface AsyncComputed<T> {
  (): Promise<T>;
  subscribe(callback: (value: T) => void): () => void;
  loading(): boolean;
  error(): Error | null;
}

type AsyncComputedState<T> = {
  fn: () => Promise<T>;
  value: T | undefined;
  promise: Promise<T> | null;
  subscribers: Set<(value: T) => void>;
  loading: boolean;
  error: Error | null;
  dependencies: Set<{ subscribe: (callback: () => void) => () => void }>;
  isDirty: boolean;
  unsubscribe: (() => void) | null;
};

/**
 * Creates an async computed value
 * Automatically handles loading states and errors
 */
export function asyncComputed<T>(fn: () => Promise<T>): AsyncComputed<T> {
  const loadingSignal = signal(true); // Start with loading = true
  const errorSignal = signal<Error | null>(null);

  const state: AsyncComputedState<T> = {
    fn,
    value: undefined,
    promise: null,
    subscribers: new Set(),
    loading: true, // Start with loading = true
    error: null,
    dependencies: new Set(),
    isDirty: true,
    unsubscribe: null,
  };

  const compute = async (): Promise<T> => {
    // If already computed and not dirty, return cached value
    if (!state.isDirty && state.value !== undefined && state.promise) {
      return state.promise;
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
        // Recompute when dependencies change
        compute().catch(() => {
          // Error handling is done in the compute function
        });
      },
    };

    // Track dependencies while getting the promise
    let promise: Promise<T>;
    try {
      loadingSignal.set(true);
      errorSignal.set(null);
      state.loading = true;
      state.error = null;

      promise = withContext(context, fn);
      state.promise = promise;

      // Subscribe to all dependencies
      const unsubscribers: (() => void)[] = [];
      state.dependencies.forEach((dep) => {
        unsubscribers.push(
          dep.subscribe(() => {
            state.isDirty = true;
            compute().catch(() => {
              // Error handling
            });
          })
        );
      });

      state.unsubscribe = () => {
        unsubscribers.forEach((unsub) => unsub());
      };

      // Wait for the promise to resolve
      const value = await promise;
      state.value = value;
      state.loading = false;
      state.error = null;
      loadingSignal.set(false);
      errorSignal.set(null);

      // Notify subscribers
      state.subscribers.forEach((callback) => {
        callback(value);
      });

      state.isDirty = false;
      return value;
    } catch (error) {
      state.loading = false;
      state.error = error instanceof Error ? error : new Error(String(error));
      state.isDirty = true;
      loadingSignal.set(false);
      errorSignal.set(state.error);

      // Notify subscribers of error (they can check error() method)
      throw error;
    }
  };

  const get = (): Promise<T> => {
    const context = getCurrentContext();
    if (context) {
      // Track this async computed as a dependency
      const dependencyTracker = {
        subscribe: (callback: () => void) => {
          const subscriber = (value: T) => {
            callback();
          };
          state.subscribers.add(subscriber);
          // Compute once to set up dependencies
          compute().catch(() => {
            // Error handling
          });
          return () => {
            state.subscribers.delete(subscriber);
          };
        },
      };
      context.dependencies.add(dependencyTracker);
    }
    return compute();
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    // Compute once to set up dependencies
    compute().then((value) => {
      callback(value);
    }).catch(() => {
      // Error handling - subscribers can check error() method
    });
    state.subscribers.add(callback);
    return () => {
      state.subscribers.delete(callback);
    };
  };

  const loading = (): boolean => {
    return loadingSignal();
  };

  const error = (): Error | null => {
    return errorSignal();
  };

  const asyncComputedFn = get as AsyncComputed<T>;
  asyncComputedFn.subscribe = subscribe;
  asyncComputedFn.loading = loading;
  asyncComputedFn.error = error;

  return asyncComputedFn;
}

