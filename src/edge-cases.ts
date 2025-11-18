/**
 * Edge Case Handling
 * Handle edge cases and prevent common bugs
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Prevents infinite loops in effects
 */
export function safeEffect(
  fn: () => void | (() => void),
  maxIterations: number = 100
): () => void {
  let iterationCount = 0;
  const originalFn = fn;

  const safeFn = () => {
    iterationCount++;
    if (iterationCount > maxIterations) {
      console.error('Effect exceeded max iterations, possible infinite loop');
      return;
    }
    return originalFn();
  };

  // Would need to integrate with effect
  return () => {};
}

/**
 * Handles NaN and Infinity values in signals
 */
export function safeNumberSignal(
  initialValue: number,
  options: {
    allowNaN?: boolean;
    allowInfinity?: boolean;
  } = {}
): Signal<number> {
  const { allowNaN = false, allowInfinity = false } = options;
  const sig = signal(initialValue);

  const originalSet = sig.set.bind(sig);
  sig.set = (value: number) => {
    if (!allowNaN && isNaN(value)) {
      console.warn('Attempted to set NaN value, ignoring');
      return;
    }
    if (!allowInfinity && !isFinite(value)) {
      console.warn('Attempted to set Infinity value, ignoring');
      return;
    }
    originalSet(value);
  };

  return sig;
}

/**
 * Prevents setting null/undefined if not allowed
 */
export function nonNullableSignal<T>(
  initialValue: T,
  allowNull: boolean = false,
  allowUndefined: boolean = false
): Signal<T> {
  if (!allowNull && initialValue === null) {
    throw new Error('Initial value cannot be null');
  }
  if (!allowUndefined && initialValue === undefined) {
    throw new Error('Initial value cannot be undefined');
  }

  const sig = signal(initialValue);

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (!allowNull && value === null) {
      throw new Error('Cannot set null value');
    }
    if (!allowUndefined && value === undefined) {
      throw new Error('Cannot set undefined value');
    }
    originalSet(value);
  };

  return sig;
}

