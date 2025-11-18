/**
 * Tree Shaking Support
 * Utilities to help with tree shaking and bundle size optimization
 */

/**
 * Feature flags for tree shaking
 * Set to false to exclude features from bundle
 */
export const FEATURES = {
  MIDDLEWARE: true,
  PERSISTENCE: true,
  VALIDATION: true,
  HISTORY: true,
  WEBSOCKET: true,
  WORKERS: true,
  ANIMATIONS: true,
  DEVTOOLS: true,
} as const;

/**
 * Conditional feature export
 */
export function ifFeature<T>(
  feature: keyof typeof FEATURES,
  value: T,
  fallback: T
): T {
  return FEATURES[feature] ? value : fallback;
}

/**
 * Lazy feature loading
 */
export function lazyFeature<T>(
  feature: keyof typeof FEATURES,
  loader: () => Promise<T>
): Promise<T> | null {
  if (!FEATURES[feature]) {
    return null;
  }
  return loader();
}

