import { useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import type { Goal, GoalType } from '../core/types';
import { useLiveQuery } from '../hooks/useLiveQuery';

export function GoalsModule() {
  const { config } = useAppConfig();
  const goals = useLiveQuery(() => db.goalItems.filter((g) => g.active).toArray(), []);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('monthly');
  const [target, setTarget] = useState(100);

  const addGoal = async () => {
    if (!title.trim()) return;
    await db.goalItems.put({
      id: crypto.randomUUID(),
      title: title.trim(),
      type,
      categoryId: config?.goalCategories[0]?.id ?? 'personal',
      targetValue: target,
      currentValue: 0,
      priority: 'medium',
      active: true,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
  };

  const updateProgress = async (goal: Goal, delta: number) => {
    await db.goalItems.put({ ...goal, currentValue: Math.max(0, goal.currentValue + delta) });
  };

  return (
    <ModuleShell title="Goals" subtitle="Daily, weekly, monthly, yearly, milestone & streak goals">
      <div className="widget-card flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value as GoalType)}>
          {(['daily', 'weekly', 'monthly', 'yearly', 'one-time', 'recurring', 'milestone', 'streak'] as GoalType[]).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input type="number" className="input w-24" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
        <button type="button" className="btn-primary" onClick={addGoal}>Add Goal</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {goals?.map((g) => {
          const pct = g.targetValue ? Math.round((g.currentValue / g.targetValue) * 100) : 0;
          return (
            <div key={g.id} className="widget-card">
              <div className="mb-2 flex justify-between"><span className="font-semibold">{g.title}</span><span className="text-xs text-slate-500">{g.type}</span></div>
              <div className="mb-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.min(100, pct)}%` }} /></div>
              <p className="text-sm">{g.currentValue} / {g.targetValue} ({pct}%)</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => updateProgress(g, 1)}>+1</button>
                <button type="button" className="btn-secondary text-xs" onClick={() => updateProgress(g, 10)}>+10</button>
              </div>
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
}
