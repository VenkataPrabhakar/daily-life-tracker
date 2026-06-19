import { useEffect, useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { db, exportLifeOSData, importLifeOSData } from '../db/lifeOsDatabase';
import { ModuleShell } from '../components/ModuleShell';
import { InsightsPanel } from '../components/widgets/InsightsPanel';
import { generateInsights } from '../lib/insights';
import { computeDayTotals, getHeatmapYearData } from '../lib/aggregates';
import { getGoals } from '../db/database';
import type { DailyGoals } from '../core/types';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { WeeklyCompletionChart } from '../components/charts/WeeklyCompletionChart';
import { exportCsv, exportPdf, exportJsonBackup } from '../lib/export';
import { HistoryPage } from '../pages/HistoryPage';

export function InsightsModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  useEffect(() => { getGoals().then(setGoals); }, []);
  if (!logs || !goals) return null;
  const dayTotals = logs.map((l) => computeDayTotals(l, goals)).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <ModuleShell title="AI Insights" subtitle="Local, private insights from your Life OS data">
      <InsightsPanel insights={generateInsights(dayTotals, goals)} />
    </ModuleShell>
  );
}

export function AnalyticsModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const dayTotals = logs ? logs.map((l) => computeDayTotals(l)).sort((a, b) => a.date.localeCompare(b.date)) : [];
  return (
    <ModuleShell title="Analytics" subtitle="Weekly, monthly, and yearly trends">
      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyCompletionChart data={dayTotals} />
        <CalendarHeatmap data={getHeatmapYearData(dayTotals)} />
      </div>
    </ModuleShell>
  );
}

export function CalendarModule() {
  return <HistoryPage />;
}

export function TimelineModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const events = [
    ...(logs?.flatMap((l) => l.entries.map((e) => ({ date: l.date, text: `${e.category} logged`, type: 'activity' }))) ?? []),
    ...(journals?.map((j) => ({ date: j.date, text: `Journal: ${j.templateId}`, type: 'journal' })) ?? []),
    ...(transactions?.map((t) => ({ date: t.date, text: `${t.type} $${t.amount}`, type: 'finance' })) ?? []),
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
        {events.length === 0 && <p className="text-sm text-slate-400">No events yet — start logging across modules</p>}
      </div>
    </ModuleShell>
  );
}

export function AchievementsModule() {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const habits = useLiveQuery(() => db.habitLogs.toArray(), []);
  const achievements = [
    { id: '1', title: 'First Log', description: 'Log your first day', icon: '🌱', progress: logs?.length ? 1 : 0, target: 1, unlocked: (logs?.length ?? 0) >= 1 },
    { id: '2', title: 'Week Warrior', description: '7 days of activity', icon: '🔥', progress: Math.min(logs?.length ?? 0, 7), target: 7, unlocked: (logs?.length ?? 0) >= 7 },
    { id: '3', title: 'Habit Builder', description: 'Complete 10 habits', icon: '✅', progress: Math.min(habits?.filter((h) => h.completed).length ?? 0, 10), target: 10, unlocked: (habits?.filter((h) => h.completed).length ?? 0) >= 10 },
  ];

  return (
    <ModuleShell title="Achievements" subtitle="Unlock milestones as you build your Life OS">
      <div className="grid gap-3 sm:grid-cols-3">
        {achievements.map((a) => (
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
  const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray(), []);
  const bills = useLiveQuery(() => db.bills.toArray(), []);

  useEffect(() => {
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
  }, [bills]);

  return (
    <ModuleShell title="Notifications" subtitle="Bill reminders, budget alerts, and habit nudges">
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
  return (
    <ModuleShell title="Reports" subtitle="Generate and export Life OS reports">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={() => logs && getGoals().then((g) => exportPdf(logs, g))}>Download PDF Report</button>
        <button type="button" className="btn-secondary" onClick={() => logs && getGoals().then((g) => exportCsv(logs, g))}>Download CSV</button>
      </div>
    </ModuleShell>
  );
}

export function BackupModule() {
  const [status, setStatus] = useState('');
  return (
    <ModuleShell title="Backup & Restore" subtitle="Full Life OS data export and import">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={async () => {
          const data = await exportLifeOSData();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
          setStatus('Backup exported');
        }}>Export Full Backup</button>
        <button type="button" className="btn-secondary" onClick={() => exportJsonBackup()}>Export Legacy JSON</button>
        <label className="btn-secondary cursor-pointer">
          Import Backup
          <input type="file" accept=".json" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return;
            try { await importLifeOSData(JSON.parse(await file.text())); setStatus('Restored successfully'); }
            catch { setStatus('Import failed'); }
          }} />
        </label>
      </div>
      {status && <p className="text-sm text-brand-600">{status}</p>}
    </ModuleShell>
  );
}
