/**
 * Type Safety Improvements
 * Enhanced type safety utilities
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Creates a type-safe signal with runtime validation
 */
export function typedSignal<T>(
  initialValue: T,
  typeGuard?: (value: unknown) => value is T
): Signal<T> {
  if (typeGuard && !typeGuard(initialValue)) {
    throw new Error(`Initial value does not match type guard`);
  }

  const sig = signal(initialValue);

  if (typeGuard) {
    const originalSet = sig.set.bind(sig);
    sig.set = (value: T) => {
      if (!typeGuard(value)) {
        throw new Error(`Value does not match type guard`);
      }
      originalSet(value);
    };
  }

  return sig;
}

/**
 * Creates a signal with branded type
 */
export function brandedSignal<T, Brand extends string>(
  initialValue: T,
  brand: Brand
): Signal<T & { __brand: Brand }> {
  return signal(initialValue as T & { __brand: Brand });
}

/**
 * Creates a signal that only accepts specific values
 */
export function unionSignal<T extends string | number>(
  initialValue: T,
  allowedValues: readonly T[]
): Signal<T> {
  if (!allowedValues.includes(initialValue)) {
    throw new Error(`Initial value ${initialValue} is not in allowed values`);
  }

  const sig = signal(initialValue);

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (!allowedValues.includes(value)) {
      throw new Error(`Value ${value} is not in allowed values: ${allowedValues.join(', ')}`);
    }
    originalSet(value);
  };

  return sig;
}

