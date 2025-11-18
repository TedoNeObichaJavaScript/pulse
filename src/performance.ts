/**
 * Performance Monitoring
 * Built-in metrics and performance tracking
 */

import type { Signal } from './signal';

export interface PerformanceMetrics {
  updateCount: number;
  subscriberCount: number;
  averageUpdateTime: number;
  lastUpdateTime: number;
}

const metricsMap = new WeakMap<Signal<any>, PerformanceMetrics>();

/**
 * Tracks performance metrics for a signal
 */
export function trackPerformance<T>(sig: Signal<T>): PerformanceMetrics {
  let metrics = metricsMap.get(sig);
  if (!metrics) {
    metrics = {
      updateCount: 0,
      subscriberCount: 0,
      averageUpdateTime: 0,
      lastUpdateTime: 0,
    };
    metricsMap.set(sig, metrics);

    const originalSet = sig.set.bind(sig);
    sig.set = (value: T) => {
      const start = performance.now();
      originalSet(value);
      const duration = performance.now() - start;

      metrics!.updateCount++;
      metrics!.lastUpdateTime = duration;
      metrics!.averageUpdateTime =
        (metrics!.averageUpdateTime * (metrics!.updateCount - 1) + duration) /
        metrics!.updateCount;
    };

    const originalSubscribe = sig.subscribe.bind(sig);
    sig.subscribe = (callback: (value: T) => void) => {
      metrics!.subscriberCount++;
      const unsubscribe = originalSubscribe(callback);
      return () => {
        metrics!.subscriberCount--;
        unsubscribe();
      };
    };
  }

  return metrics;
}

/**
 * Gets performance metrics for a signal
 */
export function getPerformanceMetrics<T>(sig: Signal<T>): PerformanceMetrics | null {
  return metricsMap.get(sig) || null;
}

/**
 * Resets performance metrics
 */
export function resetPerformanceMetrics<T>(sig: Signal<T>): void {
  const metrics = metricsMap.get(sig);
  if (metrics) {
    metrics.updateCount = 0;
    metrics.averageUpdateTime = 0;
    metrics.lastUpdateTime = 0;
  }
}

