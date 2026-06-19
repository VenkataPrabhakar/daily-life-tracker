import { useEffect, useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { db } from '../db/lifeOsDatabase';
import { ModuleShell } from '../components/ModuleShell';
import { InsightsPanel } from '../components/widgets/InsightsPanel';
import { generateInsights } from '../lib/insights';
import { computeDayTotals, getHeatmapYearData } from '../lib/aggregates';
import { getGoals } from '../db/database';
import { useAppConfig } from '../context/ConfigContext';
import type { DailyGoals, ReportPeriod } from '../core/types';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { WeeklyCompletionChart } from '../components/charts/WeeklyCompletionChart';
import { computeCorrelations, computeTrend, filterByPeriod } from '../platform/analytics/trends';
import { evaluateNotificationRules } from '../platform/rules/engine';

export function AnalyticsModule() {
  const { config } = useAppConfig();
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>('month');
  useEffect(() => { getGoals().then(setGoals); }, []);

  const allTotals = logs && goals ? logs.map((l) => computeDayTotals(l, goals)).sort((a, b) => a.date.localeCompare(b.date)) : [];
  const dayTotals = filterByPeriod(allTotals, period);
  const correlations = computeCorrelations(dayTotals);
  const sleepTrend = computeTrend(dayTotals, 'sleepMin');
  const completionTrend = computeTrend(dayTotals, 'completionPercent');

  const expenseByMonth = transactions?.filter((t) => t.type === 'expense') ?? [];
  const incomeByMonth = transactions?.filter((t) => t.type === 'income') ?? [];

  return (
    <ModuleShell
      title="Analytics"
      subtitle="Weekly, monthly, yearly trends, correlations, and insights"
      actions={
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as ReportPeriod[]).map((p) => (
            <button key={p} type="button" className={`rounded-xl px-3 py-1 text-sm capitalize ${period === p ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="widget-card"><p className="text-xs text-slate-500">Sleep trend</p><p className="text-lg font-bold capitalize">{sleepTrend.direction} ({sleepTrend.change > 0 ? '+' : ''}{sleepTrend.change} min)</p></div>
        <div className="widget-card"><p className="text-xs text-slate-500">Completion trend</p><p className="text-lg font-bold capitalize">{completionTrend.direction} ({completionTrend.change > 0 ? '+' : ''}{completionTrend.change}%)</p></div>
        <div className="widget-card"><p className="text-xs text-slate-500">Income ({period})</p><p className="text-lg font-bold">${incomeByMonth.reduce((a, t) => a + t.amount, 0).toLocaleString()}</p></div>
        <div className="widget-card"><p className="text-xs text-slate-500">Expenses ({period})</p><p className="text-lg font-bold">${expenseByMonth.reduce((a, t) => a + t.amount, 0).toLocaleString()}</p></div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <WeeklyCompletionChart data={dayTotals} title={`Completion — ${period}`} />
        <CalendarHeatmap data={getHeatmapYearData(dayTotals)} />
      </div>
      <div className="mt-4 widget-card">
        <h3 className="mb-2 font-semibold">Correlations</h3>
        <div className="space-y-2">
          {correlations.map((c) => (
            <div key={`${c.metricA}-${c.metricB}`} className="flex justify-between text-sm">
              <span>{c.interpretation}</span>
              <span className="font-mono text-slate-500">{c.coefficient}</span>
            </div>
          ))}
          {correlations.length === 0 && <p className="text-sm text-slate-400">Log more data to see correlations</p>}
        </div>
      </div>
      {config?.charts.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {config.charts.map((c) => (
            <div key={c.id} className="widget-card">
              <p className="font-medium">{c.label}</p>
              <p className="text-xs capitalize text-slate-500">{c.chartType} · {c.period} · {c.module}</p>
            </div>
          ))}
        </div>
      ) : null}
      {goals && dayTotals.length > 0 && (
        <div className="mt-4"><InsightsPanel insights={generateInsights(dayTotals, goals)} /></div>
      )}
    </ModuleShell>
  );
}

export function TimelineModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const health = useLiveQuery(() => db.healthEntries.toArray(), []);
  const events = [
    ...(logs?.flatMap((l) => l.entries.map((e) => ({ date: l.date, text: `${e.category} logged`, type: 'activity' }))) ?? []),
    ...(journals?.map((j) => ({ date: j.date, text: `Journal: ${j.templateId}`, type: 'journal' })) ?? []),
    ...(transactions?.map((t) => ({ date: t.date, text: `${t.type} $${t.amount}`, type: 'finance' })) ?? []),
    ...(health?.map((h) => ({ date: h.date, text: `Health: ${h.metricId}`, type: 'health' })) ?? []),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100);

  return (
    <ModuleShell title="Timeline" subtitle="Unified chronological view across all modules">
      <div className="relative space-y-4 border-l-2 border-brand-500/30 pl-6">
        {events.map((e, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] h-3 w-3 rounded-full bg-brand-500" />
            <p className="text-xs text-slate-500">{e.date} · {e.type}</p>
            <p className="text-sm">{e.text}</p>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-400">No events yet</p>}
      </div>
    </ModuleShell>
  );
}

export function AchievementsModule() {
  const { config } = useAppConfig();
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const habits = useLiveQuery(() => db.habitLogs.toArray(), []);

  const badges = config?.badges.map((b) => {
    let progress = 0;
    if (b.criteriaRef === 'logs') progress = logs?.length ?? 0;
    else if (b.criteriaRef === 'habitLogs') progress = habits?.filter((h) => h.completed).length ?? 0;
    else if (b.criteriaRef === 'activity') progress = Math.min(logs?.length ?? 0, b.target);
    return { ...b, progress: Math.min(progress, b.target), unlocked: progress >= b.target };
  }) ?? [];

  return (
    <ModuleShell title="Achievements" subtitle="User-configurable badges — create in Settings">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((a) => (
          <div key={a.id} className={`widget-card text-center ${a.unlocked ? 'border-emerald-500/40' : 'opacity-60'}`}>
            <span className="text-3xl">{a.icon}</span>
            <p className="mt-2 font-semibold">{a.title}</p>
            <p className="text-xs text-slate-500">{a.description}</p>
            <p className="mt-2 text-sm">{a.progress}/{a.target}</p>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}

export function NotificationsModule() {
  const { config } = useAppConfig();
  const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray(), []);

  useEffect(() => {
    if (config) evaluateNotificationRules(config);
  }, [config]);

  return (
    <ModuleShell title="Notifications" subtitle="Rule-based alerts — configure rules in Settings">
      <div className="space-y-2">
        {notifications?.map((n) => (
          <div key={n.id} className={`widget-card text-sm ${n.read ? 'opacity-60' : ''}`}>
            <p className="font-medium">{n.title}</p>
            <p className="text-slate-500">{n.message}</p>
          </div>
        ))}
        {!notifications?.length && <p className="text-sm text-slate-400">No notifications</p>}
      </div>
    </ModuleShell>
  );
}

export function ReportsModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const filtered = filterByPeriod(logs?.map((l) => ({ ...l, date: l.date })) ?? [], period);

  const exportReport = async (format: 'json' | 'csv' | 'excel' | 'pdf') => {
    const goals = await getGoals();
    const { exportLifeOS } = await import('../platform/export/unifiedExport');
    await exportLifeOS(format, filtered, goals, `${period}-report`);
  };

  return (
    <ModuleShell title="Reports" subtitle="Weekly, monthly, and yearly filtered exports">
      <div className="flex flex-wrap gap-2">
        {(['week', 'month', 'year'] as ReportPeriod[]).map((p) => (
          <button key={p} type="button" className={`rounded-xl px-3 py-1 text-sm capitalize ${period === p ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-500">{filtered.length} days in {period} report</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['pdf', 'csv', 'excel', 'json'] as const).map((fmt) => (
          <button key={fmt} type="button" className="btn-secondary text-sm" onClick={() => exportReport(fmt)}>Export {fmt.toUpperCase()}</button>
        ))}
      </div>
    </ModuleShell>
  );
}
