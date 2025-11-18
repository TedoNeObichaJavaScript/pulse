import { describe, it, expect, vi } from 'vitest';
import { lifecycleSignal, destroySignal, addLifecycleHooks } from './lifecycle';
import { signal } from './signal';

describe('lifecycle', () => {
  describe('lifecycleSignal', () => {
    it('should call onCreated hook', () => {
      const onCreated = vi.fn();
      const sig = lifecycleSignal(0, { onCreated });

      expect(onCreated).toHaveBeenCalledWith(0, sig);
    });

    it('should call onUpdated hook', () => {
      const onUpdated = vi.fn();
      const sig = lifecycleSignal(0, { onUpdated });

      sig.set(5);
      expect(onUpdated).toHaveBeenCalledWith(5, 0, sig);
    });

    it('should call onDestroyed hook', () => {
      const onDestroyed = vi.fn();
      const sig = lifecycleSignal(0, { onDestroyed });

      destroySignal(sig);
      expect(onDestroyed).toHaveBeenCalledWith(0, sig);
    });

    it('should not call onUpdated if value unchanged', () => {
      const onUpdated = vi.fn();
      const sig = lifecycleSignal(0, { onUpdated });

      sig.set(0);
      expect(onUpdated).not.toHaveBeenCalled();
    });
  });

  describe('addLifecycleHooks', () => {
    it('should add hooks to existing signal', () => {
      const sig = signal(0);
      const onUpdated = vi.fn();

      addLifecycleHooks(sig, { onUpdated });
      sig.set(5);

      expect(onUpdated).toHaveBeenCalledWith(5, 0, sig);
    });
  });
});

