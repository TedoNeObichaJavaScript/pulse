/**
 * Signal Factory Pattern
 * Factory functions for creating common signal patterns
 */

import { signal, type Signal } from './signal';
import { computed } from './computed';
import { effect } from './effect';

/**
 * Creates a counter signal with increment/decrement
 */
export function counterSignal(initialValue: number = 0): Signal<number> & {
  increment: (by?: number) => void;
  decrement: (by?: number) => void;
  reset: () => void;
} {
  const sig = signal(initialValue);
  const initial = initialValue;

  return Object.assign(sig, {
    increment: (by: number = 1) => {
      sig.update((n) => n + by);
    },
    decrement: (by: number = 1) => {
      sig.update((n) => n - by);
    },
    reset: () => {
      sig.set(initial);
    },
  });
}

/**
 * Creates a toggle signal
 */
export function toggleSignal(initialValue: boolean = false): Signal<boolean> & {
  toggle: () => void;
  on: () => void;
  off: () => void;
} {
  const sig = signal(initialValue);

  return Object.assign(sig, {
    toggle: () => {
      sig.update((v) => !v);
    },
    on: () => {
      sig.set(true);
    },
    off: () => {
      sig.set(false);
    },
  });
}

/**
 * Creates a number signal with min/max bounds
 */
export function boundedSignal(
  initialValue: number,
  min: number,
  max: number
): Signal<number> {
  return signal(initialValue, {
    middleware: [
      (value, next) => {
        const clamped = Math.max(min, Math.min(max, value));
        return next(clamped);
      },
    ],
  });
}

/**
 * Creates a string signal with validation
 */
export function stringSignal(
  initialValue: string = '',
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): Signal<string> {
  const { minLength, maxLength, pattern } = options;

  return signal(initialValue, {
    middleware: [
      (value, next, sig) => {
        if (minLength !== undefined && value.length < minLength) {
          return sig(); // Reject
        }
        if (maxLength !== undefined && value.length > maxLength) {
          return sig(); // Reject
        }
        if (pattern && !pattern.test(value)) {
          return sig(); // Reject
        }
        return next(value);
      },
    ],
  });
}

/**
 * Creates a form signal group
 */
export function formSignal<T extends Record<string, any>>(
  initialValues: T
): {
  fields: { [K in keyof T]: Signal<T[K]> };
  values: Signal<T>;
  reset: () => void;
  isValid: Signal<boolean>;
} {
  const fields: { [K in keyof T]: Signal<T[K]> } = {} as any;
  const initial = { ...initialValues };

  for (const key in initialValues) {
    fields[key] = signal(initialValues[key]);
  }

  const values = computed(() => {
    const result = {} as T;
    for (const key in fields) {
      result[key] = fields[key]();
    }
    return result;
  });

  const reset = () => {
    for (const key in fields) {
      fields[key].set(initial[key]);
    }
  };

  const isValid = computed(() => {
    // Simple validation - all fields have truthy values
    for (const key in fields) {
      if (!fields[key]()) {
        return false;
      }
    }
    return true;
  });

  return {
    fields,
    values: values as Signal<T>,
    reset,
    isValid: isValid as Signal<boolean>,
  };
}

