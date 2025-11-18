/**
 * Signal Debugging & Logging
 * Enhanced debugging utilities for signals
 */

import type { Signal } from './signal';

export interface DebugOptions {
  label?: string;
  logUpdates?: boolean;
  logSubscriptions?: boolean;
  logDependencies?: boolean;
  color?: string;
}

const debugSignals = new WeakMap<Signal<any>, DebugOptions>();

/**
 * Enables debugging for a signal
 */
export function debugSignal<T>(
  sig: Signal<T>,
  options: DebugOptions = {}
): Signal<T> {
  const {
    label = 'Signal',
    logUpdates = true,
    logSubscriptions = false,
    logDependencies = false,
    color = '#007acc',
  } = options;

  debugSignals.set(sig, options);

  if (logUpdates) {
    const originalSet = sig.set.bind(sig);
    sig.set = (value: T) => {
      console.log(
        `%c[${label}] Update:`,
        `color: ${color}; font-weight: bold`,
        value
      );
      originalSet(value);
    };
  }

  if (logSubscriptions) {
    const originalSubscribe = sig.subscribe.bind(sig);
    sig.subscribe = (callback: (value: T) => void) => {
      console.log(
        `%c[${label}] New subscription`,
        `color: ${color}; font-weight: bold`
      );
      const unsubscribe = originalSubscribe(callback);
      return () => {
        console.log(
          `%c[${label}] Unsubscribed`,
          `color: ${color}; font-weight: bold`
        );
        unsubscribe();
      };
    };
  }

  return sig;
}

/**
 * Logs signal value
 */
export function logSignal<T>(sig: Signal<T>, label?: string): void {
  const value = sig();
  console.log(label ? `[${label}]` : '[Signal]', value);
}

/**
 * Gets all debug info for a signal
 */
export function getDebugInfo<T>(sig: Signal<T>): DebugOptions | null {
  return debugSignals.get(sig) || null;
}

/**
 * Creates a signal inspector
 */
export function inspectSignal<T>(sig: Signal<T>): {
  value: T;
  subscribers: number;
  debug: DebugOptions | null;
} {
  // This would need access to internal state
  // For now, simplified version
  return {
    value: sig(),
    subscribers: 0, // Would need internal access
    debug: debugSignals.get(sig) || null,
  };
}

/**
 * Traces signal updates
 */
export function traceSignal<T>(
  sig: Signal<T>,
  label?: string
): Signal<T> {
  return debugSignal(sig, {
    label: label || 'Traced',
    logUpdates: true,
    logSubscriptions: true,
  });
}

