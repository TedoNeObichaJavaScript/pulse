/**
 * Signal Refs
 * Reference-based signals (like React refs) for mutable values
 */

import { signal, type Signal } from './signal';

export interface Ref<T> {
  current: T;
}

/**
 * Creates a ref signal - mutable value that doesn't trigger reactivity
 */
export function ref<T>(initialValue: T): Ref<T> {
  return {
    get current() {
      return initialValue;
    },
    set current(value: T) {
      initialValue = value;
    },
  };
}

/**
 * Creates a ref signal that can be accessed reactively
 */
export function reactiveRef<T>(initialValue: T): Ref<T> & { signal: Signal<T> } {
  const sig = signal(initialValue);
  
  return {
    get current() {
      return sig();
    },
    set current(value: T) {
      sig.set(value);
    },
    signal: sig,
  };
}

/**
 * Creates a ref that only updates when explicitly set
 */
export function mutableRef<T>(initialValue: T): Ref<T> {
  let value = initialValue;
  
  return {
    get current() {
      return value;
    },
    set current(newValue: T) {
      value = newValue;
    },
  };
}

/**
 * Creates a ref callback pattern
 */
export function refCallback<T = HTMLElement>(): [
  (element: T | null) => void,
  Signal<T | null>
] {
  const elementSignal = signal<T | null>(null);
  
  const callback = (element: T | null) => {
    elementSignal.set(element);
  };
  
  return [callback, elementSignal];
}

/**
 * Creates a ref that can be forwarded
 */
export function forwardRef<T, P = {}>(
  render: (props: P, ref: Ref<T>) => any
): (props: P & { ref?: Ref<T> }) => any {
  return (props) => {
    const { ref: forwardedRef, ...rest } = props as any;
    const internalRef = ref<T>(null as any);
    const actualRef = forwardedRef || internalRef;
    return render(rest as P, actualRef);
  };
}

/**
 * Combines multiple refs into one
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | ((value: T) => void) | null>): (value: T) => void {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref && 'current' in ref) {
        (ref as Ref<T>).current = value;
      }
    });
  };
}

