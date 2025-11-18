/**
 * Bundle Optimization
 * Utilities to reduce bundle size
 */

/**
 * Minimal signal implementation for smaller bundles
 */
export function minimalSignal<T>(initialValue: T): {
  (): T;
  set(value: T): void;
  subscribe(callback: (value: T) => void): () => void;
} {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  const get = (): T => value;

  const set = (newValue: T): void => {
    if (value !== newValue) {
      value = newValue;
      subscribers.forEach((callback) => callback(newValue));
    }
  };

  const subscribe = (callback: (value: T) => void): (() => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  const sig = get as typeof get & { set: typeof set; subscribe: typeof subscribe };
  sig.set = set;
  sig.subscribe = subscribe;

  return sig;
}

/**
 * Feature detection for conditional loading
 */
// WeakRef type declaration for TypeScript
declare const WeakRef: {
  new <T extends object>(target: T): { deref: () => T | undefined };
  prototype: { deref: () => any };
} | undefined;

export const hasFeatures = {
  localStorage: typeof localStorage !== 'undefined',
  sessionStorage: typeof sessionStorage !== 'undefined',
  WebSocket: typeof WebSocket !== 'undefined',
  Worker: typeof Worker !== 'undefined',
  WeakRef: typeof WeakRef !== 'undefined',
  requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
  queueMicrotask: typeof queueMicrotask !== 'undefined',
} as const;

