/**
 * Signal Scopes
 * Scoped signals for component-level state management
 */

import { signal, type Signal } from './signal';
import { effect } from './effect';

export interface Scope {
  signal: <T>(initialValue: T) => Signal<T>;
  cleanup: () => void;
  isActive: Signal<boolean>;
}

const scopeStack: Scope[] = [];

/**
 * Creates a new scope
 */
export function createScope(): Scope {
  const signals: Array<() => void> = [];
  const isActive = signal(true);

  const scopeSignal = <T>(initialValue: T): Signal<T> => {
    const sig = signal(initialValue);
    
    // Track cleanup
    const cleanup = () => {
      // Signal cleanup would go here if needed
    };
    signals.push(cleanup);

    return sig;
  };

  const cleanup = () => {
    isActive.set(false);
    signals.forEach((cleanupFn) => cleanupFn());
    signals.length = 0;
  };

  return {
    signal: scopeSignal,
    cleanup,
    isActive,
  };
}

/**
 * Gets the current scope
 */
export function getCurrentScope(): Scope | null {
  return scopeStack[scopeStack.length - 1] || null;
}

/**
 * Runs a function within a scope
 */
export function withScope<T>(scope: Scope, fn: () => T): T {
  scopeStack.push(scope);
  try {
    return fn();
  } finally {
    scopeStack.pop();
  }
}

/**
 * Creates a scoped effect that auto-cleans up
 */
export function scopedEffect(fn: () => void | (() => void)): () => void {
  const scope = getCurrentScope();
  if (!scope) {
    return effect(fn);
  }

  const cleanupFns: Array<() => void> = [];
  const stop = effect(() => {
    if (!scope.isActive()) {
      return;
    }

    const cleanup = fn();
    if (cleanup) {
      cleanupFns.push(cleanup);
    }
  });

  return () => {
    stop();
    cleanupFns.forEach((cleanup) => cleanup());
  };
}

/**
 * Creates a scope that auto-cleans up when dependencies change
 */
export function autoScope<T>(
  dependencies: Signal<any>[],
  fn: (scope: Scope) => T
): Signal<T> {
  const result = signal<T | null>(null);
  let currentScope: Scope | null = null;

  const update = () => {
    // Cleanup previous scope
    if (currentScope) {
      currentScope.cleanup();
    }

    // Create new scope
    currentScope = createScope();
    const value = withScope(currentScope, () => fn(currentScope!));
    result.set(value);
  };

  // Watch dependencies
  dependencies.forEach((dep) => {
    dep.subscribe(() => {
      update();
    });
  });

  // Initial run
  update();

  return result as Signal<T>;
}

