/**
 * Signal State Machine
 * State machine pattern with signals
 */

import { signal, type Signal } from './signal';

export type StateTransition<TState, TEvent> = {
  from: TState;
  event: TEvent;
  to: TState;
  guard?: () => boolean;
  action?: () => void;
};

export interface StateMachineConfig<TState, TEvent> {
  initialState: TState;
  transitions: StateTransition<TState, TEvent>[];
  onStateChange?: (from: TState, to: TState) => void;
}

export interface StateMachine<TState, TEvent> {
  state: Signal<TState>;
  canTransition: (event: TEvent) => boolean;
  transition: (event: TEvent) => boolean;
  reset: () => void;
  getAvailableEvents: () => TEvent[];
}

/**
 * Creates a state machine
 */
export function stateMachine<TState, TEvent>(
  config: StateMachineConfig<TState, TEvent>
): StateMachine<TState, TEvent> {
  const { initialState, transitions, onStateChange } = config;
  const state = signal<TState>(initialState);

  const canTransition = (event: TEvent): boolean => {
    const currentState = state();
    const transition = transitions.find(
      (t) => t.from === currentState && t.event === event
    );

    if (!transition) {
      return false;
    }

    if (transition.guard && !transition.guard()) {
      return false;
    }

    return true;
  };

  const transition = (event: TEvent): boolean => {
    const currentState = state();
    const transition = transitions.find(
      (t) => t.from === currentState && t.event === event
    );

    if (!transition) {
      return false;
    }

    if (transition.guard && !transition.guard()) {
      return false;
    }

    const previousState = currentState;
    state.set(transition.to);

    if (transition.action) {
      transition.action();
    }

    if (onStateChange) {
      onStateChange(previousState, transition.to);
    }

    return true;
  };

  const reset = () => {
    state.set(initialState);
  };

  const getAvailableEvents = (): TEvent[] => {
    const currentState = state();
    return transitions
      .filter((t) => t.from === currentState && canTransition(t.event))
      .map((t) => t.event);
  };

  return {
    state,
    canTransition,
    transition,
    reset,
    getAvailableEvents,
  };
}

