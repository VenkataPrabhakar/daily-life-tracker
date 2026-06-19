import { useState } from 'react';
import { ModuleShell } from '../../components/ModuleShell';
import { useAppConfig } from '../../context/ConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { GlobalSearch } from '../../components/GlobalSearch';
import { LifeModeSelector } from '../../components/LifeModeSelector';
import { ExportPanel } from '../../components/export/ExportPanel';
import { exportLifeOS } from '../../platform/export/unifiedExport';
import { importLifeOSData, exportLifeOSData, clearAllData } from '../../db/database';
import type { CategoryDefinition, FieldDefinition, ThemeMode, WidgetDefinition, FormulaDefinition, BadgeDefinition, NotificationRule, LifeRuleDefinition, UnitDefinition, JournalTemplate, Profile, ThemeDefinition } from '../../core/types';

type ConfigSection = 'modules' | 'categories' | 'metrics' | 'widgets' | 'formulas' | 'themes' | 'badges' | 'notifications' | 'rules' | 'units' | 'charts' | 'journal' | 'profiles' | 'data';

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

function FormulaEditor({ formulas, onSave }: { formulas: FormulaDefinition[]; onSave: (f: FormulaDefinition[]) => void }) {
  const [label, setLabel] = useState('');
  const [expr, setExpr] = useState('');
  const add = () => {
    if (!label.trim() || !expr.trim()) return;
    onSave([...formulas, { id: `f-${Date.now()}`, label: label.trim(), expression: expr.trim(), module: 'custom' }]);
    setLabel(''); setExpr('');
  };
  return (
    <div className="widget-card space-y-3">
      {formulas.map((f) => (
        <div key={f.id} className="flex items-start justify-between rounded-lg bg-slate-50 p-2 text-sm dark:bg-slate-800/50">
          <div><p className="font-medium">{f.label}</p><code className="text-xs text-slate-500">{f.expression}</code></div>
          <button type="button" className="text-red-500" onClick={() => onSave(formulas.filter((x) => x.id !== f.id))}>×</button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <input className="input text-sm" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className="input flex-1 text-sm" placeholder="Expression (e.g. sleep + water / 100)" value={expr} onChange={(e) => setExpr(e.target.value)} />
        <button type="button" className="btn-secondary text-sm" onClick={add}>Add</button>
      </div>
    </div>
  );
}

function BadgeEditor({ badges, onSave }: { badges: BadgeDefinition[]; onSave: (b: BadgeDefinition[]) => void }) {
  const [title, setTitle] = useState('');
  const add = () => {
    if (!title.trim()) return;
    onSave([...badges, { id: `b-${Date.now()}`, title: title.trim(), description: 'Custom badge', icon: '🏅', criteriaType: 'manual', criteriaRef: 'manual', target: 1 }]);
    setTitle('');
  };
  return (
    <div className="widget-card space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {badges.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border p-3 text-center">
            <div><span className="text-2xl">{b.icon}</span><p className="font-semibold">{b.title}</p></div>
            <button type="button" className="text-red-500" onClick={() => onSave(badges.filter((x) => x.id !== b.id))}>×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2"><input className="input text-sm" placeholder="Badge title" value={title} onChange={(e) => setTitle(e.target.value)} /><button type="button" className="btn-secondary text-sm" onClick={add}>Add</button></div>
    </div>
  );
}

function RuleEditor({ title, items, onSave, type }: { title: string; items: NotificationRule[] | LifeRuleDefinition[]; onSave: (items: never[]) => void; type: 'notification' | 'life' }) {
  const [label, setLabel] = useState('');
  const add = () => {
    if (!label.trim()) return;
    if (type === 'notification') {
      onSave([...items as NotificationRule[], { id: `r-${Date.now()}`, label: label.trim(), trigger: 'custom', message: label.trim(), enabled: true }] as never[]);
    } else {
      onSave([...items as LifeRuleDefinition[], { id: `lr-${Date.now()}`, label: label.trim(), condition: 'sleep < 360', action: 'Custom action', module: 'health', enabled: true }] as never[]);
    }
    setLabel('');
  };
  return (
    <div className="widget-card space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {items.map((r) => (
        <label key={r.id} className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={'enabled' in r ? r.enabled : false} onChange={() => onSave(items.map((x) => x.id === r.id ? { ...x, enabled: !('enabled' in x ? x.enabled : false) } : x) as never[])} />
          <span>{r.label}</span>
          <button type="button" className="ml-auto text-red-500" onClick={() => onSave(items.filter((x) => x.id !== r.id) as never[])}>×</button>
        </label>
      ))}
      <div className="flex gap-2"><input className="input text-sm" placeholder="New rule" value={label} onChange={(e) => setLabel(e.target.value)} /><button type="button" className="btn-secondary text-sm" onClick={add}>Add</button></div>
    </div>
  );
}

