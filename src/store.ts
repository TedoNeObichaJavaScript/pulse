import { signal, type Signal } from './signal';

/**
 * A store is a signal with additional methods for partial updates
 */
export interface Store<T> extends Signal<T> {
  update(updater: (value: T) => T): void;
  setField<K extends keyof T>(key: K, value: T[K]): void;
}

/**
 * Creates a store (enhanced signal) for managing object state
 */
export function store<T extends Record<string, any>>(initialValue: T): Store<T> {
  const sig = signal(initialValue);

  // Create store object with signal methods
  const storeFn = Object.assign(
    () => sig(),
    {
      set: sig.set.bind(sig),
      update: sig.update.bind(sig),
      subscribe: sig.subscribe.bind(sig),
      setField: <K extends keyof T>(key: K, value: T[K]) => {
        sig.update((current) => ({
          ...current,
          [key]: value,
        }));
      },
    }
  ) as Store<T>;

  return storeFn;
}


