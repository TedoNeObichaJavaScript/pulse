/**
 * Signal Pagination
 * Built-in pagination support for lists
 */

import { signal, type Signal } from './signal';
import { computed } from './computed';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedSignal<T> {
  items: Signal<T[]>;
  pagination: Signal<PaginationState>;
  currentPage: Computed<T[]>;
  totalPages: Computed<number>;
  hasNext: Computed<boolean>;
  hasPrevious: Computed<boolean>;
  next: () => void;
  previous: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/**
 * Creates a paginated signal
 */
export function paginatedSignal<T>(
  items: Signal<T[]>,
  options?: { initialPage?: number; pageSize?: number }
): PaginatedSignal<T> {
  const initialPage = options?.initialPage ?? 1;
  const initialPageSize = options?.pageSize ?? 10;

  const pagination = signal<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
  });

  // Update total when items change
  items.subscribe((allItems) => {
    pagination.update((p) => ({
      ...p,
      total: allItems.length,
    }));
  });

  const currentPage = computed(() => {
    const allItems = items();
    const state = pagination();
    const start = (state.page - 1) * state.pageSize;
    const end = start + state.pageSize;
    return allItems.slice(start, end);
  });

  const totalPages = computed(() => {
    const state = pagination();
    return Math.ceil(state.total / state.pageSize);
  });

  const hasNext = computed(() => {
    const state = pagination();
    const total = totalPages();
    return state.page < total;
  });

  const hasPrevious = computed(() => {
    const state = pagination();
    return state.page > 1;
  });

  const next = () => {
    if (hasNext()) {
      pagination.update((p) => ({
        ...p,
        page: p.page + 1,
      }));
    }
  };

  const previous = () => {
    if (hasPrevious()) {
      pagination.update((p) => ({
        ...p,
        page: p.page - 1,
      }));
    }
  };

  const goToPage = (page: number) => {
    const total = totalPages();
    if (page >= 1 && page <= total) {
      pagination.update((p) => ({
        ...p,
        page,
      }));
    }
  };

  const setPageSize = (size: number) => {
    if (size > 0) {
      pagination.update((p) => {
        const newTotalPages = Math.ceil(p.total / size);
        const newPage = Math.min(p.page, newTotalPages || 1);
        return {
          ...p,
          pageSize: size,
          page: newPage,
        };
      });
    }
  };

  // Initialize total
  pagination.update((p) => ({
    ...p,
    total: items().length,
  }));

  return {
    items,
    pagination,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    next,
    previous,
    goToPage,
    setPageSize,
  };
}

/**
 * Creates pagination from an array
 */
export function paginateArray<T>(
  array: T[],
  options?: { initialPage?: number; pageSize?: number }
): PaginatedSignal<T> {
  const items = signal(array);
  return paginatedSignal(items, options);
}

