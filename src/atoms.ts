/**
 * Atomic State Management
 * Atom-based state pattern for granular state composition (like Jotai)
 */

import { signal, type Signal } from './signal';
import { computed, type Computed } from './computed';
import type { SignalOptions } from './signal';

/**
 * An atom is a unit of state that can be read and written
 */
export interface Atom<T> {
  read: () => T;
  write: (value: T | ((prev: T) => T)) => void;
  subscribe: (callback: (value: T) => void) => () => void;
}

/**
 * A read-only atom
 */
export interface ReadOnlyAtom<T> {
  read: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
}

type AtomState<T> = {
  signal: Signal<T>;
  key?: string;
};

const atomRegistry = new Map<string, Atom<any>>();

/**
 * Creates an atom - a unit of reactive state
 */
export function atom<T>(initialValue: T, options?: SignalOptions<T> & { key?: string }): Atom<T> {
  const sig = signal(initialValue, options);
  const key = options?.key;

  const atomInstance: Atom<T> = {
    read: () => sig(),
    write: (value) => {
      if (typeof value === 'function') {
        sig.update(value as (prev: T) => T);
      } else {
        sig.set(value);
      }
    },
    subscribe: (callback) => sig.subscribe(callback),
  };

  if (key) {
    atomRegistry.set(key, atomInstance);
  }

  return atomInstance;
}

/**
 * Creates a read-only atom from a computed value
 */
export function computedAtom<T>(fn: () => T): ReadOnlyAtom<T> {
  const comp = computed(fn);
  return {
    read: () => comp(),
    subscribe: (callback) => comp.subscribe(callback),
  };
}

/**
 * Creates a derived atom from other atoms
 */
export function derivedAtom<T>(
  atoms: ReadOnlyAtom<any>[],
  fn: (...values: any[]) => T
): ReadOnlyAtom<T> {
  return computedAtom(() => {
    const values = atoms.map((atom) => atom.read());
    return fn(...values);
  });
}

/**
 * Creates a writable derived atom
 */
export function writableDerivedAtom<T, U>(
  readAtom: ReadOnlyAtom<T>,
  writeFn: (value: U, get: () => T) => void
): Atom<U> {
  const derived = computedAtom(() => readAtom.read() as unknown as U);
  
  return {
    read: () => derived.read(),
    write: (value) => {
      const actualValue = typeof value === 'function' 
        ? (value as (prev: U) => U)(derived.read())
        : value;
      writeFn(actualValue, () => readAtom.read());
    },
    subscribe: (callback) => derived.subscribe(callback),
  };
}

/**
 * Gets an atom by key
 */
export function getAtom<T>(key: string): Atom<T> | undefined {
  return atomRegistry.get(key);
}

/**
 * Creates an atom that can be split into multiple atoms
 */
export function splitAtom<T extends Record<string, any>>(
  parentAtom: Atom<T>
): Record<keyof T, Atom<T[keyof T]>> {
  const keys = Object.keys(parentAtom.read()) as (keyof T)[];
  const split: Partial<Record<keyof T, Atom<T[keyof T]>>> = {};

  keys.forEach((key) => {
    split[key] = atom(parentAtom.read()[key], {
      key: `split.${String(key)}`,
    }) as Atom<T[keyof T]>;

    // Sync with parent
    parentAtom.subscribe((parentValue) => {
      if (split[key]!.read() !== parentValue[key]) {
        split[key]!.write(parentValue[key]);
      }
    });

    split[key]!.subscribe((value) => {
      const parentValue = parentAtom.read();
      if (parentValue[key] !== value) {
        parentAtom.write({ ...parentValue, [key]: value });
      }
    });
  });

  return split as Record<keyof T, Atom<T[keyof T]>>;
}

/**
 * Focuses an atom on a specific path
 */
export function focusAtom<T, U>(
  parentAtom: Atom<T>,
  getter: (parent: T) => U,
  setter: (parent: T, value: U) => T
): Atom<U> {
  return {
    read: () => getter(parentAtom.read()),
    write: (value) => {
      const parent = parentAtom.read();
      const actualValue = typeof value === 'function'
        ? (value as (prev: U) => U)(getter(parent))
        : value;
      parentAtom.write(setter(parent, actualValue));
    },
    subscribe: (callback) => {
      return parentAtom.subscribe((parent) => {
        callback(getter(parent));
      });
    },
  };
}

/**
 * Combines multiple atoms into one
 */
export function combineAtoms<T extends Record<string, any>>(
  atoms: { [K in keyof T]: ReadOnlyAtom<T[K]> }
): ReadOnlyAtom<T> {
  return computedAtom(() => {
    const result = {} as T;
    for (const key in atoms) {
      result[key] = atoms[key].read();
    }
    return result;
  });
}

/**
 * Creates an async atom
 */
export function asyncAtom<T>(
  fn: () => Promise<T>,
  initialValue?: T
): ReadOnlyAtom<Promise<T>> & { loading: ReadOnlyAtom<boolean>; error: ReadOnlyAtom<Error | null> } {
  const loadingAtom = atom(!!initialValue === false);
  const errorAtom = atom<Error | null>(null);
  const valueAtom = atom<Promise<T>>(Promise.resolve(initialValue as T));

  const load = async () => {
    loadingAtom.write(true);
    errorAtom.write(null);
    try {
      const result = await fn();
      valueAtom.write(Promise.resolve(result));
      loadingAtom.write(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errorAtom.write(error);
      loadingAtom.write(false);
      throw error;
    }
  };

  // Load immediately
  load();

  return {
    read: () => valueAtom.read(),
    subscribe: (callback) => valueAtom.subscribe(callback),
    loading: loadingAtom,
    error: errorAtom,
  };
}

