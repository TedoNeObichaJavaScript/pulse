/**
 * Conflict Resolution
 * Conflict resolution strategies for sync conflicts
 */

import { signal, type Signal } from './signal';

export type ConflictResolutionStrategy<T> =
  | 'last-write-wins'
  | 'first-write-wins'
  | 'merge'
  | 'custom';

export interface Conflict<T> {
  key: string;
  local: T;
  remote: T;
  timestamp: number;
  resolve: (value: T) => void;
}

export interface ConflictResolver<T> {
  resolve: (conflict: Conflict<T>) => T;
}

/**
 * Creates a conflict resolver
 */
export function createConflictResolver<T>(
  strategy: ConflictResolutionStrategy<T>,
  mergeFn?: (local: T, remote: T) => T
): ConflictResolver<T> {
  return {
    resolve: (conflict: Conflict<T>): T => {
      switch (strategy) {
        case 'last-write-wins':
          return conflict.remote; // Assume remote is newer
        case 'first-write-wins':
          return conflict.local;
        case 'merge':
          if (mergeFn) {
            return mergeFn(conflict.local, conflict.remote);
          }
          // Default merge: prefer remote
          return conflict.remote;
        case 'custom':
          if (mergeFn) {
            return mergeFn(conflict.local, conflict.remote);
          }
          return conflict.remote;
        default:
          return conflict.remote;
      }
    },
  };
}

/**
 * Creates a signal with conflict resolution
 */
export function conflictAwareSignal<T>(
  initialValue: T,
  resolver: ConflictResolver<T>
): Signal<T> & {
  conflicts: Signal<Conflict<T>[]>;
  resolveConflict: (key: string, value: T) => void;
} {
  const sig = signal(initialValue);
  const conflicts = signal<Conflict<T>[]>([]);
  let conflictCounter = 0;

  const resolveConflict = (key: string, value: T) => {
    const currentConflicts = conflicts();
    const index = currentConflicts.findIndex((c) => c.key === key);
    if (index !== -1) {
      currentConflicts[index].resolve(value);
      currentConflicts.splice(index, 1);
      conflicts.set([...currentConflicts]);
    }
  };

  const detectConflict = (local: T, remote: T): Conflict<T> | null => {
    if (local !== remote) {
      return {
        key: `conflict-${++conflictCounter}`,
        local,
        remote,
        timestamp: Date.now(),
        resolve: (value: T) => {
          sig.set(value);
        },
      };
    }
    return null;
  };

  const sync = (remote: T) => {
    const local = sig();
    const conflict = detectConflict(local, remote);
    if (conflict) {
      const resolved = resolver.resolve(conflict);
      conflicts.set([...conflicts(), conflict]);
      sig.set(resolved);
    } else {
      sig.set(remote);
    }
  };

  Object.assign(sig, {
    conflicts,
    resolveConflict,
    sync,
  });

  return sig as Signal<T> & {
    conflicts: Signal<Conflict<T>[]>;
    resolveConflict: (key: string, value: T) => void;
    sync: (remote: T) => void;
  };
}

/**
 * Three-way merge for objects
 */
export function threeWayMerge<T extends Record<string, any>>(
  base: T,
  local: T,
  remote: T
): T {
  const result = { ...base };

  // Merge local changes
  for (const key in local) {
    if (local[key] !== base[key]) {
      result[key] = local[key];
    }
  }

  // Merge remote changes (remote wins on conflicts)
  for (const key in remote) {
    if (remote[key] !== base[key]) {
      result[key] = remote[key];
    }
  }

  return result;
}

/**
 * Timestamp-based conflict resolution
 */
export function timestampResolver<T>(
  getTimestamp: (value: T) => number
): ConflictResolver<T> {
  return {
    resolve: (conflict: Conflict<T>): T => {
      const localTime = getTimestamp(conflict.local);
      const remoteTime = getTimestamp(conflict.remote);
      return remoteTime > localTime ? conflict.remote : conflict.local;
    },
  };
}

