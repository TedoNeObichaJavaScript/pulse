/**
 * Signal Animations
 * Signal-driven animation utilities
 */

import { signal, type Signal } from './signal';

export interface AnimationOptions {
  duration: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
  onUpdate?: (value: number) => void;
}

/**
 * Animates a signal value from start to end
 */
export function animateSignal(
  sig: Signal<number>,
  to: number,
  options: AnimationOptions
): Promise<void> {
  return new Promise((resolve) => {
    const { duration, easing = (t) => t, onComplete, onUpdate } = options;
    const from = sig();
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);
      const value = from + (to - from) * eased;

      sig.set(value);

      if (onUpdate) {
        onUpdate(value);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) {
          onComplete();
        }
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

/**
 * Creates an animated signal
 */
export function animatedSignal(
  initialValue: number
): Signal<number> & {
  animate: (to: number, options: AnimationOptions) => Promise<void>;
  stop: () => void;
} {
  const sig = signal(initialValue);
  let currentAnimation: Promise<void> | null = null;

  const animate = (to: number, options: AnimationOptions): Promise<void> => {
    if (currentAnimation) {
      // Stop current animation
    }
    currentAnimation = animateSignal(sig, to, {
      ...options,
      onComplete: () => {
        currentAnimation = null;
        if (options.onComplete) {
          options.onComplete();
        }
      },
    });
    return currentAnimation;
  };

  const stop = () => {
    currentAnimation = null;
  };

  return Object.assign(sig, {
    animate,
    stop,
  });
}

/**
 * Easing functions
 */
export const easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
};

