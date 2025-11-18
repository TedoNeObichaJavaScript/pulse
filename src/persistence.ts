/**
 * Signal Persistence
 * Automatically persist signals to localStorage/sessionStorage
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

/**
 * localStorage adapter
 */
export const localStorageAdapter: StorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage quota exceeded or disabled
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

/**
 * sessionStorage adapter
 */
export const sessionStorageAdapter: StorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Storage quota exceeded or disabled
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

export interface PersistenceOptions<T> {
  /**
   * Storage key to use
   */
  key: string;
  /**
   * Storage adapter (localStorage, sessionStorage, or custom)
   */
  adapter?: StorageAdapter;
  /**
   * Serialize function (default: JSON.stringify)
   */
  serialize?: (value: T) => string;
  /**
   * Deserialize function (default: JSON.parse)
   */
  deserialize?: (value: string) => T;
  /**
   * Debounce delay in milliseconds (default: 0 = immediate)
   */
  debounce?: number;
  /**
   * Whether to sync across tabs/windows (default: false)
   */
  sync?: boolean;
}

/**
 * Creates a persistent signal that automatically saves to storage
 */
export function persistentSignal<T>(
  initialValue: T,
  options: PersistenceOptions<T>
): Signal<T> {
  const {
    key,
    adapter = localStorageAdapter,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    debounce: debounceMs = 0,
    sync = false,
  } = options;

  // Try to load from storage
  let storedValue: T | null = null;
  try {
    const stored = adapter.getItem(key);
    if (stored !== null) {
      storedValue = deserialize(stored);
    }
  } catch {
    // Ignore deserialization errors
  }

  // Create signal with stored value or initial value
  const sig = signal<T>(storedValue !== null ? storedValue : initialValue);

  // Save function with optional debouncing
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  const save = (value: T) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const doSave = () => {
      try {
        const serialized = serialize(value);
        adapter.setItem(key, serialized);
      } catch {
        // Ignore save errors
      }
    };

    if (debounceMs > 0) {
      saveTimeout = setTimeout(doSave, debounceMs);
    } else {
      doSave();
    }
  };

  // Subscribe to signal changes and save
  sig.subscribe((value) => {
    save(value);
  });

  // Listen for storage events if sync is enabled
  if (sync && typeof window !== 'undefined') {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          // Only update if value actually changed to avoid loops
          if (JSON.stringify(sig()) !== JSON.stringify(newValue)) {
            sig.set(newValue);
          }
        } catch {
          // Ignore deserialization errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
  }

  // Save initial value if it wasn't loaded from storage
  if (storedValue === null) {
    save(initialValue);
  }

  return sig;
}

/**
 * Creates a persistent signal using localStorage
 */
export function localStorageSignal<T>(
  key: string,
  initialValue: T,
  options?: Omit<PersistenceOptions<T>, 'key' | 'adapter'>
): Signal<T> {
  return persistentSignal(initialValue, {
    key,
    adapter: localStorageAdapter,
    ...options,
  });
}

/**
 * Creates a persistent signal using sessionStorage
 */
export function sessionStorageSignal<T>(
  key: string,
  initialValue: T,
  options?: Omit<PersistenceOptions<T>, 'key' | 'adapter'>
): Signal<T> {
  return persistentSignal(initialValue, {
    key,
    adapter: sessionStorageAdapter,
    ...options,
  });
}

/**
 * Hydrates a signal from storage
 */
export function hydrateSignal<T>(
  signal: Signal<T>,
  key: string,
  adapter: StorageAdapter = localStorageAdapter,
  deserialize: (value: string) => T = JSON.parse
): boolean {
  try {
    const stored = adapter.getItem(key);
    if (stored !== null) {
      const value = deserialize(stored);
      signal.set(value);
      return true;
    }
  } catch {
    // Ignore errors
  }
  return false;
}

/**
 * Clears persisted signal from storage
 */
export function clearPersistedSignal(
  key: string,
  adapter: StorageAdapter = localStorageAdapter
): void {
  adapter.removeItem(key);
}

