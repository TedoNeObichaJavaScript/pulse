/**
 * DevTools Extension
 * Browser extension integration for debugging signals
 */

import { signal, type Signal } from './signal';
import { computed, type Computed } from './computed';
import { effect } from './effect';

export interface DevToolsExtension {
  registerSignal: <T>(key: string, sig: Signal<T>) => void;
  registerComputed: <T>(key: string, comp: Computed<T>) => void;
  unregister: (key: string) => void;
  inspect: (key: string) => any;
  getAllSignals: () => Array<{ key: string; type: 'signal' | 'computed'; value: any }>;
  clear: () => void;
}

const signalRegistry = new Map<string, { signal: Signal<any> | Computed<any>; type: 'signal' | 'computed' }>();

/**
 * Creates a DevTools extension interface
 */
export function createDevToolsExtension(): DevToolsExtension {
  const registerSignal = <T>(key: string, sig: Signal<T>): void => {
    signalRegistry.set(key, { signal: sig, type: 'signal' });
    notifyDevTools('signal-registered', { key, type: 'signal' });
  };

  const registerComputed = <T>(key: string, comp: Computed<T>): void => {
    signalRegistry.set(key, { signal: comp, type: 'computed' });
    notifyDevTools('computed-registered', { key, type: 'computed' });
  };

  const unregister = (key: string): void => {
    signalRegistry.delete(key);
    notifyDevTools('signal-unregistered', { key });
  };

  const inspect = (key: string): any => {
    const entry = signalRegistry.get(key);
    if (!entry) {
      return null;
    }

    try {
      const value = entry.signal();
      return {
        key,
        type: entry.type,
        value,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        key,
        type: entry.type,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      };
    }
  };

  const getAllSignals = (): Array<{ key: string; type: 'signal' | 'computed'; value: any }> => {
    const results: Array<{ key: string; type: 'signal' | 'computed'; value: any }> = [];
    signalRegistry.forEach((entry, key) => {
      try {
        results.push({
          key,
          type: entry.type,
          value: entry.signal(),
        });
      } catch (error) {
        results.push({
          key,
          type: entry.type,
          value: error instanceof Error ? error.message : String(error),
        });
      }
    });
    return results;
  };

  const clear = (): void => {
    signalRegistry.clear();
    notifyDevTools('signals-cleared', {});
  };

  return {
    registerSignal,
    registerComputed,
    unregister,
    inspect,
    getAllSignals,
    clear,
  };
}

/**
 * Notifies DevTools extension
 */
function notifyDevTools(event: string, data: any): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Try to communicate with extension
  try {
    // Post message for extension content script
    window.postMessage(
      {
        source: 'pulse-devtools',
        event,
        data,
      },
      '*'
    );

    // Also try custom event
    window.dispatchEvent(
      new CustomEvent('pulse-devtools', {
        detail: { event, data },
      })
    );
  } catch (error) {
    // Silently fail if DevTools not available
  }
}

/**
 * Global DevTools instance
 */
let globalDevTools: DevToolsExtension | null = null;

/**
 * Gets or creates the global DevTools extension
 */
export function getDevToolsExtension(): DevToolsExtension {
  if (!globalDevTools) {
    globalDevTools = createDevToolsExtension();
  }
  return globalDevTools;
}

/**
 * Auto-registers signals with DevTools if available
 */
export function autoRegisterDevTools(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if DevTools extension is available
  const checkExtension = () => {
    try {
      // Try to detect extension
      const hasExtension = (window as any).__PULSE_DEVTOOLS__ !== undefined;
      return hasExtension;
    } catch {
      return false;
    }
  };

  if (checkExtension()) {
    // Extension is available, enable auto-registration
    (window as any).__PULSE_DEVTOOLS_AUTO_REGISTER__ = true;
  }
}

/**
 * Creates a signal with automatic DevTools registration
 */
export function devToolsSignal<T>(
  key: string,
  initialValue: T
): Signal<T> {
  const sig = signal(initialValue);
  const devTools = getDevToolsExtension();
  devTools.registerSignal(key, sig);
  return sig;
}

/**
 * Creates a computed with automatic DevTools registration
 */
export function devToolsComputed<T>(
  key: string,
  fn: () => T
): Computed<T> {
  const comp = computed(fn);
  const devTools = getDevToolsExtension();
  devTools.registerComputed(key, comp);
  return comp;
}

/**
 * Exposes Pulse API to window for DevTools
 */
export function exposeToDevTools(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const devTools = getDevToolsExtension();

  (window as any).__PULSE_DEVTOOLS__ = {
    getAllSignals: () => devTools.getAllSignals(),
    inspect: (key: string) => devTools.inspect(key),
    clear: () => devTools.clear(),
    version: '1.0.0',
  };
}

// Auto-expose on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    exposeToDevTools();
    autoRegisterDevTools();
  } else {
    window.addEventListener('load', () => {
      exposeToDevTools();
      autoRegisterDevTools();
    });
  }
}

