import { useState } from 'react';
import { useWellnessDashboard } from '../hooks/useWellnessDashboard';
import { StatWidget } from '../components/widgets/StatWidget';
import { RecoveryScoreWidget } from '../components/widgets/RecoveryScoreWidget';
import { HabitCategoryGrid } from '../components/widgets/HabitCategoryGrid';
import { InsightsPanel } from '../components/widgets/InsightsPanel';
import { WeeklyCompletionChart } from '../components/charts/WeeklyCompletionChart';
import { SleepTrendChart, MoodTrendChart } from '../components/charts/SleepTrendChart';
import { HabitSuccessPieChart } from '../components/charts/HabitSuccessPieChart';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { formatMl } from '../lib/aggregates';
import { toDateKey } from '../lib/dates';

export function DashboardPage() {
  const [anchor, setAnchor] = useState(new Date());
  const dash = useWellnessDashboard(anchor);

  if (dash.loading || !dash.goals) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const todayRecovery = dash.today?.recoveryScore ?? dash.avgRecovery;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Wellness Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Your daily pulse</h1>
          <p className="mt-1 text-sm text-slate-500">WHOOP-inspired insights from your local data</p>
        </div>
        <input
          type="date"
          className="input w-auto"
          value={toDateKey(anchor)}
          onChange={(e) => setAnchor(new Date(e.target.value + 'T12:00:00'))}
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatWidget label="Current Streak" value={`${dash.streak} days`} emoji="🔥" accent="amber" />
        <StatWidget label="Weekly Completion" value={`${dash.weeklyCompletion}%`} emoji="🎯" percent={dash.weeklyCompletion} accent="brand" />
        <StatWidget label="Avg Sleep" value={dash.avgSleepHours} emoji="😴" accent="violet" />
        <StatWidget label="Water Intake" value={dash.avgWater} emoji="💧" accent="brand" />
        <StatWidget label="Mood Score" value={dash.avgMood > 0 ? `${dash.avgMood}/5` : '—'} emoji="😊" accent="amber" />
        <StatWidget
          label="Recovery"
          value={`${todayRecovery}%`}
          emoji="💚"
          percent={todayRecovery}
          accent={todayRecovery > 80 ? 'emerald' : todayRecovery >= 60 ? 'amber' : 'rose'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RecoveryScoreWidget score={todayRecovery} />
        </div>
        <div className="lg:col-span-2">
          <InsightsPanel insights={dash.insights} />
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Habit Categories</h2>
        <HabitCategoryGrid stats={dash.habitStats} />
      </section>

      <CalendarHeatmap data={dash.heatmap} />

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyCompletionChart data={dash.dayTotals} />
        <HabitSuccessPieChart stats={dash.habitStats} />
        <SleepTrendChart data={dash.dayTotals} />
        <MoodTrendChart data={dash.dayTotals} />
      </div>

      {dash.today && (
        <div className="widget-card">
          <h3 className="mb-2 text-sm font-semibold">Today at a glance</h3>
          <p className="text-sm text-slate-500">
            Water {formatMl(dash.today.hydrationMl)} · Recovery {dash.today.recoveryScore}% ·
            Completion {dash.today.completionPercent}%
          </p>
        </div>
      )}
    </div>
  );
}
