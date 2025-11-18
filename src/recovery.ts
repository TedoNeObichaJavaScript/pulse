/**
 * Error Recovery
 * Automatic error recovery with fallback values
 */

import type { Signal } from './signal';
import { signal } from './signal';
import { computed } from './computed';

/**
 * Creates a signal with error recovery
 */
export function recoverableSignal<T>(
  initialValue: T,
  fallback: T | ((error: Error) => T)
): Signal<T> {
  const sig = signal<T>(initialValue);
  let hasError = false;
  let lastError: Error | null = null;

  const getFallback = (error: Error): T => {
    return typeof fallback === 'function' ? (fallback as (error: Error) => T)(error) : fallback;
  };

  const safeSet = (value: T): void => {
    try {
      hasError = false;
      lastError = null;
      sig.set(value);
    } catch (error) {
      hasError = true;
      lastError = error instanceof Error ? error : new Error(String(error));
      const fallbackValue = getFallback(lastError);
      sig.set(fallbackValue);
    }
  };

  const get = (): T => {
    return sig();
  };

  const recoverableSig = get as Signal<T> & { hasError: () => boolean; getError: () => Error | null };
  recoverableSig.set = safeSet;
  recoverableSig.update = (fn: (value: T) => T) => {
    try {
      safeSet(fn(sig()));
    } catch (error) {
      // Error already handled in safeSet
    }
  };
  recoverableSig.subscribe = sig.subscribe.bind(sig);
  recoverableSig.hasError = () => hasError;
  recoverableSig.getError = () => lastError;

  return recoverableSig;
}

/**
 * Creates a computed with error recovery
 */
export function recoverableComputed<T>(
  fn: () => T,
  fallback: T | ((error: Error) => T)
): Signal<T> {
  let hasError = false;
  let lastError: Error | null = null;

  const getFallback = (error: Error): T => {
    return typeof fallback === 'function' ? (fallback as (error: Error) => T)(error) : fallback;
  };

  const safeComputed = computed(() => {
    try {
      hasError = false;
      lastError = null;
      return fn();
    } catch (error) {
      hasError = true;
      lastError = error instanceof Error ? error : new Error(String(error));
      return getFallback(lastError);
    }
  });

  return Object.assign(safeComputed, {
    hasError: () => hasError,
    getError: () => lastError,
  }) as Signal<T> & { hasError: () => boolean; getError: () => Error | null };
}

