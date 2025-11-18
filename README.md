# Pulse ⚡

A lightweight reactive state engine with dependency tracking and automatic updates.

## Features

- 🔄 **Reactive Signals** - Track dependencies and automatically update
- 📦 **Stores** - Manage application state with partial updates
- 🧮 **Computed Values** - Derived state that updates automatically
- 🎯 **Dependency Tracking** - Automatic dependency graph management
- ⚡ **Batch Updates** - Atomic updates for multiple signals
- 🔒 **Readonly Views** - Encapsulation with readonly signals and computed values
- ⚖️ **Custom Equality** - Prevent unnecessary updates with custom comparison
- 🔗 **Derived Stores** - Reactive object state from multiple sources
- 📋 **Signal Arrays** - Reactive array operations (push, pop, splice, etc.)
- 🌐 **Async Computed** - Handle promises with loading and error states
- 🛡️ **Error Handling** - Global error handlers and error boundaries
- 🔧 **Template Compiler** - Transform template syntax into render functions

## Installation

```bash
npm install pulse
# or
pnpm add pulse
# or
yarn add pulse
```

## Usage

### Basic Signals

```typescript
import { signal, computed, effect } from 'pulse';

// Create a reactive signal
const count = signal(0);

// Create a computed value
const doubled = computed(() => count() * 2);

// Create an effect that runs when dependencies change
effect(() => {
  console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// Update the signal
count.set(5); // Logs: "Count: 5, Doubled: 10"
```

### Batch Updates

```typescript
import { batch, signal } from 'pulse';

const a = signal(0);
const b = signal(0);

// Batch multiple updates - effects only run once
batch(() => {
  a.set(1);
  b.set(1);
});
```

### Stores

```typescript
import { store } from 'pulse';

const user = store({ name: 'John', age: 30 });
user.setField('age', 31); // Partial update
user.update(u => ({ ...u, name: 'Jane' })); // Full update
```

### Signal Arrays

```typescript
import { array } from 'pulse';

const items = array([1, 2, 3]);
items.push(4); // Reactive push
items.pop(); // Reactive pop
const filtered = items.filter(x => x > 2); // Returns new SignalArray
```

### Async Computed

```typescript
import { asyncComputed, signal } from 'pulse';

const userId = signal(1);
const user = asyncComputed(async () => {
  const id = userId();
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});

// Check loading state
if (user.loading()) {
  console.log('Loading...');
}

// Check for errors
if (user.error()) {
  console.error('Error:', user.error());
}

// Get value
const data = await user();
```

### Template Compiler

```typescript
import { compile } from 'pulse';

const template = compile(`
  <h1>{{ title }}</h1>
  {{#if show}}
    <p>{{ message }}</p>
  {{/if}}
  {{#each items as item}}
    <li>{{ item }}</li>
  {{/each}}
`);

const html = template.render({
  title: 'Hello',
  show: true,
  message: 'World',
  items: ['a', 'b', 'c']
});
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Watch mode
pnpm dev
```

## License

MIT


