/**
 * Signal Retry Logic
 * Retry failed operations
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Creates a retryable signal operation
 */
export function retrySignal<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Signal<T | null> & {
  execute: () => Promise<T>;
  reset: () => void;
} {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
  } = options;

  const sig = signal<T | null>(null);
  let currentAttempt = 0;

  const calculateDelay = (attempt: number): number => {
    if (backoff === 'exponential') {
      return delay * Math.pow(2, attempt);
    }
    return delay * (attempt + 1);
  };

  const execute = async (): Promise<T> => {
    currentAttempt = 0;

    while (currentAttempt < maxAttempts) {
      try {
        const result = await fn();
        sig.set(result);
        return result;
      } catch (error) {
        currentAttempt++;
        if (currentAttempt >= maxAttempts) {
          throw error;
        }

        if (onRetry) {
          onRetry(
            currentAttempt,
            error instanceof Error ? error : new Error(String(error))
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, calculateDelay(currentAttempt - 1))
        );
      }
    }

    throw new Error('Max retry attempts reached');
  };

  const reset = () => {
    currentAttempt = 0;
    sig.set(null);
  };

  return Object.assign(sig, {
    execute,
    reset,
  });
}

