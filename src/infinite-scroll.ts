/**
 * Infinite Scroll
 * Infinite scroll patterns with signals
 */

import { signal, type Signal } from './signal';
import { computed, type Computed } from './computed';
import { resource, type Resource } from './resources';

export interface InfiniteScrollOptions<T> {
  pageSize?: number;
  threshold?: number;
  onLoadMore?: (page: number) => Promise<T[]>;
}

export interface InfiniteScrollSignal<T> {
  items: Signal<T[]>;
  loading: Signal<boolean>;
  hasMore: Signal<boolean>;
  page: Signal<number>;
  loadMore: () => Promise<void>;
  reset: () => void;
  observe: (element: HTMLElement) => () => void;
}

/**
 * Creates an infinite scroll signal
 */
export function infiniteScrollSignal<T>(
  initialItems: T[] = [],
  options?: InfiniteScrollOptions<T>
): InfiniteScrollSignal<T> {
  const pageSize = options?.pageSize ?? 20;
  const threshold = options?.threshold ?? 200;
  const onLoadMore = options?.onLoadMore;

  const items = signal<T[]>(initialItems);
  const loading = signal(false);
  const hasMore = signal(true);
  const page = signal(1);

  const loadMore = async (): Promise<void> => {
    if (loading() || !hasMore() || !onLoadMore) {
      return;
    }

    loading.set(true);
    try {
      const currentPage = page();
      const newItems = await onLoadMore(currentPage);
      
      if (newItems.length === 0) {
        hasMore.set(false);
      } else {
        items.update((current) => [...current, ...newItems]);
        page.update((p) => p + 1);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      loading.set(false);
    }
  };

  const reset = () => {
    items.set(initialItems);
    page.set(1);
    hasMore.set(true);
    loading.set(false);
  };

  const observe = (element: HTMLElement): (() => void) => {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback to scroll event
      const handleScroll = () => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const distanceFromBottom = rect.bottom - windowHeight;

        if (distanceFromBottom < threshold && hasMore() && !loading()) {
          loadMore();
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore() && !loading()) {
            loadMore();
          }
        });
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  };

  return {
    items,
    loading,
    hasMore,
    page,
    loadMore,
    reset,
    observe,
  };
}

/**
 * Creates an infinite scroll from a resource
 */
export function infiniteScrollResource<T>(
  fetcher: (page: number, pageSize: number) => Promise<T[]>,
  options?: { pageSize?: number; threshold?: number }
): InfiniteScrollSignal<T> {
  const pageSize = options?.pageSize ?? 20;
  let currentPage = 1;

  const infinite = infiniteScrollSignal<T>([], {
    pageSize,
    threshold: options?.threshold,
    onLoadMore: async (page) => {
      currentPage = page;
      return await fetcher(page, pageSize);
    },
  });

  // Initial load
  fetcher(1, pageSize).then((items) => {
    infinite.items.set(items);
    infinite.hasMore.set(items.length === pageSize);
  });

  return infinite;
}

/**
 * Creates an infinite scroll with virtual scrolling
 */
export function virtualInfiniteScroll<T>(
  items: Signal<T[]>,
  options?: { itemHeight?: number; containerHeight?: number; overscan?: number }
): {
  visibleItems: Computed<T[]>;
  scrollTop: Signal<number>;
  totalHeight: Computed<number>;
} {
  const itemHeight = options?.itemHeight ?? 50;
  const containerHeight = options?.containerHeight ?? 400;
  const overscan = options?.overscan ?? 5;

  const scrollTop = signal(0);

  const visibleItems = computed(() => {
    const allItems = items();
    const top = scrollTop();
    const start = Math.max(0, Math.floor(top / itemHeight) - overscan);
    const end = Math.min(
      allItems.length,
      Math.ceil((top + containerHeight) / itemHeight) + overscan
    );
    return allItems.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }));
  });

  const totalHeight = computed(() => {
    return items().length * itemHeight;
  });

  return {
    visibleItems: visibleItems as any,
    scrollTop,
    totalHeight,
  };
}

