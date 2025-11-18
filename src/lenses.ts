/**
 * Signal Lenses
 * Immutable updates with path-based access
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type Lens<T, U> = {
  get: (value: T) => U;
  set: (value: T, newValue: U) => T;
};

/**
 * Creates a lens for a property
 */
export function propLens<K extends string>(key: K): Lens<Record<K, any>, any> {
  return {
    get: (value) => value[key],
    set: (value, newValue) => ({ ...value, [key]: newValue }),
  };
}

/**
 * Creates a lens for array index
 */
export function indexLens<T>(index: number): Lens<T[], T> {
  return {
    get: (value) => value[index],
    set: (value, newValue) => {
      const newArray = [...value];
      newArray[index] = newValue;
      return newArray;
    },
  };
}

/**
 * Composes two lenses
 */
export function composeLens<A, B, C>(
  lens1: Lens<A, B>,
  lens2: Lens<B, C>
): Lens<A, C> {
  return {
    get: (value) => lens2.get(lens1.get(value)),
    set: (value, newValue) => {
      const intermediate = lens1.get(value);
      const updated = lens2.set(intermediate, newValue);
      return lens1.set(value, updated);
    },
  };
}

/**
 * Creates a signal focused through a lens
 */
export function lensSignal<T, U>(
  sig: Signal<T>,
  lens: Lens<T, U>
): Signal<U> {
  const get = (): U => {
    return lens.get(sig());
  };

  const lensSig = get as Signal<U>;
  lensSig.set = (value: U) => {
    sig.set(lens.set(sig(), value));
  };
  lensSig.update = (fn: (value: U) => U) => {
    sig.set(lens.set(sig(), fn(lens.get(sig()))));
  };
  lensSig.subscribe = (callback: (value: U) => void) => {
    return sig.subscribe((value) => {
      callback(lens.get(value));
    });
  };

  return lensSig;
}

/**
 * Creates a path-based lens
 */
export function pathLens<T>(path: string[]): Lens<T, any> {
  return {
    get: (value) => {
      let current: any = value;
      for (const key of path) {
        if (current === null || current === undefined) {
          return undefined;
        }
        current = current[key];
      }
      return current;
    },
    set: (value, newValue) => {
      if (path.length === 0) {
        return newValue;
      }
      const [first, ...rest] = path;
      if (rest.length === 0) {
        return { ...value, [first]: newValue };
      }
      const nested = pathLens(rest);
      return {
        ...value,
        [first]: nested.set((value as any)[first] || {}, newValue),
      };
    },
  };
}

