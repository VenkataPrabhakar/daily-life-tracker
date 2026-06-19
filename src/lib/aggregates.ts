import { format, parseISO, subDays } from 'date-fns';
import type { ActivityEntry, DailyGoals, DailyLog, DayTotals } from '../db/types';
import { computeRecoveryScore } from './recovery';

export function computeDayTotals(log: DailyLog, goals?: DailyGoals): DayTotals {
  const totals: DayTotals = {
    date: log.date,
    hydrationMl: 0,
    gymMin: 0,
    dietCalories: 0,
    proteinG: 0,
    workMin: 0,
    sleepMin: 0,
    noteCount: 0,
    gymDays: 0,
    moodScore: 0,
    moodCount: 0,
    activityScore: 0,
    completionPercent: 0,
    recoveryScore: 0,
  };

  for (const entry of log.entries) {
    switch (entry.category) {
      case 'hydration':
        totals.hydrationMl += entry.hydration?.amountMl ?? 0;
        break;
      case 'gym':
        totals.gymMin += entry.gym?.durationMin ?? 0;
        break;
      case 'diet':
        totals.dietCalories += entry.diet?.calories ?? 0;
        totals.proteinG += entry.diet?.proteinG ?? 0;
        break;
      case 'work':
        totals.workMin += entry.work?.durationMin ?? 0;
        break;
      case 'sleep':
        totals.sleepMin += entry.sleep?.durationMin ?? 0;
        break;
      case 'note':
        totals.noteCount += 1;
        break;
      case 'mood':
        if (entry.mood?.score) {
          totals.moodScore += entry.mood.score;
          totals.moodCount += 1;
        }
        break;
    }
  }

  if (totals.gymMin > 0) totals.gymDays = 1;
  totals.activityScore = computeActivityScore(totals);

  if (goals) {
    totals.completionPercent = computeDayCompletion(totals, goals);
    totals.recoveryScore = computeRecoveryScore(totals, goals);
  }

  return totals;
}

/** Composite activity intensity for heatmap (0–4 scale). */
export function computeActivityScore(totals: DayTotals): number {
  let score = 0;
  if (totals.hydrationMl > 0) score += 1;
  if (totals.gymMin > 0) score += 1;
  if (totals.dietCalories > 0) score += 1;
  if (totals.workMin > 0) score += 1;
  if (totals.sleepMin > 0) score += 1;
  if (totals.moodCount > 0) score += 1;
  if (score >= 5) return 4;
  if (score >= 3) return 3;
  if (score >= 2) return 2;
  if (score >= 1) return 1;
  return 0;
}

export function computeDayCompletion(totals: DayTotals, goals: DailyGoals): number {
  const metrics = [
    progressPercent(totals.hydrationMl, goals.hydrationMl),
    progressPercent(totals.gymMin, goals.gymMin),
    progressPercent(totals.sleepMin, goals.sleepMin),
    progressPercent(totals.workMin, goals.workMin),
    totals.moodCount > 0 ? (totals.moodScore / totals.moodCount) * 20 : 0,
  ];
  return Math.round(metrics.reduce((a, b) => a + b, 0) / metrics.length);
}

export function computeTotalsForLogs(logs: DailyLog[], goals?: DailyGoals): DayTotals[] {
  return logs.map((log) => computeDayTotals(log, goals));
}

