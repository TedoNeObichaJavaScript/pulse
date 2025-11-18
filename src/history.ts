/**
 * Signal History & Undo/Redo
 * Time-travel debugging with state snapshots
 */

import type { Signal } from './signal';
import { signal } from './signal';

export interface HistoryState<T> {
  value: T;
  timestamp: number;
  label?: string;
}

export interface HistoryOptions {
  /**
   * Maximum number of history entries (default: 100)
   */
  maxSize?: number;
  /**
   * Whether to enable undo/redo (default: true)
   */
  enabled?: boolean;
}

/**
 * Signal with history tracking and undo/redo capabilities
 */
export interface HistorySignal<T> extends Signal<T> {
  /**
   * Undo the last change
   */
  undo(): boolean;
  /**
   * Redo the last undone change
   */
  redo(): boolean;
  /**
   * Get history entries
   */
  getHistory(): HistoryState<T>[];
  /**
   * Clear history
   */
  clearHistory(): void;
  /**
   * Get current history index
   */
  getHistoryIndex(): number;
  /**
   * Jump to a specific history index
   */
  jumpToHistory(index: number): boolean;
  /**
   * Check if undo is available
   */
  canUndo(): boolean;
  /**
   * Check if redo is available
   */
  canRedo(): boolean;
  /**
   * Create a snapshot with a label
   */
  snapshot(label?: string): void;
}

/**
 * Creates a signal with history tracking
 */
export function historySignal<T>(
  initialValue: T,
  options: HistoryOptions = {}
): HistorySignal<T> {
  const { maxSize = 100, enabled = true } = options;

  const history: HistoryState<T>[] = [
    { value: initialValue, timestamp: Date.now() },
  ];
  let historyIndex = 0;
  let isUpdating = false;

  const sig = signal<T>(initialValue);

  // Track changes
  const originalSet = sig.set.bind(sig);
  sig.set = (value: T) => {
    if (isUpdating) {
      originalSet(value);
      return;
    }

    originalSet(value);

    if (enabled) {
      // Remove any history after current index (when undoing then making new change)
      history.splice(historyIndex + 1);

      // Add new entry
      history.push({
        value,
        timestamp: Date.now(),
      });

      // Limit history size
      if (history.length > maxSize) {
        history.shift();
      } else {
        historyIndex++;
      }
    }
  };

  const undo = (): boolean => {
    if (!enabled || !canUndo()) {
      return false;
    }

    isUpdating = true;
    historyIndex--;
    originalSet(history[historyIndex].value);
    isUpdating = false;
    return true;
  };

  const redo = (): boolean => {
    if (!enabled || !canRedo()) {
      return false;
    }

    isUpdating = true;
    historyIndex++;
    originalSet(history[historyIndex].value);
    isUpdating = false;
    return true;
  };

  const getHistory = (): HistoryState<T>[] => {
    return [...history];
  };

  const clearHistory = (): void => {
    history.length = 0;
    history.push({ value: sig(), timestamp: Date.now() });
    historyIndex = 0;
  };

  const getHistoryIndex = (): number => {
    return historyIndex;
  };

  const jumpToHistory = (index: number): boolean => {
    if (!enabled || index < 0 || index >= history.length) {
      return false;
    }

    isUpdating = true;
    historyIndex = index;
    originalSet(history[historyIndex].value);
    isUpdating = false;
    return true;
  };

  const canUndo = (): boolean => {
    return enabled && historyIndex > 0;
  };

  const canRedo = (): boolean => {
    return enabled && historyIndex < history.length - 1;
  };

  const snapshot = (label?: string): void => {
    if (enabled) {
      // Remove any history after current index
      history.splice(historyIndex + 1);

      history.push({
        value: sig(),
        timestamp: Date.now(),
        label,
      });

      if (history.length > maxSize) {
        history.shift();
      } else {
        historyIndex++;
      }
    }
  };

  const historySig = Object.assign(sig, {
    undo,
    redo,
    getHistory,
    clearHistory,
    getHistoryIndex,
    jumpToHistory,
    canUndo,
    canRedo,
    snapshot,
  }) as HistorySignal<T>;

  return historySig;
}

