import { format, parseISO } from 'date-fns';
import type { ActivityEntry, DailyLog, DayTotals } from '../db/types';

export function computeDayTotals(log: DailyLog): DayTotals {
  const totals: DayTotals = {
    date: log.date,
    hydrationMl: 0,
    gymMin: 0,
    dietCalories: 0,
    workMin: 0,
    sleepMin: 0,
    noteCount: 0,
    gymDays: 0,
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
    }
  }

  if (totals.gymMin > 0) totals.gymDays = 1;
  return totals;
}

export function computeTotalsForLogs(logs: DailyLog[]): DayTotals[] {
  return logs.map(computeDayTotals);
}

export function aggregateTotals(dayTotals: DayTotals[]) {
  return dayTotals.reduce(
    (acc, day) => ({
      hydrationMl: acc.hydrationMl + day.hydrationMl,
      gymMin: acc.gymMin + day.gymMin,
      dietCalories: acc.dietCalories + day.dietCalories,
      workMin: acc.workMin + day.workMin,
      sleepMin: acc.sleepMin + day.sleepMin,
      noteCount: acc.noteCount + day.noteCount,
      gymDays: acc.gymDays + day.gymDays,
      days: acc.days + 1,
    }),
    {
      hydrationMl: 0,
      gymMin: 0,
      dietCalories: 0,
      workMin: 0,
      sleepMin: 0,
      noteCount: 0,
      gymDays: 0,
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

export function computeHabitConsistency(dayTotals: DayTotals[], metric: keyof Pick<DayTotals, 'gymMin' | 'hydrationMl' | 'sleepMin'>) {
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

export function formatMl(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`;
  return `${ml}ml`;
}

export function progressPercent(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}
