import { describe, it, expect, vi } from 'vitest';
import {
  contract,
  typeContract,
  rangeContract,
  lengthContract,
  patternContract,
  shapeContract,
  unionContract,
  optionalContract,
  validatedSignal,
  validate,
} from './validation';

describe('validation', () => {
  describe('contract', () => {
    it('should create a contract', () => {
      const isPositive = contract((value: number) => value > 0);
      expect(isPositive.validate(5)).toBe(true);
      expect(isPositive.validate(-1)).toBe(false);
    });

    it('should return error message', () => {
      const isPositive = contract((value: number) => {
        if (value > 0) return true;
        return 'Value must be positive';
      });
      expect(isPositive.validate(5)).toBe(true);
      expect(isPositive.validate(-1)).toBe('Value must be positive');
    });
  });

  describe('typeContract', () => {
    it('should validate types', () => {
      const isNumber = typeContract((value): value is number => typeof value === 'number', 'number');
      expect(isNumber.validate(5)).toBe(true);
      expect(isNumber.validate('5')).toBe(false);
    });
  });

  describe('rangeContract', () => {
    it('should validate number ranges', () => {
      const range = rangeContract(0, 10);
      expect(range.validate(5)).toBe(true);
      expect(range.validate(-1)).not.toBe(true);
      expect(range.validate(11)).not.toBe(true);
    });
  });

  describe('lengthContract', () => {
    it('should validate string lengths', () => {
      const length = lengthContract(3, 10);
      expect(length.validate('hello')).toBe(true);
      expect(length.validate('hi')).not.toBe(true);
      expect(length.validate('very long string')).not.toBe(true);
    });
  });

  describe('patternContract', () => {
    it('should validate string patterns', () => {
      const email = patternContract(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(email.validate('test@example.com')).toBe(true);
      expect(email.validate('invalid')).not.toBe(true);
    });
  });

  describe('shapeContract', () => {
    it('should validate object shapes', () => {
      const userShape = shapeContract({
        name: lengthContract(1, 50),
        age: rangeContract(0, 150),
      });

      expect(userShape.validate({ name: 'John', age: 30 })).toBe(true);
      expect(userShape.validate({ name: '', age: 30 })).not.toBe(true);
      expect(userShape.validate({ name: 'John', age: 200 })).not.toBe(true);
    });
  });

  describe('unionContract', () => {
    it('should validate union types', () => {
      const stringOrNumber = unionContract(
        typeContract((v): v is string => typeof v === 'string', 'string'),
        typeContract((v): v is number => typeof v === 'number', 'number')
      );

      expect(stringOrNumber.validate('hello')).toBe(true);
      expect(stringOrNumber.validate(42)).toBe(true);
      expect(stringOrNumber.validate(true)).not.toBe(true);
    });
  });

  describe('optionalContract', () => {
    it('should allow undefined values', () => {
      const optionalString = optionalContract(
        typeContract((v): v is string => typeof v === 'string', 'string')
      );

      expect(optionalString.validate(undefined)).toBe(true);
      expect(optionalString.validate('hello')).toBe(true);
      expect(optionalString.validate(42)).not.toBe(true);
    });
  });

  describe('validatedSignal', () => {
    it('should create validated signal', () => {
      const isPositive = contract((value: number) => value > 0);
      const sig = validatedSignal(5, { contract: isPositive });

      expect(sig()).toBe(5);
      sig.set(10);
      expect(sig()).toBe(10);
    });

    it('should reject invalid values', () => {
      const isPositive = contract((value: number) => value > 0);
      const onError = vi.fn();
      const sig = validatedSignal(5, {
        contract: isPositive,
        onError,
      });

      sig.set(-1);
      expect(sig()).toBe(5); // Should remain 5
      expect(onError).toHaveBeenCalled();
    });

    it('should throw on error if configured', () => {
      const isPositive = contract((value: number) => value > 0);
      const sig = validatedSignal(5, {
        contract: isPositive,
        throwOnError: true,
      });

      expect(() => sig.set(-1)).toThrow();
    });
  });

  describe('validate', () => {
    it('should validate values', () => {
      const isPositive = contract((value: number) => value > 0);
      expect(validate(5, isPositive).valid).toBe(true);
      expect(validate(-1, isPositive).valid).toBe(false);
    });

    it('should return error message', () => {
      const isPositive = contract((value: number) => {
        if (value > 0) return true;
        return 'Must be positive';
      });
      const result = validate(-1, isPositive);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be positive');
    });
  });
});

