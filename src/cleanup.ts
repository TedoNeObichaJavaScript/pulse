/**
 * Cleanup Utilities
 * Better cleanup and resource management
 */

import type { Signal } from './signal';

const cleanupRegistry = new WeakMap<Signal<any>, Set<() => void>>();

/**
 * Registers a cleanup function for a signal
 */
export function registerCleanup<T>(
  sig: Signal<T>,
  cleanup: () => void
): () => void {
  let cleanups = cleanupRegistry.get(sig);
  if (!cleanups) {
    cleanups = new Set();
    cleanupRegistry.set(sig, cleanups);
  }
  cleanups.add(cleanup);

  return () => {
    cleanups?.delete(cleanup);
  };
}

/**
 * Cleans up all registered cleanups for a signal
 */
export function cleanupSignal<T>(sig: Signal<T>): void {
  const cleanups = cleanupRegistry.get(sig);
  if (cleanups) {
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (error) {
        console.error('Error in cleanup function:', error);
      }
    }
    cleanups.clear();
  }
}

/**
 * Creates a cleanup manager
 */
export class CleanupManager {
  private cleanups: Set<() => void> = new Set();

  add(cleanup: () => void): () => void {
    this.cleanups.add(cleanup);
    return () => {
      this.cleanups.delete(cleanup);
    };
  }

  cleanup(): void {
    for (const cleanup of this.cleanups) {
      try {
        cleanup();
      } catch (error) {
        console.error('Error in cleanup:', error);
      }
    }
    this.cleanups.clear();
  }

  get size(): number {
    return this.cleanups.size;
  }
}

/**
 * Creates a cleanup manager
 */
export function createCleanupManager(): CleanupManager {
  return new CleanupManager();
}