function UnitEditor({ units, onSave }: { units: UnitDefinition[]; onSave: (u: UnitDefinition[]) => void }) {
  const [label, setLabel] = useState('');
  const [symbol, setSymbol] = useState('');
  const add = () => {
    if (!label.trim()) return;
    onSave([...units, { id: label.toLowerCase(), label: label.trim(), symbol: symbol || label.slice(0, 3), category: 'general' }]);
    setLabel(''); setSymbol('');
  };
  return (
    <div className="widget-card space-y-2">
      <div className="flex flex-wrap gap-1">{units.map((u) => (
        <span key={u.id} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{u.label} ({u.symbol})<button type="button" className="text-red-500" onClick={() => onSave(units.filter((x) => x.id !== u.id))}>×</button></span>
      ))}</div>
      <div className="flex gap-2"><input className="input text-sm" placeholder="Unit name" value={label} onChange={(e) => setLabel(e.target.value)} /><input className="input w-20 text-sm" placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} /><button type="button" className="btn-secondary text-sm" onClick={add}>Add</button></div>
    </div>
  );
}

function JournalTemplateEditor({ templates, onSave }: { templates: JournalTemplate[]; onSave: (t: JournalTemplate[]) => void }) {
  const [label, setLabel] = useState('');
  const add = () => {
    if (!label.trim()) return;
    onSave([...templates, { id: `j-${Date.now()}`, label: label.trim(), icon: '📝', userCreated: true, prompts: [{ id: 'content', label: 'Write', placeholder: 'Start writing...' }] }]);
    setLabel('');
  };
  return (
    <div className="widget-card space-y-2">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between text-sm"><span>{t.icon} {t.label}</span><button type="button" className="text-red-500" onClick={() => onSave(templates.filter((x) => x.id !== t.id))}>×</button></div>
      ))}
      <div className="flex gap-2"><input className="input text-sm" placeholder="Template name" value={label} onChange={(e) => setLabel(e.target.value)} /><button type="button" className="btn-secondary text-sm" onClick={add}>Add</button></div>
    </div>
  );
}

function ProfileEditor({ profiles, activeId, onSave, onActivate }: { profiles: Profile[]; activeId: string; onSave: (p: Profile[]) => void; onActivate: (id: string) => void }) {
  const [name, setName] = useState('');
  const add = () => {
    if (!name.trim()) return;
    onSave([...profiles, { id: crypto.randomUUID(), name: name.trim(), isDefault: false, createdAt: new Date().toISOString() }]);
    setName('');
  };
  return (
    <div className="widget-card space-y-2">
      {profiles.map((p) => (
        <div key={p.id} className="flex items-center justify-between text-sm">
          <span>{p.name}{p.isDefault ? ' (default)' : ''}{activeId === p.id ? ' · active' : ''}</span>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary text-xs" onClick={() => onActivate(p.id)}>Activate</button>
            {!p.isDefault && <button type="button" className="text-red-500 text-xs" onClick={() => onSave(profiles.filter((x) => x.id !== p.id))}>×</button>}
          </div>
        </div>
      ))}
      <div className="flex gap-2"><input className="input text-sm" placeholder="Profile name" value={name} onChange={(e) => setName(e.target.value)} /><button type="button" className="btn-secondary text-sm" onClick={add}>Add</button></div>
    </div>
  );
}

