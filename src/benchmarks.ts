/**
 * Signal Benchmarks
 * Performance benchmarking tools
 */

import type { Signal } from './signal';
import { signal } from './signal';
import { computed } from './computed';

export interface BenchmarkResult {
  name: string;
  operations: number;
  duration: number;
  opsPerSecond: number;
  memoryUsed?: number;
}

/**
 * Benchmarks signal operations
 */
export function benchmarkSignal<T>(
  name: string,
  operations: number,
  fn: (sig: Signal<T>) => void
): BenchmarkResult {
  const sig = signal(0 as T);
  const start = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize;

  for (let i = 0; i < operations; i++) {
    fn(sig);
  }

  const end = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize;
  const duration = end - start;
  const opsPerSecond = (operations / duration) * 1000;

  return {
    name,
    operations,
    duration,
    opsPerSecond,
    memoryUsed: endMemory && startMemory ? endMemory - startMemory : undefined,
  };
}

/**
 * Benchmarks multiple operations
 */
export function benchmarkSuite<T>(
  benchmarks: Array<{
    name: string;
    operations: number;
    fn: (sig: Signal<T>) => void;
  }>
): BenchmarkResult[] {
  return benchmarks.map((bench) => benchmarkSignal(bench.name, bench.operations, bench.fn));
}

/**
 * Compares two implementations
 */
export function compareBenchmarks(
  result1: BenchmarkResult,
  result2: BenchmarkResult
): {
  faster: string;
  speedup: number;
  difference: number;
} {
  const faster = result1.opsPerSecond > result2.opsPerSecond ? result1.name : result2.name;
  const speedup = Math.max(result1.opsPerSecond, result2.opsPerSecond) /
                  Math.min(result1.opsPerSecond, result2.opsPerSecond);
  const difference = Math.abs(result1.opsPerSecond - result2.opsPerSecond);

  return {
    faster,
    speedup,
    difference,
  };
}

/**
 * Runs comprehensive benchmark suite
 */
export function runBenchmarkSuite(): {
  signalCreation: BenchmarkResult;
  signalRead: BenchmarkResult;
  signalWrite: BenchmarkResult;
  computedCreation: BenchmarkResult;
  computedRead: BenchmarkResult;
} {
  return {
    signalCreation: benchmarkSignal('Signal Creation', 10000, () => {
      signal(0);
    }),
    signalRead: benchmarkSignal('Signal Read', 100000, (sig) => {
      sig();
    }),
    signalWrite: benchmarkSignal('Signal Write', 100000, (sig) => {
      sig.set(1);
    }),
    computedCreation: benchmarkSignal('Computed Creation', 1000, () => {
      const s = signal(0);
      computed(() => s() * 2);
    }),
    computedRead: benchmarkSignal('Computed Read', 10000, () => {
      const s = signal(0);
      const c = computed(() => s() * 2);
      c();
    }),
  };
}

/**
 * Formats benchmark results
 */
export function formatBenchmarkResults(results: BenchmarkResult[]): string {
  return results
    .map((r) => {
      return `${r.name}:\n  ${r.operations} operations in ${r.duration.toFixed(2)}ms\n  ${r.opsPerSecond.toFixed(0)} ops/sec`;
    })
    .join('\n\n');
}

