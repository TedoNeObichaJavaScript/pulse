/**
 * Basic example demonstrating Pulse reactive primitives
 */
import { signal, computed, effect, store } from '../src/index';

console.log('=== Pulse Reactive Engine Demo ===\n');

// 1. Signals
console.log('1. Signals:');
const count = signal(0);
console.log(`Initial count: ${count()}`);

count.set(5);
console.log(`After set(5): ${count()}`);

count.update((n) => n + 1);
console.log(`After update(n => n + 1): ${count()}\n`);

// 2. Computed values
console.log('2. Computed Values:');
const doubled = computed(() => count() * 2);
console.log(`Doubled: ${doubled()}`);

count.set(10);
console.log(`After count.set(10), doubled: ${doubled()}\n`);

// 3. Effects
console.log('3. Effects:');
effect(() => {
  console.log(`Effect: count is ${count()}, doubled is ${doubled()}`);
});

count.set(20);
count.set(25);
console.log('');

// 4. Stores
console.log('4. Stores:');
const user = store({ name: 'John', age: 30 });
console.log(`User: ${JSON.stringify(user())}`);

user.setField('age', 31);
console.log(`After setField('age', 31): ${JSON.stringify(user())}`);

user.update((u) => ({ ...u, name: 'Jane' }));
console.log(`After update: ${JSON.stringify(user())}\n`);

console.log('=== Demo Complete ===');


