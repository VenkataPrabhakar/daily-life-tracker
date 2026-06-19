import { useDashboardData } from '../hooks/useDashboardData';
import { generateInsights } from '../lib/insights';
import { computeHabitCategoryStats } from '../lib/habitCategories';
import {
  averageMood,
  computeActivityStreak,
  computeWeeklyCompletion,
  formatMl,
  formatSleepHours,
  getHeatmapYearData,
  getLastNDaysTotals,
} from '../lib/aggregates';
import { averageRecoveryScore } from '../lib/recovery';
import { toDateKey } from '../lib/dates';
import { useMemo } from 'react';

export function useWellnessDashboard(anchorDate: Date = new Date()) {
  const data = useDashboardData('month', anchorDate);

  const enriched = useMemo(() => {
    if (!data.goals || data.loading) return null;

    const last7 = getLastNDaysTotals(data.dayTotals, 7);
    const today = data.dayTotals.find((d) => d.date === toDateKey(anchorDate)) ?? data.dayTotals.at(-1);
    const insights = generateInsights(data.dayTotals, data.goals);
    const habitStats = computeHabitCategoryStats(data.dayTotals, data.goals);
    const heatmap = getHeatmapYearData(data.dayTotals, anchorDate);

    return {
      ...data,
      today,
      last7,
      streak: computeActivityStreak(data.dayTotals),
      weeklyCompletion: computeWeeklyCompletion(data.dayTotals),
      avgSleepHours: data.summary
        ? formatSleepHours(Math.round(data.summary.sleepMin / (data.summary.days || 1)))
        : '0h',
      avgWater: data.summary
        ? formatMl(Math.round(data.summary.hydrationMl / (data.summary.days || 1)))
        : '0ml',
      avgMood: averageMood(data.dayTotals),
      avgRecovery: averageRecoveryScore(last7.length ? last7 : data.dayTotals.slice(-1)),
      insights,
      habitStats,
      heatmap,
    };
  }, [data, anchorDate]);

  return enriched ?? { ...data, loading: true };
}
