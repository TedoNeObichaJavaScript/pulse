/**
 * Signal Queries
 * Query-like API for server data with caching
 */

import { signal, type Signal } from './signal';
import { computed } from './computed';
import { resource, type Resource } from './resources';

export interface QueryOptions<T> {
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  retryDelay?: number;
}

export interface Query<T> extends Resource<T> {
  isStale: Computed<boolean>;
  isFetching: Signal<boolean>;
  lastFetched: Signal<number | null>;
  invalidate: () => void;
  refetch: () => Promise<T>;
}

const queryCache = new Map<string, Query<any>>();
const queryTimestamps = new Map<string, number>();

/**
 * Creates a query signal
 */
export function query<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: QueryOptions<T>
): Query<T> {
  // Check cache first
  if (queryCache.has(key)) {
    const cached = queryCache.get(key)!;
    const timestamp = queryTimestamps.get(key) || 0;
    const staleTime = options?.staleTime ?? 0;
    
    if (Date.now() - timestamp < staleTime) {
      return cached;
    }
  }

  const staleTime = options?.staleTime ?? 0;
  const cacheTime = options?.cacheTime ?? 5 * 60 * 1000; // 5 minutes default

  const res = resource(fetcher, {
    retry: options?.retry,
    retryDelay: options?.retryDelay,
  });

  const isFetching = signal(false);
  const lastFetched = signal<number | null>(null);

  const isStale = computed(() => {
    const last = lastFetched();
    if (last === null) return true;
    return Date.now() - last > staleTime;
  });

  const originalRefetch = res.refetch;
  const refetch = async (): Promise<T> => {
    isFetching.set(true);
    try {
      const result = await originalRefetch();
      lastFetched.set(Date.now());
      queryTimestamps.set(key, Date.now());
      return result;
    } finally {
      isFetching.set(false);
    }
  };

  const invalidate = () => {
    queryTimestamps.delete(key);
    res.invalidate();
  };

  // Initial fetch
  refetch().catch(() => {});

  // Refetch on window focus
  if (options?.refetchOnWindowFocus !== false && typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (isStale()) {
        refetch().catch(() => {});
      }
    });
  }

  const queryInstance: Query<T> = {
    ...res,
    isStale,
    isFetching,
    lastFetched,
    invalidate,
    refetch,
  };

  queryCache.set(key, queryInstance);
  queryTimestamps.set(key, Date.now());

  // Cleanup after cacheTime
  setTimeout(() => {
    queryCache.delete(key);
    queryTimestamps.delete(key);
  }, cacheTime);

  return queryInstance;
}

/**
 * Invalidates queries by key pattern
 */
export function invalidateQueries(pattern: string | RegExp): void {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  
  queryCache.forEach((query, key) => {
    if (regex.test(key)) {
      query.invalidate();
    }
  });
}

/**
 * Prefetches a query
 */
export function prefetchQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: QueryOptions<T>
): Promise<T> {
  const q = query(key, fetcher, options);
  return q.refetch();
}

/**
 * Gets a query from cache
 */
export function getQuery<T>(key: string): Query<T> | undefined {
  return queryCache.get(key);
}

