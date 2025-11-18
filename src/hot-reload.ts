/**
 * Hot Reload
 * Hot module replacement support for signals
 */

import { signal, type Signal } from './signal';

const signalRegistry = new Map<string, Signal<any>>();
const reloadCallbacks = new Set<() => void>();

/**
 * Registers a signal for hot reload
 */
export function registerForHotReload<T>(key: string, sig: Signal<T>): void {
  signalRegistry.set(key, sig);
}

/**
 * Gets a signal from the registry
 */
export function getHotReloadSignal<T>(key: string): Signal<T> | undefined {
  return signalRegistry.get(key);
}

/**
 * Registers a callback to run on hot reload
 */
export function onHotReload(callback: () => void): () => void {
  reloadCallbacks.add(callback);
  return () => {
    reloadCallbacks.delete(callback);
  };
}

/**
 * Triggers hot reload (called by HMR system)
 */
export function triggerHotReload(): void {
  reloadCallbacks.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error('Error in hot reload callback:', error);
    }
  });
}

/**
 * Creates a hot-reloadable signal
 */
export function hotReloadableSignal<T>(
  key: string,
  initialValue: T
): Signal<T> {
  // Check if signal exists from previous reload
  const existing = getHotReloadSignal<T>(key);
  if (existing) {
    return existing;
  }

  const sig = signal(initialValue);
  registerForHotReload(key, sig);

  // Preserve value on reload
  onHotReload(() => {
    const current = sig();
    const newSig = signal(current);
    registerForHotReload(key, newSig);
  });

  return sig;
}

/**
 * Preserves signal state across hot reloads
 */
export function preserveSignalState<T>(key: string, sig: Signal<T>): void {
  registerForHotReload(key, sig);

  if (typeof window !== 'undefined' && (window as any).__PULSE_HMR__) {
    const preserved = (window as any).__PULSE_HMR__[key];
    if (preserved !== undefined) {
      sig.set(preserved);
    }

    sig.subscribe((value) => {
      if (!(window as any).__PULSE_HMR__) {
        (window as any).__PULSE_HMR__ = {};
      }
      (window as any).__PULSE_HMR__[key] = value;
    });
  }
}

/**
 * Clears hot reload state
 */
export function clearHotReloadState(): void {
  signalRegistry.clear();
  reloadCallbacks.clear();
  if (typeof window !== 'undefined') {
    (window as any).__PULSE_HMR__ = {};
  }
}

