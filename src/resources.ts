/**
 * Signal Resources
 * Resource management for async data with loading/error states
 */

import { signal, type Signal } from './signal';
import { computed, type Computed } from './computed';
import type { SignalOptions } from './signal';

export interface Resource<T> {
  (): T | undefined;
  loading: Signal<boolean>;
  error: Signal<Error | null>;
  data: Signal<T | undefined>;
  refetch: () => Promise<T>;
  invalidate: () => void;
}

export interface ResourceOptions<T> {
  initialValue?: T;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  retry?: number;
  retryDelay?: number;
}

/**
 * Creates a resource signal for managing async data
 */
export function resource<T>(
  fetcher: () => Promise<T>,
  options?: ResourceOptions<T>
): Resource<T> {
  const loading = signal(options?.initialValue === undefined);
  const error = signal<Error | null>(null);
  const data = signal<T | undefined>(options?.initialValue);

  let retryCount = 0;
  const maxRetries = options?.retry ?? 0;
  const retryDelay = options?.retryDelay ?? 1000;

  const fetchData = async (): Promise<T> => {
    loading.set(true);
    error.set(null);

    try {
      const result = await fetcher();
      data.set(result);
      loading.set(false);
      retryCount = 0;
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.set(errorObj);
      loading.set(false);

      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchData();
      }

      options?.onError?.(errorObj);
      throw errorObj;
    }
  };

  // Initial fetch
  fetchData().catch(() => {
    // Error already handled
  });

  const resourceFn = (): T | undefined => {
    return data();
  };

  const refetch = () => {
    retryCount = 0;
    return fetchData();
  };

  const invalidate = () => {
    data.set(undefined);
    error.set(null);
    loading.set(true);
    fetchData().catch(() => {
      // Error already handled
    });
  };

  Object.assign(resourceFn, {
    loading,
    error,
    data,
    refetch,
    invalidate,
  });

  return resourceFn as Resource<T>;
}

/**
 * Creates a resource that depends on other signals
 */
export function dependentResource<T, Dependencies extends readonly Signal<any>[]>(
  dependencies: Dependencies,
  fetcher: (...args: { [K in keyof Dependencies]: ReturnType<Dependencies[K]> }) => Promise<T>,
  options?: ResourceOptions<T>
): Resource<T> {
  const loading = signal(options?.initialValue === undefined);
  const error = signal<Error | null>(null);
  const data = signal<T | undefined>(options?.initialValue);

  let currentDeps: any[] = [];
  let retryCount = 0;
  const maxRetries = options?.retry ?? 0;
  const retryDelay = options?.retryDelay ?? 1000;

  const fetchData = async (): Promise<T> => {
    loading.set(true);
    error.set(null);
    currentDeps = dependencies.map((dep) => dep());

    try {
      const result = await fetcher(...currentDeps);
      data.set(result);
      loading.set(false);
      retryCount = 0;
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.set(errorObj);
      loading.set(false);

      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchData();
      }

      options?.onError?.(errorObj);
      throw errorObj;
    }
  };

  // Watch dependencies and refetch when they change
  dependencies.forEach((dep) => {
    dep.subscribe(() => {
      const newDeps = dependencies.map((d) => d());
      const changed = newDeps.some((val, i) => val !== currentDeps[i]);
      if (changed) {
        fetchData().catch(() => {
          // Error already handled
        });
      }
    });
  });

  // Initial fetch
  fetchData().catch(() => {
    // Error already handled
  });

  const resourceFn = (): T | undefined => {
    return data();
  };

  const refetch = () => {
    retryCount = 0;
    return fetchData();
  };

  const invalidate = () => {
    data.set(undefined);
    error.set(null);
    loading.set(true);
    fetchData().catch(() => {
      // Error already handled
    });
  };

  Object.assign(resourceFn, {
    loading,
    error,
    data,
    refetch,
    invalidate,
  });

  return resourceFn as Resource<T>;
}

/**
 * Creates a resource from a promise
 */
export function promiseResource<T>(
  promise: Promise<T>,
  options?: ResourceOptions<T>
): Resource<T> {
  return resource(() => promise, options);
}

/**
 * Creates multiple resources in parallel
 */
export function parallelResources<T extends Record<string, () => Promise<any>>>(
  fetchers: T
): {
  [K in keyof T]: Resource<Awaited<ReturnType<T[K]>>>;
} {
  const resources = {} as any;
  for (const key in fetchers) {
    resources[key] = resource(fetchers[key]);
  }
  return resources;
}

