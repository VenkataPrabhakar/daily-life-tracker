import type { ModuleDefinition, WidgetDefinition } from '../../core/types';

export type PluginManifest = {
  id: string;
  name: string;
  version: string;
  modules?: ModuleDefinition[];
  widgets?: WidgetDefinition[];
  onRegister?: () => void;
};

const registry = new Map<string, PluginManifest>();

export function registerPlugin(manifest: PluginManifest) {
  registry.set(manifest.id, manifest);
  manifest.onRegister?.();
}

export function getPlugins(): PluginManifest[] {
  return [...registry.values()];
}

export function getPluginModules(): ModuleDefinition[] {
  return getPlugins().flatMap((p) => p.modules ?? []);
}

export function getPluginWidgets(): WidgetDefinition[] {
  return getPlugins().flatMap((p) => p.widgets ?? []);
}

/** Merge plugin-provided modules/widgets into app config at runtime. */
export function mergePluginConfig<T extends { modules: ModuleDefinition[]; widgets: WidgetDefinition[] }>(config: T): T {
  const pluginModules = getPluginModules();
  const pluginWidgets = getPluginWidgets();
  if (!pluginModules.length && !pluginWidgets.length) return config;
  return {
    ...config,
    modules: [...config.modules, ...pluginModules.filter((m) => !config.modules.some((x) => x.id === m.id))],
    widgets: [...config.widgets, ...pluginWidgets.filter((w) => !config.widgets.some((x) => x.id === w.id))],
  };
}
