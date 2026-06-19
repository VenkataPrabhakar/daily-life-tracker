import type { DayTotals, ReportPeriod } from '../../core/types';

export function filterByPeriod<T extends { date: string }>(items: T[], period: ReportPeriod): T[] {
  const now = new Date();
  const cutoff = new Date(now);
  if (period === 'week') cutoff.setDate(now.getDate() - 7);
  else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
  else cutoff.setFullYear(now.getFullYear() - 1);
  const key = cutoff.toISOString().slice(0, 10);
  return items.filter((i) => i.date >= key);
}

export type Correlation = {
  metricA: string;
  metricB: string;
  coefficient: number;
  interpretation: string;
};

function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const vx = xs[i] - mx;
    const vy = ys[i] - my;
    num += vx * vy;
    dx += vx * vx;
    dy += vy * vy;
  }
  const den = Math.sqrt(dx * dy);
  return den ? num / den : 0;
}

export function computeCorrelations(data: DayTotals[]): Correlation[] {
  if (data.length < 5) return [];
  const pairs: [string, keyof DayTotals, keyof DayTotals][] = [
    ['Sleep × Recovery', 'sleepMin', 'recoveryScore'],
    ['Mood × Completion', 'moodScore', 'completionPercent'],
    ['Hydration × Activity', 'hydrationMl', 'activityScore'],
    ['Work × Completion', 'workMin', 'completionPercent'],
  ];
  return pairs.map(([label, a, b]) => {
    const xs = data.map((d) => Number(d[a]) || 0);
    const ys = data.map((d) => Number(d[b]) || 0);
    const r = pearson(xs, ys);
    const strength = Math.abs(r) > 0.5 ? 'Strong' : Math.abs(r) > 0.25 ? 'Moderate' : 'Weak';
    const dir = r > 0 ? 'positive' : r < 0 ? 'negative' : 'none';
    return { metricA: String(a), metricB: String(b), coefficient: Math.round(r * 100) / 100, interpretation: `${strength} ${dir} correlation (${label})` };
  });
}

export function computeTrend(data: DayTotals[], field: keyof DayTotals): { direction: 'up' | 'down' | 'flat'; change: number } {
  if (data.length < 2) return { direction: 'flat', change: 0 };
  const half = Math.floor(data.length / 2);
  const first = data.slice(0, half);
  const second = data.slice(half);
  const avg = (arr: DayTotals[]) => arr.reduce((s, d) => s + (Number(d[field]) || 0), 0) / arr.length;
  const change = avg(second) - avg(first);
  return { direction: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat', change: Math.round(change) };
}
