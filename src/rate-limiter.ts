/**
 * Signal Rate Limiter
 * Rate limiting for signal updates
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  onLimitExceeded?: () => void;
}

/**
 * Creates a rate-limited signal
 */
export function rateLimitedSignal<T>(
  initialValue: T,
  options: RateLimiterOptions
): Signal<T> & {
  getRemainingRequests: () => number;
  reset: () => void;
} {
  const { maxRequests, windowMs, onLimitExceeded } = options;
  const sig = signal<T>(initialValue);
  const requests: number[] = [];

  const cleanup = () => {
    const now = Date.now();
    while (requests.length > 0 && requests[0] < now - windowMs) {
      requests.shift();
    }
  };

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    cleanup();

    if (requests.length >= maxRequests) {
      if (onLimitExceeded) {
        onLimitExceeded();
      }
      return; // Rate limit exceeded
    }

    requests.push(Date.now());
    originalSet(value);
  };

  const getRemainingRequests = (): number => {
    cleanup();
    return Math.max(0, maxRequests - requests.length);
  };

  const reset = () => {
    requests.length = 0;
  };

  return Object.assign(sig, {
    getRemainingRequests,
    reset,
  });
}

/**
 * Token bucket rate limiter
 */
export function tokenBucketSignal<T>(
  initialValue: T,
  capacity: number,
  refillRate: number // tokens per second
): Signal<T> & {
  getTokens: () => number;
} {
  const sig = signal<T>(initialValue);
  let tokens = capacity;
  let lastRefill = Date.now();

  const refill = () => {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;
    tokens = Math.min(capacity, tokens + elapsed * refillRate);
    lastRefill = now;
  };

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    refill();
    if (tokens >= 1) {
      tokens -= 1;
      originalSet(value);
    }
  };

  const getTokens = (): number => {
    refill();
    return tokens;
  };

  return Object.assign(sig, {
    getTokens,
  });
}

