/**
 * Signal Validation & Contracts
 * Runtime type checking and schema validation for signals
 */

import type { Signal } from './signal';
import { signal } from './signal';

export type Validator<T> = (value: T) => boolean | string;
export type Contract<T> = {
  validate: Validator<T>;
  name?: string;
};

/**
 * Creates a contract validator
 */
export function contract<T>(
  validator: Validator<T>,
  name?: string
): Contract<T> {
  return {
    validate: validator,
    name: name || 'Contract',
  };
}

/**
 * Type guard contract - validates value is of specific type
 */
export function typeContract<T>(
  typeGuard: (value: unknown) => value is T,
  typeName: string
): Contract<T> {
  return contract(
    (value): value is T => typeGuard(value),
    `TypeContract<${typeName}>`
  );
}

/**
 * Number range contract
 */
export function rangeContract(min: number, max: number): Contract<number> {
  return contract(
    (value) => {
      if (typeof value !== 'number') {
        return `Expected number, got ${typeof value}`;
      }
      if (value < min || value > max) {
        return `Value ${value} is outside range [${min}, ${max}]`;
      }
      return true;
    },
    `RangeContract[${min}, ${max}]`
  );
}

/**
 * String length contract
 */
export function lengthContract(min: number, max: number): Contract<string> {
  return contract(
    (value) => {
      if (typeof value !== 'string') {
        return `Expected string, got ${typeof value}`;
      }
      if (value.length < min || value.length > max) {
        return `String length ${value.length} is outside range [${min}, ${max}]`;
      }
      return true;
    },
    `LengthContract[${min}, ${max}]`
  );
}

/**
 * Array length contract
 */
export function arrayLengthContract<T>(
  min: number,
  max: number
): Contract<T[]> {
  return contract(
    (value) => {
      if (!Array.isArray(value)) {
        return `Expected array, got ${typeof value}`;
      }
      if (value.length < min || value.length > max) {
        return `Array length ${value.length} is outside range [${min}, ${max}]`;
      }
      return true;
    },
    `ArrayLengthContract[${min}, ${max}]`
  );
}

/**
 * Pattern contract for strings (regex)
 */
export function patternContract(pattern: RegExp): Contract<string> {
  return contract(
    (value) => {
      if (typeof value !== 'string') {
        return `Expected string, got ${typeof value}`;
      }
      if (!pattern.test(value)) {
        return `String does not match pattern ${pattern}`;
      }
      return true;
    },
    `PatternContract(${pattern})`
  );
}

/**
 * Object shape contract
 */
export function shapeContract<T extends Record<string, any>>(
  shape: Record<keyof T, Contract<any>>
): Contract<T> {
  return contract(
    (value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `Expected object, got ${typeof value}`;
      }
      for (const [key, contract] of Object.entries(shape)) {
        const result = contract.validate((value as any)[key]);
        if (result !== true) {
          return `Property '${key}': ${result}`;
        }
      }
      return true;
    },
    'ShapeContract'
  );
}

/**
 * Union contract (one of many)
 */
export function unionContract<T>(...contracts: Contract<T>[]): Contract<T> {
  return contract(
    (value) => {
      for (const contract of contracts) {
        const result = contract.validate(value);
        if (result === true) {
          return true;
        }
      }
      return `Value does not match any of ${contracts.length} contracts`;
    },
    `UnionContract(${contracts.length})`
  );
}

/**
 * Optional contract (value can be undefined)
 */
export function optionalContract<T>(
  contract: Contract<T>
): Contract<T | undefined> {
  return {
    validate: (value) => {
      if (value === undefined) {
        return true;
      }
      return contract.validate(value);
    },
    name: `Optional<${contract.name}>`,
  };
}

export interface ValidatedSignalOptions<T> {
  contract: Contract<T>;
  onValidationError?: (value: T, error: string) => void;
  onError?: (value: T, error: string) => void; // Alias for onValidationError
  throwOnError?: boolean;
}

/**
 * Creates a validated signal that enforces a contract
 */
export function validatedSignal<T>(
  initialValue: T,
  options: ValidatedSignalOptions<T>
): Signal<T> {
  const { contract, onValidationError, onError, throwOnError = false } = options;
  // Support both onValidationError and onError (onError is an alias)
  const errorHandler = onValidationError || onError;

  // Validate initial value
  const initialResult = contract.validate(initialValue);
    if (initialResult !== true) {
      const errorMsg = typeof initialResult === 'string' ? initialResult : 'Validation failed';
      if (throwOnError) {
        throw new Error(`Initial value validation failed: ${errorMsg}`);
      }
      if (errorHandler) {
        errorHandler(initialValue, errorMsg);
      }
    }

  const sig: Signal<T> = signal(initialValue, {
    middleware: [
      (value: T, next: (value: T) => T, signal: Signal<T>) => {
        const result = contract.validate(value);
        if (result !== true) {
          const errorMsg = typeof result === 'string' ? result : 'Validation failed';
          if (throwOnError) {
            throw new Error(`Validation failed: ${errorMsg}`);
          }
          // Call error handler synchronously before returning current value
          if (errorHandler) {
            try {
              errorHandler(value, errorMsg);
            } catch (e) {
              // Ignore errors in error handler
            }
          }
          return signal(); // Return current signal value if validation fails
        }
        return next(value);
      },
    ],
  });

  return sig;
}

/**
 * Validates a value against a contract
 */
export function validate<T>(value: T, contract: Contract<T>): {
  valid: boolean;
  error?: string;
} {
  const result = contract.validate(value);
  if (result === true) {
    return { valid: true };
  }
  return {
    valid: false,
    error: typeof result === 'string' ? result : 'Validation failed',
  };
}

