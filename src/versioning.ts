/**
 * State Versioning
 * Version management for state migrations
 */

import { signal, type Signal } from './signal';

export interface VersionedState<T> {
  version: number;
  data: T;
}

export type Migration<T, U> = (data: T) => U;

export interface VersionManager<T> {
  currentVersion: Signal<number>;
  migrate: (targetVersion: number) => void;
  addMigration: <U>(version: number, migration: Migration<T, U>) => void;
}

const migrations = new Map<number, Migration<any, any>>();

/**
 * Creates a versioned signal
 */
export function versionedSignal<T>(
  initialValue: T,
  initialVersion: number = 1
): Signal<VersionedState<T>> & VersionManager<T> {
  const sig = signal<VersionedState<T>>({
    version: initialVersion,
    data: initialValue,
  });
  const currentVersion = signal(initialVersion);

  const migrate = (targetVersion: number) => {
    const current = sig();
    if (targetVersion <= current.version) {
      return;
    }

    let data: any = current.data;
    for (let v = current.version + 1; v <= targetVersion; v++) {
      const migration = migrations.get(v);
      if (migration) {
        data = migration(data);
      }
    }

    sig.set({
      version: targetVersion,
      data,
    });
    currentVersion.set(targetVersion);
  };

  const addMigration = <U>(version: number, migration: Migration<T, U>) => {
    migrations.set(version, migration);
  };

  Object.assign(sig, {
    currentVersion,
    migrate,
    addMigration,
  });

  return sig as Signal<VersionedState<T>> & VersionManager<T>;
}

/**
 * Creates a migration helper
 */
export function createMigration<T, U>(
  fromVersion: number,
  toVersion: number,
  migrateFn: (data: T) => U
): Migration<T, U> {
  return migrateFn;
}

/**
 * Migrates state from one version to another
 */
export function migrateState<T>(
  state: VersionedState<any>,
  targetVersion: number
): VersionedState<T> {
  if (targetVersion <= state.version) {
    return state as VersionedState<T>;
  }

  let data: any = state.data;
  for (let v = state.version + 1; v <= targetVersion; v++) {
    const migration = migrations.get(v);
    if (migration) {
      data = migration(data);
    }
  }

  return {
    version: targetVersion,
    data,
  };
}

/**
 * Creates a versioned store
 */
export function versionedStore<T extends Record<string, any>>(
  initialValue: T,
  initialVersion: number = 1
): Signal<VersionedState<T>> & VersionManager<T> {
  return versionedSignal(initialValue, initialVersion);
}