function ThemeEditor({ themes, activeId, onSave, onActivate, mode, setMode, themeOptions }: {
  themes: ThemeDefinition[]; activeId: string; onSave: (t: ThemeDefinition[]) => void; onActivate: (id: string) => void;
  mode: ThemeMode; setMode: (m: ThemeMode) => void; themeOptions: { id: ThemeMode; label: string }[];
}) {
  const [label, setLabel] = useState('');
  const add = () => {
    if (!label.trim()) return;
    onSave([...themes, { id: `t-${Date.now()}`, label: label.trim(), mode: 'light', brandHue: 220, accentHue: 160 }]);
    setLabel('');
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{themeOptions.map((opt) => (
        <button key={opt.id} type="button" className={`rounded-xl px-4 py-2 text-sm ${mode === opt.id ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setMode(opt.id)}>{opt.label}</button>
      ))}</div>
      <div className="flex flex-wrap gap-2">{themes.map((t) => (
        <button key={t.id} type="button" className={`rounded-xl px-3 py-2 text-sm ${activeId === t.id ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => onActivate(t.id)}>{t.label}{!t.isBuiltIn && <span className="ml-1 text-red-400" onClick={(e) => { e.stopPropagation(); onSave(themes.filter((x) => x.id !== t.id)); }}>×</span>}</button>
      ))}</div>
      <div className="flex gap-2"><input className="input text-sm" placeholder="Custom theme name" value={label} onChange={(e) => setLabel(e.target.value)} /><button type="button" className="btn-secondary text-sm" onClick={add}>Add Theme</button></div>
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
    { id: 'rules', label: 'Rules' },
    { id: 'units', label: 'Units' },
    { id: 'charts', label: 'Charts' },
    { id: 'journal', label: 'Journal' },
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
            <CategoryEditor title="Income Sources" items={config.incomeSources} module="income" onSave={(items) => updateConfig({ incomeSources: items })} />
            <CategoryEditor title="Finance Tags" items={config.financeTags.map((t) => ({ id: t.id, label: t.label, module: 'finance' }))} module="finance" onSave={(items) => updateConfig({ financeTags: items.map((i) => ({ id: i.id, label: i.label })) })} />
            <CategoryEditor title="Asset Types" items={config.assetTypes} module="assets" onSave={(items) => updateConfig({ assetTypes: items })} />
            <CategoryEditor title="Habit Categories" items={config.habitCategories} module="habits" onSave={(items) => updateConfig({ habitCategories: items })} />
            <CategoryEditor title="Goal Categories" items={config.goalCategories} module="goals" onSave={(items) => updateConfig({ goalCategories: items })} />
          </div>
        )}

        {section === 'metrics' && (
          <MetricEditor metrics={[...config.healthMetrics, ...config.customMetrics]} onSave={(m) => updateConfig({ customMetrics: m.filter((x) => !config.healthMetrics.some((h) => h.id === x.id)) })} />
        )}

        {section === 'widgets' && <WidgetEditor widgets={config.widgets} onSave={(w) => updateConfig({ widgets: w })} />}

        {section === 'formulas' && (
          <FormulaEditor formulas={config.formulas} onSave={(formulas) => updateConfig({ formulas })} />
        )}

        {section === 'themes' && (
          <ThemeEditor themes={config.themes} activeId={config.activeThemeId} onSave={(themes) => updateConfig({ themes })} onActivate={(id) => updateConfig({ activeThemeId: id })} mode={mode} setMode={setMode} themeOptions={themeOptions} />
        )}

        {section === 'badges' && (
          <BadgeEditor badges={config.badges} onSave={(badges) => updateConfig({ badges })} />
        )}

        {section === 'notifications' && (
          <RuleEditor title="Notification Rules" items={config.notificationRules} onSave={(notificationRules) => updateConfig({ notificationRules })} type="notification" />
        )}

        {section === 'rules' && (
          <RuleEditor title="Life Rules" items={config.lifeRules} onSave={(lifeRules) => updateConfig({ lifeRules })} type="life" />
        )}

        {section === 'units' && (
          <UnitEditor units={config.units} onSave={(units) => updateConfig({ units })} />
        )}

        {section === 'journal' && (
          <JournalTemplateEditor templates={config.journalTemplates} onSave={(journalTemplates) => updateConfig({ journalTemplates })} />
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
          <ProfileEditor profiles={config.profiles} activeId={config.activeProfileId} onSave={(profiles) => updateConfig({ profiles })} onActivate={(id) => updateConfig({ activeProfileId: id })} />
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
