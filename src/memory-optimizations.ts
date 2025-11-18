/**
 * Memory Optimizations
 * Optimize memory usage and prevent leaks
 */

import type { Signal } from './signal';

/**
 * Weak reference wrapper for signals
 */
export function weakSignal<T>(sig: Signal<T>): WeakRef<Signal<T>> | { deref: () => Signal<T> } {
  if (typeof WeakRef !== 'undefined') {
    return new (WeakRef as any)(sig);
  }
  // Fallback for environments without WeakRef
  return { deref: () => sig };
}

/**
 * Cleans up unused signals
 */
export function cleanupUnusedSignals(): void {
  // This would need a registry of all signals
  // For now, it's a placeholder
}

/**
 * Prevents memory leaks by limiting subscriber count
 */
export function limitSubscribers<T>(
  sig: Signal<T>,
  maxSubscribers: number = 100
): Signal<T> {
  const originalSubscribe = sig.subscribe.bind(sig);
  let subscriberCount = 0;

  sig.subscribe = (callback: (value: T) => void) => {
    if (subscriberCount >= maxSubscribers) {
      console.warn(`Signal has reached max subscribers (${maxSubscribers})`);
      return () => {}; // Return no-op unsubscribe
    }
    subscriberCount++;
    const unsubscribe = originalSubscribe(callback);
    return () => {
      subscriberCount--;
      unsubscribe();
    };
  };

  return sig;
}

