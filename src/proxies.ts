/**
 * Signal Proxies
 * Proxy-based signal access for reactive objects
 */

import type { Signal } from './signal';
import { signal } from './signal';

/**
 * Creates a proxy that wraps a signal for transparent property access
 */
export function proxySignal<T extends Record<string, any>>(
  sig: Signal<T>
): T & {
  $signal: Signal<T>;
  $update: (updater: (value: T) => T) => void;
} {
  const proxy = new Proxy(sig(), {
    get(target, prop) {
      if (prop === '$signal') {
        return sig;
      }
      if (prop === '$update') {
        return (updater: (value: T) => T) => {
          sig.update(updater);
        };
      }
      return (target as any)[prop];
    },
    set(target, prop, value) {
      const current = sig();
      const updated = { ...current, [prop]: value };
      sig.set(updated);
      return true;
    },
  }) as T & { $signal: Signal<T>; $update: (updater: (value: T) => T) => void };

  // Subscribe to updates to keep proxy in sync
  sig.subscribe((newValue) => {
    Object.assign(proxy, newValue);
  });

  return proxy;
}

/**
 * Creates a signal from a proxy
 */
export function signalFromProxy<T extends Record<string, any>>(
  initialValue: T
): Signal<T> & T {
  const sig = signal(initialValue);
  const proxy = new Proxy(initialValue, {
    get(target, prop) {
      if (prop === 'set' || prop === 'update' || prop === 'subscribe') {
        return (sig as any)[prop];
      }
      const current = sig();
      return (current as any)[prop];
    },
    set(target, prop, value) {
      const current = sig();
      const updated = { ...current, [prop]: value };
      sig.set(updated);
      return true;
    },
  }) as Signal<T> & T;

  return proxy;
}

