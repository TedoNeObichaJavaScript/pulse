/**
 * Vue Integration
 * Vue 3 composables for Pulse signals
 */

// @ts-ignore - Vue is an optional dependency
import type { Ref, UnwrapRef } from 'vue';
import type { Signal } from '../signal';

/**
 * Vue composable for using a signal
 */
export function useSignal<T>(sig: Signal<T>): Ref<UnwrapRef<T>> {
  const { ref, watchEffect, onUnmounted } = require('vue');
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
  const { ref } = require('vue');
  const sig = signal(initialValue);
  const value = ref(initialValue) as Ref<UnwrapRef<T>>;

  sig.subscribe((newValue) => {
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

