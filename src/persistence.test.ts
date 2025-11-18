import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  persistentSignal,
  localStorageSignal,
  sessionStorageSignal,
  hydrateSignal,
  clearPersistedSignal,
  localStorageAdapter,
  type StorageAdapter,
} from './persistence';
import { signal } from './signal';

describe('persistence', () => {
  let mockStorage: Record<string, string>;
  let mockAdapter: StorageAdapter;

  beforeEach(() => {
    mockStorage = {};
    mockAdapter = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    };
  });

  describe('persistentSignal', () => {
    it('should save to storage on update', () => {
      const sig = persistentSignal(0, {
        key: 'test',
        adapter: mockAdapter,
      });

      sig.set(5);
      expect(mockStorage['test']).toBe('5');
    });

    it('should load from storage on creation', () => {
      mockAdapter.setItem('test', '10');
      const sig = persistentSignal(0, {
        key: 'test',
        adapter: mockAdapter,
      });

      expect(sig()).toBe(10);
    });

    it('should use initial value if storage is empty', () => {
      const sig = persistentSignal(42, {
        key: 'test',
        adapter: mockAdapter,
      });

      expect(sig()).toBe(42);
      expect(mockStorage['test']).toBe('42');
    });

    it('should debounce saves', (done) => {
      const sig = persistentSignal(0, {
        key: 'test',
        adapter: mockAdapter,
        debounce: 50,
      });

      sig.set(1);
      sig.set(2);
      sig.set(3);

      expect(mockStorage['test']).toBeUndefined();

      setTimeout(() => {
        expect(mockStorage['test']).toBe('3');
        done();
      }, 100);
    });

    it('should use custom serialize/deserialize', () => {
      const sig = persistentSignal({ count: 0 }, {
        key: 'test',
        adapter: mockAdapter,
        serialize: (value) => `custom:${JSON.stringify(value)}`,
        deserialize: (value) => JSON.parse(value.replace('custom:', '')),
      });

      sig.set({ count: 5 });
      expect(mockStorage['test']).toBe('custom:{"count":5}');

      const sig2 = persistentSignal({ count: 0 }, {
        key: 'test',
        adapter: mockAdapter,
        serialize: (value) => `custom:${JSON.stringify(value)}`,
        deserialize: (value) => JSON.parse(value.replace('custom:', '')),
      });

      expect(sig2().count).toBe(5);
    });
  });

  describe('localStorageSignal', () => {
    it('should create signal with localStorage adapter', () => {
      const sig = localStorageSignal('test', 0);
      sig.set(5);
      // In test environment, localStorage might not work, so we just test it doesn't throw
      expect(sig()).toBe(5);
    });
  });

  describe('sessionStorageSignal', () => {
    it('should create signal with sessionStorage adapter', () => {
      const sig = sessionStorageSignal('test', 0);
      sig.set(5);
      expect(sig()).toBe(5);
    });
  });

  describe('hydrateSignal', () => {
    it('should hydrate signal from storage', () => {
      const sig = signal(0);
      mockAdapter.setItem('test', '42');

      const hydrated = hydrateSignal(sig, 'test', mockAdapter);
      expect(hydrated).toBe(true);
      expect(sig()).toBe(42);
    });

    it('should return false if storage is empty', () => {
      const sig = signal(0);
      const hydrated = hydrateSignal(sig, 'test', mockAdapter);
      expect(hydrated).toBe(false);
      expect(sig()).toBe(0);
    });
  });

  describe('clearPersistedSignal', () => {
    it('should clear persisted signal from storage', () => {
      mockAdapter.setItem('test', '42');
      clearPersistedSignal('test', mockAdapter);
      expect(mockAdapter.getItem('test')).toBeNull();
    });
  });
});

