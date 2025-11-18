/**
 * Advanced Pulse Examples
 * Demonstrates advanced features and patterns
 */

import {
  signal,
  computed,
  effect,
  batch,
  store,
  array,
  asyncComputed,
  historySignal,
  debouncedSignal,
  throttledSignal,
  middleware,
  persistentSignal,
  validatedSignal,
  websocketSignal,
  reducerSignal,
  stateMachine,
  animatedSignal,
  easing,
} from '../src/index';

// Example 1: Advanced State Management with History
export function historyExample() {
  const count = historySignal(0, { maxHistory: 10 });

  count.set(1);
  count.set(2);
  count.set(3);

  console.log('Current:', count()); // 3
  count.undo();
  console.log('After undo:', count()); // 2
  count.redo();
  console.log('After redo:', count()); // 3
}

// Example 2: Form Validation
export function formValidationExample() {
  const email = validatedSignal('', {
    contract: {
      validate: (value: string) => {
        if (!value.includes('@')) {
          return 'Invalid email';
        }
        return true;
      },
    },
    onValidationError: (value, error) => {
      console.error(`Validation error for ${value}: ${error}`);
    },
  });

  email.set('invalid'); // Will trigger validation error
  email.set('valid@example.com'); // Valid
}

// Example 3: WebSocket Integration
export function websocketExample() {
  const ws = websocketSignal('wss://echo.websocket.org', {
    reconnect: true,
    reconnectInterval: 1000,
    onOpen: () => console.log('Connected'),
    onClose: () => console.log('Disconnected'),
  });

  ws.subscribe((data) => {
    console.log('Received:', data);
  });

  ws.send(JSON.stringify({ message: 'Hello' }));
}

// Example 4: Redux-like Reducer Pattern
export function reducerExample() {
  type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

  const counter = reducerSignal(
    (state: number, action: Action) => {
      switch (action.type) {
        case 'increment':
          return state + 1;
        case 'decrement':
          return state - 1;
        case 'reset':
          return 0;
        default:
          return state;
      }
    },
    0
  );

  counter.dispatch({ type: 'increment' });
  console.log('Count:', counter()); // 1
}

// Example 5: State Machine
export function stateMachineExample() {
  type State = 'idle' | 'loading' | 'success' | 'error';

  const machine = stateMachine<State>(
    {
      initialState: 'idle',
      states: {
        idle: {
          transitions: {
            start: 'loading',
          },
        },
        loading: {
          transitions: {
            success: 'success',
            error: 'error',
          },
        },
        success: {
          transitions: {
            reset: 'idle',
          },
        },
        error: {
          transitions: {
            retry: 'loading',
            reset: 'idle',
          },
        },
      },
    },
    (state) => {
      console.log('State changed to:', state);
    }
  );

  machine.transition('start');
  console.log('Current state:', machine.state()); // 'loading'
}

// Example 6: Animations
export function animationExample() {
  const position = animatedSignal(0);

  position.animate(100, {
    duration: 1000,
    easing: easing.easeInOut,
    onUpdate: (value) => {
      console.log('Position:', value);
    },
    onComplete: () => {
      console.log('Animation complete');
    },
  });
}

// Example 7: Middleware Pipeline
export function middlewareExample() {
  const count = signal(0, {
    middleware: [
      middleware.logging('count'),
      middleware.transform((value) => Math.max(0, value)), // Prevent negative
      middleware.validation((value) => value < 100, 'Value must be less than 100'),
    ],
  });

  count.set(-5); // Will be transformed to 0
  count.set(50); // Valid
  count.set(150); // Will trigger validation error
}

// Example 8: Persistence
export function persistenceExample() {
  const settings = persistentSignal(
    { theme: 'light', language: 'en' },
    {
      key: 'app-settings',
      storage: 'localStorage',
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }
  );

  settings.set({ theme: 'dark', language: 'en' });
  // Settings are automatically saved to localStorage
}

// Example 9: Async Computed with Loading States
export function asyncComputedExample() {
  const userId = signal(1);

  const user = asyncComputed(async () => {
    const id = userId();
    const response = await fetch(`https://api.example.com/users/${id}`);
    return response.json();
  });

  effect(() => {
    if (user.loading()) {
      console.log('Loading user...');
    } else if (user.error()) {
      console.error('Error:', user.error());
    } else {
      console.log('User:', user());
    }
  });

  userId.set(2); // Automatically fetches new user
}

// Example 10: Batch Updates
export function batchExample() {
  const a = signal(0);
  const b = signal(0);
  const sum = computed(() => a() + b());

  let updateCount = 0;
  sum.subscribe(() => {
    updateCount++;
  });

  // Without batch - triggers 2 updates
  a.set(1);
  b.set(1);
  console.log('Updates without batch:', updateCount); // 2

  updateCount = 0;

  // With batch - triggers 1 update
  batch(() => {
    a.set(2);
    b.set(2);
  });
  console.log('Updates with batch:', updateCount); // 1
}

