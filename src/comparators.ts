/**
 * Signal Comparators
 * Advanced comparison utilities
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Deep equality comparator
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || b === null || a === undefined || b === undefined) {
    return false;
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }
    if (!deepEqual((a as any)[key], (b as any)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow equality comparator
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || b === null || a === undefined || b === undefined) {
    return false;
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if ((a as any)[key] !== (b as any)[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a signal with deep equality comparison
 */
export function deepEqualSignal<T>(initialValue: T): Signal<T> {
  return signal(initialValue, {
    equals: deepEqual,
  });
}

/**
 * Creates a signal with shallow equality comparison
 */
export function shallowEqualSignal<T extends Record<string, any>>(
  initialValue: T
): Signal<T> {
  return signal(initialValue, {
    equals: shallowEqual,
  });
}

/**
 * Creates a custom comparator function
 */
export function createComparator<T>(
  compareFn: (a: T, b: T) => boolean
): (a: T, b: T) => boolean {
  return compareFn;
}

