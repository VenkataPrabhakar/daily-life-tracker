import { useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { DynamicFieldForm } from '../components/DynamicFieldForm';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import type { HealthEntry } from '../core/types';
import { toDateKey } from '../lib/dates';
import { SleepTrendChart, MoodTrendChart } from '../components/charts/SleepTrendChart';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { computeDayTotals } from '../lib/aggregates';

export function HealthModule() {
  const { config } = useAppConfig();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [saved, setSaved] = useState(false);
  const logs = useLiveQuery(() => db.logs.toArray(), []);

  const save = async () => {
    const entries: HealthEntry[] = Object.entries(values)
      .filter(([, v]) => v !== '' && v !== undefined)
      .map(([metricId, value]) => ({
        id: crypto.randomUUID(),
        date,
        metricId,
        value,
      }));
    await db.healthEntries.bulkPut(entries);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = logs ? logs.map((l) => computeDayTotals(l)).sort((a, b) => a.date.localeCompare(b.date)) : [];

  return (
    <ModuleShell title="Health" subtitle="Config-driven metrics — customize fields in Settings">
      <div className="flex gap-4">
        <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <button type="button" className="btn-primary" onClick={save}>{saved ? 'Saved!' : 'Save metrics'}</button>
      </div>
      <div className="widget-card">
        <DynamicFieldForm
          fields={config?.healthMetrics ?? []}
          values={values}
          onChange={(id, v) => setValues((prev) => ({ ...prev, [id]: v }))}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SleepTrendChart data={chartData} />
        <MoodTrendChart data={chartData} />
      </div>
    </ModuleShell>
  );
}
