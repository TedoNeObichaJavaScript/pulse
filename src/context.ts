/**
 * Context management for dependency tracking
 * Tracks the current reactive context (effect or computed) that's running
 */

type ReactiveContext = {
  dependencies: Set<SignalLike>;
  onInvalidate?: () => void;
};

type SignalLike = {
  subscribe: (callback: () => void) => () => void;
};

const contextStack: ReactiveContext[] = [];

export function getCurrentContext(): ReactiveContext | null {
  return contextStack[contextStack.length - 1] || null;
}

export function setCurrentContext(context: ReactiveContext | null): void {
  if (context === null) {
    contextStack.pop();
  } else {
    contextStack.push(context);
  }
}

export function withContext<T>(context: ReactiveContext, fn: () => T): T {
  setCurrentContext(context);
  try {
    return fn();
  } finally {
    setCurrentContext(null);
  }
}


