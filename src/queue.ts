/**
 * Signal Queues
 * Queue system for managing signal updates
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface QueueOptions {
  /**
   * Maximum queue size (default: Infinity)
   */
  maxSize?: number;
  /**
   * Process queue automatically (default: true)
   */
  autoProcess?: boolean;
  /**
   * Delay between processing items (default: 0)
   */
  delay?: number;
}

/**
 * Creates a queued signal that processes updates in order
 */
export function queuedSignal<T>(
  initialValue: T,
  options: QueueOptions = {}
): Signal<T> & {
  queue: T[];
  processQueue: () => void;
  clearQueue: () => void;
} {
  const { maxSize = Infinity, autoProcess = true, delay = 0 } = options;
  const sig = signal<T>(initialValue);
  const queue: T[] = [];
  let isProcessing = false;

  const processQueue = (): void => {
    if (isProcessing || queue.length === 0) {
      return;
    }

    isProcessing = true;

    const processNext = () => {
      if (queue.length === 0) {
        isProcessing = false;
        return;
      }

      const value = queue.shift()!;
      sig.set(value);

      if (delay > 0) {
        setTimeout(processNext, delay);
      } else {
        processNext();
      }
    };

    processNext();
  };

  const queuedSet = (value: T): void => {
    if (queue.length >= maxSize) {
      queue.shift(); // Remove oldest
    }
    queue.push(value);

    if (autoProcess) {
      processQueue();
    }
  };

  return Object.assign(sig, {
    set: queuedSet,
    queue,
    processQueue,
    clearQueue: () => {
      queue.length = 0;
    },
  }) as Signal<T> & {
    queue: T[];
    processQueue: () => void;
    clearQueue: () => void;
  };
}

