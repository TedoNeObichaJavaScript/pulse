/**
 * Advanced Debugging Tools
 * Enhanced debugging and inspection utilities
 */

import type { Signal } from './signal';

export interface SignalSnapshot {
  id: string;
  name: string;
  value: any;
  subscribers: number;
  dependencies: string[];
  timestamp: number;
}

const signalSnapshots: SignalSnapshot[] = [];
let snapshotCounter = 0;

/**
 * Takes a snapshot of all signals
 */
export function snapshotSignals(): SignalSnapshot[] {
  // This would need access to all signals
  // For now, returns stored snapshots
  return [...signalSnapshots];
}

/**
 * Compares two signal snapshots
 */
export function compareSnapshots(
  before: SignalSnapshot[],
  after: SignalSnapshot[]
): {
  added: SignalSnapshot[];
  removed: SignalSnapshot[];
  changed: Array<{ before: SignalSnapshot; after: SignalSnapshot }>;
} {
  const beforeMap = new Map(before.map((s) => [s.id, s]));
  const afterMap = new Map(after.map((s) => [s.id, s]));

  const added: SignalSnapshot[] = [];
  const removed: SignalSnapshot[] = [];
  const changed: Array<{ before: SignalSnapshot; after: SignalSnapshot }> = [];

  for (const [id, afterSnap] of afterMap.entries()) {
    const beforeSnap = beforeMap.get(id);
    if (!beforeSnap) {
      added.push(afterSnap);
    } else if (JSON.stringify(beforeSnap.value) !== JSON.stringify(afterSnap.value)) {
      changed.push({ before: beforeSnap, after: afterSnap });
    }
  }

  for (const [id, beforeSnap] of beforeMap.entries()) {
    if (!afterMap.has(id)) {
      removed.push(beforeSnap);
    }
  }

  return { added, removed, changed };
}

/**
 * Traces signal updates
 */
export function traceSignal<T>(
  sig: Signal<T>,
  label?: string
): Signal<T> & {
  getTrace: () => Array<{ value: T; timestamp: number; stack?: string }>;
  clearTrace: () => void;
} {
  const trace: Array<{ value: T; timestamp: number; stack?: string }> = [];
  const name = label || 'Signal';

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    const entry: { value: T; timestamp: number; stack?: string } = {
      value,
      timestamp: Date.now(),
    };

    if (typeof Error !== 'undefined') {
      entry.stack = new Error().stack;
    }

    trace.push(entry);
    originalSet(value);
  };

  return Object.assign(sig, {
    getTrace: () => [...trace],
    clearTrace: () => {
      trace.length = 0;
    },
  });
}

/**
 * Visualizes signal dependency graph
 */
export function visualizeDependencies(signals: Map<string, Signal<any>>): string {
  const graph: string[] = [];
  graph.push('digraph SignalDependencies {');
  graph.push('  rankdir=LR;');
  graph.push('  node [shape=box];');

  for (const [name, sig] of signals.entries()) {
    graph.push(`  "${name}" [label="${name}"];`);
    // Would need to track actual dependencies
  }

  graph.push('}');
  return graph.join('\n');
}

/**
 * Debugs signal updates with detailed logging
 */
export function debugSignal<T>(
  sig: Signal<T>,
  options: {
    logReads?: boolean;
    logWrites?: boolean;
    logSubscriptions?: boolean;
    label?: string;
  } = {}
): Signal<T> {
  const {
    logReads = false,
    logWrites = true,
    logSubscriptions = false,
    label = 'Signal',
  } = options;

  const originalGet = sig.bind(sig);
  const debugGet = (): T => {
    if (logReads) {
      console.log(`[${label}] Read:`, originalGet());
    }
    return originalGet();
  };

  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (logWrites) {
      console.log(`[${label}] Write:`, value);
    }
    originalSet(value);
  };

  const originalSubscribe = sig.subscribe.bind(sig);
  sig.subscribe = (callback: (value: T) => void) => {
    if (logSubscriptions) {
      console.log(`[${label}] Subscription added`);
    }
    const unsubscribe = originalSubscribe(callback);
    return () => {
      if (logSubscriptions) {
        console.log(`[${label}] Subscription removed`);
      }
      unsubscribe();
    };
  };

  const debugSig = debugGet as Signal<T>;
  debugSig.set = sig.set;
  debugSig.update = sig.update.bind(sig);
  debugSig.subscribe = sig.subscribe;

  return debugSig;
}

/**
 * Creates a signal inspector
 */
export function inspectSignal<T>(sig: Signal<T>): {
  value: T;
  subscribers: number;
  isComputed: boolean;
  dependencies: string[];
} {
  // This would need internal access
  return {
    value: sig(),
    subscribers: 0, // Would need internal access
    isComputed: typeof (sig as any).set === 'undefined',
    dependencies: [], // Would need internal access
  };
}

