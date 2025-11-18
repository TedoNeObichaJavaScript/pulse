/**
 * Signal Patchers
 * Patch-based updates for objects
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type Patch<T> = {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
};

/**
 * Applies a patch to an object
 */
export function applyPatch<T extends Record<string, any>>(
  obj: T,
  patch: Patch<T>
): T {
  const { op, path, value, from } = patch;
  const keys = path.split('/').filter(Boolean);
  const result = { ...obj };

  let current: any = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current[key] = { ...current[key] };
    current = current[key];
  }

  const lastKey = keys[keys.length - 1];

  switch (op) {
    case 'add':
    case 'replace':
      current[lastKey] = value;
      break;
    case 'remove':
      delete current[lastKey];
      break;
    case 'move':
      if (from) {
        const fromKeys = from.split('/').filter(Boolean);
        let fromCurrent: any = result;
        for (const key of fromKeys) {
          fromCurrent = fromCurrent[key];
        }
        current[lastKey] = fromCurrent;
        // Remove from original location
        const fromParentKeys = fromKeys.slice(0, -1);
        let fromParent: any = result;
        for (const key of fromParentKeys) {
          fromParent = fromParent[key];
        }
        delete fromParent[fromKeys[fromKeys.length - 1]];
      }
      break;
    case 'copy':
      if (from) {
        const fromKeys = from.split('/').filter(Boolean);
        let fromCurrent: any = result;
        for (const key of fromKeys) {
          fromCurrent = fromCurrent[key];
        }
        current[lastKey] = fromCurrent;
      }
      break;
    case 'test':
      if (current[lastKey] !== value) {
        throw new Error(`Patch test failed at ${path}`);
      }
      break;
  }

  return result;
}

/**
 * Creates a patchable signal
 */
export function patchableSignal<T extends Record<string, any>>(
  initialValue: T
): Signal<T> & {
  patch: (patch: Patch<T>) => void;
  patchMany: (patches: Patch<T>[]) => void;
} {
  const sig = signal<T>(initialValue);

  const patch = (p: Patch<T>) => {
    sig.set(applyPatch(sig(), p));
  };

  const patchMany = (patches: Patch<T>[]) => {
    let current = sig();
    for (const p of patches) {
      current = applyPatch(current, p);
    }
    sig.set(current);
  };

  return Object.assign(sig, {
    patch,
    patchMany,
  });
}

