import { useState } from 'react';
import type { DashboardPeriod } from '../db/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { PeriodSelector } from '../components/PeriodSelector';
import { SummaryCard } from '../components/SummaryCard';
import { ProgressRing } from '../components/ProgressRing';
import {
  ActivityHeatmap,
  DietChart,
  GymChart,
  HydrationChart,
  MonthlyBarChart,
  SleepChart,
  WorkChart,
} from '../components/charts/CategoryCharts';
import { formatDisplayDate, toDateKey } from '../lib/dates';
import { formatDuration, formatMl, progressPercent } from '../lib/aggregates';

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [anchor, setAnchor] = useState(new Date());
  const { loading, goals, dayTotals, summary, monthlyGroups, gymStreak, consistency } =
    useDashboardData(period, anchor);

  const todayTotals = dayTotals.at(-1);

  if (loading || !summary || !goals) {
    return <p className="text-center text-slate-500">Loading dashboard...</p>;
  }

  const avgHydration = summary.days ? Math.round(summary.hydrationMl / summary.days) : 0;
  const avgGym = summary.days ? Math.round(summary.gymMin / summary.days) : 0;
  const avgCalories = summary.days ? Math.round(summary.dietCalories / summary.days) : 0;
  const avgWork = summary.days ? Math.round(summary.workMin / summary.days) : 0;
  const avgSleep = summary.days ? Math.round(summary.sleepMin / summary.days) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {period === 'day'
              ? formatDisplayDate(toDateKey(anchor))
              : `${summary.days} days tracked`}
          </p>
        </div>
        <input
          type="date"
          className="input w-auto"
          value={toDateKey(anchor)}
          onChange={(e) => setAnchor(new Date(e.target.value + 'T12:00:00'))}
        />
      </header>

      <PeriodSelector value={period} onChange={setPeriod} />

      {period === 'day' && todayTotals && (
        <div className="flex flex-wrap justify-center gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ProgressRing label="Water" percent={progressPercent(todayTotals.hydrationMl, goals.hydrationMl)} />
          <ProgressRing label="Gym" percent={progressPercent(todayTotals.gymMin, goals.gymMin)} />
          <ProgressRing label="Diet" percent={progressPercent(todayTotals.dietCalories, goals.calories)} />
          <ProgressRing label="Work" percent={progressPercent(todayTotals.workMin, goals.workMin)} />
          <ProgressRing label="Sleep" percent={progressPercent(todayTotals.sleepMin, goals.sleepMin)} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard
          label={period === 'day' ? 'Water' : 'Avg water'}
          value={period === 'day' && todayTotals ? formatMl(todayTotals.hydrationMl) : formatMl(avgHydration)}
          emoji="💧"
        />
        <SummaryCard
          label={period === 'day' ? 'Gym' : 'Avg gym'}
          value={period === 'day' && todayTotals ? formatDuration(todayTotals.gymMin) : formatDuration(avgGym)}
          emoji="🏋️"
          subValue={period !== 'day' ? `${summary.gymDays} gym days` : undefined}
        />
        <SummaryCard
          label={period === 'day' ? 'Diet' : 'Avg calories'}
          value={period === 'day' && todayTotals ? `${todayTotals.dietCalories} kcal` : `${avgCalories} kcal`}
          emoji="🍽️"
        />
        <SummaryCard
          label={period === 'day' ? 'Work' : 'Avg work'}
          value={period === 'day' && todayTotals ? formatDuration(todayTotals.workMin) : formatDuration(avgWork)}
          emoji="💼"
        />
        <SummaryCard
          label={period === 'day' ? 'Sleep' : 'Avg sleep'}
          value={period === 'day' && todayTotals ? formatDuration(todayTotals.sleepMin) : formatDuration(avgSleep)}
          emoji="😴"
        />
        {period !== 'day' && (
          <SummaryCard label="Gym streak" value={`${gymStreak} days`} emoji="🔥" subValue="Current streak" />
        )}
      </div>

      {period !== 'day' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Gym consistency" value={`${consistency.gym}%`} subValue="Days with gym" />
          <SummaryCard label="Hydration consistency" value={`${consistency.hydration}%`} subValue="Days with water logged" />
          <SummaryCard label="Sleep consistency" value={`${consistency.sleep}%`} subValue="Days with sleep logged" />
        </div>
      )}

      {period === 'month' && (
        <ActivityHeatmap data={dayTotals} metric="gymMin" />
      )}

      {period === 'year' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <MonthlyBarChart data={monthlyGroups} dataKey="hydrationMl" color="#0ea5e9" title="💧 Monthly hydration" />
          <MonthlyBarChart data={monthlyGroups} dataKey="gymMin" color="#f97316" title="🏋️ Monthly gym" />
          <MonthlyBarChart data={monthlyGroups} dataKey="dietCalories" color="#22c55e" title="🍽️ Monthly calories" />
          <MonthlyBarChart data={monthlyGroups} dataKey="workMin" color="#8b5cf6" title="💼 Monthly work" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <HydrationChart data={dayTotals} />
          <GymChart data={dayTotals} />
          <DietChart data={dayTotals} />
          <WorkChart data={dayTotals} />
          <SleepChart data={dayTotals} />
        </div>
      )}
    </div>
  );
}
