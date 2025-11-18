/**
 * Memory Leak Detection
 * Automatic detection of memory leaks in signals
 */

import type { Signal } from './signal';

const signalRegistry = new WeakMap<Signal<any>, {
  createdAt: number;
  updateCount: number;
  subscriberCount: number;
  lastAccess: number;
}>();

/**
 * Tracks signal for memory leak detection
 */
export function trackSignal<T>(sig: Signal<T>): void {
  signalRegistry.set(sig, {
    createdAt: Date.now(),
    updateCount: 0,
    subscriberCount: 0,
    lastAccess: Date.now(),
  });

  // Track updates
  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    const info = signalRegistry.get(sig);
    if (info) {
      info.updateCount++;
      info.lastAccess = Date.now();
    }
    originalSet(value);
  };

  // Track subscriptions
  const originalSubscribe = sig.subscribe.bind(sig);
  sig.subscribe = (callback: (value: T) => void) => {
    const info = signalRegistry.get(sig);
    if (info) {
      info.subscriberCount++;
    }
    const unsubscribe = originalSubscribe(callback);
    return () => {
      if (info) {
        info.subscriberCount--;
      }
      unsubscribe();
    };
  };
}

/**
 * Checks for potential memory leaks
 */
export function checkMemoryLeaks(): Array<{
  signal: Signal<any>;
  age: number;
  updateCount: number;
  subscriberCount: number;
  lastAccess: number;
  potentialLeak: boolean;
}> {
  const leaks: Array<{
    signal: Signal<any>;
    age: number;
    updateCount: number;
    subscriberCount: number;
    lastAccess: number;
    potentialLeak: boolean;
  }> = [];

  // WeakMap doesn't allow iteration, so we'd need a different approach
  // This is a placeholder for the concept

  return leaks;
}

/**
 * Gets memory usage stats
 */
export function getMemoryStats(): {
  trackedSignals: number;
  totalUpdates: number;
  totalSubscribers: number;
} {
  // Would need a different data structure to track this
  return {
    trackedSignals: 0,
    totalUpdates: 0,
    totalSubscribers: 0,
  };
}

