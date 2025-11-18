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
});


