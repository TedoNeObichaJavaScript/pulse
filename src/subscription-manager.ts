/**
 * Signal Subscriptions Manager
 * Manage multiple subscriptions
 */

import type { Signal } from './signal';

export class SubscriptionManager {
  private subscriptions: Set<() => void> = new Set();

  /**
   * Adds a subscription
   */
  add<T>(sig: Signal<T>, callback: (value: T) => void): () => void {
    const unsubscribe = sig.subscribe(callback);
    this.subscriptions.add(unsubscribe);
    return unsubscribe;
  }

  /**
   * Removes a subscription
   */
  remove(unsubscribe: () => void): void {
    unsubscribe();
    this.subscriptions.delete(unsubscribe);
  }

  /**
   * Unsubscribes from all subscriptions
   */
  unsubscribeAll(): void {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Gets the number of active subscriptions
   */
  getCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Checks if there are any active subscriptions
   */
  hasSubscriptions(): boolean {
    return this.subscriptions.size > 0;
  }
}

/**
 * Creates a subscription manager
 */
export function createSubscriptionManager(): SubscriptionManager {
  return new SubscriptionManager();
}

