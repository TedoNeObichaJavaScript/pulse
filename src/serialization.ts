/**
 * Signal Serialization
 * Serialize and deserialize signal state
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface SerializationOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  replacer?: (key: string, value: any) => any;
  reviver?: (key: string, value: any) => any;
}

/**
 * Serializes a signal value to JSON
 */
export function serializeSignal<T>(
  sig: Signal<T>,
  options: SerializationOptions = {}
): string {
  const { serialize = JSON.stringify, replacer } = options;
  return serialize(sig(), replacer);
}

/**
 * Deserializes JSON to a signal value
 */
export function deserializeSignal<T>(
  json: string,
  options: SerializationOptions = {}
): Signal<T> {
  const { deserialize = JSON.parse, reviver } = options;
  return signal(deserialize(json, reviver));
}

/**
 * Creates a serializable signal
 */
export function serializableSignal<T>(
  initialValue: T,
  options: SerializationOptions = {}
): Signal<T> & {
  serialize: () => string;
  deserialize: (json: string) => void;
} {
  const { serialize = JSON.stringify, deserialize = JSON.parse, replacer, reviver } = options;
  const sig = signal<T>(initialValue);

  const serializeFn = (): string => {
    return serialize(sig(), replacer);
  };

  const deserializeFn = (json: string): void => {
    sig.set(deserialize(json, reviver));
  };

  return Object.assign(sig, {
    serialize: serializeFn,
    deserialize: deserializeFn,
  });
}

/**
 * Exports all signal states
 */
export function exportSignalStates(
  signals: Record<string, Signal<any>>,
  options: SerializationOptions = {}
): string {
  const { serialize = JSON.stringify, replacer } = options;
  const state: Record<string, any> = {};
  for (const [key, sig] of Object.entries(signals)) {
    state[key] = sig();
  }
  return serialize(state, replacer);
}

/**
 * Imports signal states
 */
export function importSignalStates(
  json: string,
  signals: Record<string, Signal<any>>,
  options: SerializationOptions = {}
): void {
  const { deserialize = JSON.parse, reviver } = options;
  const state = deserialize(json, reviver);
  for (const [key, value] of Object.entries(state)) {
    if (signals[key]) {
      signals[key].set(value);
    }
  }
}

