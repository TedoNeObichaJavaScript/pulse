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

// Transformers
export {
  mapSignal,
  filterSignal,
  reduceSignal,
  pipeSignal,
  combineSignals,
  zipSignals,
} from './transformers';

// Signal Groups
export {
  signalGroup,
  type SignalGroup,
} from './groups';

// Lenses
export {
  lensSignal,
  propLens,
  indexLens,
  composeLens,
  pathLens,
  type Lens,
} from './lenses';

// Conditional Subscriptions
export {
  conditionalSubscribe,
  conditionalEffect as conditionalSubscribeEffect,
} from './conditional';

// Caching
export {
  cachedComputed,
  invalidateCache,
  type CacheOptions,
} from './caching';

// Synchronization
export {
  syncedSignal,
  localStorageSyncedSignal,
  type SyncOptions,
} from './sync';

// Testing Utilities
export {
  waitForSignal,
  collectSignalValues,
  mockSignal,
  expectSignal,
} from './testing';

// Performance Monitoring
export {
  trackPerformance,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  type PerformanceMetrics,
} from './performance';

// Error Recovery
export {
  recoverableSignal,
  recoverableComputed,
} from './recovery';

// Lazy Evaluation
export {
  lazyComputed,
} from './lazy';

// Memoization
export {
  memoizedComputed,
} from './memo';

// Queues
export {
  queuedSignal,
  type QueueOptions,
} from './queue';

// Priorities
export {
  prioritySignal,
  type Priority,
  type PriorityOptions,
} from './priority';

// Reactive Streams/Operators
export {
  map,
  filter,
  combineLatest,
  take,
  skip,
  distinct,
  distinctBy,
  throttle,
  debounce,
  scan,
  sample,
  delay,
} from './streams';

// Debugging
export {
  debugSignal,
  logSignal,
  getDebugInfo,
  inspectSignal,
  traceSignal,
  type DebugOptions,
} from './debug';

// Memory Leak Detection
export {
  trackSignal,
  checkMemoryLeaks,
  getMemoryStats,
} from './memory';

// Factory Patterns
export {
  counterSignal,
  toggleSignal,
  boundedSignal,
  stringSignal,
  formSignal,
} from './factory';

// Timers
export {
  timerSignal,
  intervalSignal,
  timeoutSignal,
  dateSignal,
} from './timers';

// Observables
export {
  signalToObservable,
  observableToSignal,
  fromSignal,
  type Observable,
  type Observer,
} from './observable';

// State Machine
export {
  stateMachine,
  type StateMachine,
  type StateMachineConfig,
  type StateTransition,
} from './statemachine';

// Animations
export {
  animateSignal,
  animatedSignal,
  easing,
  type AnimationOptions,
} from './animations';

// WebSocket
export {
  websocketSignal,
  type WebSocketSignalOptions,
} from './websocket';

// Dependency Graph
export {
  registerSignal,
  getDependencyGraph,
  getDependencies,
  getDependents,
  exportDependencyGraph,
  visualizeDependencyGraph,
  type DependencyNode,
} from './dependency-graph';

// Context API
export {
  createSignalContext,
  useContext,
  useSignalContext,
  type SignalContext,
} from './context-api';

// Selectors
export {
  createSelector,
  createMemoizedSelector,
  createCombinedSelector,
  type Selector,
} from './selectors';

// Providers
export {
  provide,
  inject,
  provideSignal,
  injectSignal,
  createProviderScope,
  type Provider,
  type SignalProvider,
} from './providers';

// Enhanced Effects
export {
  enhancedEffect,
  conditionalEffect,
  debouncedEffect,
  throttledEffect,
  type EffectOptions,
} from './effects-enhanced';

// Comparators
export {
  deepEqual,
  shallowEqual,
  deepEqualSignal,
  shallowEqualSignal,
  createComparator,
} from './comparators';

// Patchers
export {
  patchableSignal,
  applyPatch,
  type Patch,
} from './patchers';

// Reducers
export {
  reducerSignal,
  combineReducers,
  type Reducer,
  type ReducerSignal,
} from './reducers';

// Subscription Manager
export {
  SubscriptionManager,
  createSubscriptionManager,
} from './subscription-manager';

// Event Emitter
export {
  createEventEmitter,
  signalEventEmitter,
  type EventEmitter,
  type EventHandler,
} from './event-emitter';

