import { describe, it, expect } from 'vitest';
import { signal } from './signal';
import { store } from './store';
import { derived, derivedFrom } from './derived';

describe('derived', () => {
  it('should create derived store from function', () => {
    const count = signal(5);
    const doubled = derived(() => ({
      original: count(),
      doubled: count() * 2,
    }));

    expect(doubled().original).toBe(5);
    expect(doubled().doubled).toBe(10);

    count.set(10);
    expect(doubled().original).toBe(10);
    expect(doubled().doubled).toBe(20);
  });

  it('should update when dependencies change', () => {
    const a = signal(1);
    const b = signal(2);
    const sum = derived(() => ({
      a: a(),
      b: b(),
      sum: a() + b(),
    }));

    expect(sum().sum).toBe(3);
    a.set(5);
    expect(sum().sum).toBe(7);
    b.set(10);
    expect(sum().sum).toBe(15);
  });
});

describe('derivedFrom', () => {
  it('should combine multiple signals into store', () => {
    const firstName = signal('John');
    const lastName = signal('Doe');
    const fullName = derivedFrom(
      { first: firstName, last: lastName },
      (values) => ({
        fullName: `${values.first} ${values.last}`,
        first: values.first,
        last: values.last,
      })
    );

    expect(fullName().fullName).toBe('John Doe');
    firstName.set('Jane');
    expect(fullName().fullName).toBe('Jane Doe');
  });

  it('should combine signals and stores', () => {
    const count = signal(5);
    const user = store({ name: 'John', age: 30 });
    const combined = derivedFrom(
      { count, user },
      (values) => ({
        count: values.count,
        name: values.user.name,
        age: values.user.age,
      })
    );

    expect(combined().count).toBe(5);
    expect(combined().name).toBe('John');
    expect(combined().age).toBe(30);

    count.set(10);
    user.setField('age', 31);
    expect(combined().count).toBe(10);
    expect(combined().age).toBe(31);
  });

  it('should work without transform function', () => {
    const a = signal(1);
    const b = signal(2);
    const combined = derivedFrom({ a, b });

    expect(combined().a).toBe(1);
    expect(combined().b).toBe(2);
    a.set(5);
    expect(combined().a).toBe(5);
  });
});

