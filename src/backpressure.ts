/**
 * Signal Backpressure
 * Backpressure handling for high-frequency updates
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface BackpressureOptions {
  bufferSize?: number;
  strategy?: 'drop' | 'latest' | 'oldest' | 'block';
  onBackpressure?: () => void;
}

/**
 * Creates a signal with backpressure handling
 */
export function backpressureSignal<T>(
  initialValue: T,
  options: BackpressureOptions = {}
): Signal<T> & {
  getBufferSize: () => number;
  clearBuffer: () => void;
} {
  const {
    bufferSize = 10,
    strategy = 'drop',
    onBackpressure,
  } = options;

  const sig = signal<T>(initialValue);
  const buffer: T[] = [];
  let isProcessing = false;

  const processBuffer = () => {
    if (isProcessing || buffer.length === 0) {
      return;
    }

    isProcessing = true;

    const processNext = () => {
      if (buffer.length === 0) {
        isProcessing = false;
        return;
      }

      let value: T;
      switch (strategy) {
        case 'oldest':
          value = buffer.shift()!;
          break;
        case 'latest':
          value = buffer.pop()!;
          buffer.length = 0; // Clear rest
          break;
        default:
          value = buffer.shift()!;
      }

      sig.set(value);

      // Process next item
      setTimeout(processNext, 0);
    };

    processNext();
  };

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (buffer.length >= bufferSize) {
      if (onBackpressure) {
        onBackpressure();
      }

      switch (strategy) {
        case 'drop':
          return; // Drop the new value
        case 'latest':
          buffer.length = 0; // Clear buffer
          buffer.push(value);
          break;
        case 'oldest':
          buffer.shift(); // Remove oldest
          buffer.push(value);
          break;
        case 'block':
          // Wait for space (simplified - would need async handling)
          return;
      }
    } else {
      buffer.push(value);
    }

    processBuffer();
  };

  const getBufferSize = (): number => {
    return buffer.length;
  };

  const clearBuffer = (): void => {
    buffer.length = 0;
  };

  return Object.assign(sig, {
    getBufferSize,
    clearBuffer,
  });
}