// Retry Logic
export {
  retrySignal,
  type RetryOptions,
} from './retry';

// Circuit Breaker
export {
  circuitBreaker,
  type CircuitState,
  type CircuitBreakerOptions,
} from './circuit-breaker';

// Rate Limiter
export {
  rateLimitedSignal,
  tokenBucketSignal,
  type RateLimiterOptions,
} from './rate-limiter';

// Backpressure
export {
  backpressureSignal,
  type BackpressureOptions,
} from './backpressure';

// Advanced Batching
export {
  priorityBatch,
  conditionalBatch,
  scheduledBatch,
  cancellableBatch,
  batchSignalUpdates,
  type BatchStrategy,
} from './batching-advanced';

// Optimizations
export {
  optimizeSignalUpdates,
  memoizeSignalGetter,
  detectCircularDependency,
} from './optimizations';

// Type Safety
export {
  typedSignal,
  brandedSignal,
  unionSignal,
} from './type-safety';

// Edge Cases
export {
  safeEffect,
  safeNumberSignal,
  nonNullableSignal,
} from './edge-cases';

// Memory Optimizations
export {
  weakSignal,
  cleanupUnusedSignals,
  limitSubscribers,
} from './memory-optimizations';

// Cleanup Utilities
export {
  registerCleanup,
  cleanupSignal,
  CleanupManager,
  createCleanupManager,
} from './cleanup';

// Performance Improvements
export {
  debounceReads,
  immutableSignal,
  autoBatchSignal,
} from './performance-improvements';

// Utilities
export {
  cloneSignal,
  cloneSignalValue,
  mergeSignals,
  signalDiff,
  signalsEqual,
  promiseSignal,
  eventSignal,
  getterSignal,
  syncSignal,
} from './utilities';

// Serialization
export {
  serializeSignal,
  deserializeSignal,
  serializableSignal,
  exportSignalStates,
  importSignalStates,
  type SerializationOptions,
} from './serialization';

// Plugins
export {
  usePlugin,
  unusePlugin,
  getPlugins,
  getPluginAPI,
  type PulsePlugin,
  type PulsePluginAPI,
} from './plugins';

// Middleware Chain
export {
  MiddlewareChain,
  createMiddlewareChain,
  signalWith,
} from './middleware-chain';

// React Integration
export {
  useSignal,
  useComputed,
  usePulseEffect,
  useSignalState,
} from './integrations/react';

// Vue Integration
export {
  useSignal as useVueSignal,
  createSignal,
  useComputed as useVueComputed,
} from './integrations/vue';

// SSR Support
export {
  isSSR,
  ssrSignal,
  hydrateSignal as hydrateSignalSSR,
  getSignalState,
  serializeForSSR,
  deserializeFromSSR,
} from './integrations/ssr';

// Proxies
export {
  proxySignal,
  signalFromProxy,
} from './proxies';

// Workers
export {
  workerSignal,
  computedWorker,
  createWorkerFromFunction,
  syncWorkerSignal,
  type WorkerSignalOptions,
} from './workers';

// DevTools
export {
  enableDevTools,
  registerSignalDevTools,
  devToolsSignal,
  logSignalUpdates,
  profileSignal,
  type DevToolsOptions,
} from './devtools';

// Core Optimizations
export {
  optimizedNotify,
  scheduleRAFUpdate,
  scheduleMicrotaskUpdate,
  fastEquals,
} from './optimizations-core';

// Performance Hooks
export {
  addPerformanceHook,
  withPerformanceMonitoring,
  type PerformanceHook,
} from './performance-hooks';

// Bundle Optimization
export {
  minimalSignal,
  hasFeatures,
} from './bundle-optimization';

// Tree Shaking
export {
  FEATURES,
  ifFeature,
  lazyFeature,
} from './tree-shaking';

// Composition
export {
  composeSignals,
  combineSignals,
  deriveSignal,
  switchSignal,
  mergeSignalsWith,
  pickSignal,
  omitSignal,
  mapSignal,
  filterSignal,
  reduceSignal,
} from './composition';

// Type Utilities
export {
  isSignal,
  isComputed,
  createTypedSignal,
  createBrandedSignal,
  type SignalValue,
  type SignalValues,
  type SignalOf,
  type Reactive,
  type OptionalReactive,
  type DeepReactive,
  type BrandedSignal,
} from './type-utilities';

