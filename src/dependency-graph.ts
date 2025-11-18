/**
 * Signal Dependency Graph
 * Build dependency graph visualization data
 */

import type { Signal } from './signal';
import { getCurrentContext } from './context';

export interface DependencyNode {
  id: string;
  type: 'signal' | 'computed' | 'effect';
  label: string;
  value?: any;
  dependencies: string[];
  dependents: string[];
}

const nodeRegistry = new WeakMap<Signal<any>, DependencyNode>();
let nodeCounter = 0;

/**
 * Registers a signal in the dependency graph
 */
export function registerSignal<T>(
  sig: Signal<T>,
  type: 'signal' | 'computed' | 'effect' = 'signal',
  label?: string
): DependencyNode {
  let node = nodeRegistry.get(sig);
  if (!node) {
    const id = `node-${nodeCounter++}`;
    node = {
      id,
      type,
      label: label || id,
      dependencies: [],
      dependents: [],
    };
    nodeRegistry.set(sig, node);
  }
  return node;
}

/**
 * Gets dependency graph data
 */
export function getDependencyGraph(): DependencyNode[] {
  const nodes: DependencyNode[] = [];
  const visited = new WeakSet<Signal<any>>();

  // This would need to track all signals
  // For now, return registered nodes
  return nodes;
}

/**
 * Gets dependencies for a signal
 */
export function getDependencies<T>(sig: Signal<T>): DependencyNode[] {
  const node = nodeRegistry.get(sig);
  if (!node) {
    return [];
  }

  // Would need to resolve dependency IDs to nodes
  return [];
}

/**
 * Gets dependents for a signal
 */
export function getDependents<T>(sig: Signal<T>): DependencyNode[] {
  const node = nodeRegistry.get(sig);
  if (!node) {
    return [];
  }

  // Would need to resolve dependent IDs to nodes
  return [];
}

/**
 * Exports dependency graph as JSON
 */
export function exportDependencyGraph(): string {
  return JSON.stringify(getDependencyGraph(), null, 2);
}

/**
 * Visualizes dependency graph (console output)
 */
export function visualizeDependencyGraph(): void {
  const graph = getDependencyGraph();
  console.log('Dependency Graph:');
  graph.forEach((node) => {
    console.log(`  ${node.label} (${node.type})`);
    if (node.dependencies.length > 0) {
      console.log(`    depends on: ${node.dependencies.join(', ')}`);
    }
    if (node.dependents.length > 0) {
      console.log(`    used by: ${node.dependents.join(', ')}`);
    }
  });
}

