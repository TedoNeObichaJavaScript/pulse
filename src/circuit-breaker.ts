/**
 * Signal Circuit Breaker
 * Circuit breaker pattern for fault tolerance
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  onStateChange?: (state: CircuitState) => void;
}

/**
 * Creates a circuit breaker
 */
export function circuitBreaker<T>(
  fn: () => Promise<T>,
  options: CircuitBreakerOptions = {}
): {
  execute: () => Promise<T>;
  state: Signal<CircuitState>;
  reset: () => void;
} {
  const {
    failureThreshold = 5,
    resetTimeout = 60000,
    onStateChange,
  } = options;

  const state = signal<CircuitState>('closed');
  let failureCount = 0;
  let lastFailureTime = 0;

  const setState = (newState: CircuitState) => {
    if (state() !== newState) {
      state.set(newState);
      if (onStateChange) {
        onStateChange(newState);
      }
    }
  };

  const execute = async (): Promise<T> => {
    const currentState = state();

    if (currentState === 'open') {
      if (Date.now() - lastFailureTime > resetTimeout) {
        setState('half-open');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      if (currentState === 'half-open') {
        setState('closed');
        failureCount = 0;
      } else {
        failureCount = 0;
      }
      return result;
    } catch (error) {
      failureCount++;
      lastFailureTime = Date.now();

      if (failureCount >= failureThreshold) {
        setState('open');
      }

      throw error;
    }
  };

  const reset = () => {
    failureCount = 0;
    lastFailureTime = 0;
    setState('closed');
  };

  return {
    execute,
    state,
    reset,
  };
}

