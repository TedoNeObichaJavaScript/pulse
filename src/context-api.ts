/**
 * Signal Context API
 * Context-based signal sharing (like React Context)
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface SignalContext<T> {
  signal: Signal<T>;
  Provider: (value: T) => void;
  Consumer: (fn: (value: T) => void) => () => void;
}

const contextStack: Array<{ context: SignalContext<any>; value: any }> = [];

/**
 * Creates a signal context
 */
export function createSignalContext<T>(defaultValue: T): SignalContext<T> {
  const contextSignal = signal(defaultValue);

  const Provider = (value: T) => {
    contextStack.push({ context: contextSignal as any, value });
    contextSignal.set(value);
  };

  const Consumer = (fn: (value: T) => void) => {
    fn(contextSignal());
    return contextSignal.subscribe(fn);
  };

  return {
    signal: contextSignal,
    Provider,
    Consumer,
  };
}

/**
 * Gets current context value
 */
export function useContext<T>(context: SignalContext<T>): T {
  return context.signal();
}

/**
 * Uses context with subscription
 */
export function useSignalContext<T>(
  context: SignalContext<T>
): Signal<T> {
  return context.signal;
}

