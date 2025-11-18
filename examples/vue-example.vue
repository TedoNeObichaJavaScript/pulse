<template>
  <div>
    <h1>Pulse Vue Example</h1>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script setup lang="ts">
import { useSignal, useComputed } from '../src/integrations/vue';
import { signal, computed } from '../src/index';

const countSignal = signal(0);
const count = useSignal(countSignal);
const doubled = useComputed(computed(() => count.value * 2));

const increment = () => {
  countSignal.set(countSignal() + 1);
};

const decrement = () => {
  countSignal.set(countSignal() - 1);
};
</script>

