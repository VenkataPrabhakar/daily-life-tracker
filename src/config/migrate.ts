import type { AppConfig } from '../core/types';
import { createDefaultConfig } from './defaults/index';
import { createExtendedConfigFields } from './defaults/extensions';

/** Merge stored config with defaults so new platform fields always exist. */
export function migrateConfig(stored: Partial<AppConfig> | undefined): AppConfig {
  const defaults = createDefaultConfig();
  if (!stored) return defaults;

  const ext = createExtendedConfigFields();
  return {
    ...defaults,
    ...stored,
    ...Object.fromEntries(
      (Object.keys(ext) as (keyof typeof ext)[]).map((key) => [
        key,
        stored[key] !== undefined && (Array.isArray(stored[key]) ? (stored[key] as unknown[]).length > 0 : true)
          ? stored[key]
          : ext[key],
      ]),
    ),
    modules: stored.modules?.length ? stored.modules : defaults.modules,
    widgets: stored.widgets?.length ? stored.widgets : defaults.widgets,
    dashboards: stored.dashboards?.length ? stored.dashboards : defaults.dashboards,
    version: 2,
  } as AppConfig;
}
