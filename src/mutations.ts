/**
 * Signal Mutations
 * Mutation API for server updates with optimistic updates
 */

import { signal, type Signal } from './signal';
import { optimisticSignal, type OptimisticSignal } from './optimistic';

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  optimisticUpdate?: (variables: TVariables) => TData;
  retry?: number;
  retryDelay?: number;
}

export interface Mutation<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
  isPending: Signal<boolean>;
  isError: Signal<boolean>;
  isSuccess: Signal<boolean>;
  error: Signal<Error | null>;
  data: Signal<TData | null>;
}

/**
 * Creates a mutation
 */
export function mutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables>
): Mutation<TData, TVariables> {
  const isPending = signal(false);
  const isError = signal(false);
  const isSuccess = signal(false);
  const error = signal<Error | null>(null);
  const data = signal<TData | null>(null);

  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    isPending.set(true);
    isError.set(false);
    isSuccess.set(false);
    error.set(null);

    try {
      const result = await mutationFn(variables);
      data.set(result);
      isSuccess.set(true);
      options?.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.set(errorObj);
      isError.set(true);
      options?.onError?.(errorObj, variables);
      throw errorObj;
    } finally {
      isPending.set(false);
    }
  };

  const mutate = (variables: TVariables): Promise<TData> => {
    return mutateAsync(variables).catch((err) => {
      // Error already handled
      throw err;
    });
  };

  const reset = () => {
    isPending.set(false);
    isError.set(false);
    isSuccess.set(false);
    error.set(null);
    data.set(null);
  };

  return {
    mutate,
    mutateAsync,
    reset,
    isPending,
    isError,
    isSuccess,
    error,
    data,
  };
}

/**
 * Creates an optimistic mutation
 */
export function optimisticMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables> & {
    optimisticUpdate: (variables: TVariables) => TData;
  }
): Mutation<TData, TVariables> & { optimistic: OptimisticSignal<TData> } {
  const optimistic = optimisticSignal<TData | null>(null);
  const baseMutation = mutation(mutationFn, {
    ...options,
    onSuccess: (data, variables) => {
      optimistic.isOptimistic.set(false);
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      optimistic.rollback();
      options?.onError?.(error, variables);
    },
  });

  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    if (options?.optimisticUpdate) {
      const optimisticValue = options.optimisticUpdate(variables);
      return optimistic.optimistic(optimisticValue, () => baseMutation.mutateAsync(variables));
    }
    return baseMutation.mutateAsync(variables);
  };

  const mutate = (variables: TVariables): Promise<TData> => {
    return mutateAsync(variables).catch((err) => {
      throw err;
    });
  };

  return {
    ...baseMutation,
    mutate,
    mutateAsync,
    optimistic,
  };
}

/**
 * Creates a mutation with retry logic
 */
export function retryMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables> & {
    retry?: number;
    retryDelay?: number;
  }
): Mutation<TData, TVariables> {
  return mutation(
    async (variables: TVariables) => {
      const maxRetries = options?.retry ?? 0;
      const retryDelay = options?.retryDelay ?? 1000;
      let lastError: Error | null = null;

      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await mutationFn(variables);
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (i < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      throw lastError!;
    },
    options
  );
}

