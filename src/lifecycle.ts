/**
 * Signal Lifecycle Hooks
 * onCreated, onDestroyed, onUpdated hooks
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type LifecycleHook<T> = (value: T, signal: Signal<T>) => void;

export interface LifecycleOptions<T> {
  onCreated?: LifecycleHook<T>;
  onDestroyed?: LifecycleHook<T>;
  onUpdated?: (newValue: T, oldValue: T, signal: Signal<T>) => void;
}

const signalRegistry = new WeakMap<Signal<any>, { onDestroyed?: LifecycleHook<any> }>();

/**
 * Creates a signal with lifecycle hooks
 */
export function lifecycleSignal<T>(
  initialValue: T,
  options: LifecycleOptions<T> = {}
): Signal<T> {
  const { onCreated, onDestroyed, onUpdated } = options;

  const sig = signal<T>(initialValue);

  // Call onCreated hook
  if (onCreated) {
    onCreated(initialValue, sig);
  }

  // Track old value for onUpdated
  let oldValue = initialValue;

  // Override set to call onUpdated
  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (onUpdated && value !== oldValue) {
      onUpdated(value, oldValue, sig);
    }
    oldValue = value;
    originalSet(value);
  };

  // Register for cleanup
  if (onDestroyed) {
    signalRegistry.set(sig, { onDestroyed });
  }

  return sig;
}

/**
 * Destroys a signal and calls onDestroyed hook
 */
export function destroySignal<T>(sig: Signal<T>): void {
  const registry = signalRegistry.get(sig);
  if (registry?.onDestroyed) {
    registry.onDestroyed(sig(), sig);
    signalRegistry.delete(sig);
  }
}

/**
 * Adds lifecycle hooks to an existing signal
 */
export function addLifecycleHooks<T>(
  sig: Signal<T>,
  options: LifecycleOptions<T>
): Signal<T> {
  const { onUpdated } = options;
  let oldValue = sig();

  if (onUpdated) {
    const originalSet = sig.set.bind(sig);
    sig.set = (value: T) => {
      if (value !== oldValue) {
        onUpdated(value, oldValue, sig);
      }
      oldValue = value;
      originalSet(value);
    };
  }

  if (options.onDestroyed) {
    signalRegistry.set(sig, { onDestroyed: options.onDestroyed });
  }

  return sig;
}

