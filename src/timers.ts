/**
 * Signal Timers
 * Reactive timers and intervals
 */

import { signal, type Signal } from './signal';
import { effect } from './effect';

/**
 * Creates a reactive timer signal
 */
export function timerSignal(interval: number, initialValue: number = 0): Signal<number> & {
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: () => boolean;
} {
  const sig = signal(initialValue);
  let timerId: ReturnType<typeof setInterval> | null = null;
  let isRunning = false;

  const start = () => {
    if (isRunning) return;
    isRunning = true;
    timerId = setInterval(() => {
      sig.update((n) => n + 1);
    }, interval);
  };

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    isRunning = false;
  };

  const reset = () => {
    stop();
    sig.set(initialValue);
  };

  return Object.assign(sig, {
    start,
    stop,
    reset,
    isRunning: () => isRunning,
  });
}

/**
 * Creates a reactive interval that updates a signal
 */
export function intervalSignal<T>(
  fn: () => T,
  interval: number
): Signal<T> & {
  start: () => void;
  stop: () => void;
} {
  const sig = signal(fn());
  let timerId: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (timerId) return;
    timerId = setInterval(() => {
      sig.set(fn());
    }, interval);
  };

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  return Object.assign(sig, {
    start,
    stop,
  });
}

/**
 * Creates a reactive timeout signal
 */
export function timeoutSignal<T>(
  fn: () => T,
  delay: number
): Signal<T | null> & {
  cancel: () => void;
} {
  const sig = signal<T | null>(null);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  timeoutId = setTimeout(() => {
    sig.set(fn());
    timeoutId = null;
  }, delay);

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      sig.set(null);
    }
  };

  return Object.assign(sig, {
    cancel,
  });
}

/**
 * Creates a reactive date/time signal
 */
export function dateSignal(updateInterval: number = 1000): Signal<Date> & {
  start: () => void;
  stop: () => void;
} {
  const sig = signal(new Date());
  let timerId: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (timerId) return;
    sig.set(new Date());
    timerId = setInterval(() => {
      sig.set(new Date());
    }, updateInterval);
  };

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  return Object.assign(sig, {
    start,
    stop,
  });
}

