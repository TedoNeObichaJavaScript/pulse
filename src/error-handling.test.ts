import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setErrorHandler,
  getErrorHandler,
  handleError,
  errorBoundary,
  errorBoundaryAsync,
  PulseError,
} from './error-handling';

describe('error handling', () => {
  beforeEach(() => {
    setErrorHandler(null);
  });

  it('should create PulseError', () => {
    const error = new PulseError('Test error', 'test-context');
    expect(error.message).toBe('Test error');
    expect(error.source).toBe('test-context');
    expect(error.name).toBe('PulseError');
  });

  it('should set and get error handler', () => {
    const handler = vi.fn();
    setErrorHandler(handler);
    expect(getErrorHandler()).toBe(handler);
  });

  it('should call error handler when handling error', () => {
    const handler = vi.fn();
    setErrorHandler(handler);
    const error = new Error('Test error');
    handleError(error, 'test-context');
    expect(handler).toHaveBeenCalledWith(error, 'test-context');
  });

  it('should log to console when no handler is set', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    handleError(error, 'test-context');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should catch errors in errorBoundary', () => {
    const onError = vi.fn();
    const result = errorBoundary(
      () => {
        throw new Error('Test error');
      },
      onError
    );
    expect(result).toBeUndefined();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return value when no error occurs', () => {
    const result = errorBoundary(() => 42);
    expect(result).toBe(42);
  });

  it('should handle errors in errorBoundaryAsync', async () => {
    const onError = vi.fn();
    const result = await errorBoundaryAsync(
      async () => {
        throw new Error('Test error');
      },
      onError
    );
    expect(result).toBeUndefined();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return value when no error occurs in async', async () => {
    const result = await errorBoundaryAsync(async () => 42);
    expect(result).toBe(42);
  });
});

