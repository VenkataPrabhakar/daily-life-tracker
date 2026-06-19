import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { getAllLogs } from '../db/database';
import type { DailyLog } from '../db/types';
import { computeDayTotals } from '../lib/aggregates';
import { toDateKey } from '../lib/dates';

export function HistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const logMap = useMemo(() => new Map(logs.map((l) => [l.date, l])), [logs]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const monthStart = startOfMonth(currentMonth);
  const startPad = monthStart.getDay();

  if (loading) {
    return <p className="text-center text-slate-500">Loading history...</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-slate-500">Browse and revisit past days</p>
      </header>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
        >
          ← Prev
        </button>
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
        >
          Next →
        </button>
      </div>

      <div className="card">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const key = toDateKey(day);
            const log = logMap.get(key);
            const hasEntries = (log?.entries.length ?? 0) > 0;
            const totals = log ? computeDayTotals(log) : null;
            const isToday = key === toDateKey(new Date());

            return (
              <Link
                key={key}
                to={`/?date=${key}`}
                className={`flex min-h-[72px] flex-col rounded-lg border p-2 text-left transition hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 ${
                  isToday
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                    : 'border-slate-100 dark:border-slate-800'
                } ${!isSameMonth(day, currentMonth) ? 'opacity-40' : ''}`}
              >
                <span className="text-sm font-medium">{format(day, 'd')}</span>
                {hasEntries && totals ? (
                  <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                    {totals.hydrationMl > 0 && <span>💧</span>}
                    {totals.gymMin > 0 && <span>🏋️</span>}
                    {totals.dietCalories > 0 && <span>🍽️</span>}
                    {totals.workMin > 0 && <span>💼</span>}
                    {totals.sleepMin > 0 && <span>😴</span>}
                  </div>
                ) : (
                  <span className="mt-1 text-[10px] text-slate-300">—</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-500">Recent days with entries</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">No history yet. Start logging on the Today page!</p>
        ) : (
          [...logs]
            .reverse()
            .slice(0, 10)
            .map((log) => {
              const totals = computeDayTotals(log);
              return (
                <Link
                  key={log.date}
                  to={`/?date=${log.date}`}
                  className="card flex items-center justify-between transition hover:border-brand-400"
                >
                  <span className="font-medium">{format(parseISO(log.date), 'EEE, MMM d')}</span>
                  <span className="text-xs text-slate-500">
                    {log.entries.length} entries · {totals.hydrationMl > 0 ? '💧' : ''}{totals.gymMin > 0 ? '🏋️' : ''}{totals.dietCalories > 0 ? '🍽️' : ''}
                  </span>
                </Link>
              );
            })
        )}
      </div>
    </div>
  );
}
