# Pulse API Documentation

Complete API reference for the Pulse reactive state engine.

## Table of Contents

- [Core API](#core-api)
- [Advanced Features](#advanced-features)
- [Framework Integrations](#framework-integrations)
- [Utilities](#utilities)

## Core API

### `signal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>`

Creates a reactive signal.

**Parameters:**
- `initialValue: T` - Initial value for the signal
- `options?: SignalOptions<T>` - Optional configuration
  - `equals?: (a: T, b: T) => boolean` - Custom equality function
  - `middleware?: Middleware<T>[]` - Middleware pipeline

**Returns:** `Signal<T>` - A reactive signal

**Example:**
```typescript
const count = signal(0);
count.set(5);
console.log(count()); // 5
```

### `computed<T>(fn: () => T): Computed<T>`

Creates a computed value that automatically recalculates when dependencies change.

**Parameters:**
- `fn: () => T` - Computation function

**Returns:** `Computed<T>` - A computed signal

**Example:**
```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);
count.set(5);
console.log(doubled()); // 10
```

### `effect(fn: () => void | (() => void)): () => void`

Creates an effect that runs when dependencies change.

**Parameters:**
- `fn: () => void | (() => void)` - Effect function, can return cleanup

**Returns:** `() => void` - Cleanup function

**Example:**
```typescript
const count = signal(0);
const stop = effect(() => {
  console.log('Count:', count());
});
count.set(5); // Logs: "Count: 5"
stop(); // Stop the effect
```

### `store<T extends Record<string, any>>(initialValue: T): Store<T>`

Creates a reactive store (object signal) with convenient update methods.

**Parameters:**
- `initialValue: T` - Initial object value

**Returns:** `Store<T>` - A store signal

**Example:**
```typescript
const user = store({ name: 'John', age: 30 });
user.setField('age', 31);
user.update(u => ({ ...u, name: 'Jane' }));
```

## Advanced Features

### Batch Updates

#### `batch<T>(fn: () => T): T`

Batches multiple signal updates together.

**Example:**
```typescript
batch(() => {
  a.set(1);
  b.set(2);
  c.set(3);
}); // All updates batched, effects run once
```

### History & Undo/Redo

#### `historySignal<T>(initialValue: T, options?: HistoryOptions): HistorySignal<T>`

Creates a signal with history tracking.

**Example:**
```typescript
const count = historySignal(0, { maxHistory: 10 });
count.set(1);
count.set(2);
count.undo(); // Back to 1
count.redo(); // Back to 2
```

### Persistence

#### `persistentSignal<T>(initialValue: T, options: PersistenceOptions<T>): Signal<T>`

Creates a signal that persists to storage.

**Example:**
```typescript
const settings = persistentSignal(
  { theme: 'light' },
  {
    key: 'settings',
    storage: 'localStorage',
  }
);
```

### Validation

#### `validatedSignal<T>(initialValue: T, options: ValidatedSignalOptions<T>): Signal<T>`

Creates a signal with validation.

**Example:**
```typescript
const email = validatedSignal('', {
  contract: {
    validate: (value) => value.includes('@') || 'Invalid email',
  },
});
```

### Middleware

#### `middleware.logging(label?: string): Middleware<T>`

Logging middleware.

#### `middleware.validation(validator: (value: T) => boolean, error?: string): Middleware<T>`

Validation middleware.

#### `middleware.transform(transformer: (value: T) => T): Middleware<T>`

Transformation middleware.

**Example:**
```typescript
const count = signal(0, {
  middleware: [
    middleware.logging('count'),
    middleware.transform(v => Math.max(0, v)),
  ],
});
```

### Async Computed

#### `asyncComputed<T>(fn: () => Promise<T>): AsyncComputed<T>`

Creates an async computed value with loading and error states.

**Example:**
```typescript
const user = asyncComputed(async () => {
  const response = await fetch('/api/user');
  return response.json();
});

if (user.loading()) {
  console.log('Loading...');
}
```

### WebSocket

#### `websocketSignal<T>(url: string, options?: WebSocketSignalOptions): Signal<T | null> & WebSocketMethods`

Creates a reactive WebSocket signal.

**Example:**
```typescript
const ws = websocketSignal('wss://echo.websocket.org', {
  reconnect: true,
});
ws.send('Hello');
ws.subscribe((data) => console.log('Received:', data));
```

### Reducers

#### `reducerSignal<TState, TAction>(reducer: Reducer<TState, TAction>, initialState: TState): ReducerSignal<TState, TAction>`

Creates a Redux-like reducer signal.

**Example:**
```typescript
const counter = reducerSignal(
  (state, action) => {
    switch (action.type) {
      case 'increment': return state + 1;
      case 'decrement': return state - 1;
      default: return state;
    }
  },
  0
);

counter.dispatch({ type: 'increment' });
```

### State Machine

#### `stateMachine<TState>(config: StateMachineConfig<TState>, onStateChange?: (state: TState) => void): StateMachine<TState>`

Creates a state machine.

**Example:**
```typescript
const machine = stateMachine({
  initialState: 'idle',
  states: {
    idle: { transitions: { start: 'loading' } },
    loading: { transitions: { success: 'done' } },
  },
});

machine.transition('start');
```

### Animations

#### `animatedSignal(initialValue: number): AnimatedSignal`

Creates an animated signal.

**Example:**
```typescript
const position = animatedSignal(0);
position.animate(100, {
  duration: 1000,
  easing: easing.easeInOut,
});
```

## Framework Integrations

### React

#### `useSignal<T>(sig: Signal<T>): [T, (value: T) => void]`

React hook for using a signal.

#### `useComputed<T>(computed: Signal<T>): T`

React hook for using a computed value.

#### `usePulseEffect(fn: () => void | (() => void), deps?: any[]): void`

React hook for using an effect.

**Example:**
```typescript
function Counter() {
  const [count, setCount] = useSignal(signal(0));
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Vue

#### `useSignal<T>(sig: Signal<T>): Ref<UnwrapRef<T>>`

Vue composable for using a signal.

**Example:**
```typescript
export default {
  setup() {
    const count = useSignal(signal(0));
    return { count };
  }
}
```

## Utilities

### `cloneSignal<T>(sig: Signal<T>): Signal<T>`

Clones a signal.

### `mergeSignals<T>(...signals: Signal<Partial<T>>[]): Signal<T>`

Merges multiple signals.

### `signalDiff<T>(sig1: Signal<T>, sig2: Signal<T>): Partial<T>`

Gets the difference between two signals.

### `promiseSignal<T>(promise: Promise<T>): Signal<T | null> & { loading: Signal<boolean>; error: Signal<Error | null> }`

Creates a signal from a promise.

### `serializableSignal<T>(initialValue: T, options?: SerializationOptions): Signal<T> & SerializationMethods`

Creates a serializable signal.

## DevTools

### `enableDevTools(options?: DevToolsOptions): void`

Enables DevTools integration.

### `devToolsSignal<T>(initialValue: T, name?: string): Signal<T>`

Creates a signal with DevTools integration.

### `logSignalUpdates<T>(sig: Signal<T>, label?: string): Signal<T>`

Logs signal updates to console.

### `profileSignal<T>(sig: Signal<T>, name?: string): Signal<T> & ProfileMethods`

Profiles signal performance.

## Type Definitions

### `Signal<T>`

```typescript
interface Signal<T> {
  (): T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
  subscribe(callback: (value: T) => void): () => void;
}
```

### `Computed<T>`

```typescript
interface Computed<T> {
  (): T;
  subscribe(callback: (value: T) => void): () => void;
}
```

### `Store<T>`

```typescript
interface Store<T> extends Signal<T> {
  setField<K extends keyof T>(key: K, value: T[K]): void;
  update(updater: (value: T) => T): void;
}
```

## Error Handling

### `withErrorHandling<T>(fn: () => T, context?: string): T | undefined`

Wraps a function with error handling.

### `errorBoundary<T>(fn: () => T, onError?: (error: Error) => void): T | undefined`

Creates an error boundary.

## Performance

### `batch<T>(fn: () => T): T`

Batches updates for better performance.

### `debouncedSignal<T>(initialValue: T, delay: number): Signal<T>`

Creates a debounced signal.

### `throttledSignal<T>(initialValue: T, delay: number): Signal<T>`

Creates a throttled signal.

## Memory Management

### `limitSubscribers<T>(sig: Signal<T>, maxSubscribers?: number): Signal<T>`

Limits the number of subscribers.

### `cleanupSignal<T>(sig: Signal<T>): void`

Cleans up a signal.

## Testing

### `mockSignal<T>(value: T): Signal<T>`

Creates a mock signal for testing.

### `waitForSignal<T>(sig: Signal<T>, predicate: (value: T) => boolean, timeout?: number): Promise<T>`

Waits for a signal to match a predicate.

### `collectSignalValues<T>(sig: Signal<T>, count: number): Promise<T[]>`

Collects signal values over time.

