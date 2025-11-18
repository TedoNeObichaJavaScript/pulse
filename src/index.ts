// Core reactive primitives
export { signal, type Signal } from './signal';
export { computed, type Computed } from './computed';
export { effect } from './effect';
export { store, type Store } from './store';

// Batch updates
export { batch } from './batch';

// Readonly views
export { readonly, readonlyComputed, type ReadonlySignal, type ReadonlyComputed } from './readonly';

// Derived stores
export { derived, derivedFrom, type DerivedStore } from './derived';

// Array signals
export { array, type SignalArray } from './array';

// Async computed
export { asyncComputed, type AsyncComputed } from './async-computed';

// Error handling
export {
  setErrorHandler,
  getErrorHandler,
  handleError,
  errorBoundary,
  errorBoundaryAsync,
  PulseError,
} from './error-handling';

// Template compiler
export { compile, type CompiledTemplate, type CompileOptions } from './compiler/index';

// Middleware
export {
  createMiddleware,
  loggingMiddleware,
  validationMiddleware,
  transformMiddleware,
  throttleMiddleware,
  debounceMiddleware,
  historyMiddleware,
  type Middleware,
} from './middleware';

// Dependency tracking
export { getCurrentContext, setCurrentContext } from './context';


