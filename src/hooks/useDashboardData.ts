import { useCallback, useEffect, useState } from 'react';
import { getGoals, getLogsInRange } from '../db/database';
import type { DailyGoals, DashboardPeriod } from '../db/types';
import {
  aggregateTotals,
  computeDayTotals,
  computeGymStreak,
  computeHabitConsistency,
  computeTotalsForLogs,
  groupByMonth,
} from '../lib/aggregates';
import { getDateRange, getDaysInRange } from '../lib/dates';

export function useDashboardData(period: DashboardPeriod, anchorDate: Date) {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [dayKeys, setDayKeys] = useState<string[]>([]);
  const [dayTotals, setDayTotals] = useState<ReturnType<typeof computeDayTotals>[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof aggregateTotals> | null>(null);
  const [monthlyGroups, setMonthlyGroups] = useState<ReturnType<typeof groupByMonth>>([]);
  const [gymStreak, setGymStreak] = useState(0);
  const [consistency, setConsistency] = useState({ gym: 0, hydration: 0, sleep: 0 });

  const refresh = useCallback(async () => {
    setLoading(true);
    const range = getDateRange(period, anchorDate);
    const keys = getDaysInRange(range.start, range.end);
    const [logs, goalsData] = await Promise.all([
      getLogsInRange(range.start, range.end),
      getGoals(),
    ]);

    const logMap = new Map(logs.map((l) => [l.date, l]));
    const filledLogs = keys.map(
      (date) => logMap.get(date) ?? { date, entries: [], updatedAt: '' },
    );
    const totals = computeTotalsForLogs(filledLogs, goalsData);
    const agg = aggregateTotals(totals);

    setGoals(goalsData);
    setDayKeys(keys);
    setDayTotals(totals);
    setSummary(agg);
    setMonthlyGroups(groupByMonth(totals));
    setGymStreak(computeGymStreak(totals));
    setConsistency({
      gym: computeHabitConsistency(totals, 'gymMin'),
      hydration: computeHabitConsistency(totals, 'hydrationMl'),
      sleep: computeHabitConsistency(totals, 'sleepMin'),
    });
    setLoading(false);
  }, [period, anchorDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    goals,
    dayKeys,
    dayTotals,
    summary,
    monthlyGroups,
    gymStreak,
    consistency,
    refresh,
  };
}
