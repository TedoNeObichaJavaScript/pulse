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

// Persistence
export {
  persistentSignal,
  localStorageSignal,
  sessionStorageSignal,
  hydrateSignal,
  clearPersistedSignal,
  localStorageAdapter,
  sessionStorageAdapter,
  type StorageAdapter,
  type PersistenceOptions,
} from './persistence';

// Validation & Contracts
export {
  contract,
  typeContract,
  rangeContract,
  lengthContract,
  arrayLengthContract,
  patternContract,
  shapeContract,
  unionContract,
  optionalContract,
  validatedSignal,
  validate,
  type Contract,
  type Validator,
  type ValidatedSignalOptions,
} from './validation';

// History & Undo/Redo
export {
  historySignal,
  type HistorySignal,
  type HistoryState,
  type HistoryOptions,
} from './history';

// Utilities
export {
  debouncedSignal,
  throttledSignal,
  conditionalSignal,
} from './utils';

// Lifecycle Hooks
export {
  lifecycleSignal,
  destroySignal,
  addLifecycleHooks,
  type LifecycleHook,
  type LifecycleOptions,
} from './lifecycle';

// Dependency tracking
export { getCurrentContext, setCurrentContext } from './context';


