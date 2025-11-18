/**
 * Signal Plugins
 * Plugin system for extensibility
 */

import type { Signal } from './signal';

export interface PulsePlugin {
  name: string;
  version?: string;
  install: (api: PulsePluginAPI) => void;
  uninstall?: () => void;
}

export interface PulsePluginAPI {
  signal: {
    beforeCreate?: <T>(initialValue: T, options?: any) => void;
    afterCreate?: <T>(sig: Signal<T>) => void;
    beforeSet?: <T>(sig: Signal<T>, value: T) => boolean | void;
    afterSet?: <T>(sig: Signal<T>, value: T) => void;
  };
  computed: {
    beforeCreate?: <T>(fn: () => T) => void;
    afterCreate?: <T>(computed: Signal<T>) => void;
  };
  effect: {
    beforeCreate?: (fn: () => void | (() => void)) => void;
    afterCreate?: (cleanup: () => void) => void;
  };
}

const plugins: PulsePlugin[] = [];
const pluginAPI: PulsePluginAPI = {
  signal: {},
  computed: {},
  effect: {},
};

/**
 * Registers a plugin
 */
export function usePlugin(plugin: PulsePlugin): void {
  if (plugins.find((p) => p.name === plugin.name)) {
    console.warn(`Plugin ${plugin.name} is already registered`);
    return;
  }
  plugins.push(plugin);
  plugin.install(pluginAPI);
}

/**
 * Unregisters a plugin
 */
export function unusePlugin(pluginName: string): void {
  const index = plugins.findIndex((p) => p.name === pluginName);
  if (index !== -1) {
    const plugin = plugins[index];
    if (plugin.uninstall) {
      plugin.uninstall();
    }
    plugins.splice(index, 1);
  }
}

/**
 * Gets all registered plugins
 */
export function getPlugins(): PulsePlugin[] {
  return [...plugins];
}

/**
 * Gets plugin API (for internal use)
 */
export function getPluginAPI(): PulsePluginAPI {
  return pluginAPI;
}

