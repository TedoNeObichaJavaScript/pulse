import { describe, it, expect } from 'vitest';
import { historySignal } from './history';

describe('historySignal', () => {
  it('should create signal with history', () => {
    const sig = historySignal(0);
    expect(sig()).toBe(0);
    expect(sig.getHistory().length).toBe(1);
  });

  it('should track history on updates', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.set(2);
    sig.set(3);

    const history = sig.getHistory();
    expect(history.length).toBe(4);
    expect(history[0].value).toBe(0);
    expect(history[3].value).toBe(3);
  });

  it('should undo changes', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.set(2);

    expect(sig()).toBe(2);
    sig.undo();
    expect(sig()).toBe(1);
    sig.undo();
    expect(sig()).toBe(0);
  });

  it('should redo changes', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.set(2);

    sig.undo();
    sig.undo();
    expect(sig()).toBe(0);

    sig.redo();
    expect(sig()).toBe(1);
    sig.redo();
    expect(sig()).toBe(2);
  });

  it('should check if undo/redo is available', () => {
    const sig = historySignal(0);
    expect(sig.canUndo()).toBe(false);
    expect(sig.canRedo()).toBe(false);

    sig.set(1);
    expect(sig.canUndo()).toBe(true);
    expect(sig.canRedo()).toBe(false);

    sig.undo();
    expect(sig.canUndo()).toBe(false);
    expect(sig.canRedo()).toBe(true);
  });

  it('should clear history', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.set(2);

    sig.clearHistory();
    expect(sig.getHistory().length).toBe(1);
    expect(sig.getHistory()[0].value).toBe(sig());
  });

  it('should jump to history index', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.set(2);
    sig.set(3);

    sig.jumpToHistory(1);
    expect(sig()).toBe(1);
    expect(sig.getHistoryIndex()).toBe(1);
  });

  it('should create snapshots with labels', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.snapshot('Checkpoint 1');
    sig.set(2);

    const history = sig.getHistory();
    expect(history[1].label).toBe('Checkpoint 1');
  });

  it('should limit history size', () => {
    const sig = historySignal(0, { maxSize: 3 });
    sig.set(1);
    sig.set(2);
    sig.set(3);
    sig.set(4);

    const history = sig.getHistory();
    expect(history.length).toBe(3);
    expect(history[0].value).toBe(2); // Oldest entry removed
  });

  it('should remove future history when making new change after undo', () => {
    const sig = historySignal(0);
    sig.set(1);
    sig.set(2);
    sig.set(3);

    sig.undo(); // Now at 2
    sig.undo(); // Now at 1

    sig.set(5); // New change should remove 2 and 3 from history

    expect(sig.getHistory().length).toBe(3); // 0, 1, 5
    expect(sig.getHistory()[2].value).toBe(5);
    expect(sig.canRedo()).toBe(false);
  });

  it('should disable history when enabled is false', () => {
    const sig = historySignal(0, { enabled: false });
    sig.set(1);
    sig.set(2);

    expect(sig.getHistory().length).toBe(1);
    expect(sig.canUndo()).toBe(false);
    expect(sig.canRedo()).toBe(false);
  });
});

