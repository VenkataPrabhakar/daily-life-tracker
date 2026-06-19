import type { DailyGoals, DayTotals } from '../db/types';
import { progressPercent } from './aggregates';

export type RecoveryColor = 'green' | 'yellow' | 'red';

/** Recovery score: sleep 40%, mood 30%, water 20%, exercise 10%. */
export function computeRecoveryScore(day: DayTotals, goals: DailyGoals): number {
  const sleepScore = progressPercent(day.sleepMin, goals.sleepMin);
  const moodScore = day.moodCount > 0 ? (day.moodScore / day.moodCount) * 20 : 50;
  const waterScore = progressPercent(day.hydrationMl, goals.hydrationMl);
  const exerciseScore = progressPercent(day.gymMin, goals.gymMin);

  const weighted =
    sleepScore * 0.4 +
    moodScore * 0.3 +
    waterScore * 0.2 +
    exerciseScore * 0.1;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function getRecoveryColor(score: number): RecoveryColor {
  if (score > 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

export function recoveryColorClasses(color: RecoveryColor): string {
  switch (color) {
    case 'green':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'yellow':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'red':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
  }
}

export function recoveryRingColor(score: number): string {
  const color = getRecoveryColor(score);
  if (color === 'green') return '#10b981';
  if (color === 'yellow') return '#f59e0b';
  return '#f43f5e';
}

export function averageRecoveryScore(days: DayTotals[]): number {
  if (days.length === 0) return 0;
  const sum = days.reduce((acc, d) => acc + d.recoveryScore, 0);
  return Math.round(sum / days.length);
}
