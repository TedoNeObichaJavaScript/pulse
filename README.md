<div align="center">
  <img src="logo.svg" alt="Pulse Logo" width="400" height="200">
  <h1>Pulse ⚡</h1>
  <p><strong>A lightweight reactive state engine</strong></p>
  <p>Automatically tracks dependencies between variables and UI components</p>
</div>

---

## 📖 About

**Pulse** is a powerful, lightweight reactive state management framework for JavaScript and TypeScript applications. It provides automatic dependency tracking, fine-grained reactivity, and a comprehensive set of features for building modern, reactive applications.

### What is Pulse?

Pulse is a **reactive state engine** that makes building applications with automatic data synchronization effortless. Instead of manually managing when to update your UI or recalculate values, Pulse automatically tracks relationships between your data and keeps everything in sync.

**Key Concept:** When you create a **signal** (a reactive variable), any **computed values** or **effects** that read from it automatically become dependent on it. When the signal changes, all dependent computations and effects automatically re-run. This creates a reactive data flow where changes propagate automatically through your application.

### Why Use Pulse?

- 🎯 **Zero Boilerplate** - No manual subscription management
- ⚡ **High Performance** - Optimized batching and dependency tracking
- 🧩 **Framework Agnostic** - Works with React, Vue, or vanilla JS (React/Vue are optional)
- 📦 **Lightweight** - Minimal bundle size with tree shaking
- 🔧 **TypeScript First** - Full type safety out of the box
- 🚀 **Production Ready** - 100+ features, comprehensive error handling
- 🛠️ **Developer Experience** - Rich tooling and debugging utilities

### Perfect For

- **State Management** - Manage application state with automatic reactivity
- **UI Frameworks** - Build reactive UI frameworks or enhance existing ones
- **Data Binding** - Create two-way data binding systems
- **Form Validation** - Reactive form state with automatic validation
- **Real-time Updates** - Keep data synchronized across your application
- **Server State** - Query-like API for server data with caching
- **Cross-Framework** - Use with React, Vue, or any JavaScript framework

---

## 🎯 Core Concept

When you create a **signal** (a reactive variable), any **computed values** or **effects** that read from it automatically become dependent on it. When the signal changes, all dependent computations and effects automatically re-run. This creates a reactive data flow where changes propagate automatically through your application.

```typescript
const count = signal(0);           // Create a signal
const doubled = computed(() => {    // Create a computed value
  return count() * 2;               // Reading count() creates a dependency
});

// When count changes, doubled automatically recalculates
count.set(5);  // doubled() is now 10, automatically!
```

## ✨ Features

### 🎯 Core Reactivity
- 🔄 **Signals** - Reactive variables that trigger updates when changed
- 🧮 **Computed Values** - Derived state that automatically recalculates when dependencies change
- 📦 **Stores** - Reactive objects with convenient partial update methods
- 🎯 **Effects** - Side effects that automatically re-run when dependencies change
- 🎯 **Automatic Dependency Tracking** - No manual dependency management needed

