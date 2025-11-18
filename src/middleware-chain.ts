/**
 * Signal Middleware Chain
 * Chainable middleware system
 */

import type { Signal } from './signal';
import type { Middleware } from './middleware';

/**
 * Creates a chainable middleware builder
 */
export class MiddlewareChain<T> {
  private middlewares: Middleware<T>[] = [];

  /**
   * Adds middleware to the chain
   */
  use(middleware: Middleware<T>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Adds logging middleware
   */
  log(label?: string): this {
    const { loggingMiddleware } = require('./middleware');
    return this.use(loggingMiddleware(label));
  }

  /**
   * Adds validation middleware
   */
  validate(validator: (value: T) => boolean, onError?: (value: T) => void): this {
    const { validationMiddleware } = require('./middleware');
    return this.use(validationMiddleware(validator, onError));
  }

  /**
   * Adds transformation middleware
   */
  transform(transformer: (value: T) => T): this {
    const { transformMiddleware } = require('./middleware');
    return this.use(transformMiddleware(transformer));
  }

  /**
   * Adds throttle middleware
   */
  throttle(delay: number): this {
    const { throttleMiddleware } = require('./middleware');
    return this.use(throttleMiddleware(delay));
  }

  /**
   * Adds debounce middleware
   */
  debounce(delay: number): this {
    const { debounceMiddleware } = require('./middleware');
    return this.use(debounceMiddleware(delay));
  }

  /**
   * Builds the middleware array
   */
  build(): Middleware<T>[] {
    return [...this.middlewares];
  }
}

/**
 * Creates a middleware chain
 */
export function createMiddlewareChain<T>(): MiddlewareChain<T> {
  return new MiddlewareChain<T>();
}

/**
 * Fluent API for creating signals with middleware
 */
export function signalWith<T>(
  initialValue: T
): {
  middleware: (chain: MiddlewareChain<T>) => Signal<T>;
  validate: (validator: (value: T) => boolean) => Signal<T>;
  transform: (transformer: (value: T) => T) => Signal<T>;
  log: (label?: string) => Signal<T>;
} {
  return {
    middleware: (chain: MiddlewareChain<T>) => {
      const { signal } = require('./signal');
      return signal(initialValue, { middleware: chain.build() });
    },
    validate: (validator: (value: T) => boolean) => {
      const { signal } = require('./signal');
      const { validationMiddleware } = require('./middleware');
      return signal(initialValue, {
        middleware: [validationMiddleware(validator)],
      });
    },
    transform: (transformer: (value: T) => T) => {
      const { signal } = require('./signal');
      const { transformMiddleware } = require('./middleware');
      return signal(initialValue, {
        middleware: [transformMiddleware(transformer)],
      });
    },
    log: (label?: string) => {
      const { signal } = require('./signal');
      const { loggingMiddleware } = require('./middleware');
      return signal(initialValue, {
        middleware: [loggingMiddleware(label)],
      });
    },
  };
}

