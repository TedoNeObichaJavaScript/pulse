/**
 * React Integration Example
 * Shows how to use Pulse with React
 */

import React from 'react';
import { useSignal, useComputed, usePulseEffect } from '../src/integrations/react';
import { signal, computed } from '../src/index';

// Shared signal (can be in a separate file)
const countSignal = signal(0);
const nameSignal = signal('World');

export function Counter() {
  const [count, setCount] = useSignal(countSignal);
  const doubled = useComputed(computed(() => count * 2));

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}

export function Greeting() {
  const [name, setName] = useSignal(nameSignal);

  usePulseEffect(() => {
    console.log('Name changed to:', name);
  }, [name]);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Hello, {name}!</p>
    </div>
  );
}

