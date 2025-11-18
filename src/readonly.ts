import type { Signal } from './signal';
import type { Computed } from './computed';

/**
 * A readonly signal - can read but cannot write
 */
export interface ReadonlySignal<T> {
  (): T;
  subscribe(callback: (value: T) => void): () => void;
}

/**
 * A readonly computed value
 */
export interface ReadonlyComputed<T> {
  (): T;
  subscribe(callback: (value: T) => void): () => void;
}

/**
 * Creates a readonly view of a signal
 */
export function readonly<T>(signal: Signal<T>): ReadonlySignal<T> {
  const readonlyFn = (() => signal()) as ReadonlySignal<T>;
  readonlyFn.subscribe = signal.subscribe.bind(signal);
  return readonlyFn;
}

/**
 * Creates a readonly view of a computed value
 * (Computed values are already readonly, but this provides type safety)
 */
export function readonlyComputed<T>(computed: Computed<T>): ReadonlyComputed<T> {
  const readonlyFn = (() => computed()) as ReadonlyComputed<T>;
  readonlyFn.subscribe = computed.subscribe.bind(computed);
  return readonlyFn;
}

