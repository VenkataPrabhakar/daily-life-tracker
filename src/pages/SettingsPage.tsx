import { useEffect, useRef, useState } from 'react';
import { clearAllData, exportAllData, getGoals, importAllData, saveGoals } from '../db/database';
import type { DailyGoals, ExportData } from '../db/types';
import { DEFAULT_GOALS } from '../db/types';
import { useTheme } from '../context/ThemeContext';
import { clampNumber } from '../lib/dates';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
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

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-life-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      if (!data.logs || !Array.isArray(data.logs)) {
        throw new Error('Invalid backup file');
      }
      await importAllData(data);
      const updatedGoals = await getGoals();
      setGoals(updatedGoals);
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Goals, theme, and data backup</p>
      </header>

      <section className="card space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`rounded-lg px-4 py-2 text-sm ${theme === 'light' ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`rounded-lg px-4 py-2 text-sm ${theme === 'dark' ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
          >
            Dark
          </button>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Daily goals</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-500">Water (ml)</span>
            <input type="number" className="input mt-1" min={0} value={goals.hydrationMl} onChange={(e) => updateGoal('hydrationMl', Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Gym (minutes)</span>
            <input type="number" className="input mt-1" min={0} value={goals.gymMin} onChange={(e) => updateGoal('gymMin', Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Calories</span>
            <input type="number" className="input mt-1" min={0} value={goals.calories} onChange={(e) => updateGoal('calories', Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Work (minutes)</span>
            <input type="number" className="input mt-1" min={0} value={goals.workMin} onChange={(e) => updateGoal('workMin', Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Sleep (minutes)</span>
            <input type="number" className="input mt-1" min={0} value={goals.sleepMin} onChange={(e) => updateGoal('sleepMin', Number(e.target.value))} />
          </label>
        </div>
        <button type="button" onClick={handleSaveGoals} className="btn-primary">
          {saved ? 'Saved!' : 'Save goals'}
        </button>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Data backup</h2>
        <p className="text-sm text-slate-500">Export your data as JSON for backup or future cloud sync.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleExport} className="btn-primary">Export JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">Import JSON</button>
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
        </div>
        {importStatus && <p className="text-sm text-brand-600">{importStatus}</p>}
      </section>

      <section className="card space-y-4 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-600">Danger zone</h2>
        <button type="button" onClick={handleClear} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Clear all data
        </button>
      </section>
    </div>
  );
}
