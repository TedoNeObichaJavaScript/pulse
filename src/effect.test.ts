import { describe, it, expect, vi } from 'vitest';
import { signal } from './signal';
import { effect } from './effect';

describe('effect', () => {
  it('should run effect immediately', () => {
    const fn = vi.fn();
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should re-run when dependency changes', () => {
    const count = signal(0);
    const fn = vi.fn(() => {
      count(); // Access signal to create dependency
    });

    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    count.set(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call cleanup function', () => {
    const cleanup = vi.fn();
    const count = signal(0);

    effect(() => {
      count();
      return cleanup;
    });

    count.set(1);
    expect(cleanup).toHaveBeenCalledTimes(1); // Called before re-run
  });

  it('should stop effect when cleanup is called', () => {
    const count = signal(0);
    const fn = vi.fn(() => {
      count();
    });

    const stop = effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    stop();
    count.set(1);
    expect(fn).toHaveBeenCalledTimes(1); // Should not run again
  });
});


