import { describe, it, expect } from 'vitest';
import { signal } from './signal';

describe('signal', () => {
  it('should create a signal with initial value', () => {
    const count = signal(0);
    expect(count()).toBe(0);
  });

  it('should update value with set', () => {
    const count = signal(0);
    count.set(5);
    expect(count()).toBe(5);
  });

  it('should update value with update', () => {
    const count = signal(0);
    count.update((n) => n + 1);
    expect(count()).toBe(1);
  });

  it('should notify subscribers on change', () => {
    const count = signal(0);
    let notified = false;
    let notifiedValue = 0;

    count.subscribe((value) => {
      notified = true;
      notifiedValue = value;
    });

    count.set(5);
    expect(notified).toBe(true);
    expect(notifiedValue).toBe(5);
  });

  it('should allow unsubscribing', () => {
    const count = signal(0);
    let callCount = 0;

    const unsubscribe = count.subscribe(() => {
      callCount++;
    });

    count.set(1);
    expect(callCount).toBe(1);

    unsubscribe();
    count.set(2);
    expect(callCount).toBe(1); // Should not increment
  });

  it('should use custom equality function', () => {
    const obj = signal({ count: 0 }, {
      equals: (a, b) => a.count === b.count
    });
    
    let notifyCount = 0;
    obj.subscribe(() => {
      notifyCount++;
    });

    // Same count value - should not notify
    obj.set({ count: 0 });
    expect(notifyCount).toBe(0);
    expect(obj().count).toBe(0);

    // Different count value - should notify
    obj.set({ count: 1 });
    expect(notifyCount).toBe(1);
    expect(obj().count).toBe(1);

    // Same count value again - should not notify
    obj.set({ count: 1 });
    expect(notifyCount).toBe(1);
  });

  it('should use deep equality for objects', () => {
    const deepEquals = (a: any, b: any): boolean => {
      if (a === b) return true;
      if (typeof a !== 'object' || typeof b !== 'object') return false;
      if (a === null || b === null) return false;
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!keysB.includes(key) || !deepEquals(a[key], b[key])) return false;
      }
      return true;
    };

    const obj = signal({ a: 1, b: { c: 2 } }, { equals: deepEquals });
    let notifyCount = 0;
    obj.subscribe(() => notifyCount++);

    obj.set({ a: 1, b: { c: 2 } }); // Same structure
    expect(notifyCount).toBe(0);

    obj.set({ a: 1, b: { c: 3 } }); // Different value
    expect(notifyCount).toBe(1);
  });
});
