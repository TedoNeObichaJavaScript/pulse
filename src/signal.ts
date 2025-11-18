import { getCurrentContext, setCurrentContext, withContext } from './context';
import { scheduleUpdate, isBatchingUpdates } from './batch';

/**
 * A reactive signal - the core primitive of the reactive system
 */
export interface Signal<T> {
  (): T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
  subscribe(callback: (value: T) => void): () => void;
}

export interface SignalOptions<T> {
  /**
   * Custom equality function to determine if two values are equal
   * If provided, signal will only notify subscribers if values are not equal
   */
  equals?: (a: T, b: T) => boolean;
}

type SignalState<T> = {
  value: T;
  subscribers: Set<(value: T) => void>;
  equals?: (a: T, b: T) => boolean;
};

/**
 * Creates a reactive signal
 */
export function signal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T> {
  const state: SignalState<T> = {
    value: initialValue,
    subscribers: new Set(),
    equals: options?.equals,
  };

  // Create a dependency tracker object for this signal
  const dependencyTracker = {
    subscribe: (callback: () => void) => {
      // When signal changes, call the callback
      const subscriber = (value: T) => {
        callback();
      };
      state.subscribers.add(subscriber);
      // Return unsubscribe function
      return () => {
        state.subscribers.delete(subscriber);
      };
    },
  };

  const get = (): T => {
    const context = getCurrentContext();
    if (context) {
      // Track this signal as a dependency
      context.dependencies.add(dependencyTracker);
    }
    return state.value;
  };

  const set = (value: T): void => {
    // Check equality using custom function or default strict equality
    const isEqual = state.equals 
      ? state.equals(state.value, value)
      : state.value === value;
    
    if (!isEqual) {
      state.value = value;
      
      // Notify all subscribers
      const notify = () => {
        state.subscribers.forEach((callback) => callback(value));
      };
      
      // If batching, schedule the update; otherwise notify immediately
      if (isBatchingUpdates()) {
        scheduleUpdate(notify);
      } else {
        notify();
      }
    }
  };

  const update = (fn: (value: T) => T): void => {
    set(fn(state.value));
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    state.subscribers.add(callback);
    // Return unsubscribe function
    return () => {
      state.subscribers.delete(callback);
    };
  };

  // Make the function callable
  const signalFn = get as Signal<T>;
  signalFn.set = set;
  signalFn.update = update;
  signalFn.subscribe = subscribe;

  return signalFn;
}

