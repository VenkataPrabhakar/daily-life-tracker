import { useState, useMemo } from 'react';
import { ModuleShell } from '../../components/ModuleShell';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { db } from '../../db/lifeOsDatabase';
import type { CalendarViewMode } from '../../core/types';
import { CalendarHeatmap } from '../../components/charts/CalendarHeatmap';
import { computeDayTotals, getHeatmapYearData } from '../../lib/aggregates';

const VIEWS: { id: CalendarViewMode; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'list', label: 'List' },
];

export function CalendarModule() {
  const [view, setView] = useState<CalendarViewMode>('month');
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const events = useLiveQuery(() => db.calendarEvents.toArray(), []);
  const bills = useLiveQuery(() => db.bills.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);

  const allEvents = useMemo(() => {
    const items = [
      ...(events ?? []).map((e) => ({ date: e.date, title: e.title, type: e.type })),
      ...(bills ?? []).map((b) => ({ date: b.dueDate, title: b.name, type: 'bill' as const })),
      ...(tasks ?? []).filter((t) => t.dueDate).map((t) => ({ date: t.dueDate!, title: t.title, type: 'task' as const })),
    ];
    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, bills, tasks]);

  const monthEvents = allEvents.filter((e) => e.date.startsWith(month));
  const heatmap = logs ? getHeatmapYearData(logs.map((l) => computeDayTotals(l))) : [];

  const addEvent = async () => {
    await db.calendarEvents.put({
      id: crypto.randomUUID(),
      title: 'New Event',
      date: new Date().toISOString().slice(0, 10),
      type: 'custom',
    });
  };

  return (
    <ModuleShell
      title="Calendar"
      subtitle="Month, week, agenda, and list views across your life"
      actions={
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" className={`rounded-xl px-3 py-1 text-sm ${view === v.id ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setView(v.id)}>{v.label}</button>
          ))}
          <button type="button" className="btn-secondary text-sm" onClick={addEvent}>+ Event</button>
        </div>
      }
    >
      {view === 'month' && (
        <div className="space-y-4">
          <input type="month" className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
          <CalendarHeatmap data={heatmap} />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {monthEvents.map((e, i) => (
              <div key={i} className="widget-card text-sm">
                <span className="text-xs text-slate-500">{e.date}</span>
                <p className="font-medium">{e.title}</p>
                <span className="text-xs capitalize text-brand-600">{e.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - d.getDay() + i);
            const key = d.toISOString().slice(0, 10);
            const dayEv = allEvents.filter((e) => e.date === key);
            return (
              <div key={i} className="widget-card min-h-24 p-2">
                <p className="text-xs font-semibold">{d.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                {dayEv.map((e, j) => <p key={j} className="truncate text-[10px]">{e.title}</p>)}
              </div>
            );
          })}
        </div>
      )}
      {view === 'agenda' && (
        <div className="space-y-2">
          {allEvents.slice(0, 30).map((e, i) => (
            <div key={i} className="widget-card flex justify-between text-sm">
              <span>{e.title}</span>
              <span className="text-slate-500">{e.date}</span>
            </div>
          ))}
        </div>
      )}
      {view === 'list' && (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {allEvents.map((e, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span className="capitalize text-slate-500">{e.type}</span>
              <span className="flex-1 px-4">{e.title}</span>
              <span className="text-slate-400">{e.date}</span>
            </div>
          ))}
        </div>
      )}
    </ModuleShell>
  );
}
