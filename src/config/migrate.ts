import type { AppConfig, CategoryDefinition, JournalTemplate, ModuleDefinition } from '../core/types';
import { createDefaultConfig } from './defaults/index';
import { createExtendedConfigFields } from './defaults/extensions';
import { buildExpenseCategories, FINANCE_TAGS, ASSET_TYPES } from './defaults/financeCategories';
import { JOURNAL_TEMPLATES, JOURNAL_PROMPTS, DEFAULT_JOURNAL_REMINDERS } from './defaults/journalDefaults';

function mergeJournalTemplates(stored: JournalTemplate[], defaults: JournalTemplate[]): JournalTemplate[] {
  const byId = new Map(stored.map((t) => [t.id, t]));
  for (const t of defaults) {
    if (!byId.has(t.id)) byId.set(t.id, t);
    else {
      const existing = byId.get(t.id)!;
      byId.set(t.id, { ...t, ...existing, prompts: existing.userCreated ? existing.prompts : t.prompts });
    }
  }
  return [...byId.values()];
}

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
    journalTemplates: mergeJournalTemplates(stored.journalTemplates ?? [], JOURNAL_TEMPLATES),
    journalPrompts: stored.journalPrompts?.length ? stored.journalPrompts : JOURNAL_PROMPTS,
    journalReminders: stored.journalReminders?.length ? stored.journalReminders : DEFAULT_JOURNAL_REMINDERS,
    version: 5,
  } as AppConfig;
}
