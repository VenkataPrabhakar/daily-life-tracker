import { useEffect, useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { db } from '../db/lifeOsDatabase';
import { ModuleShell } from '../components/ModuleShell';
import { InsightsPanel } from '../components/widgets/InsightsPanel';
import { generateInsights } from '../lib/insights';
import { computeDayTotals, getHeatmapYearData } from '../lib/aggregates';
import { getGoals } from '../db/database';
import { useAppConfig } from '../context/ConfigContext';
import type { DailyGoals } from '../core/types';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { WeeklyCompletionChart } from '../components/charts/WeeklyCompletionChart';
import { exportLifeOS } from '../platform/export/unifiedExport';
import type { ReportPeriod } from '../core/types';

export function AnalyticsModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  useEffect(() => { getGoals().then(setGoals); }, []);
  const dayTotals = logs && goals ? logs.map((l) => computeDayTotals(l, goals)).sort((a, b) => a.date.localeCompare(b.date)) : [];
  return (
    <ModuleShell title="Analytics" subtitle="Trends, heatmaps, and smart local insights">
      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyCompletionChart data={dayTotals} />
        <CalendarHeatmap data={getHeatmapYearData(dayTotals)} />
      </div>
      {goals && dayTotals.length > 0 && (
        <div className="mt-4">
          <InsightsPanel insights={generateInsights(dayTotals, goals)} />
        </div>
      )}
    </ModuleShell>
  );
}

export function TimelineModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const relationships = useLiveQuery(() => db.interactions.toArray(), []);
  const events = [
    ...(logs?.flatMap((l) => l.entries.map((e) => ({ date: l.date, text: `${e.category} logged`, type: 'activity' }))) ?? []),
    ...(journals?.map((j) => ({ date: j.date, text: `Journal: ${j.templateId}`, type: 'journal' })) ?? []),
    ...(transactions?.map((t) => ({ date: t.date, text: `${t.type} $${t.amount}`, type: 'finance' })) ?? []),
    ...(relationships?.map((r) => ({ date: r.date, text: `Interaction logged`, type: 'relationship' })) ?? []),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);

  return (
    <ModuleShell title="Timeline" subtitle="Unified chronological view across all modules">
      <div className="relative space-y-4 border-l-2 border-brand-500/30 pl-6">
        {events.map((e, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] h-3 w-3 rounded-full bg-brand-500" />
            <p className="text-xs text-slate-500">{e.date}</p>
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
    <ModuleShell title="Achievements" subtitle="Configurable badges and milestones">
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
  const bills = useLiveQuery(() => db.bills.toArray(), []);

  useEffect(() => {
    if (!config?.notificationRules) return;
    bills?.forEach(async (b) => {
      if (b.status === 'overdue' || b.status === 'upcoming') {
        const exists = await db.notifications.where('title').equals(`Bill: ${b.name}`).count();
        if (!exists) {
          await db.notifications.put({
            id: crypto.randomUUID(),
            title: `Bill: ${b.name}`,
            message: `$${b.amount} due ${b.dueDate}`,
            type: 'bill',
            read: false,
            createdAt: new Date().toISOString(),
            dueAt: b.dueDate,
          });
        }
      }
    });
  }, [bills, config]);

  return (
    <ModuleShell title="Notifications" subtitle="Rule-based alerts from your config">
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

  const exportReport = async (format: 'json' | 'csv' | 'excel' | 'pdf') => {
    const goals = await getGoals();
    await exportLifeOS(format, logs ?? [], goals, `${period}-report`);
  };

  return (
    <ModuleShell title="Reports" subtitle="Weekly, monthly, and yearly exports">
      <div className="flex flex-wrap gap-2">
        {(['week', 'month', 'year'] as ReportPeriod[]).map((p) => (
          <button key={p} type="button" className={`rounded-xl px-3 py-1 text-sm capitalize ${period === p ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['pdf', 'csv', 'excel', 'json'] as const).map((fmt) => (
          <button key={fmt} type="button" className="btn-secondary text-sm" onClick={() => exportReport(fmt)}>Export {fmt.toUpperCase()}</button>
        ))}
      </div>
    </ModuleShell>
  );
}