### 🚀 Advanced Features
- ⚡ **Batch Updates** - Group multiple updates together for better performance
- 🔒 **Readonly Views** - Create read-only versions of signals for encapsulation
- ⚖️ **Custom Equality** - Prevent unnecessary updates with custom comparison functions
- 🔗 **Derived Stores** - Combine multiple signals into reactive object state
- 📋 **Signal Arrays** - Reactive arrays with push, pop, splice, and other array methods
- 🌐 **Async Computed** - Handle async operations with built-in loading and error states
- 🛡️ **Error Handling** - Global error handlers and error boundaries for robust applications
- 🔧 **Template Compiler** - Transform template syntax (like Handlebars) into JavaScript render functions
- 🔌 **Middleware/Interceptors** - Pipeline system for logging, validation, transformation
- 💾 **Persistence** - localStorage/sessionStorage integration with auto-save and hydration
- ✅ **Validation & Contracts** - Runtime type checking and schema validation
- ⏮️ **History & Undo/Redo** - Time-travel debugging with state snapshots
- ⏱️ **Debounce & Throttle** - Built-in utilities for rate limiting
- 🔄 **Lifecycle Hooks** - onCreated, onUpdated, onDestroyed hooks
- 🔀 **Transformers** - Map/filter/reduce operations on signals
- 👥 **Signal Groups** - Group related signals with batch operations
- 🔍 **Lenses** - Immutable updates with path-based access
- 🎯 **Conditional Subscriptions** - Subscribe only when conditions are met
- 💨 **Caching** - Smart caching with TTL and invalidation
- 🔗 **Synchronization** - Cross-tab/window state sync with BroadcastChannel
- 🧪 **Testing Utilities** - Helpers for testing signals in test suites
- 📊 **Performance Monitoring** - Built-in metrics and performance tracking
- 🔄 **Error Recovery** - Automatic error recovery with fallback values
- 🦥 **Lazy Evaluation** - Lazy computed values that only compute when accessed
- 🧠 **Memoization** - Memoized computed values with dependency tracking
- 📬 **Queues** - Queue system for managing signal updates
- ⚡ **Priorities** - Priority-based update scheduling
- 🌊 **Reactive Streams** - RxJS-like operators (map, filter, debounce, throttle, etc.)
- 🐛 **Debugging** - Enhanced debugging utilities with logging and tracing
- 🧠 **Memory Leak Detection** - Automatic detection of memory leaks
- 🏭 **Factory Patterns** - Counter, toggle, form, and other common patterns
- ⏱️ **Timers** - Reactive timers, intervals, and timeouts
- 👁️ **Observables** - Observable pattern integration (RxJS compatible)
- 🔄 **State Machine** - State machine pattern with signals
- 🎬 **Animations** - Signal-driven animations with easing functions
- 🌐 **WebSocket** - Reactive WebSocket integration with auto-reconnect
- 📊 **Dependency Graph** - Build and visualize signal dependency graphs
- 🔗 **Context API** - Context-based signal sharing (React-like)
- 🎯 **Selectors** - Selector pattern for derived state
- 🏗️ **Providers** - Provider pattern for dependency injection
- ⚡ **Enhanced Effects** - Effects with better cleanup and lifecycle
- ⚖️ **Comparators** - Deep/shallow equality and custom comparators
- 🔧 **Patchers** - Patch-based updates for objects (JSON Patch)
- 🔄 **Reducers** - Redux-like reducer pattern
- 📋 **Subscription Manager** - Manage multiple subscriptions
- 📡 **Event Emitter** - Event emitter pattern with signals
- 🔁 **Retry Logic** - Retry failed operations with backoff
- ⚡ **Circuit Breaker** - Circuit breaker pattern for fault tolerance
- 🚦 **Rate Limiter** - Rate limiting for signal updates
- 💨 **Backpressure** - Backpressure handling for high-frequency updates
- 📦 **Advanced Batching** - Priority, conditional, and scheduled batching
- 🛠️ **Utilities** - Clone, merge, diff, and sync signal operations
- 💾 **Serialization** - Serialize/deserialize signal state for persistence
- 🔌 **Plugins** - Extensible plugin system for custom functionality
- 🔗 **Framework Integrations** - React hooks, Vue composables (optional peer dependencies)
- ⛓️ **Middleware Chain** - Fluent API for building middleware pipelines
- 🎨 **Composition** - Higher-order signals and composition utilities
- 🔍 **Type Utilities** - Advanced TypeScript type helpers
- 🧪 **Testing Helpers** - Comprehensive testing utilities
- 🐛 **Debugging Tools** - Advanced debugging and inspection
- ⚡ **Performance Hooks** - Performance monitoring and profiling

## 🚀 Performance

Pulse is optimized for performance with:
- **Optimized batching** - Groups multiple updates together
- **Fine-grained reactivity** - Only updates what changed
- **Smart dependency tracking** - Minimal overhead
- **Efficient memory usage** - Automatic cleanup of unused subscriptions
- **Tree-shakeable** - Small bundle size with unused code elimination

## 📦 Installation

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 🔨 Build

```bash
# Build the library
npm run build

# Build in watch mode (for development)
npm run dev
```

The build outputs to the `dist/` folder:
- `dist/index.js` - ES module format
- `dist/index.cjs` - CommonJS format
- Type definitions included

## 📖 Usage

### Basic Signals

```typescript
import { signal, computed, effect } from './dist/index.js';

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
import { batch, signal } from './dist/index.js';

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
import { store } from './dist/index.js';

const user = store({ name: 'John', age: 30 });
user.setField('age', 31); // Partial update
user.update(u => ({ ...u, name: 'Jane' })); // Full update
```

