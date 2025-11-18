/**
 * Signal Providers
 * Provider pattern for dependency injection
 */

import type { Signal } from './signal';

export type Provider<T> = () => T;
export type SignalProvider<T> = () => Signal<T>;

const providerRegistry = new Map<string, Provider<any>>();

/**
 * Registers a provider
 */
export function provide<T>(key: string, provider: Provider<T>): void {
  providerRegistry.set(key, provider);
}

/**
 * Gets a value from a provider
 */
export function inject<T>(key: string, defaultValue?: T): T {
  const provider = providerRegistry.get(key);
  if (provider) {
    return provider();
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`No provider found for key: ${key}`);
}

/**
 * Registers a signal provider
 */
export function provideSignal<T>(key: string, provider: SignalProvider<T>): void {
  provide(key, provider);
}

/**
 * Injects a signal from a provider
 */
export function injectSignal<T>(key: string): Signal<T> {
  const provider = inject<SignalProvider<T>>(key);
  return provider();
}

/**
 * Creates a provider scope
 */
export function createProviderScope(
  providers: Record<string, Provider<any>>,
  fn: () => void
): void {
  const previous = new Map(providerRegistry);
  
  // Register new providers
  for (const [key, provider] of Object.entries(providers)) {
    provide(key, provider);
  }

  try {
    fn();
  } finally {
    // Restore previous providers
    providerRegistry.clear();
    for (const [key, provider] of previous.entries()) {
      providerRegistry.set(key, provider);
    }
  }
}

