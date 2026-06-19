import { useMemo, useState } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { entriesByDate } from '../../platform/journal/journalUtils';
import type { JournalEntry } from '../../core/types';
import { toDateKey } from '../../lib/dates';

type Props = {
  entries: JournalEntry[];
  onSelectDate?: (date: string) => void;
};

export function JournalCalendar({ entries, onSelectDate }: Props) {
  const [month, setMonth] = useState(new Date());
  const byDate = useMemo(() => entriesByDate(entries), [entries]);

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startPad = startOfMonth(month).getDay();

  return (
    <div className="widget-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Calendar</h3>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>←</button>
          <span className="text-sm font-medium">{format(month, 'MMMM yyyy')}</span>
          <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>→</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((d) => {
          const key = toDateKey(d);
          const count = byDate.get(key)?.length ?? 0;
          const inMonth = isSameMonth(d, month);
          return (
            <button
              key={key}
              type="button"
              disabled={!inMonth}
              onClick={() => onSelectDate?.(key)}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-xs transition-colors ${
                count > 0 ? 'bg-brand-500/15 font-semibold text-brand-700 dark:text-brand-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {format(d, 'd')}
              {count > 0 && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function JournalTimeline({ entries }: { entries: JournalEntry[] }) {
  const sorted = [...entries].sort((a, b) => `${b.date}${b.time ?? ''}`.localeCompare(`${a.date}${a.time ?? ''}`));
  const grouped = useMemo(() => {
    const g = new Map<string, JournalEntry[]>();
    for (const e of sorted) {
      const list = g.get(e.date) ?? [];
      list.push(e);
      g.set(e.date, list);
    }
    return [...g.entries()];
  }, [sorted]);

  return (
    <div className="space-y-4">
      {grouped.length === 0 && <p className="text-sm text-slate-400">No entries yet — pick a journal type to begin</p>}
      {grouped.map(([date, items]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {format(parseISO(date), 'EEEE, MMM d')}
          </p>
          <div className="space-y-2 border-l-2 border-brand-500/30 pl-4">
            {items.map((e) => (
              <div key={e.id} className="widget-card py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {e.time && <span>{e.time}</span>}
                  {e.mood && <span>Mood {e.mood}/5</span>}
                  {e.tags?.map((t) => <span key={t} className="rounded-full bg-brand-500/10 px-2 py-0.5 text-brand-600">#{t}</span>)}
                </div>
                <p className="mt-1 text-sm">{Object.values(e.responses).filter(Boolean).join(' · ').slice(0, 200)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
