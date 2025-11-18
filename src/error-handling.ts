/**
 * Error handling utilities for Pulse
 */

export class PulseError extends Error {
  constructor(message: string, public readonly source?: string) {
    super(message);
    this.name = 'PulseError';
  }
}

export type ErrorHandler = (error: Error, context?: string) => void;

let globalErrorHandler: ErrorHandler | null = null;

/**
 * Sets a global error handler for Pulse
 * This handler will be called when errors occur in effects, computed values, etc.
 */
export function setErrorHandler(handler: ErrorHandler | null): void {
  globalErrorHandler = handler;
}

/**
 * Gets the current global error handler
 */
export function getErrorHandler(): ErrorHandler | null {
  return globalErrorHandler;
}

/**
 * Handles an error, calling the global error handler if set
 */
export function handleError(error: Error, context?: string): void {
  if (globalErrorHandler) {
    try {
      globalErrorHandler(error, context);
    } catch (handlerError) {
      // If the error handler itself throws, log to console as fallback
      console.error('Error in Pulse error handler:', handlerError);
      console.error('Original error:', error);
    }
  } else {
    // Default: log to console
    console.error(`Pulse error${context ? ` in ${context}` : ''}:`, error);
  }
}

/**
 * Wraps a function with error handling
 */
export function withErrorHandling<T>(
  fn: () => T,
  context?: string
): T | undefined {
  try {
    return fn();
  } catch (error) {
    handleError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    return undefined;
  }
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandlingAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    return undefined;
  }
}

/**
 * Creates an error boundary that catches errors in a function
 * Returns the result or undefined if an error occurred
 */
export function errorBoundary<T>(fn: () => T, onError?: (error: Error) => void): T | undefined {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      handleError(err);
    }
    return undefined;
  }
}

/**
 * Creates an async error boundary
 */
export async function errorBoundaryAsync<T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      handleError(err);
    }
    return undefined;
  }
}

