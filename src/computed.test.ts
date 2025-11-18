import { describe, it, expect } from 'vitest';
import { signal } from './signal';
import { computed } from './computed';

describe('computed', () => {
  it('should compute value from signal', () => {
    const count = signal(5);
    const doubled = computed(() => count() * 2);
    expect(doubled()).toBe(10);
  });

  it('should update when dependency changes', () => {
    const count = signal(5);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(10);
    count.set(10);
    expect(doubled()).toBe(20);
  });

  it('should handle multiple dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    const sum = computed(() => a() + b());

    expect(sum()).toBe(3);
    a.set(5);
    expect(sum()).toBe(7);
    b.set(10);
    expect(sum()).toBe(15);
  });

  it('should cache computed value', () => {
    const count = signal(5);
    let computeCount = 0;
    const doubled = computed(() => {
      computeCount++;
      return count() * 2;
    });

    doubled();
    doubled();
    doubled();
    expect(computeCount).toBe(1); // Should only compute once
  });

  it('should notify subscribers', () => {
    const count = signal(5);
    const doubled = computed(() => count() * 2);
    let notified = false;
    let notifiedValue = 0;

    doubled.subscribe((value) => {
      notified = true;
      notifiedValue = value;
    });

    count.set(10);
    expect(notified).toBe(true);
    expect(notifiedValue).toBe(20);
  });
});


