import { describe, it, expect, vi } from 'vitest';
import { signal } from './signal';
import { effect } from './effect';
import { batch } from './batch';

describe('batch', () => {
  it('should batch multiple signal updates', () => {
    const a = signal(0);
    const b = signal(0);
    let effectCount = 0;

    effect(() => {
      a();
      b();
      effectCount++;
    });

    expect(effectCount).toBe(1);

    // Update both signals in a batch
    batch(() => {
      a.set(1);
      b.set(1);
    });

    // Effect should only run once after batch
    expect(effectCount).toBe(2);
    expect(a()).toBe(1);
    expect(b()).toBe(1);
  });

  it('should batch nested updates', () => {
    const a = signal(0);
    const b = signal(0);
    let effectCount = 0;

    effect(() => {
      a();
      b();
      effectCount++;
    });

    batch(() => {
      a.set(1);
      batch(() => {
        b.set(1);
        a.set(2);
      });
      b.set(2);
    });

    // Effect should only run once after outer batch completes
    expect(effectCount).toBe(2);
    expect(a()).toBe(2);
    expect(b()).toBe(2);
  });

  it('should return value from batch function', () => {
    const result = batch(() => {
      return 42;
    });
    expect(result).toBe(42);
  });

  it('should handle errors in batch', () => {
    const a = signal(0);
    let effectCount = 0;

    effect(() => {
      a();
      effectCount++;
    });

    expect(() => {
      batch(() => {
        a.set(1);
        throw new Error('Test error');
      });
    }).toThrow('Test error');

    // Signal should still be updated
    expect(a()).toBe(1);
    // Effect should have run
    expect(effectCount).toBe(2);
  });
});

