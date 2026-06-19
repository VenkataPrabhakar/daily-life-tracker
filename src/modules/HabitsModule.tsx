import { useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import type { Habit, HabitLog } from '../core/types';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { toDateKey } from '../lib/dates';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { computeDayTotals, getHeatmapYearData } from '../lib/aggregates';

function computeStreak(habitId: string, logs: HabitLog[]): number {
  const dates = logs.filter((l) => l.habitId === habitId && l.completed).map((l) => l.date).sort().reverse();
  let streak = 0;
  const today = toDateKey(new Date());
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(); expected.setDate(expected.getDate() - i);
    if (dates[i] === toDateKey(expected) || (i === 0 && dates[0] === today)) streak++;
    else break;
  }
  return streak;
}

export function HabitsModule() {
  const { config } = useAppConfig();
  const habits = useLiveQuery(() => db.habits.filter((h) => h.active).toArray(), []);
  const habitLogs = useLiveQuery(() => db.habitLogs.toArray(), []);
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('fitness');
  const today = toDateKey(new Date());

  const addHabit = async () => {
    if (!name.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      categoryId,
      frequency: 'daily',
      priority: 'medium',
      active: true,
      createdAt: new Date().toISOString(),
      suggestion: 'If sleep < 6 hours, suggest light workout.',
    };
    await db.habits.put(habit);
    setName('');
  };

  const toggleToday = async (habitId: string) => {
    const existing = habitLogs?.find((l) => l.habitId === habitId && l.date === today);
    if (existing) await db.habitLogs.put({ ...existing, completed: !existing.completed });
    else await db.habitLogs.put({ id: crypto.randomUUID(), habitId, date: today, completed: true });
  };

  const heatmap = logs && habitLogs ? getHeatmapYearData(logs.map((l) => computeDayTotals(l))) : [];

  return (
    <ModuleShell title="Habits" subtitle="Daily, weekly, streak & milestone habits with heatmap">
      <div className="widget-card flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="New habit" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {config?.habitCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button type="button" className="btn-primary" onClick={addHabit}>Add</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {habits?.map((h) => {
          const done = habitLogs?.some((l) => l.habitId === h.id && l.date === today && l.completed);
          const streak = computeStreak(h.id, habitLogs ?? []);
          return (
            <div key={h.id} className="widget-card flex items-center justify-between">
              <div>
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs text-slate-500">🔥 {streak} day streak · {h.frequency}</p>
              </div>
              <button type="button" onClick={() => toggleToday(h.id)} className={`rounded-xl px-3 py-1 text-sm ${done ? 'bg-emerald-500 text-white' : 'btn-secondary'}`}>
                {done ? 'Done' : 'Mark'}
              </button>
            </div>
          );
        })}
      </div>
      <CalendarHeatmap data={heatmap} title="Activity Heatmap" />
    </ModuleShell>
  );
}
