/**
 * Core Performance Optimizations
 * Critical performance improvements for signals
 */

import type { Signal } from './signal';
import { scheduleUpdate, isBatchingUpdates } from './batch';

/**
 * Optimized subscriber notification using arrays for better iteration
 */
export function optimizedNotify<T>(
  subscribers: Set<(value: T) => void>,
  value: T
): void {
  // Convert to array once for iteration (faster than Set.forEach in some cases)
  const subs = Array.from(subscribers);
  for (let i = 0; i < subs.length; i++) {
    try {
      subs[i](value);
    } catch (error) {
      console.error('Error in signal subscriber:', error);
    }
  }
}

/**
 * Uses requestAnimationFrame for UI-related updates
 */
let rafScheduled = false;
const rafQueue: Array<() => void> = [];

function flushRAF(): void {
  rafScheduled = false;
  const updates = rafQueue.slice();
  rafQueue.length = 0;
  for (const update of updates) {
    try {
      update();
    } catch (error) {
      console.error('Error in RAF update:', error);
    }
  }
}

export function scheduleRAFUpdate(update: () => void): void {
  rafQueue.push(update);
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(flushRAF);
  }
}

/**
 * Optimized batch that uses microtasks more efficiently
 */
let microtaskScheduled = false;
const microtaskQueue: Array<() => void> = [];

function flushMicrotask(): void {
  microtaskScheduled = false;
  const updates = microtaskQueue.slice();
  microtaskQueue.length = 0;
  for (const update of updates) {
    try {
      update();
    } catch (error) {
      console.error('Error in microtask update:', error);
    }
  }
}

export function scheduleMicrotaskUpdate(update: () => void): void {
  microtaskQueue.push(update);
  if (!microtaskScheduled) {
    microtaskScheduled = true;
    queueMicrotask(flushMicrotask);
  }
}

/**
 * Signal pool for reusing signal objects (memory optimization)
 */
const signalPool: Array<Signal<any>> = [];
const MAX_POOL_SIZE = 100;

export function getPooledSignal<T>(): Signal<T> | null {
  if (signalPool.length > 0) {
    return signalPool.pop() as Signal<T>;
  }
  return null;
}

export function returnToPool<T>(sig: Signal<T>): void {
  if (signalPool.length < MAX_POOL_SIZE) {
    // Reset signal state would go here
    signalPool.push(sig);
  }
}

/**
 * Deduplicates signal subscriptions
 */
export function deduplicateSubscriptions<T>(
  subscribers: Set<(value: T) => void>
): Set<(value: T) => void> {
  // In practice, Set already deduplicates, but we can optimize further
  return subscribers;
}

/**
 * Fast path for primitive value equality
 */
export function fastEquals<T>(a: T, b: T): boolean {
  // Fast path for primitives
  if (typeof a !== 'object' || a === null || b === null) {
    return a === b;
  }
  // For objects, use reference equality as fast path
  if (a === b) {
    return true;
  }
  return false;
}

