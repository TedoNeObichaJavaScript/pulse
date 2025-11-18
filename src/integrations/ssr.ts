/**
 * SSR Support
 * Server-side rendering utilities
 */

import type { Signal } from '../signal';

/**
 * Checks if running in SSR environment
 */
export function isSSR(): boolean {
  return typeof window === 'undefined';
}

/**
 * Creates an SSR-safe signal
 */
export function ssrSignal<T>(initialValue: T): Signal<T> {
  const { signal } = require('../signal');
  return signal(initialValue);
}

/**
 * Hydrates signal state on client
 */
export function hydrateSignal<T>(
  sig: Signal<T>,
  serverValue: T
): void {
  if (!isSSR()) {
    sig.set(serverValue);
  }
}

/**
 * Gets signal state for SSR
 */
export function getSignalState<T>(sig: Signal<T>): T {
  return sig();
}

/**
 * Serializes all signals for SSR
 */
export function serializeForSSR(
  signals: Record<string, Signal<any>>
): Record<string, any> {
  const state: Record<string, any> = {};
  for (const [key, sig] of Object.entries(signals)) {
    state[key] = sig();
  }
  return state;
}

/**
 * Deserializes signal state on client
 */
export function deserializeFromSSR(
  state: Record<string, any>,
  signals: Record<string, Signal<any>>
): void {
  for (const [key, value] of Object.entries(state)) {
    if (signals[key]) {
      signals[key].set(value);
    }
  }
}

