# Pulse ⚡

A lightweight reactive state engine with dependency tracking and automatic updates.

## Features

- 🔄 **Reactive Signals** - Track dependencies and automatically update
- 📦 **Stores** - Manage application state
- 🧮 **Computed Values** - Derived state that updates automatically
- 🎯 **Dependency Tracking** - Automatic dependency graph management
- 🔧 **Template Compiler** - Transform template syntax into render functions (coming soon)

## Installation

```bash
npm install pulse
# or
pnpm add pulse
# or
yarn add pulse
```

## Usage

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