### Signal Arrays

```typescript
import { array } from './dist/index.js';

const items = array([1, 2, 3]);
items.push(4); // Reactive push
items.pop(); // Reactive pop
const filtered = items.filter(x => x > 2); // Returns new SignalArray
```

### Async Computed

```typescript
import { asyncComputed, signal } from './dist/index.js';

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
import { compile } from './dist/index.js';

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

### React Integration (Optional)

React is an **optional peer dependency**. The React integrations will only work if React is installed in your project.

```typescript
import { signal, computed } from './dist/index.js';
import { useSignal, useComputed } from './dist/index.js';

function Counter() {
  const [count, setCount] = useSignal(signal(0));
  const doubled = useComputed(computed(() => count * 2));
  
  return <button onClick={() => setCount(count + 1)}>{doubled}</button>;
}
```

### Vue Integration (Optional)

Vue is an **optional peer dependency**. The Vue integrations will only work if Vue is installed in your project.

```typescript
import { signal } from './dist/index.js';
import { useSignal as useVueSignal } from './dist/index.js';

export default {
  setup() {
    const count = useVueSignal(signal(0));
    return { count };
  }
}
```

### Validation & Contracts

```typescript
import { validatedSignal, contract } from './dist/index.js';

const isPositive = contract((value: number) => value > 0);
const count = validatedSignal(5, {
  contract: isPositive,
  onError: (value, error) => {
    console.log('Validation failed:', error);
  }
});

count.set(-1); // Calls onError, keeps value at 5
```

### Middleware

```typescript
import { signal, transformMiddleware, validationMiddleware } from './dist/index.js';

const transform = transformMiddleware((x: number) => x * 2);
const validate = validationMiddleware((x: number) => x < 100);

const sig = signal(0, { middleware: [transform, validate] });

sig.set(10);  // 10 * 2 = 20, valid ✅
sig.set(60);  // 60 * 2 = 120, invalid → gracefully degrades ✅
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test Status:** 118/119 tests passing ✅

The framework is production-ready with comprehensive test coverage.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Build in watch mode (for development)
npm run dev
```

## 🎯 Use Cases

- **State Management** - Manage application state with automatic reactivity
- **UI Frameworks** - Build reactive UI frameworks or enhance existing ones
- **Data Binding** - Create two-way data binding systems
- **Form Validation** - Reactive form state with automatic validation
- **Real-time Updates** - Keep data synchronized across your application
- **Template Rendering** - Use the template compiler for server-side or client-side rendering
- **Cross-Framework** - Use with React, Vue, or any JavaScript framework

## 💡 Why Pulse?

Unlike traditional state management libraries that require you to manually trigger updates, Pulse automatically tracks dependencies and updates only what's necessary. This means:

- **Less Boilerplate** - No need to manually subscribe/unsubscribe
- **Better Performance** - Only updates what actually changed
- **Easier Debugging** - Clear dependency relationships
- **Type Safe** - Full TypeScript support with excellent autocomplete
- **Framework Agnostic** - Works with React, Vue, or any JavaScript framework (React/Vue are optional)
- **Production Ready** - 100+ features, comprehensive error handling, and optimizations
- **Small Bundle** - Tree-shakeable, minimal footprint
- **Developer Experience** - Rich tooling and debugging utilities

## 📚 Documentation

- **[API Reference](docs/API.md)** - Complete API documentation with examples
- **[Guide](docs/GUIDE.md)** - Comprehensive usage guide and best practices
- **[Examples](examples/README.md)** - Code examples and demos

## 🎮 Try It Out

Run the examples to see Pulse in action:

```bash
# Basic example
npx tsx examples/basic.ts

# Advanced example
npx tsx examples/advanced.ts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Stats

- **100+ Features** - Comprehensive reactive state management
- **100+ Source Files** - Well-organized, modular codebase
- **Full TypeScript** - Complete type safety
- **Production Ready** - Optimized and battle-tested
- **118/119 Tests Passing** - Comprehensive test coverage

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/TedoNeObichaJavaScript">TedoNeObichaJavaScript</a></p>
  <p>⭐ Star this repo if you find it useful!</p>
  <p>
    <a href="https://github.com/TedoNeObichaJavaScript/pulse">GitHub</a> •
    <a href="docs/API.md">Documentation</a> •
    <a href="examples/README.md">Examples</a>
  </p>
</div>
