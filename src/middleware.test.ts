import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signal } from './signal';
import {
  createMiddleware,
  loggingMiddleware,
  validationMiddleware,
  transformMiddleware,
  historyMiddleware,
} from './middleware';

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMiddleware', () => {
    it('should create middleware pipeline', () => {
      const middleware1 = vi.fn((value: number, next) => next(value * 2));
      const middleware2 = vi.fn((value: number, next) => next(value + 1));
      const pipeline = createMiddleware(middleware1, middleware2);

      const sig = signal(0);
      const result = pipeline(5, sig, 0);

      expect(result).toBe(11); // (5 * 2) + 1
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
    });
  });

  describe('loggingMiddleware', () => {
    it('should log signal updates', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logMiddleware = loggingMiddleware('TestSignal');
      const sig = signal(0, { middleware: [logMiddleware] });

      sig.set(5);
      expect(consoleSpy).toHaveBeenCalledWith('[TestSignal] Update:', 5);

      consoleSpy.mockRestore();
    });
  });

  describe('validationMiddleware', () => {
    it('should validate values before updating', () => {
      const validator = (value: number) => value > 0;
      const onError = vi.fn();
      const validateMiddleware = validationMiddleware(validator, onError);
      const sig = signal(5, { middleware: [validateMiddleware] });

      sig.set(10); // Valid
      expect(sig()).toBe(10);

      sig.set(-1); // Invalid
      expect(onError).toHaveBeenCalledWith(-1);
      expect(sig()).toBe(10); // Should remain 10
    });

    it('should throw error if no error handler provided', () => {
      const validator = (value: number) => value > 0;
      const validateMiddleware = validationMiddleware(validator);
      const sig = signal(5, { middleware: [validateMiddleware] });

      expect(() => sig.set(-1)).toThrow();
    });
  });

  describe('transformMiddleware', () => {
    it('should transform values before updating', () => {
      const transformer = (value: number) => value * 2;
      const transform = transformMiddleware(transformer);
      const sig = signal(0, { middleware: [transform] });

      sig.set(5);
      expect(sig()).toBe(10);
    });
  });

  describe('historyMiddleware', () => {
    it('should track signal update history', () => {
      const { middleware, getHistory, clearHistory } = historyMiddleware(10);
      const sig = signal(0, { middleware: [middleware] });

      sig.set(1);
      sig.set(2);
      sig.set(3);

      const history = getHistory();
      expect(history.length).toBe(3);
      expect(history[0].value).toBe(1);
      expect(history[2].value).toBe(3);

      clearHistory();
      expect(getHistory().length).toBe(0);
    });

    it('should limit history size', () => {
      const { middleware, getHistory } = historyMiddleware(2);
      const sig = signal(0, { middleware: [middleware] });

      sig.set(1);
      sig.set(2);
      sig.set(3);

      const history = getHistory();
      expect(history.length).toBe(2);
      expect(history[0].value).toBe(2);
      expect(history[1].value).toBe(3);
    });
  });

  describe('middleware chaining', () => {
    it('should chain multiple middlewares', () => {
      const transform = transformMiddleware((x: number) => x * 2);
      const validate = validationMiddleware((x: number) => x < 100);
      const sig = signal(0, { middleware: [transform, validate] });

      sig.set(10); // 10 * 2 = 20, valid
      expect(sig()).toBe(20);

      sig.set(60); // 60 * 2 = 120, invalid
      expect(sig()).toBe(20); // Should remain 20
    });
  });
});

