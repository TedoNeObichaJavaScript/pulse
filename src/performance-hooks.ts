/**
 * Performance Hooks
 * Hooks for monitoring and optimizing performance
 */

import type { Signal } from './signal';

export type PerformanceHook = (signal: Signal<any>, value: any, duration: number) => void;

let performanceHooks: PerformanceHook[] = [];

/**
 * Registers a performance hook
 */
export function addPerformanceHook(hook: PerformanceHook): () => void {
  performanceHooks.push(hook);
  return () => {
    const index = performanceHooks.indexOf(hook);
    if (index > -1) {
      performanceHooks.splice(index, 1);
    }
  };
}

/**
 * Calls all performance hooks
 */
export function callPerformanceHooks<T>(
  signal: Signal<T>,
  value: T,
  duration: number
): void {
  for (const hook of performanceHooks) {
    try {
      hook(signal, value, duration);
    } catch (error) {
      console.error('Error in performance hook:', error);
    }
  }
}

/**
 * Performance monitoring signal wrapper
 */
export function withPerformanceMonitoring<T>(
  sig: Signal<T>,
  name?: string
): Signal<T> {
  const originalSet = sig.set.bind(sig);
  
  sig.set = (value: T) => {
    const start = performance.now();
    originalSet(value);
    const duration = performance.now() - start;
    
    callPerformanceHooks(sig, value, duration);
    
    if (duration > 1) { // Log slow updates (>1ms)
      console.warn(`Slow signal update${name ? ` (${name})` : ''}: ${duration.toFixed(2)}ms`);
    }
  };
  
  return sig;
}

