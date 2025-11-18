/**
 * Offline Support
 * Offline-first patterns with queue and sync
 */

import { signal, type Signal } from './signal';
import { batch } from './batch';

export interface OfflineQueueItem {
  id: string;
  action: () => Promise<any>;
  timestamp: number;
  retries: number;
}

export interface OfflineManager {
  isOnline: Signal<boolean>;
  queue: Signal<OfflineQueueItem[]>;
  add: (action: () => Promise<any>) => Promise<any>;
  sync: () => Promise<void>;
  clear: () => void;
}

const offlineQueue: OfflineQueueItem[] = [];
let queueId = 0;

/**
 * Creates an offline manager
 */
export function createOfflineManager(options?: {
  maxRetries?: number;
  retryDelay?: number;
  storageKey?: string;
}): OfflineManager {
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelay = options?.retryDelay ?? 1000;
  const storageKey = options?.storageKey || 'pulse-offline-queue';

  const isOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const queue = signal<OfflineQueueItem[]>([]);

  // Load queue from storage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const items = JSON.parse(stored);
        offlineQueue.push(...items);
        queue.set([...offlineQueue]);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Watch online status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline.set(true);
      sync();
    });

    window.addEventListener('offline', () => {
      isOnline.set(false);
    });
  }

  const saveQueue = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(offlineQueue));
      } catch (e) {
        // Ignore storage errors
      }
    }
  };

  const add = async (action: () => Promise<any>): Promise<any> => {
    if (isOnline()) {
      try {
        return await action();
      } catch (error) {
        // If online but action failed, queue it
        const item: OfflineQueueItem = {
          id: `queue-${++queueId}`,
          action,
          timestamp: Date.now(),
          retries: 0,
        };
        offlineQueue.push(item);
        queue.set([...offlineQueue]);
        saveQueue();
        throw error;
      }
    } else {
      // Queue the action
      const item: OfflineQueueItem = {
        id: `queue-${++queueId}`,
        action,
        timestamp: Date.now(),
        retries: 0,
      };
      offlineQueue.push(item);
      queue.set([...offlineQueue]);
      saveQueue();
      throw new Error('Offline: Action queued');
    }
  };

  const sync = async (): Promise<void> => {
    if (!isOnline() || offlineQueue.length === 0) {
      return;
    }

    const items = [...offlineQueue];
    const successful: string[] = [];

    for (const item of items) {
      try {
        await item.action();
        successful.push(item.id);
      } catch (error) {
        item.retries++;
        if (item.retries >= maxRetries) {
          // Remove after max retries
          successful.push(item.id);
        } else {
          // Retry with delay
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    // Remove successful items
    batch(() => {
      successful.forEach((id) => {
        const index = offlineQueue.findIndex((item) => item.id === id);
        if (index !== -1) {
          offlineQueue.splice(index, 1);
        }
      });
      queue.set([...offlineQueue]);
      saveQueue();
    });
  };

  const clear = () => {
    offlineQueue.length = 0;
    queue.set([]);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        // Ignore storage errors
      }
    }
  };

  // Auto-sync when coming online
  if (isOnline()) {
    sync().catch(() => {});
  }

  return {
    isOnline,
    queue,
    add,
    sync,
    clear,
  };
}

/**
 * Creates an offline-aware signal
 */
export function offlineSignal<T>(
  initialValue: T,
  updateFn: (value: T) => Promise<T>,
  manager?: OfflineManager
): Signal<T> & { isSyncing: Signal<boolean> } {
  const sig = signal(initialValue);
  const isSyncing = signal(false);
  const offlineMgr = manager || createOfflineManager();

  const originalSet = sig.set;
  sig.set = (value: T) => {
    originalSet(value);
    
    offlineMgr.add(async () => {
      isSyncing.set(true);
      try {
        const result = await updateFn(value);
        originalSet(result);
        return result;
      } finally {
        isSyncing.set(false);
      }
    }).catch(() => {
      // Queued for later
    });
  };

  Object.assign(sig, {
    isSyncing,
  });

  return sig as Signal<T> & { isSyncing: Signal<boolean> };
}

/**
 * Global offline manager instance
 */
let globalOfflineManager: OfflineManager | null = null;

/**
 * Gets or creates the global offline manager
 */
export function getOfflineManager(): OfflineManager {
  if (!globalOfflineManager) {
    globalOfflineManager = createOfflineManager();
  }
  return globalOfflineManager;
}

