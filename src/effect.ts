import { withContext } from './context';
import { withErrorHandling } from './error-handling';

/**
 * Creates an effect that runs when its dependencies change
 */
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | undefined;
  let isActive = true;

  const dependencies = new Set<{ subscribe: (callback: () => void) => () => void }>();
  let unsubscribe: (() => void) | null = null;

  const run = () => {
    if (!isActive) return;

    // Cleanup previous effect
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }

    // Unsubscribe from old dependencies
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    dependencies.clear();

    // Set up context for dependency tracking
    const context = {
      dependencies,
      onInvalidate: () => {
        // When a dependency changes, re-run the effect
        run();
      },
    };

    // Run the effect while tracking dependencies, with error handling
    const result = withErrorHandling(
      () => withContext(context, fn),
      'effect'
    );
    cleanup = result && typeof result === 'function' ? result : undefined;

    // Subscribe to all dependencies
    const unsubscribers: (() => void)[] = [];
    dependencies.forEach((dep) => {
      unsubscribers.push(
        dep.subscribe(() => {
          run();
        })
      );
    });

    unsubscribe = () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  };

  // Run initially
  run();

  // Return cleanup function
  return () => {
    isActive = false;
    if (cleanup) {
      cleanup();
    }
    if (unsubscribe) {
      unsubscribe();
    }
  };
}


