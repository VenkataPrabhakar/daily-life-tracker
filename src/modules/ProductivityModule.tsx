import { useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import type { Task } from '../core/types';
import { useLiveQuery } from '../hooks/useLiveQuery';

type View = 'list' | 'kanban';

export function ProductivityModule() {
  const { config } = useAppConfig();
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const [view, setView] = useState<View>('list');
  const [title, setTitle] = useState('');

  const addTask = async () => {
    if (!title.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      status: 'todo',
      categoryId: config?.taskCategories[0]?.id ?? 'coding',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      pomodoroCount: 0,
    };
    await db.tasks.put(task);
    setTitle('');
  };

  const moveTask = async (task: Task, status: Task['status']) => {
    await db.tasks.put({ ...task, status });
  };

  const columns: Task['status'][] = ['todo', 'in-progress', 'done'];

  return (
    <ModuleShell
      title="Productivity"
      subtitle="Tasks, deep work, coding, reading, learning & Pomodoro"
      actions={
        <div className="flex gap-2">
          {(['list', 'kanban'] as View[]).map((v) => (
            <button key={v} type="button" className={`rounded-xl px-3 py-1.5 text-sm capitalize ${view === v ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      }
    >
      <div className="widget-card flex gap-2">
        <input className="input max-w-md" placeholder="New task..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="button" className="btn-primary" onClick={addTask}>Add</button>
      </div>
      {view === 'list' ? (
        <div className="space-y-2">
          {tasks?.map((t) => (
            <div key={t.id} className="widget-card flex items-center justify-between text-sm">
              <span>{t.title}</span>
              <select className="input w-auto text-xs" value={t.status} onChange={(e) => moveTask(t, e.target.value as Task['status'])}>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col} className="widget-card min-h-[200px]">
              <h3 className="mb-3 text-sm font-semibold capitalize">{col.replace('-', ' ')}</h3>
              <div className="space-y-2">
                {tasks?.filter((t) => t.status === col).map((t) => (
                  <div key={t.id} className="rounded-lg border p-2 text-sm dark:border-slate-700">{t.title}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleShell>
  );
}
