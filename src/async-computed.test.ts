import { describe, it, expect, vi } from 'vitest';
import { signal } from './signal';
import { asyncComputed } from './async-computed';

describe('asyncComputed', () => {
  it('should create async computed value', async () => {
    const count = signal(5);
    const doubled = asyncComputed(async () => {
      const value = count();
      return value * 2;
    });

    const result = await doubled();
    expect(result).toBe(10);
  });

  it('should update when dependency changes', async () => {
    const count = signal(5);
    const doubled = asyncComputed(async () => {
      return count() * 2;
    });

    expect(await doubled()).toBe(10);
    count.set(10);
    expect(await doubled()).toBe(20);
  });

  it('should track loading state', async () => {
    const count = signal(5);
    let resolvePromise: (value: number) => void;
    const promise = new Promise<number>((resolve) => {
      resolvePromise = resolve;
    });

    const computed = asyncComputed(async () => {
      return await promise;
    });

    // Initially loading
    expect(computed.loading()).toBe(true);

    // Resolve the promise
    resolvePromise!(count() * 2);
    await computed();

    // Should not be loading after resolve
    expect(computed.loading()).toBe(false);
  });

  it('should handle errors', async () => {
    const computed = asyncComputed(async () => {
      throw new Error('Test error');
    });

    try {
      await computed();
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(computed.error()).toBeInstanceOf(Error);
      expect(computed.loading()).toBe(false);
    }
  });

  it('should notify subscribers', async () => {
    const count = signal(5);
    const doubled = asyncComputed(async () => count() * 2);
    let notified = false;
    let notifiedValue = 0;

    doubled.subscribe((value) => {
      notified = true;
      notifiedValue = value;
    });

    // Wait for initial computation
    await doubled();
    expect(notified).toBe(true);
    expect(notifiedValue).toBe(10);

    // Update dependency
    notified = false;
    count.set(20);
    // Wait a bit for async update
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(notified).toBe(true);
    expect(notifiedValue).toBe(40);
  });

  it('should allow unsubscribing', async () => {
    const count = signal(5);
    const doubled = asyncComputed(async () => count() * 2);
    let callCount = 0;

    const unsubscribe = doubled.subscribe(() => {
      callCount++;
    });

    await doubled();
    expect(callCount).toBeGreaterThan(0);

    const initialCount = callCount;
    unsubscribe();
    count.set(10);
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Should not have increased
    expect(callCount).toBe(initialCount);
  });
});