export function aggregateTotals(dayTotals: DayTotals[]) {
  return dayTotals.reduce(
    (acc, day) => ({
      hydrationMl: acc.hydrationMl + day.hydrationMl,
      gymMin: acc.gymMin + day.gymMin,
      dietCalories: acc.dietCalories + day.dietCalories,
      proteinG: acc.proteinG + day.proteinG,
      workMin: acc.workMin + day.workMin,
      sleepMin: acc.sleepMin + day.sleepMin,
      noteCount: acc.noteCount + day.noteCount,
      gymDays: acc.gymDays + day.gymDays,
      moodScore: acc.moodScore + day.moodScore,
      moodCount: acc.moodCount + day.moodCount,
      completionPercent: acc.completionPercent + day.completionPercent,
      recoveryScore: acc.recoveryScore + day.recoveryScore,
      days: acc.days + 1,
    }),
    {
      hydrationMl: 0,
      gymMin: 0,
      dietCalories: 0,
      proteinG: 0,
      workMin: 0,
      sleepMin: 0,
      noteCount: 0,
      gymDays: 0,
      moodScore: 0,
      moodCount: 0,
      completionPercent: 0,
      recoveryScore: 0,
      days: 0,
    },
  );
}

export function computeGymStreak(dayTotals: DayTotals[]): number {
  const sorted = [...dayTotals].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const day of sorted) {
    if (day.gymMin > 0) streak++;
    else break;
  }
  return streak;
}

export function computeActivityStreak(dayTotals: DayTotals[]): number {
  const sorted = [...dayTotals].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const day of sorted) {
    if (day.activityScore > 0) streak++;
    else break;
  }
  return streak;
}

export function computeWeeklyCompletion(dayTotals: DayTotals[]): number {
  const last7 = dayTotals.slice(-7);
  if (last7.length === 0) return 0;
  const sum = last7.reduce((acc, d) => acc + d.completionPercent, 0);
  return Math.round(sum / last7.length);
}

export function groupByMonth(dayTotals: DayTotals[]) {
  const map = new Map<string, DayTotals[]>();
  for (const day of dayTotals) {
    const monthKey = format(parseISO(day.date), 'yyyy-MM');
    const group = map.get(monthKey) ?? [];
    group.push(day);
    map.set(monthKey, group);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, days]) => ({
      month,
      label: format(parseISO(`${month}-01`), 'MMM yyyy'),
      totals: aggregateTotals(days),
      days,
    }));
}

export function computeHabitConsistency(
  dayTotals: DayTotals[],
  metric: keyof Pick<DayTotals, 'gymMin' | 'hydrationMl' | 'sleepMin' | 'moodCount'>,
) {
  if (dayTotals.length === 0) return 0;
  const hitDays = dayTotals.filter((d) => d[metric] > 0).length;
  return Math.round((hitDays / dayTotals.length) * 100);
}

export function entriesForTimeBlock(entries: ActivityEntry[], block: ActivityEntry['timeBlock']) {
  return entries
    .filter((e) => e.timeBlock === block)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatSleepHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function formatMl(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`;
  return `${ml}ml`;
}

export function progressPercent(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

export function averageMood(dayTotals: DayTotals[]): number {
  const withMood = dayTotals.filter((d) => d.moodCount > 0);
  if (withMood.length === 0) return 0;
  const sum = withMood.reduce((acc, d) => acc + d.moodScore / d.moodCount, 0);
  return Math.round((sum / withMood.length) * 10) / 10;
}

export function getLastNDaysTotals(dayTotals: DayTotals[], n: number): DayTotals[] {
  return dayTotals.slice(-n);
}

export function getWeekOverWeekSleepChange(dayTotals: DayTotals[]): number {
  if (dayTotals.length < 14) return 0;
  const thisWeek = dayTotals.slice(-7);
  const lastWeek = dayTotals.slice(-14, -7);
  const avg = (days: DayTotals[]) =>
    days.reduce((a, d) => a + d.sleepMin, 0) / (days.length || 1);
  return Math.round(avg(thisWeek) - avg(lastWeek));
}

export function getHeatmapYearData(dayTotals: DayTotals[], endDate: Date = new Date()) {
  const map = new Map(dayTotals.map((d) => [d.date, d.activityScore]));
  const days: { date: string; score: number; level: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const date = subDays(endDate, i);
    const key = format(date, 'yyyy-MM-dd');
    const score = map.get(key) ?? 0;
    days.push({ date: key, score, level: score });
  }
  return days;
}
