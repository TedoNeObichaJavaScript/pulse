/**
 * Immutability Helpers
 * More immutability utilities (like Immer integration)
 */

import { signal, type Signal } from './signal';

/**
 * Creates an immutable update helper
 */
export function produce<T>(
  draft: T,
  updater: (draft: T) => void
): T {
  // Simple immutable update (deep clone and update)
  const cloned = deepClone(draft);
  updater(cloned);
  return cloned;
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Creates an immutable signal
 */
export function immutableSignal<T>(
  initialValue: T
): Signal<T> & { updateImmutable: (updater: (draft: T) => void) => void } {
  const sig = signal(initialValue);

  const updateImmutable = (updater: (draft: T) => void) => {
    const current = sig();
    const updated = produce(current, updater);
    sig.set(updated);
  };

  Object.assign(sig, {
    updateImmutable,
  });

  return sig as Signal<T> & { updateImmutable: (updater: (draft: T) => void) => void };
}

/**
 * Freezes an object (shallow)
 */
export function freeze<T>(obj: T): Readonly<T> {
  if (typeof obj === 'object' && obj !== null) {
    Object.freeze(obj);
  }
  return obj as Readonly<T>;
}

/**
 * Deep freezes an object
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj as Readonly<T>;
  }

  Object.freeze(obj);

  if (obj instanceof Array) {
    obj.forEach((item) => deepFreeze(item));
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        deepFreeze(obj[key]);
      }
    }
  }

  return obj as Readonly<T>;
}

/**
 * Creates a draft state for updates
 */
export function draft<T>(value: T): T {
  return deepClone(value);
}

/**
 * Applies patches to an object (immutable)
 */
export function applyPatches<T>(
  base: T,
  patches: Array<{ path: string[]; value: any }>
): T {
  const result = deepClone(base) as any;

  patches.forEach((patch) => {
    let current = result;
    for (let i = 0; i < patch.path.length - 1; i++) {
      current = current[patch.path[i]];
    }
    current[patch.path[patch.path.length - 1]] = patch.value;
  });

  return result;
}

/**
 * Creates patches from two objects
 */
export function createPatches<T>(
  base: T,
  updated: T,
  path: string[] = []
): Array<{ path: string[]; value: any }> {
  const patches: Array<{ path: string[]; value: any }> = [];

  if (typeof base !== 'object' || typeof updated !== 'object' || base === null || updated === null) {
    if (base !== updated) {
      patches.push({ path, value: updated });
    }
    return patches;
  }

  const allKeys = new Set([...Object.keys(base), ...Object.keys(updated)]);

  allKeys.forEach((key) => {
    const baseValue = (base as any)[key];
    const updatedValue = (updated as any)[key];

    if (!(key in base)) {
      patches.push({ path: [...path, key], value: updatedValue });
    } else if (!(key in updated)) {
      patches.push({ path: [...path, key], value: undefined });
    } else if (typeof baseValue === 'object' && typeof updatedValue === 'object' && baseValue !== null && updatedValue !== null) {
      patches.push(...createPatches(baseValue, updatedValue, [...path, key]));
    } else if (baseValue !== updatedValue) {
      patches.push({ path: [...path, key], value: updatedValue });
    }
  });

  return patches;
}