// Testing Helpers
export {
  createSignalSpy,
  waitForSignal,
  collectSignalValues,
  createTestSignal,
  mockSignal,
  trackSignalReads,
} from './testing-helpers';

// Advanced Debugging
export {
  snapshotSignals,
  compareSnapshots,
  traceSignal,
  visualizeDependencies,
  debugSignal,
  inspectSignal,
  type SignalSnapshot,
} from './debugging-tools';

// Benchmarks
export {
  benchmarkSignal,
  benchmarkSuite,
  compareBenchmarks,
  runBenchmarkSuite,
  formatBenchmarkResults,
  type BenchmarkResult,
} from './benchmarks';

// Dependency tracking
export { getCurrentContext, setCurrentContext } from './context';

// Atoms - Atomic state management
export {
  atom,
  computedAtom,
  derivedAtom,
  writableDerivedAtom,
  getAtom,
  splitAtom,
  focusAtom,
  combineAtoms,
  asyncAtom,
  type Atom,
  type ReadOnlyAtom,
} from './atoms';

// Resources - Resource management for async data
export {
  resource,
  dependentResource,
  promiseResource,
  parallelResources,
  type Resource,
  type ResourceOptions,
} from './resources';

// Suspense - Suspense integration
export {
  createSuspense,
  getCurrentSuspense,
  withSuspense,
  suspenseComputed,
  suspenseResource,
  lazySuspenseResource,
  type SuspenseBoundary,
} from './suspense';

// Transitions - Non-urgent updates
export {
  createTransition,
  getCurrentTransition,
  withTransition,
  startTransition,
  transitionSignal,
  transitionBatch,
  type Transition,
} from './transitions';

// Scopes - Scoped signals
export {
  createScope,
  getCurrentScope,
  withScope,
  scopedEffect,
  autoScope,
  type Scope,
} from './scopes';

// Refs - Reference-based signals
export {
  ref,
  reactiveRef,
  mutableRef,
  refCallback,
  forwardRef,
  mergeRefs,
  type Ref,
} from './refs';

// Optimistic Updates
export {
  optimisticSignal,
  createOptimisticUpdate,
  optimisticBatch,
  optimisticMutation,
  type OptimisticSignal,
  type OptimisticUpdate,
} from './optimistic';

// Prefetching
export {
  prefetchableResource,
  onHoverPrefetch,
  onFocusPrefetch,
  linkPrefetch,
  prefetchOnMount,
  createPrefetchManager,
  viewportPrefetch,
} from './prefetching';

// Offline Support
export {
  createOfflineManager,
  offlineSignal,
  getOfflineManager,
  type OfflineManager,
  type OfflineQueueItem,
} from './offline';

// Conflict Resolution
export {
  createConflictResolver,
  conflictAwareSignal,
  threeWayMerge,
  timestampResolver,
  type ConflictResolutionStrategy,
  type Conflict,
  type ConflictResolver,
} from './conflict-resolution';

// Versioning
export {
  versionedSignal,
  createMigration,
  migrateState,
  versionedStore,
  type VersionedState,
  type VersionManager,
  type Migration,
} from './versioning';

// Hot Reload
export {
  registerForHotReload,
  getHotReloadSignal,
  onHotReload,
  triggerHotReload,
  hotReloadableSignal,
  preserveSignalState,
  clearHotReloadState,
} from './hot-reload';

// Immutability Helpers
export {
  produce,
  deepClone,
  immutableSignal,
  freeze,
  deepFreeze,
  draft,
  applyPatches,
  createPatches,
} from './immutability-helpers';

// Pagination
export {
  paginatedSignal,
  paginateArray,
  type PaginatedSignal,
  type PaginationState,
} from './pagination';

// Infinite Scroll
export {
  infiniteScrollSignal,
  infiniteScrollResource,
  virtualInfiniteScroll,
  type InfiniteScrollSignal,
  type InfiniteScrollOptions,
} from './infinite-scroll';

// Queries - Server state management
export {
  query,
  invalidateQueries,
  prefetchQuery,
  getQuery,
  type Query,
  type QueryOptions,
} from './queries';

// Mutations
export {
  mutation,
  optimisticMutation,
  retryMutation,
  type Mutation,
  type MutationOptions,
} from './mutations';

// Cache Invalidation
export {
  createCacheInvalidator,
  timeBasedInvalidation,
  dependencyBasedInvalidation,
  getCacheInvalidator,
  type CacheInvalidator,
} from './cache-invalidation';


