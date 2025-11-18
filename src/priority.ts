/**
 * Signal Priorities
 * Priority-based update scheduling
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type Priority = 'low' | 'normal' | 'high' | 'critical';

export interface PriorityOptions {
  defaultPriority?: Priority;
}

const priorityOrder: Record<Priority, number> = {
  low: 1,
  normal: 2,
  high: 3,
  critical: 4,
};

type QueuedUpdate<T> = {
  value: T;
  priority: Priority;
  timestamp: number;
};

/**
 * Creates a signal with priority-based updates
 */
export function prioritySignal<T>(
  initialValue: T,
  options: PriorityOptions = {}
): Signal<T> & {
  setWithPriority: (value: T, priority: Priority) => void;
} {
  const { defaultPriority = 'normal' } = options;
  const sig = signal<T>(initialValue);
  const updateQueue: QueuedUpdate<T>[] = [];
  let isProcessing = false;

  const processQueue = (): void => {
    if (isProcessing || updateQueue.length === 0) {
      return;
    }

    isProcessing = true;

    // Sort by priority (higher first), then by timestamp
    updateQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.timestamp - b.timestamp;
    });

    // Process all updates
    while (updateQueue.length > 0) {
      const update = updateQueue.shift()!;
      sig.set(update.value);
    }

    isProcessing = false;
  };

  const setWithPriority = (value: T, priority: Priority = defaultPriority): void => {
    updateQueue.push({
      value,
      priority,
      timestamp: Date.now(),
    });

    // Use microtask to batch updates
    Promise.resolve().then(processQueue);
  };

  return Object.assign(sig, {
    set: (value: T) => setWithPriority(value, defaultPriority),
    setWithPriority,
  }) as Signal<T> & {
    setWithPriority: (value: T, priority: Priority) => void;
  };
}

