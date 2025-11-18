/**
 * Pulse CLI Tools
 * Command-line utilities for Pulse framework
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Analyzes codebase for signal usage
 */
export function analyzeSignals(filePath: string): {
  signalCount: number;
  computedCount: number;
  effectCount: number;
  storeCount: number;
} {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const signalCount = (content.match(/signal\(/g) || []).length;
    const computedCount = (content.match(/computed\(/g) || []).length;
    const effectCount = (content.match(/effect\(/g) || []).length;
    const storeCount = (content.match(/store\(/g) || []).length;

    return {
      signalCount,
      computedCount,
      effectCount,
      storeCount,
    };
  } catch (error) {
    console.error(`Error analyzing file: ${filePath}`, error);
    return { signalCount: 0, computedCount: 0, effectCount: 0, storeCount: 0 };
  }
}

/**
 * Generates signal usage report
 */
export function generateReport(directory: string): string {
  // This would scan directory for signal usage
  return `Pulse Framework Usage Report\n${directory}`;
}

/**
 * Validates signal usage patterns
 */
export function validateSignals(filePath: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for common issues
    if (content.includes('signal(') && !content.includes('from \'pulse\'')) {
      warnings.push('Signal used but pulse not imported');
    }

    // Check for memory leaks
    if (content.includes('effect(') && !content.includes('return () =>')) {
      warnings.push('Effect may not have cleanup function');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Error reading file: ${error}`],
      warnings: [],
    };
  }
}

/**
 * Migrates code from other libraries to Pulse
 */
export function migrateCode(
  content: string,
  from: 'redux' | 'mobx' | 'vue' | 'svelte'
): string {
  let migrated = content;

  switch (from) {
    case 'redux':
      migrated = migrated.replace(/useSelector\(/g, 'useSignal(');
      migrated = migrated.replace(/dispatch\(/g, 'signal.set(');
      break;
    case 'mobx':
      migrated = migrated.replace(/observable\(/g, 'signal(');
      migrated = migrated.replace(/computed\(/g, 'computed(');
      break;
    case 'vue':
      migrated = migrated.replace(/ref\(/g, 'signal(');
      migrated = migrated.replace(/computed\(/g, 'computed(');
      break;
    case 'svelte':
      migrated = migrated.replace(/\$:/g, 'computed(() =>');
      migrated = migrated.replace(/writable\(/g, 'signal(');
      break;
  }

  return migrated;
}

