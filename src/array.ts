import { signal, type Signal } from './signal';
import { scheduleUpdate, isBatchingUpdates } from './batch';

/**
 * A reactive array signal with array mutation methods
 */
export interface SignalArray<T> extends Signal<T[]> {
  push(...items: T[]): number;
  pop(): T | undefined;
  shift(): T | undefined;
  unshift(...items: T[]): number;
  splice(start: number, deleteCount?: number, ...items: T[]): T[];
  sort(compareFn?: (a: T, b: T) => number): SignalArray<T>;
  reverse(): SignalArray<T>;
  filter(predicate: (value: T, index: number, array: T[]) => boolean): SignalArray<T>;
  map<U>(fn: (value: T, index: number, array: T[]) => U): SignalArray<U>;
  length(): number;
}

type ArraySignalState<T> = {
  value: T[];
  subscribers: Set<(value: T[]) => void>;
};

/**
 * Creates a reactive array signal
 */
export function array<T>(initialValue: T[] = []): SignalArray<T> {
  const state: ArraySignalState<T> = {
    value: [...initialValue], // Create a copy
    subscribers: new Set(),
  };

  // Create a dependency tracker object for this signal
  const dependencyTracker = {
    subscribe: (callback: () => void) => {
      const subscriber = (value: T[]) => {
        callback();
      };
      state.subscribers.add(subscriber);
      return () => {
        state.subscribers.delete(subscriber);
      };
    },
  };

  const notify = () => {
    state.subscribers.forEach((callback) => callback(state.value));
  };

  const get = (): T[] => {
    const context = getCurrentContext();
    if (context) {
      context.dependencies.add(dependencyTracker);
    }
    return state.value;
  };

  const set = (value: T[]): void => {
    state.value = [...value]; // Create a copy
    if (isBatchingUpdates()) {
      scheduleUpdate(notify);
    } else {
      notify();
    }
  };

  const update = (fn: (value: T[]) => T[]): void => {
    set(fn(state.value));
  };

  const subscribe = (callback: (value: T[]) => void): (() => void) => {
    state.subscribers.add(callback);
    return () => {
      state.subscribers.delete(callback);
    };
  };

  // Array mutation methods
  const push = (...items: T[]): number => {
    const result = state.value.push(...items);
    if (isBatchingUpdates()) {
      scheduleUpdate(notify);
    } else {
      notify();
    }
    return result;
  };

  const pop = (): T | undefined => {
    const result = state.value.pop();
    if (result !== undefined) {
      if (isBatchingUpdates()) {
        scheduleUpdate(notify);
      } else {
        notify();
      }
    }
    return result;
  };

  const shift = (): T | undefined => {
    const result = state.value.shift();
    if (result !== undefined) {
      if (isBatchingUpdates()) {
        scheduleUpdate(notify);
      } else {
        notify();
      }
    }
    return result;
  };

  const unshift = (...items: T[]): number => {
    const result = state.value.unshift(...items);
    if (isBatchingUpdates()) {
      scheduleUpdate(notify);
    } else {
      notify();
    }
    return result;
  };

  const splice = (start: number, deleteCount?: number, ...items: T[]): T[] => {
    const result = state.value.splice(start, deleteCount ?? 0, ...items);
    if (isBatchingUpdates()) {
      scheduleUpdate(notify);
    } else {
      notify();
    }
    return result;
  };

  const sort = (compareFn?: (a: T, b: T) => number): SignalArray<T> => {
    state.value.sort(compareFn);
    if (isBatchingUpdates()) {
      scheduleUpdate(notify);
    } else {
      notify();
    }
    return arrayFn;
  };

  const reverse = (): SignalArray<T> => {
    state.value.reverse();
    if (isBatchingUpdates()) {
      scheduleUpdate(notify);
    } else {
      notify();
    }
    return arrayFn;
  };

  const filter = (predicate: (value: T, index: number, array: T[]) => boolean): SignalArray<T> => {
    return array(state.value.filter(predicate));
  };

  const map = <U>(fn: (value: T, index: number, array: T[]) => U): SignalArray<U> => {
    return array(state.value.map(fn));
  };

  const length = (): number => {
    return state.value.length;
  };

  const arrayFn = Object.assign(get, {
    set,
    update,
    subscribe,
    push,
    pop,
    shift,
    unshift,
    splice,
    sort,
    reverse,
    filter,
    map,
    length,
  }) as SignalArray<T>;

  return arrayFn;
}

