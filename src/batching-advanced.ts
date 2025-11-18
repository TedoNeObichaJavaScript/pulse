/**
 * Advanced Batching
 * Advanced batching strategies
 */

import { batch } from './batch';
import type { Signal } from './signal';

export interface BatchStrategy {
  shouldBatch: () => boolean;
  execute: (updates: Array<() => void>) => void;
}

/**
 * Priority-based batching
 */
export function priorityBatch<T>(
  fn: () => T,
  priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
): T {
  // For now, use regular batch
  // In a full implementation, this would queue by priority
  return batch(fn);
}

/**
 * Conditional batching
 */
export function conditionalBatch<T>(
  fn: () => T,
  condition: () => boolean
): T {
  if (condition()) {
    return batch(fn);
  }
  return fn();
}

/**
 * Scheduled batching
 */
export function scheduledBatch<T>(
  fn: () => T,
  delay: number = 0
): T {
  if (delay === 0) {
    return batch(fn);
  }

  // Schedule batch execution
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(batch(fn));
    }, delay);
  }) as any; // Type assertion for sync return
}

/**
 * Batch with cancellation
 */
export function cancellableBatch<T>(
  fn: () => T
): {
  execute: () => T;
  cancel: () => void;
} {
  let cancelled = false;

  const execute = (): T => {
    if (cancelled) {
      throw new Error('Batch was cancelled');
    }
    return batch(fn);
  };

  const cancel = () => {
    cancelled = true;
  };

  return {
    execute,
    cancel,
  };
}

/**
 * Batch multiple signal updates
 */
export function batchSignalUpdates(
  updates: Array<{ signal: Signal<any>; value: any }>
): void {
  batch(() => {
    for (const { signal, value } of updates) {
      signal.set(value);
    }
  });
}

