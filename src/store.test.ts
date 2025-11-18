import { describe, it, expect } from 'vitest';
import { store } from './store';

describe('store', () => {
  it('should create a store with initial value', () => {
    const user = store({ name: 'John', age: 30 });
    expect(user().name).toBe('John');
    expect(user().age).toBe(30);
  });

  it('should update store with set', () => {
    const user = store({ name: 'John', age: 30 });
    user.set({ name: 'Jane', age: 25 });
    expect(user().name).toBe('Jane');
    expect(user().age).toBe(25);
  });

  it('should update store with update', () => {
    const user = store({ name: 'John', age: 30 });
    user.update((u) => ({ ...u, age: 31 }));
    expect(user().name).toBe('John');
    expect(user().age).toBe(31);
  });

  it('should update single field with setField', () => {
    const user = store({ name: 'John', age: 30 });
    user.setField('age', 31);
    expect(user().name).toBe('John');
    expect(user().age).toBe(31);
  });
});


