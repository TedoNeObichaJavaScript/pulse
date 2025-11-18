/**
 * Signal Reducers
 * Redux-like reducer pattern
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type Reducer<TState, TAction> = (state: TState, action: TAction) => TState;

export interface ReducerSignal<TState, TAction> extends Signal<TState> {
  dispatch: (action: TAction) => void;
  getActions: () => TAction[];
  reset: () => void;
}

/**
 * Creates a reducer-based signal
 */
export function reducerSignal<TState, TAction>(
  reducer: Reducer<TState, TAction>,
  initialState: TState
): ReducerSignal<TState, TAction> {
  const sig = signal<TState>(initialState);
  const actions: TAction[] = [];

  const dispatch = (action: TAction) => {
    actions.push(action);
    const newState = reducer(sig(), action);
    sig.set(newState);
  };

  const getActions = () => [...actions];

  const reset = () => {
    actions.length = 0;
    sig.set(initialState);
  };

  return Object.assign(sig, {
    dispatch,
    getActions,
    reset,
  });
}

/**
 * Combines multiple reducers
 */
export function combineReducers<TState extends Record<string, any>, TAction>(
  reducers: {
    [K in keyof TState]: Reducer<TState[K], TAction>;
  }
): Reducer<TState, TAction> {
  return (state: TState, action: TAction): TState => {
    const newState = {} as TState;
    for (const key in reducers) {
      newState[key] = reducers[key](state[key], action);
    }
    return newState;
  };
}

