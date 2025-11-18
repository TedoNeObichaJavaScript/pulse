/**
 * Vue Integration
 * Vue 3 composables for Pulse signals
 */

import type { Signal } from '../signal';

// Vue is an optional dependency - use dynamic require
let Vue: any;
function getVue() {
  if (!Vue) {
    try {
      Vue = require('vue');
    } catch (e) {
      throw new Error('Vue is not installed. Please install vue to use Vue integrations.');
    }
  }
  return Vue;
}

// Type definitions for Vue types (for TypeScript)
type Ref<T> = any;
type UnwrapRef<T> = T;

/**
 * Vue composable for using a signal
 */
export function useSignal<T>(sig: Signal<T>): Ref<UnwrapRef<T>> {
  const vue = getVue();
  const { ref, watchEffect, onUnmounted } = vue;
  const value = ref(sig()) as Ref<UnwrapRef<T>>;

  const unsubscribe = sig.subscribe((newValue: T) => {
    value.value = newValue as UnwrapRef<T>;
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return value;
}

/**
 * Vue composable for creating a signal
 */
export function createSignal<T>(initialValue: T): {
  signal: Signal<T>;
  ref: Ref<UnwrapRef<T>>;
} {
  const { signal } = require('../signal');
  const vue = getVue();
  const { ref } = vue;
  const sig = signal(initialValue);
  const value = ref(initialValue) as Ref<UnwrapRef<T>>;

  sig.subscribe((newValue: T) => {
    value.value = newValue as UnwrapRef<T>;
  });

  return {
    signal: sig,
    ref: value,
  };
}

/**
 * Vue composable for computed
 */
export function useComputed<T>(computed: Signal<T>): Ref<UnwrapRef<T>> {
  return useSignal(computed);
}

