/**
 * Signal Transitions
 * React 18 transitions-like API for non-urgent updates
 */

import { signal, type Signal } from './signal';
import { batch } from './batch';

export interface Transition {
  startTransition: (fn: () => void) => void;
  isPending: Signal<boolean>;
}

const transitionStack: Transition[] = [];

/**
 * Creates a transition context
 */
export function createTransition(): Transition {
  const isPending = signal(false);
  let pendingCount = 0;

  const startTransition = (fn: () => void) => {
    pendingCount++;
    isPending.set(true);

    // Use requestIdleCallback or setTimeout for non-urgent updates
    const schedule = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 0);

    schedule(() => {
      batch(() => {
        try {
          fn();
        } finally {
          pendingCount--;
          if (pendingCount === 0) {
            isPending.set(false);
          }
        }
      });
    });
  };

  return {
    startTransition,
    isPending,
  };
}

/**
 * Gets the current transition context
 */
export function getCurrentTransition(): Transition | null {
  return transitionStack[transitionStack.length - 1] || null;
}

/**
 * Runs a function within a transition context
 */
export function withTransition<T>(transition: Transition, fn: () => T): T {
  transitionStack.push(transition);
  try {
    return fn();
  } finally {
    transitionStack.pop();
  }
}

/**
 * Marks an update as a transition (non-urgent)
 */
export function startTransition(fn: () => void): void {
  const transition = getCurrentTransition();
  if (transition) {
    transition.startTransition(fn);
  } else {
    // Fallback to regular execution
    fn();
  }
}

/**
 * Creates a transition-aware signal
 */
export function transitionSignal<T>(
  initialValue: T,
  options?: { transition?: Transition }
): Signal<T> & { transition: Transition } {
  const sig = signal(initialValue);
  const transition = options?.transition || createTransition();

  const originalSet = sig.set;
  sig.set = (value: T) => {
    transition.startTransition(() => {
      originalSet(value);
    });
  };

  const originalUpdate = sig.update;
  sig.update = (fn: (value: T) => T) => {
    transition.startTransition(() => {
      originalUpdate(fn);
    });
  };

  Object.assign(sig, {
    transition,
  });

  return sig as Signal<T> & { transition: Transition };
}

/**
 * Batches updates in a transition
 */
export function transitionBatch(fn: () => void): void {
  const transition = getCurrentTransition();
  if (transition) {
    transition.startTransition(fn);
  } else {
    batch(fn);
  }
}

