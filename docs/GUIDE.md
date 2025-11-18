# Pulse Guide

A comprehensive guide to using Pulse for reactive state management.

## Getting Started

### Installation

```bash
npm install pulse
```

### Basic Usage

```typescript
import { signal, computed, effect } from 'pulse';

// Create a signal
const count = signal(0);

// Create a computed value
const doubled = computed(() => count() * 2);

// Create an effect
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// Update the signal
count.set(5); // Logs: "Count: 5, Doubled: 10"
```

## Core Concepts

### Signals

Signals are reactive variables that trigger updates when changed.

```typescript
const name = signal('World');
name.set('Pulse'); // Triggers updates
```

### Computed Values

Computed values automatically recalculate when dependencies change.

```typescript
const a = signal(1);
const b = signal(2);
const sum = computed(() => a() + b()); // Automatically updates
```

### Effects

Effects run side effects when dependencies change.

```typescript
effect(() => {
  document.title = `Count: ${count()}`;
});
```

### Stores

Stores are reactive objects with convenient update methods.

```typescript
const user = store({ name: 'John', age: 30 });
user.setField('age', 31); // Partial update
```

## Patterns

### State Management

```typescript
// Create a state store
const appState = store({
  user: null,
  theme: 'light',
  notifications: [],
});

// Update state
appState.setField('theme', 'dark');
appState.update(state => ({
  ...state,
  notifications: [...state.notifications, newNotification],
}));
```

### Form Handling

```typescript
const form = store({
  email: '',
  password: '',
  errors: {},
});

// Validate on change
form.subscribe((state) => {
  const errors = {};
  if (!state.email.includes('@')) {
    errors.email = 'Invalid email';
  }
  form.setField('errors', errors);
});
```

### Async Data

```typescript
const userId = signal(1);
const user = asyncComputed(async () => {
  const id = userId();
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

// Check loading state
if (user.loading()) {
  return <Loading />;
}

// Check error state
if (user.error()) {
  return <Error error={user.error()} />;
}

// Use data
return <UserProfile user={user()} />;
```

### Real-time Updates

```typescript
const messages = array([]);
const ws = websocketSignal('wss://chat.example.com');

ws.subscribe((data) => {
  if (data) {
    messages.push(data);
  }
});
```

## Best Practices

### 1. Use Batch for Multiple Updates

```typescript
// ❌ Bad - triggers multiple updates
a.set(1);
b.set(2);
c.set(3);

// ✅ Good - triggers one update
batch(() => {
  a.set(1);
  b.set(2);
  c.set(3);
});
```

### 2. Clean Up Effects

```typescript
const stop = effect(() => {
  // Side effect
});

// Clean up when done
stop();
```

### 3. Use Computed for Derived State

```typescript
// ❌ Bad - manual recalculation
let filtered = [];
items.subscribe((items) => {
  filtered = items.filter(x => x.active);
});

// ✅ Good - automatic recalculation
const filtered = computed(() => items().filter(x => x.active));
```

### 4. Validate Input

```typescript
const email = validatedSignal('', {
  contract: {
    validate: (value) => value.includes('@') || 'Invalid email',
  },
});
```

### 5. Persist Important State

```typescript
const settings = persistentSignal(
  { theme: 'light' },
  { key: 'settings', storage: 'localStorage' }
);
```

## Performance Tips

1. **Batch Updates** - Group related updates
2. **Use Computed** - Avoid manual recalculation
3. **Debounce/Throttle** - Limit update frequency
4. **Lazy Evaluation** - Compute only when needed
5. **Memoization** - Cache expensive computations

## Common Pitfalls

1. **Circular Dependencies** - Avoid signals depending on each other in a cycle
2. **Memory Leaks** - Always clean up effects and subscriptions
3. **Unnecessary Updates** - Use custom equality functions
4. **Async Race Conditions** - Use proper async patterns

## Migration from Other Libraries

### From Redux

```typescript
// Redux
const store = createStore(reducer);

// Pulse
const state = reducerSignal(reducer, initialState);
```

### From MobX

```typescript
// MobX
const count = observable(0);

// Pulse
const count = signal(0);
```

### From Vue

```typescript
// Vue
const count = ref(0);

// Pulse
const count = signal(0);
```

## Troubleshooting

### Signal Not Updating

- Check if you're using `set()` or `update()`
- Verify dependencies are tracked correctly
- Check for custom equality functions preventing updates

### Memory Leaks

- Always clean up effects
- Unsubscribe from signals when done
- Use cleanup managers

### Performance Issues

- Use batch updates
- Debounce/throttle frequent updates
- Profile signals with DevTools

