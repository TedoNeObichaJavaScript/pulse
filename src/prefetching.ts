/**
 * Signal Prefetching
 * Prefetching strategies for proactive data loading
 */

import { signal, type Signal } from './signal';
import { resource, type Resource } from './resources';

export interface PrefetchOptions {
  onHover?: boolean;
  onFocus?: boolean;
  onMount?: boolean;
  delay?: number;
}

const prefetchCache = new Map<string, Promise<any>>();

/**
 * Creates a prefetchable resource
 */
export function prefetchableResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: PrefetchOptions
): Resource<T> & { prefetch: () => Promise<T> } {
  const res = resource(fetcher);
  
  const prefetch = (): Promise<T> => {
    if (prefetchCache.has(key)) {
      return prefetchCache.get(key)!;
    }

    const promise = res.refetch();
    prefetchCache.set(key, promise);
    
    promise.finally(() => {
      // Keep in cache for a bit
      setTimeout(() => {
        prefetchCache.delete(key);
      }, 60000); // 1 minute
    });

    return promise;
  };

  Object.assign(res, {
    prefetch,
  });

  return res as Resource<T> & { prefetch: () => Promise<T> };
}

/**
 * Creates a prefetch hook for hover events
 */
export function onHoverPrefetch<T>(
  element: HTMLElement,
  prefetchFn: () => Promise<T>
): () => void {
  let timeoutId: number | null = null;
  const delay = 100; // Default delay

  const handleMouseEnter = () => {
    timeoutId = window.setTimeout(() => {
      prefetchFn().catch(() => {
        // Silently handle errors
      });
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Creates a prefetch hook for focus events
 */
export function onFocusPrefetch<T>(
  element: HTMLElement,
  prefetchFn: () => Promise<T>
): () => void {
  const handleFocus = () => {
    prefetchFn().catch(() => {
      // Silently handle errors
    });
  };

  element.addEventListener('focus', handleFocus, { once: true });

  return () => {
    element.removeEventListener('focus', handleFocus);
  };
}

/**
 * Creates a prefetch hook for link hover
 */
export function linkPrefetch(
  link: HTMLAnchorElement,
  prefetchFn: () => Promise<any>
): () => void {
  return onHoverPrefetch(link, prefetchFn);
}

/**
 * Prefetches a resource on mount
 */
export function prefetchOnMount<T>(prefetchFn: () => Promise<T>): void {
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      prefetchFn().catch(() => {});
    } else {
      window.addEventListener('load', () => {
        prefetchFn().catch(() => {});
      }, { once: true });
    }
  }
}

/**
 * Creates a prefetch manager
 */
export function createPrefetchManager() {
  const prefetched = new Set<string>();

  return {
    prefetch: <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
      if (prefetched.has(key)) {
        return Promise.resolve(null as any);
      }

      prefetched.add(key);
      return fetcher().catch((error) => {
        prefetched.delete(key);
        throw error;
      });
    },
    isPrefetched: (key: string): boolean => {
      return prefetched.has(key);
    },
    clear: (key?: string): void => {
      if (key) {
        prefetched.delete(key);
      } else {
        prefetched.clear();
      }
    },
  };
}

/**
 * Prefetches resources based on viewport intersection
 */
export function viewportPrefetch<T>(
  element: HTMLElement,
  prefetchFn: () => Promise<T>,
  options?: { rootMargin?: string; threshold?: number }
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback to immediate prefetch
    prefetchFn().catch(() => {});
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prefetchFn().catch(() => {});
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: options?.rootMargin || '200px',
      threshold: options?.threshold || 0,
    }
  );

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}

