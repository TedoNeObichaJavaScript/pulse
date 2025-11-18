import { describe, it, expect } from 'vitest';
import { array } from './array';
import { effect } from './effect';

describe('array', () => {
  it('should create array signal with initial value', () => {
    const arr = array([1, 2, 3]);
    expect(arr()).toEqual([1, 2, 3]);
  });

  it('should create empty array by default', () => {
    const arr = array();
    expect(arr()).toEqual([]);
  });

  it('should push items', () => {
    const arr = array([1, 2]);
    const length = arr.push(3, 4);
    expect(arr()).toEqual([1, 2, 3, 4]);
    expect(length).toBe(4);
  });

  it('should pop items', () => {
    const arr = array([1, 2, 3]);
    const popped = arr.pop();
    expect(popped).toBe(3);
    expect(arr()).toEqual([1, 2]);
  });

  it('should shift items', () => {
    const arr = array([1, 2, 3]);
    const shifted = arr.shift();
    expect(shifted).toBe(1);
    expect(arr()).toEqual([2, 3]);
  });

  it('should unshift items', () => {
    const arr = array([2, 3]);
    const length = arr.unshift(0, 1);
    expect(arr()).toEqual([0, 1, 2, 3]);
    expect(length).toBe(4);
  });

  it('should splice items', () => {
    const arr = array([1, 2, 3, 4, 5]);
    const removed = arr.splice(1, 2, 6, 7);
    expect(arr()).toEqual([1, 6, 7, 4, 5]);
    expect(removed).toEqual([2, 3]);
  });

  it('should sort array', () => {
    const arr = array([3, 1, 2]);
    arr.sort();
    expect(arr()).toEqual([1, 2, 3]);
  });

  it('should reverse array', () => {
    const arr = array([1, 2, 3]);
    arr.reverse();
    expect(arr()).toEqual([3, 2, 1]);
  });

  it('should filter array', () => {
    const arr = array([1, 2, 3, 4, 5]);
    const filtered = arr.filter((x) => x % 2 === 0);
    expect(filtered()).toEqual([2, 4]);
    // Original should be unchanged
    expect(arr()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should map array', () => {
    const arr = array([1, 2, 3]);
    const mapped = arr.map((x) => x * 2);
    expect(mapped()).toEqual([2, 4, 6]);
    // Original should be unchanged
    expect(arr()).toEqual([1, 2, 3]);
  });

  it('should get length', () => {
    const arr = array([1, 2, 3]);
    expect(arr.length()).toBe(3);
    arr.push(4);
    expect(arr.length()).toBe(4);
  });

  it('should notify subscribers on mutation', () => {
    const arr = array([1, 2]);
    let notified = false;
    let notifiedValue: number[] = [];

    arr.subscribe((value) => {
      notified = true;
      notifiedValue = value;
    });

    arr.push(3);
    expect(notified).toBe(true);
    expect(notifiedValue).toEqual([1, 2, 3]);
  });

  it('should work with effects', () => {
    const arr = array([1, 2]);
    let effectCount = 0;
    let lastLength = 0;

    effect(() => {
      lastLength = arr.length();
      effectCount++;
    });

    expect(effectCount).toBe(1);
    expect(lastLength).toBe(2);

    arr.push(3);
    expect(effectCount).toBe(2);
    expect(lastLength).toBe(3);
  });
});

