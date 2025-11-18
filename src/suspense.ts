/**
 * Signal Suspense
 * Suspense integration for async signals
 */

import { signal, type Signal } from './signal';
import { computed, type Computed } from './computed';
import { resource as createResource, type Resource } from './resources';

export interface SuspenseBoundary {
  suspend: () => void;
  resume: () => void;
  isSuspended: Signal<boolean>;
}

const suspenseStack: SuspenseBoundary[] = [];

/**
 * Creates a suspense boundary
 */
export function createSuspense(): SuspenseBoundary {
  const isSuspended = signal(false);
  const pendingPromises = new Set<Promise<any>>();

  const suspend = () => {
    isSuspended.set(true);
  };

  const resume = () => {
    isSuspended.set(false);
  };

  return {
    suspend,
    resume,
    isSuspended,
  };
}

/**
 * Gets the current suspense boundary
 */
export function getCurrentSuspense(): SuspenseBoundary | null {
  return suspenseStack[suspenseStack.length - 1] || null;
}

/**
 * Runs a function within a suspense boundary
 */
export function withSuspense<T>(boundary: SuspenseBoundary, fn: () => T): T {
  suspenseStack.push(boundary);
  try {
    return fn();
  } finally {
    suspenseStack.pop();
  }
}

/**
 * Creates a suspense-aware computed that throws promises
 */
export function suspenseComputed<T>(
  fn: () => T | Promise<T>
): Computed<T> & { promise: Promise<T> | null } {
  const promiseSignal = signal<Promise<T> | null>(null);
  let currentPromise: Promise<T> | null = null;

  const comp = computed(() => {
    const result = fn();
    const boundary = getCurrentSuspense();

    if (result instanceof Promise) {
      currentPromise = result;
      promiseSignal.set(result);
      
      if (boundary) {
        boundary.suspend();
        result
          .then(() => {
            if (currentPromise === result) {
              boundary.resume();
            }
          })
          .catch(() => {
            if (currentPromise === result) {
              boundary.resume();
            }
          });
      }

      throw result; // Throw to trigger suspense
    }

    promiseSignal.set(null);
    if (boundary) {
      boundary.resume();
    }

    return result;
  });

  Object.assign(comp, {
    promise: promiseSignal,
  });

  return comp as Computed<T> & { promise: Promise<T> | null };
}

/**
 * Creates a suspense-aware resource
 */
export function suspenseResource<T>(
  fetcher: () => Promise<T>,
  options?: { initialValue?: T }
): Resource<T> & { suspense: () => T } {
  const resourceInstance = createResource(fetcher, options);
  const boundary = getCurrentSuspense();

  const suspenseFn = (): T => {
    const data = resourceInstance.data();
    const loading = resourceInstance.loading();
    const error = resourceInstance.error();

    if (error) {
      throw error;
    }

    if (loading || data === undefined) {
      if (boundary) {
        boundary.suspend();
      }
      throw resourceInstance.refetch();
    }

    if (boundary) {
      boundary.resume();
    }

    return data;
  };

  // Watch for completion
  resourceInstance.loading.subscribe((loading) => {
    if (!loading && boundary) {
      boundary.resume();
    }
  });

  Object.assign(resourceInstance, {
    suspense: suspenseFn,
  });

  return resourceInstance as Resource<T> & { suspense: () => T };
}

/**
 * Creates a lazy suspense resource
 */
export function lazySuspenseResource<T>(
  fetcher: () => Promise<T>
): () => T {
  let resourceInstance: Resource<T> | null = null;

  return () => {
    if (!resourceInstance) {
      resourceInstance = createResource(fetcher);
    }

    const data = resourceInstance.data();
    const loading = resourceInstance.loading();
    const error = resourceInstance.error();
    const boundary = getCurrentSuspense();

    if (error) {
      throw error;
    }

    if (loading || data === undefined) {
      if (boundary) {
        boundary.suspend();
      }
      throw resourceInstance.refetch();
    }

    if (boundary) {
      boundary.resume();
    }

    return data;
  };
}

