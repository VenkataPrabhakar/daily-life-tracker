import { useState, useMemo } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { DynamicFieldForm } from '../components/DynamicFieldForm';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import { toDateKey } from '../lib/dates';
import { SleepTrendChart, MoodTrendChart } from '../components/charts/SleepTrendChart';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { computeDayTotals } from '../lib/aggregates';
import { evaluateLifeRules } from '../platform/rules/engine';
import type { ReportPeriod } from '../core/types';

export function HealthModule() {
  const { config } = useAppConfig();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [saved, setSaved] = useState(false);
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const healthEntries = useLiveQuery(() => db.healthEntries.where('date').equals(date).toArray(), [date]);

  const allMetrics = useMemo(
    () => [...(config?.healthMetrics ?? []), ...(config?.customMetrics ?? [])],
    [config],
  );

  const save = async () => {
    const entries = Object.entries(values)
      .filter(([, v]) => v !== '' && v !== undefined)
      .map(([metricId, value]) => ({ id: crypto.randomUUID(), date, metricId, value }));
    await db.healthEntries.bulkPut(entries);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = logs ? logs.map((l) => computeDayTotals(l)).sort((a, b) => a.date.localeCompare(b.date)) : [];
  const suggestions = config ? evaluateLifeRules(config, {
    sleep: Number(values.sleep ?? healthEntries?.find((e) => e.metricId === 'sleep')?.value ?? chartData.at(-1)?.sleepMin ?? 480),
    stress: Number(values.stress ?? 2),
    mood: Number(values.mood ?? 3),
  }) : [];

  return (
    <ModuleShell title="Health" subtitle="Fully configurable metrics — add fields and units in Settings">
      <div className="flex flex-wrap gap-2">
        <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        {(['week', 'month', 'year'] as ReportPeriod[]).map((p) => (
          <button key={p} type="button" className={`rounded-xl px-3 py-1 text-sm capitalize ${period === p ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
        <button type="button" className="btn-primary" onClick={save}>{saved ? 'Saved!' : 'Save'}</button>
      </div>
      {suggestions.length > 0 && (
        <div className="widget-card border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10">
          <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">Smart suggestions</p>
          {suggestions.map((s) => <p key={s.ruleId} className="text-sm">{s.action}</p>)}
        </div>
      )}
      <div className="widget-card">
        <DynamicFieldForm fields={allMetrics} values={values} onChange={(id, v) => setValues((prev) => ({ ...prev, [id]: v }))} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SleepTrendChart data={chartData} />
        <MoodTrendChart data={chartData} />
      </div>
    </ModuleShell>
  );
}
