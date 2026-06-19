import type { AppConfig, CategoryDefinition, ModuleDefinition } from '../core/types';
import { createDefaultConfig } from './defaults/index';
import { createExtendedConfigFields } from './defaults/extensions';
import { buildExpenseCategories, FINANCE_TAGS, ASSET_TYPES } from './defaults/financeCategories';

function mergeCategories(stored: CategoryDefinition[], defaults: CategoryDefinition[]): CategoryDefinition[] {
  const ids = new Set(stored.map((c) => c.id));
  return [...stored, ...defaults.filter((c) => !ids.has(c.id))];
}

function mergeModules(stored: ModuleDefinition[], defaults: ModuleDefinition[]): ModuleDefinition[] {
  const withoutFinance = stored.filter((m) => m.group !== 'finance');
  const financeFromDefaults = defaults.filter((m) => m.group === 'finance');
  const existingIds = new Set(withoutFinance.map((m) => m.id));
  const newFromDefaults = defaults.filter((m) => m.group !== 'finance' && !existingIds.has(m.id));
  return [...withoutFinance, ...newFromDefaults, ...financeFromDefaults];
}

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
    modules: stored.modules?.length ? mergeModules(stored.modules, defaults.modules) : defaults.modules,
    widgets: stored.widgets?.length ? stored.widgets : defaults.widgets,
    dashboards: stored.dashboards?.length ? stored.dashboards : defaults.dashboards,
    expenseCategories: mergeCategories(stored.expenseCategories ?? [], buildExpenseCategories()),
    incomeSources: mergeCategories(stored.incomeSources ?? [], defaults.incomeSources),
    financeTags: stored.financeTags?.length ? stored.financeTags : FINANCE_TAGS,
    assetTypes: stored.assetTypes?.length ? stored.assetTypes : ASSET_TYPES,
    budgetMode: stored.budgetMode ?? defaults.budgetMode,
    version: 4,
  } as AppConfig;
}
