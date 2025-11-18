/**
 * Type Utilities
 * Advanced TypeScript utilities for signals
 */

import type { Signal } from './signal';

/**
 * Extracts the value type from a signal
 */
export type SignalValue<T> = T extends Signal<infer U> ? U : never;

/**
 * Extracts value types from multiple signals
 */
export type SignalValues<T extends readonly Signal<any>[]> = {
  [K in keyof T]: T[K] extends Signal<infer U> ? U : never;
};

/**
 * Creates a signal type from a value type
 */
export type SignalOf<T> = Signal<T>;

/**
 * Makes all properties of a type reactive (signals)
 */
export type Reactive<T> = {
  [K in keyof T]: Signal<T[K]>;
};

/**
 * Makes all properties of a type optional signals
 */
export type OptionalReactive<T> = {
  [K in keyof T]?: Signal<T[K]>;
};

/**
 * Creates a deep reactive type
 */
export type DeepReactive<T> = {
  [K in keyof T]: T[K] extends object
    ? Signal<DeepReactive<T[K]>>
    : Signal<T[K]>;
};

/**
 * Type guard for signals
 */
export function isSignal<T>(value: any): value is Signal<T> {
  return (
    typeof value === 'function' &&
    typeof (value as any).set === 'function' &&
    typeof (value as any).subscribe === 'function'
  );
}

/**
 * Type guard for computed values
 */
export function isComputed<T>(value: any): value is Signal<T> {
  return (
    isSignal(value) &&
    typeof (value as any).set === 'undefined'
  );
}

import { signal } from './signal';

/**
 * Creates a type-safe signal factory
 */

export function createTypedSignal<T>() {
  return {
    create: (initialValue: T) => {
      return signal(initialValue);
    },
  };
}

/**
 * Branded signal types for type safety
 */
export type BrandedSignal<T, Brand extends string> = Signal<T> & {
  __brand: Brand;
};

export function createBrandedSignal<T, Brand extends string>(
  initialValue: T,
  brand: Brand
): BrandedSignal<T, Brand> {
  return signal(initialValue) as BrandedSignal<T, Brand>;
}

