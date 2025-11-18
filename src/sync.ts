/**
 * Signal Synchronization
 * Cross-tab/window state sync with BroadcastChannel
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface SyncOptions {
  /**
   * Channel name for BroadcastChannel (default: 'pulse-sync')
   */
  channel?: string;
  /**
   * Whether to sync (default: true)
   */
  enabled?: boolean;
  /**
   * Custom serializer (default: JSON.stringify)
   */
  serialize?: (value: any) => string;
  /**
   * Custom deserializer (default: JSON.parse)
   */
  deserialize?: (value: string) => any;
}

/**
 * Creates a synchronized signal that syncs across tabs/windows
 */
export function syncedSignal<T>(
  initialValue: T,
  key: string,
  options: SyncOptions = {}
): Signal<T> {
  const {
    channel = 'pulse-sync',
    enabled = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const sig = signal<T>(initialValue);

  if (!enabled || typeof window === 'undefined' || !window.BroadcastChannel) {
    return sig;
  }

  const bc = new BroadcastChannel(channel);
  let isRemoteUpdate = false;

  // Listen for messages from other tabs
  bc.onmessage = (event) => {
    if (event.data.key === key && event.data.type === 'update') {
      isRemoteUpdate = true;
      try {
        const value = deserialize(event.data.value);
        sig.set(value);
      } catch {
        // Ignore deserialization errors
      }
      isRemoteUpdate = false;
    }
  };

  // Subscribe to local changes and broadcast
  sig.subscribe((value) => {
    if (!isRemoteUpdate) {
      try {
        bc.postMessage({
          key,
          type: 'update',
          value: serialize(value),
        });
      } catch {
        // Ignore serialization errors
      }
    }
  });

  return sig;
}

/**
 * Creates a synchronized signal using localStorage events (fallback)
 */
export function localStorageSyncedSignal<T>(
  initialValue: T,
  key: string,
  options: Omit<SyncOptions, 'channel'> = {}
): Signal<T> {
  const { enabled = true, serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const sig = signal<T>(initialValue);

  if (!enabled || typeof window === 'undefined') {
    return sig;
  }

  // Try to load from localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const value = deserialize(stored);
      sig.set(value);
    }
  } catch {
    // Ignore errors
  }

  let isRemoteUpdate = false;

  // Listen for storage events
  const handleStorage = (e: StorageEvent) => {
    if (e.key === key && e.newValue !== null) {
      isRemoteUpdate = true;
      try {
        const value = deserialize(e.newValue);
        sig.set(value);
      } catch {
        // Ignore errors
      }
      isRemoteUpdate = false;
    }
  };

  window.addEventListener('storage', handleStorage);

  // Subscribe to local changes
  sig.subscribe((value) => {
    if (!isRemoteUpdate) {
      try {
        localStorage.setItem(key, serialize(value));
      } catch {
        // Ignore errors
      }
    }
  });

  return sig;
}

