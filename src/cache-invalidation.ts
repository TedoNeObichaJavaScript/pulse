/**
 * Advanced Cache Invalidation
 * Smart cache invalidation strategies
 */

import { signal, type Signal } from './signal';
import { invalidateQueries } from './queries';

export type InvalidationStrategy = 'time' | 'dependency' | 'tag' | 'manual';

export interface CacheInvalidator {
  invalidate: (key: string | string[]) => void;
  invalidateByTag: (tag: string) => void;
  invalidateByPattern: (pattern: string | RegExp) => void;
  addTag: (key: string, tag: string) => void;
  removeTag: (key: string, tag: string) => void;
}

const tagMap = new Map<string, Set<string>>(); // tag -> keys
const keyTags = new Map<string, Set<string>>(); // key -> tags

/**
 * Creates a cache invalidator
 */
export function createCacheInvalidator(): CacheInvalidator {
  const invalidate = (key: string | string[]): void => {
    const keys = Array.isArray(key) ? key : [key];
    keys.forEach((k) => {
      invalidateQueries(k);
    });
  };

  const invalidateByTag = (tag: string): void => {
    const keys = tagMap.get(tag);
    if (keys) {
      keys.forEach((key) => {
        invalidate(key);
      });
    }
  };

  const invalidateByPattern = (pattern: string | RegExp): void => {
    invalidateQueries(pattern);
  };

  const addTag = (key: string, tag: string): void => {
    if (!tagMap.has(tag)) {
      tagMap.set(tag, new Set());
    }
    tagMap.get(tag)!.add(key);

    if (!keyTags.has(key)) {
      keyTags.set(key, new Set());
    }
    keyTags.get(key)!.add(tag);
  };

  const removeTag = (key: string, tag: string): void => {
    tagMap.get(tag)?.delete(key);
    keyTags.get(key)?.delete(tag);
  };

  return {
    invalidate,
    invalidateByTag,
    invalidateByPattern,
    addTag,
    removeTag,
  };
}

/**
 * Creates a time-based cache invalidator
 */
export function timeBasedInvalidation(
  ttl: number
): (key: string) => () => void {
  const timers = new Map<string, number>();

  return (key: string) => {
    const timerId = window.setTimeout(() => {
      invalidateQueries(key);
      timers.delete(key);
    }, ttl);

    timers.set(key, timerId);

    return () => {
      const id = timers.get(key);
      if (id) {
        clearTimeout(id);
        timers.delete(key);
      }
    };
  };
}

/**
 * Creates a dependency-based cache invalidator
 */
export function dependencyBasedInvalidation(): {
  addDependency: (key: string, dependsOn: string) => void;
  invalidate: (key: string) => void;
} {
  const dependencies = new Map<string, Set<string>>(); // key -> depends on keys
  const dependents = new Map<string, Set<string>>(); // key -> dependent keys

  const addDependency = (key: string, dependsOn: string): void => {
    if (!dependencies.has(key)) {
      dependencies.set(key, new Set());
    }
    dependencies.get(key)!.add(dependsOn);

    if (!dependents.has(dependsOn)) {
      dependents.set(dependsOn, new Set());
    }
    dependents.get(dependsOn)!.add(key);
  };

  const invalidate = (key: string): void => {
    invalidateQueries(key);

    // Invalidate dependents
    const deps = dependents.get(key);
    if (deps) {
      deps.forEach((dependent) => {
        invalidate(dependent);
      });
    }
  };

  return {
    addDependency,
    invalidate,
  };
}

/**
 * Global cache invalidator instance
 */
let globalInvalidator: CacheInvalidator | null = null;

/**
 * Gets or creates the global cache invalidator
 */
export function getCacheInvalidator(): CacheInvalidator {
  if (!globalInvalidator) {
    globalInvalidator = createCacheInvalidator();
  }
  return globalInvalidator;
}

