import { useState } from 'react';
import { ModuleShell } from '../../components/ModuleShell';
import { useAppConfig } from '../../context/ConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { GlobalSearch } from '../../components/GlobalSearch';
import { LifeModeSelector } from '../../components/LifeModeSelector';
import { ExportPanel } from '../../components/export/ExportPanel';
import { exportLifeOS } from '../../platform/export/unifiedExport';
import { importLifeOSData, exportLifeOSData, clearAllData } from '../../db/database';
import type { CategoryDefinition, FieldDefinition, ThemeMode, WidgetDefinition } from '../../core/types';

type ConfigSection = 'modules' | 'categories' | 'metrics' | 'widgets' | 'formulas' | 'themes' | 'badges' | 'notifications' | 'charts' | 'profiles' | 'data';

function CategoryEditor({ title, items, module, onSave }: {
  title: string;
  items: CategoryDefinition[];
  module: string;
  onSave: (items: CategoryDefinition[]) => void;
}) {
  const [label, setLabel] = useState('');
  const add = () => {
    if (!label.trim()) return;
    const id = label.toLowerCase().replace(/\s+/g, '-');
    onSave([...items, { id, label: label.trim(), module }]);
    setLabel('');
  };
  return (
    <div className="widget-card space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-1">
        {items.map((c) => (
          <span key={c.id} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
            {c.label}
            <button type="button" className="text-red-500" onClick={() => onSave(items.filter((x) => x.id !== c.id))}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input text-sm" placeholder="New category" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button type="button" className="btn-secondary text-sm" onClick={add}>Add</button>
      </div>
    </div>
  );
}

function MetricEditor({ metrics, onSave }: { metrics: FieldDefinition[]; onSave: (m: FieldDefinition[]) => void }) {
  const [label, setLabel] = useState('');
  const add = () => {
    if (!label.trim()) return;
    onSave([...metrics, { id: label.toLowerCase().replace(/\s+/g, '-'), label: label.trim(), type: 'number' }]);
    setLabel('');
  };
  return (
    <div className="widget-card space-y-2">
      <h3 className="font-semibold">Custom Metrics</h3>
      <div className="flex flex-wrap gap-1">
        {metrics.map((m) => (
          <span key={m.id} className="rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{m.label}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input text-sm" placeholder="Metric name" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button type="button" className="btn-secondary text-sm" onClick={add}>Add</button>
      </div>
    </div>
  );
}

function WidgetEditor({ widgets, onSave }: { widgets: WidgetDefinition[]; onSave: (w: WidgetDefinition[]) => void }) {
  const [label, setLabel] = useState('');
  const add = () => {
    if (!label.trim()) return;
    const id = `custom-${Date.now()}`;
    onSave([...widgets, { id, label: label.trim(), category: 'custom', defaultW: 3, defaultH: 2, userCreated: true }]);
    setLabel('');
  };
  return (
    <div className="widget-card space-y-2">
      <h3 className="font-semibold">Custom Widgets</h3>
      <div className="flex flex-wrap gap-1">
        {widgets.filter((w) => w.userCreated).map((w) => (
          <span key={w.id} className="rounded-lg bg-brand-100 px-2 py-1 text-xs dark:bg-brand-900/30">{w.label}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input text-sm" placeholder="Widget name" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button type="button" className="btn-secondary text-sm" onClick={add}>Create</button>
      </div>
    </div>
  );
}

export function SettingsModule() {
  const { config, updateConfig, refresh } = useAppConfig();
  const { mode, setMode } = useTheme();
  const [section, setSection] = useState<ConfigSection>('modules');
  const [status, setStatus] = useState('');

  if (!config) return null;

  const sections: { id: ConfigSection; label: string }[] = [
    { id: 'modules', label: 'Modules' },
    { id: 'categories', label: 'Categories' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'widgets', label: 'Widgets' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'themes', label: 'Themes' },
    { id: 'badges', label: 'Badges' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'charts', label: 'Charts' },
    { id: 'profiles', label: 'Profiles' },
    { id: 'data', label: 'Data' },
  ];

  const themeOptions: { id: ThemeMode; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const toggleModule = (id: string) => {
    const modules = config.modules.map((m) => m.id === id ? { ...m, enabled: m.enabled === false ? true : false } : m);
    updateConfig({ modules });
  };

  return (
    <ModuleShell title="Settings" subtitle="Customize every aspect of your Life OS">
      <div className="mb-4"><GlobalSearch /></div>
      <LifeModeSelector />

      <div className="mt-4 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button key={s.id} type="button" className={`rounded-xl px-3 py-1 text-sm ${section === s.id ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setSection(s.id)}>{s.label}</button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {section === 'modules' && (
          <div className="widget-card grid gap-2 sm:grid-cols-2">
            {config.modules.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.enabled !== false} onChange={() => toggleModule(m.id)} />
                {m.icon} {m.label}
              </label>
            ))}
          </div>
        )}

        {section === 'categories' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryEditor title="Expense Categories" items={config.expenseCategories} module="expenses" onSave={(items) => updateConfig({ expenseCategories: items })} />
            <CategoryEditor title="Habit Categories" items={config.habitCategories} module="habits" onSave={(items) => updateConfig({ habitCategories: items })} />
            <CategoryEditor title="Goal Categories" items={config.goalCategories} module="goals" onSave={(items) => updateConfig({ goalCategories: items })} />
            <CategoryEditor title="Relationship Categories" items={config.relationshipCategories} module="relationships" onSave={(items) => updateConfig({ relationshipCategories: items })} />
          </div>
        )}

        {section === 'metrics' && (
          <MetricEditor metrics={[...config.healthMetrics, ...config.customMetrics]} onSave={(m) => updateConfig({ customMetrics: m.filter((x) => !config.healthMetrics.some((h) => h.id === x.id)) })} />
        )}

        {section === 'widgets' && <WidgetEditor widgets={config.widgets} onSave={(w) => updateConfig({ widgets: w })} />}

        {section === 'formulas' && (
          <div className="widget-card space-y-2">
            {config.formulas.map((f) => (
              <div key={f.id} className="rounded-lg bg-slate-50 p-2 text-sm dark:bg-slate-800/50">
                <p className="font-medium">{f.label}</p>
                <code className="text-xs text-slate-500">{f.expression}</code>
              </div>
            ))}
          </div>
        )}

        {section === 'themes' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((opt) => (
                <button key={opt.id} type="button" className={`rounded-xl px-4 py-2 text-sm ${mode === opt.id ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setMode(opt.id)}>{opt.label}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {config.themes.map((t) => (
                <button key={t.id} type="button" className={`rounded-xl px-3 py-2 text-sm ${config.activeThemeId === t.id ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => updateConfig({ activeThemeId: t.id })}>{t.label}</button>
              ))}
            </div>
          </div>
        )}

        {section === 'badges' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {config.badges.map((b) => (
              <div key={b.id} className="widget-card text-center">
                <span className="text-2xl">{b.icon}</span>
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-slate-500">{b.description}</p>
              </div>
            ))}
          </div>
        )}

        {section === 'notifications' && (
          <div className="space-y-2">
            {config.notificationRules.map((r) => (
              <label key={r.id} className="widget-card flex items-center gap-3 text-sm">
                <input type="checkbox" checked={r.enabled} onChange={() => updateConfig({ notificationRules: config.notificationRules.map((x) => x.id === r.id ? { ...x, enabled: !x.enabled } : x) })} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        )}

        {section === 'charts' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {config.charts.map((c) => (
              <div key={c.id} className="widget-card">
                <p className="font-medium">{c.label}</p>
                <p className="text-xs capitalize text-slate-500">{c.chartType} · {c.period} · {c.module}</p>
              </div>
            ))}
          </div>
        )}

        {section === 'profiles' && (
          <div className="space-y-2">
            {config.profiles.map((p) => (
              <div key={p.id} className="widget-card flex items-center justify-between">
                <span>{p.name}{p.isDefault ? ' (default)' : ''}</span>
                <button type="button" className="btn-secondary text-xs" onClick={() => updateConfig({ activeProfileId: p.id })}>Activate</button>
              </div>
            ))}
          </div>
        )}

        {section === 'data' && (
          <div className="space-y-4">
            <ExportPanel />
            <div className="flex flex-wrap gap-2">
              {(['json', 'csv', 'excel'] as const).map((fmt) => (
                <button key={fmt} type="button" className="btn-secondary text-sm" onClick={() => exportLifeOS(fmt)}>Export {fmt.toUpperCase()}</button>
              ))}
            </div>
            <label className="btn-secondary cursor-pointer inline-block">
              Import Full Backup
              <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                try { await importLifeOSData(JSON.parse(await file.text())); await refresh(); setStatus('Restored'); }
                catch { setStatus('Import failed'); }
              }} />
            </label>
            <button type="button" className="btn-secondary text-sm" onClick={async () => {
              const data = await exportLifeOSData();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = 'life-os-backup.json'; a.click();
            }}>Download Full Backup</button>
            <button type="button" className="text-sm text-red-600" onClick={async () => {
              if (confirm('Clear all data?')) { await clearAllData(); await refresh(); setStatus('Cleared'); }
            }}>Clear All Data</button>
            {status && <p className="text-sm text-brand-600">{status}</p>}
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
