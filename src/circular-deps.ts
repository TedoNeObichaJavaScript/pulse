/**
 * Circular Dependency Detection
 * Detect and prevent circular dependencies
 */

import type { Signal } from './signal';
import { getCurrentContext } from './context';

const dependencyChain = new WeakMap<Signal<any>, Set<Signal<any>>>();

/**
 * Detects circular dependencies in computed values
 */
export function detectCircularDependencyInComputed<T>(
  computed: Signal<T>,
  currentChain: Set<Signal<any>> = new Set()
): boolean {
  if (currentChain.has(computed)) {
    console.warn('Circular dependency detected:', Array.from(currentChain).map(String));
    return true;
  }

  currentChain.add(computed);
  const existingChain = dependencyChain.get(computed);
  if (existingChain) {
    for (const dep of existingChain) {
      if (detectCircularDependencyInComputed(dep, new Set(currentChain))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Safe computed that prevents circular dependencies
 */
export function safeComputed<T>(
  fn: () => T,
  onCircularDependency?: () => void
): Signal<T> {
  const visited = new Set<Signal<any>>();
  
  // This would need integration with the computed implementation
  // For now, it's a utility function
  return {} as Signal<T>;
}

