/**
 * Signal Middleware System
 * Allows intercepting and transforming signal updates
 */

import type { Signal } from './signal';

export type Middleware<T> = (
  value: T,
  next: (value: T) => T,
  signal: Signal<T>
) => T;

export type MiddlewareContext<T> = {
  signal: Signal<T>;
  previousValue: T;
  newValue: T;
  timestamp: number;
};

/**
 * Creates a middleware pipeline
 */
export function createMiddleware<T>(...middlewares: Middleware<T>[]): (value: T, signal: Signal<T>, previousValue: T) => T {
  return (value: T, signal: Signal<T>, previousValue: T) => {
    let index = 0;
    
    const next = (currentValue: T): T => {
      if (index >= middlewares.length) {
        return currentValue;
      }
      const middleware = middlewares[index++];
      return middleware(currentValue, next, signal);
    };
    
    return next(value);
  };
}

/**
 * Logging middleware - logs all signal updates
 */
export function loggingMiddleware<T>(label?: string): Middleware<T> {
  return (value, next, signal) => {
    const labelText = label || 'Signal';
    console.log(`[${labelText}] Update:`, value);
    return next(value);
  };
}

/**
 * Validation middleware - validates values before updating
 */
export function validationMiddleware<T>(
  validator: (value: T) => boolean,
  onError?: (value: T) => void
): Middleware<T> {
  return (value, next, signal) => {
    if (!validator(value)) {
      if (onError) {
        onError(value);
      } else {
        throw new Error(`Validation failed for value: ${value}`);
      }
      return signal(); // Return current value if validation fails
    }
    return next(value);
  };
}

/**
 * Transformation middleware - transforms values before updating
 */
export function transformMiddleware<T>(
  transformer: (value: T) => T
): Middleware<T> {
  return (value, next) => {
    return next(transformer(value));
  };
}

/**
 * Throttle middleware - throttles signal updates
 */
export function throttleMiddleware<T>(delay: number): Middleware<T> {
  let lastUpdate = 0;
  let pendingValue: T | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (value, next, signal) => {
    const now = Date.now();
    pendingValue = value;

    if (now - lastUpdate >= delay) {
      lastUpdate = now;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return next(value);
    } else {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          if (pendingValue !== null) {
            signal.set(pendingValue);
            pendingValue = null;
          }
          timeoutId = null;
          lastUpdate = Date.now();
        }, delay - (now - lastUpdate));
      }
      return signal(); // Return current value, update will happen later
    }
  };
}

/**
 * Debounce middleware - debounces signal updates
 */
export function debounceMiddleware<T>(delay: number): Middleware<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (value, next, signal) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      next(value);
      timeoutId = null;
    }, delay);

    return signal(); // Return current value, update will happen after delay
  };
}

/**
 * History middleware - tracks signal update history
 */
export function historyMiddleware<T>(maxHistory: number = 100): {
  middleware: Middleware<T>;
  getHistory: () => Array<{ value: T; timestamp: number }>;
  clearHistory: () => void;
} {
  const history: Array<{ value: T; timestamp: number }> = [];

  const middleware: Middleware<T> = (value, next, signal) => {
    history.push({ value, timestamp: Date.now() });
    if (history.length > maxHistory) {
      history.shift();
    }
    return next(value);
  };

  return {
    middleware,
    getHistory: () => [...history],
    clearHistory: () => {
      history.length = 0;
    },
  };
}

