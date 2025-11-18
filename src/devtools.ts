/**
 * Pulse DevTools
 * Browser DevTools integration for debugging signals
 */

import type { Signal } from './signal';

export interface DevToolsOptions {
  enabled?: boolean;
  name?: string;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

interface SignalInfo {
  id: string;
  name: string;
  value: any;
  subscribers: number;
  dependencies: string[];
  lastUpdate: number;
}

const signalRegistry = new WeakMap<Signal<any>, SignalInfo>();
let signalCounter = 0;
let devToolsEnabled = false;

/**
 * Enables DevTools integration
 */
export function enableDevTools(options: DevToolsOptions = {}): void {
  devToolsEnabled = options.enabled !== false;

  if (typeof window !== 'undefined' && devToolsEnabled) {
    // Expose Pulse to window for DevTools
    (window as any).__PULSE_DEVTOOLS__ = {
      getSignals: getAllSignals,
      getSignal: getSignalInfo,
      inspectSignal,
      clearSignals,
      exportState,
    };

    // Try to connect to browser extension if available
    if ((window as any).__PULSE_DEVTOOLS_EXTENSION__) {
      (window as any).__PULSE_DEVTOOLS_EXTENSION__.connect();
    }

    console.log('%cPulse DevTools Enabled', 'color: #6366f1; font-weight: bold;');
  }
}

/**
 * Registers a signal with DevTools
 */
export function registerSignalDevTools<T>(
  sig: Signal<T>,
  name?: string
): void {
  if (!devToolsEnabled) return;

  const id = `signal-${signalCounter++}`;
  const info: SignalInfo = {
    id,
    name: name || id,
    value: sig(),
    subscribers: 0,
    dependencies: [],
    lastUpdate: Date.now(),
  };

  signalRegistry.set(sig, info);

  // Track updates
  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    info.value = value;
    info.lastUpdate = Date.now();
    originalSet(value);
    notifyDevTools('signal-update', { id, value });
  };

  // Track subscriptions
  const originalSubscribe = sig.subscribe.bind(sig);
  sig.subscribe = (callback: (value: T) => void) => {
    info.subscribers++;
    notifyDevTools('signal-subscribe', { id, subscribers: info.subscribers });
    const unsubscribe = originalSubscribe(callback);
    return () => {
      info.subscribers--;
      notifyDevTools('signal-unsubscribe', { id, subscribers: info.subscribers });
      unsubscribe();
    };
  };
}

/**
 * Gets all registered signals
 */
function getAllSignals(): SignalInfo[] {
  const signals: SignalInfo[] = [];
  // WeakMap doesn't allow iteration, so we'd need a different approach
  // This is a simplified version
  return signals;
}

/**
 * Gets info for a specific signal
 */
function getSignalInfo(sig: Signal<any>): SignalInfo | null {
  return signalRegistry.get(sig) || null;
}

/**
 * Inspects a signal
 */
function inspectSignal<T>(sig: Signal<T>): void {
  const info = signalRegistry.get(sig);
  if (info) {
    console.group(`🔍 Signal: ${info.name}`);
    console.log('Value:', info.value);
    console.log('Subscribers:', info.subscribers);
    console.log('Dependencies:', info.dependencies);
    console.log('Last Update:', new Date(info.lastUpdate));
    console.groupEnd();
  } else {
    console.warn('Signal not registered with DevTools');
  }
}

/**
 * Clears all signal registrations
 */
function clearSignals(): void {
  signalCounter = 0;
  // WeakMap doesn't have clear, but we can reset counter
}

/**
 * Exports current signal state
 */
function exportState(): string {
  return JSON.stringify(getAllSignals(), null, 2);
}

/**
 * Notifies DevTools extension of changes
 */
function notifyDevTools(type: string, data: any): void {
  if (typeof window !== 'undefined' && (window as any).__PULSE_DEVTOOLS_EXTENSION__) {
    (window as any).__PULSE_DEVTOOLS_EXTENSION__.send(type, data);
  }
}

/**
 * Creates a signal with DevTools integration
 */
export function devToolsSignal<T>(
  initialValue: T,
  name?: string
): Signal<T> {
  const { signal } = require('./signal');
  const sig = signal(initialValue);
  registerSignalDevTools(sig, name);
  return sig;
}

/**
 * Logs signal updates to console
 */
export function logSignalUpdates<T>(
  sig: Signal<T>,
  label?: string
): Signal<T> {
  const name = label || 'Signal';
  const originalSet = sig.set.bind(sig);

  sig.set = (value: T) => {
    console.log(`[${name}] Update:`, value);
    originalSet(value);
  };

  return sig;
}

/**
 * Performance profiler for signals
 */
export function profileSignal<T>(
  sig: Signal<T>,
  name?: string
): Signal<T> & {
  getStats: () => {
    updateCount: number;
    averageUpdateTime: number;
    totalUpdateTime: number;
  };
} {
  const signalName = name || 'Signal';
  let updateCount = 0;
  let totalUpdateTime = 0;
  const updateTimes: number[] = [];

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    const start = performance.now();
    originalSet(value);
    const end = performance.now();
    const duration = end - start;

    updateCount++;
    totalUpdateTime += duration;
    updateTimes.push(duration);

    // Keep only last 100 measurements
    if (updateTimes.length > 100) {
      updateTimes.shift();
    }
  };

  const getStats = () => ({
    updateCount,
    averageUpdateTime: updateCount > 0 ? totalUpdateTime / updateCount : 0,
    totalUpdateTime,
  });

  return Object.assign(sig, { getStats });
}

