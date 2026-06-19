import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DayTotals } from '../../db/types';
import { formatShortDate } from '../../lib/dates';
import { formatMl } from '../../lib/aggregates';

type ChartProps = {
  data: DayTotals[];
  dataKey: keyof Pick<DayTotals, 'hydrationMl' | 'gymMin' | 'dietCalories' | 'workMin' | 'sleepMin'>;
  color?: string;
  type?: 'bar' | 'line';
  formatter?: (v: number) => string;
};

export function TrendChart({
  data,
  dataKey,
  color = '#0ea5e9',
  type = 'bar',
  formatter,
}: ChartProps) {
  const chartData = data.map((d) => ({
    date: formatShortDate(d.date),
    value: d[dataKey],
  }));

  if (chartData.every((d) => d.value === 0)) {
    return <p className="py-8 text-center text-sm text-slate-400">No data for this period</p>;
  }

  const Chart = type === 'line' ? LineChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <Chart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [formatter ? formatter(v) : v, '']} />
        {type === 'line' ? (
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        ) : (
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

export function HydrationChart({ data }: { data: DayTotals[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">💧 Hydration</h3>
      <TrendChart data={data} dataKey="hydrationMl" color="#0ea5e9" formatter={formatMl} />
    </div>
  );
}

export function GymChart({ data }: { data: DayTotals[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">🏋️ Gym (minutes)</h3>
      <TrendChart data={data} dataKey="gymMin" color="#f97316" />
    </div>
  );
}

export function DietChart({ data }: { data: DayTotals[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">🍽️ Diet (calories)</h3>
      <TrendChart data={data} dataKey="dietCalories" color="#22c55e" />
    </div>
  );
}

export function WorkChart({ data }: { data: DayTotals[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">💼 Work (minutes)</h3>
      <TrendChart data={data} dataKey="workMin" color="#8b5cf6" type="line" />
    </div>
  );
}

export function SleepChart({ data }: { data: DayTotals[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">😴 Sleep (minutes)</h3>
      <TrendChart data={data} dataKey="sleepMin" color="#6366f1" type="line" />
    </div>
  );
}

type MonthlyProps = {
  data: { label: string; totals: { hydrationMl: number; gymMin: number; dietCalories: number; workMin: number; sleepMin: number } }[];
  dataKey: 'hydrationMl' | 'gymMin' | 'dietCalories' | 'workMin' | 'sleepMin';
  color?: string;
  title: string;
};

export function MonthlyBarChart({ data, dataKey, color = '#0ea5e9', title }: MonthlyProps) {
  const chartData = data.map((d) => ({ month: d.label, value: d.totals[dataKey] }));

  if (chartData.every((d) => d.value === 0)) {
    return (
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold">{title}</h3>
        <p className="py-8 text-center text-sm text-slate-400">No data for this period</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type HeatmapProps = { data: DayTotals[]; metric: 'gymMin' | 'hydrationMl' };

export function ActivityHeatmap({ data, metric }: HeatmapProps) {
  const max = Math.max(...data.map((d) => d[metric]), 1);

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold">
        {metric === 'gymMin' ? '🏋️ Gym days' : '💧 Hydration activity'}
      </h3>
      <div className="flex flex-wrap gap-1">
        {data.map((d) => {
          const intensity = d[metric] / max;
          const opacity = d[metric] > 0 ? 0.2 + intensity * 0.8 : 0.05;
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d[metric]}`}
              className="h-4 w-4 rounded-sm"
              style={{
                backgroundColor: metric === 'gymMin' ? `rgba(249, 115, 22, ${opacity})` : `rgba(14, 165, 233, ${opacity})`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">Darker = more activity</p>
    </div>
  );
}
