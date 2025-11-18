/**
 * Signal Event Emitter
 * Event emitter pattern with signals
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type EventHandler<T = any> = (data: T) => void;

export interface EventEmitter {
  on<T>(event: string, handler: EventHandler<T>): () => void;
  off<T>(event: string, handler: EventHandler<T>): void;
  emit<T>(event: string, data: T): void;
  once<T>(event: string, handler: EventHandler<T>): () => void;
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
}

/**
 * Creates an event emitter
 */
export function createEventEmitter(): EventEmitter {
  const handlers = new Map<string, Set<EventHandler>>();

  const on = <T>(event: string, handler: EventHandler<T>): (() => void) => {
    if (!handlers.has(event)) {
      handlers.set(event, new Set());
    }
    handlers.get(event)!.add(handler as EventHandler);

    return () => {
      off(event, handler);
    };
  };

  const off = <T>(event: string, handler: EventHandler<T>): void => {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler);
      if (eventHandlers.size === 0) {
        handlers.delete(event);
      }
    }
  };

  const emit = <T>(event: string, data: T): void => {
    const eventHandlers = handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  };

  const once = <T>(event: string, handler: EventHandler<T>): (() => void) => {
    const onceHandler = (data: T) => {
      handler(data);
      off(event, onceHandler);
    };
    return on(event, onceHandler);
  };

  const removeAllListeners = (event?: string): void => {
    if (event) {
      handlers.delete(event);
    } else {
      handlers.clear();
    }
  };

  const listenerCount = (event: string): number => {
    return handlers.get(event)?.size || 0;
  };

  return {
    on,
    off,
    emit,
    once,
    removeAllListeners,
    listenerCount,
  };
}

/**
 * Creates a signal-based event emitter
 */
export function signalEventEmitter(): EventEmitter & {
  signal: <T>(event: string) => Signal<T | null>;
} {
  const emitter = createEventEmitter();
  const signalMap = new Map<string, Signal<any>>();

  const getSignal = <T>(event: string): Signal<T | null> => {
    if (!signalMap.has(event)) {
      const sig = signal<T | null>(null);
      emitter.on<T>(event, (data) => {
        sig.set(data);
      });
      signalMap.set(event, sig);
    }
    return signalMap.get(event)!;
  };

  return Object.assign(emitter, {
    signal: getSignal,
  });
}

