import { useEffect, useRef, useState } from 'react';
import { clearAllData, getGoals, importAllData, saveGoals } from '../db/database';
import type { DailyGoals, ExportData, ThemeMode } from '../db/types';
import { DEFAULT_GOALS } from '../db/types';
import { useTheme } from '../context/ThemeContext';
import { clampNumber } from '../lib/dates';
import { ExportPanel } from '../components/export/ExportPanel';

export function SettingsPage() {
  const { mode, setMode } = useTheme();
  const [goals, setGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getGoals().then(setGoals);
  }, []);

  const handleSaveGoals = async () => {
    await saveGoals(goals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      if (!data.logs || !Array.isArray(data.logs)) throw new Error('Invalid backup');
      await importAllData(data);
      setGoals(await getGoals());
      setImportStatus(`Imported ${data.logs.length} days successfully`);
    } catch {
      setImportStatus('Import failed — check the file format');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Delete all logs and reset goals? This cannot be undone.')) {
      await clearAllData();
      setGoals(DEFAULT_GOALS);
      setImportStatus('All data cleared');
    }
  };

  const updateGoal = (key: keyof Omit<DailyGoals, 'id'>, value: number) => {
    setGoals((g) => ({ ...g, [key]: clampNumber(value, 0, 50000) }));
  };

  const themeOptions: { id: ThemeMode; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Goals, appearance, and data management</p>
      </header>

      <section className="widget-card space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                mode === opt.id ? 'bg-brand-600 text-white shadow-md' : 'btn-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="widget-card space-y-4">
        <h2 className="font-semibold">Daily goals</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ['hydrationMl', 'Water (ml)'],
            ['gymMin', 'Gym (minutes)'],
            ['calories', 'Calories'],
            ['workMin', 'Work (minutes)'],
            ['sleepMin', 'Sleep (minutes)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-xs text-slate-500">{label}</span>
              <input
                type="number"
                className="input mt-1"
                min={0}
                value={goals[key]}
                onChange={(e) => updateGoal(key, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
        <button type="button" onClick={handleSaveGoals} className="btn-primary">
          {saved ? 'Saved!' : 'Save goals'}
        </button>
      </section>

      <ExportPanel />

      <section className="widget-card space-y-4">
        <h2 className="font-semibold">Import backup</h2>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = '';
          }}
        />
        {importStatus && <p className="text-sm text-brand-600">{importStatus}</p>}
      </section>

      <section className="widget-card space-y-4 border-red-200 dark:border-red-900/50">
        <h2 className="font-semibold text-red-600">Danger zone</h2>
        <button type="button" onClick={handleClear} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Clear all data
        </button>
      </section>
    </div>
  );
}
