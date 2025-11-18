/**
 * React Integration
 * React hooks for Pulse signals
 */

import type { Signal } from '../signal';

// React is an optional dependency - use dynamic require
let React: any;
function getReact() {
  if (!React) {
    try {
      React = require('react');
    } catch (e) {
      throw new Error('React is not installed. Please install react to use React integrations.');
    }
  }
  return React;
}

/**
 * React hook for using a signal
 */
export function useSignal<T>(sig: Signal<T>): [T, (value: T) => void] {
  const react = getReact();
  const { useEffect, useState, useCallback, useRef } = react;
  
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
  }, []) as (value: T) => void;

  return [value, update];
}

/**
 * React hook for using a computed value
 */
export function useComputed<T>(computed: Signal<T>): T {
  const react = getReact();
  const { useEffect, useState } = react;
  
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
  deps?: any[]
): void {
  const react = getReact();
  const { useEffect } = react;
  
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
  const react = getReact();
  const { useEffect, useState, useCallback, useRef } = react;
  
  // Type assertion needed because React is dynamically required
  // We need to create a typed function variable first
  const typedUseRef = useRef as <U>(initialValue: U | null) => { current: U | null };
  const sigRef = typedUseRef<Signal<T>>(null);
  if (!sigRef.current) {
    const { signal } = require('../signal');
    sigRef.current = signal(initialValue);
  }

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const unsubscribe = sigRef.current!.subscribe((newValue: T) => {
      setValue(newValue);
    });
    return unsubscribe;
  }, []);

  const update = useCallback((newValue: T) => {
    sigRef.current!.set(newValue);
  }, []);

  // sigRef.current is guaranteed to be non-null here because we check and create it above
  return [sigRef.current!, update];
}

