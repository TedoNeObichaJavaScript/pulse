/**
 * React Integration
 * React hooks for Pulse signals
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Signal } from '../signal';

/**
 * React hook for using a signal
 */
export function useSignal<T>(sig: Signal<T>): [T, (value: T) => void] {
  const [value, setValue] = useState(() => sig());
  const sigRef = useRef(sig);

  useEffect(() => {
    sigRef.current = sig;
    const unsubscribe = sig.subscribe((newValue) => {
      setValue(newValue);
    });
    return unsubscribe;
  }, [sig]);

  const update = useCallback((newValue: T) => {
    sigRef.current.set(newValue);
  }, []);

  return [value, update];
}

/**
 * React hook for using a computed value
 */
export function useComputed<T>(computed: Signal<T>): T {
  const [value, setValue] = useState(() => computed());

  useEffect(() => {
    const unsubscribe = computed.subscribe((newValue) => {
      setValue(newValue);
    });
    return unsubscribe;
  }, [computed]);

  return value;
}

/**
 * React hook for using an effect
 */
export function usePulseEffect(
  fn: () => void | (() => void),
  deps?: React.DependencyList
): void {
  useEffect(() => {
    const { effect } = require('../effect');
    const cleanup = effect(fn);
    return cleanup;
  }, deps);
}

/**
 * Creates a signal and returns React hook
 */
export function useSignalState<T>(initialValue: T): [Signal<T>, (value: T) => void] {
  const sigRef = useRef<Signal<T> | null>(null);
  if (!sigRef.current) {
    const { signal } = require('../signal');
    sigRef.current = signal(initialValue);
  }

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const unsubscribe = sigRef.current!.subscribe((newValue) => {
      setValue(newValue);
    });
    return unsubscribe;
  }, []);

  const update = useCallback((newValue: T) => {
    sigRef.current!.set(newValue);
  }, []);

  return [sigRef.current, update];
}

