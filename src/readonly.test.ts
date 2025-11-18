import { describe, it, expect } from 'vitest';
import { signal } from './signal';
import { computed } from './computed';
import { readonly, readonlyComputed } from './readonly';

describe('readonly', () => {
  it('should create readonly signal that can be read', () => {
    const count = signal(5);
    const readOnlyCount = readonly(count);
    
    expect(readOnlyCount()).toBe(5);
    // Verify readonly signal doesn't have set method
    expect('set' in readOnlyCount).toBe(false);
  });

  it('should allow subscribing to readonly signal', () => {
    const count = signal(5);
    const readOnlyCount = readonly(count);
    let notified = false;
    let notifiedValue = 0;

    readOnlyCount.subscribe((value) => {
      notified = true;
      notifiedValue = value;
    });

    count.set(10);
    expect(notified).toBe(true);
    expect(notifiedValue).toBe(10);
  });

  it('should reflect changes from original signal', () => {
    const count = signal(5);
    const readOnlyCount = readonly(count);
    
    count.set(10);
    expect(readOnlyCount()).toBe(10);
  });
});

describe('readonlyComputed', () => {
  it('should create readonly computed value', () => {
    const count = signal(5);
    const doubled = computed(() => count() * 2);
    const readOnlyDoubled = readonlyComputed(doubled);
    
    expect(readOnlyDoubled()).toBe(10);
  });

  it('should allow subscribing to readonly computed', () => {
    const count = signal(5);
    const doubled = computed(() => count() * 2);
    const readOnlyDoubled = readonlyComputed(doubled);
    let notified = false;
    let notifiedValue = 0;

    readOnlyDoubled.subscribe((value) => {
      notified = true;
      notifiedValue = value;
    });

    count.set(10);
    expect(notified).toBe(true);
    expect(notifiedValue).toBe(20);
  });
});

