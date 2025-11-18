/**
 * Enhanced Effects
 * Effects with better cleanup and lifecycle management
 */

import { effect } from './effect';
import type { Signal } from './signal';

export interface EffectOptions {
  /**
   * Whether to run immediately (default: true)
   */
  immediate?: boolean;
  /**
   * Cleanup function
   */
  onCleanup?: () => void;
  /**
   * Error handler
   */
  onError?: (error: Error) => void;
  /**
   * Maximum execution count (prevents infinite loops)
   */
  maxExecutions?: number;
}

/**
 * Creates an enhanced effect with better cleanup
 */
export function enhancedEffect(
  fn: () => void | (() => void),
  options: EffectOptions = {}
): () => void {
  const {
    immediate = true,
    onCleanup,
    onError,
    maxExecutions = Infinity,
  } = options;

  let executionCount = 0;
  let cleanupFn: (() => void) | undefined;

  const stop = effect(() => {
    if (executionCount >= maxExecutions) {
      console.warn(`Effect exceeded max executions (${maxExecutions})`);
      return;
    }

    executionCount++;

    try {
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = undefined;
      }

      const result = fn();
      cleanupFn = typeof result === 'function' ? result : undefined;
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      } else {
        throw error;
      }
    }
  });

  if (!immediate) {
    // Stop immediately and let user start manually
    stop();
  }

  return () => {
    if (cleanupFn) {
      cleanupFn();
    }
    if (onCleanup) {
      onCleanup();
    }
    stop();
  };
}

/**
 * Creates an effect that only runs when condition is met
 */
export function conditionalEffect(
  condition: () => boolean,
  fn: () => void | (() => void),
  options: EffectOptions = {}
): () => void {
  return enhancedEffect(() => {
    if (condition()) {
      return fn();
    }
  }, options);
}

/**
 * Creates an effect that debounces execution
 */
export function debouncedEffect(
  fn: () => void | (() => void),
  delay: number,
  options: EffectOptions = {}
): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cleanupFn: (() => void) | undefined;

  const stop = enhancedEffect(
    () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const result = fn();
        cleanupFn = typeof result === 'function' ? result : undefined;
        timeoutId = null;
      }, delay);
    },
    {
      ...options,
      onCleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (cleanupFn) {
          cleanupFn();
        }
        if (options.onCleanup) {
          options.onCleanup();
        }
      },
    }
  );

  return stop;
}

/**
 * Creates an effect that throttles execution
 */
export function throttledEffect(
  fn: () => void | (() => void),
  delay: number,
  options: EffectOptions = {}
): () => void {
  let lastExecution = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cleanupFn: (() => void) | undefined;

  const stop = enhancedEffect(
    () => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecution;

      if (timeSinceLastExecution >= delay) {
        lastExecution = now;
        const result = fn();
        cleanupFn = typeof result === 'function' ? result : undefined;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          lastExecution = Date.now();
          const result = fn();
          cleanupFn = typeof result === 'function' ? result : undefined;
          timeoutId = null;
        }, delay - timeSinceLastExecution);
      }
    },
    {
      ...options,
      onCleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (cleanupFn) {
          cleanupFn();
        }
        if (options.onCleanup) {
          options.onCleanup();
        }
      },
    }
  );

  return stop;
}

