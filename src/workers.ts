/**
 * Signal Workers
 * Web Worker integration for signals
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface WorkerSignalOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  transferable?: Transferable[];
}

/**
 * Creates a signal that syncs with a Web Worker
 */
export function workerSignal<T = any>(
  worker: Worker,
  options: WorkerSignalOptions = {}
): Signal<T | null> & {
  post: (data: any, transferable?: Transferable[]) => void;
  terminate: () => void;
} {
  const { onMessage, onError, transferable } = options;
  const sig = signal<T | null>(null);

  worker.onmessage = (event: MessageEvent) => {
    const data = event.data;
    sig.set(data);
    if (onMessage) {
      onMessage(data);
    }
  };

  worker.onerror = (error: ErrorEvent) => {
    const err = new Error(error.message || 'Worker error');
    if (onError) {
      onError(err);
    }
  };

  const post = (data: any, transfer?: Transferable[]) => {
    if (transfer) {
      worker.postMessage(data, transfer);
    } else if (transferable) {
      worker.postMessage(data, transferable);
    } else {
      worker.postMessage(data);
    }
  };

  const terminate = () => {
    worker.terminate();
  };

  return Object.assign(sig, {
    post,
    terminate,
  });
}

/**
 * Creates a signal that runs computation in a worker
 */
export function computedWorker<T, R>(
  worker: Worker,
  input: Signal<T>
): Signal<R | null> & {
  loading: Signal<boolean>;
  error: Signal<Error | null>;
} {
  const result = signal<R | null>(null);
  const loading = signal(false);
  const error = signal<Error | null>(null);

  let requestId = 0;

  input.subscribe((value) => {
    loading.set(true);
    error.set(null);
    const id = ++requestId;

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.id === id) {
        if (event.data.error) {
          error.set(new Error(event.data.error));
          loading.set(false);
        } else {
          result.set(event.data.result);
          loading.set(false);
        }
      }
    };

    worker.postMessage({ id, input: value });
  });

  return Object.assign(result, {
    loading,
    error,
  });
}

/**
 * Creates a worker from a function string
 */
export function createWorkerFromFunction(fn: Function | string): Worker {
  const fnString = typeof fn === 'function' ? fn.toString() : fn;
  const blob = new Blob(
    [
      `
      self.onmessage = function(e) {
        const fn = ${fnString};
        try {
          const result = fn(e.data);
          self.postMessage({ id: e.data.id, result });
        } catch (error) {
          self.postMessage({ id: e.data.id, error: error.message });
        }
      };
    `,
    ],
    { type: 'application/javascript' }
  );
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}

/**
 * Signal synchronization between main thread and worker
 */
export function syncWorkerSignal<T>(
  sig: Signal<T>,
  worker: Worker,
  messageType: string = 'signal-update'
): () => void {
  // Send signal updates to worker
  const unsubscribe = sig.subscribe((value) => {
    worker.postMessage({
      type: messageType,
      value,
    });
  });

  // Listen for updates from worker
  const handler = (event: MessageEvent) => {
    if (event.data.type === messageType) {
      sig.set(event.data.value);
    }
  };

  worker.addEventListener('message', handler);

  return () => {
    unsubscribe();
    worker.removeEventListener('message', handler);
  };
}

