import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { baseChartOptions, getChartColors } from '../../lib/chartSetup';
import { formatShortDate } from '../../lib/dates';
import type { DayTotals } from '../../db/types';

type Props = { data: DayTotals[]; title?: string };

export function SleepTrendChart({ data, title = 'Sleep Trend' }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = getChartColors(isDark);
  const recent = data.slice(-14);

  const chartData = {
    labels: recent.map((d) => formatShortDate(d.date)),
    datasets: [{
      label: 'Sleep (hours)',
      data: recent.map((d) => +(d.sleepMin / 60).toFixed(1)),
      borderColor: colors.violet,
      backgroundColor: colors.violet + '33',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  return (
    <div className="widget-card animate-fade-in">
      <h3 className="mb-4 text-sm font-semibold">😴 {title}</h3>
      <div className="h-[220px]">
        <Line data={chartData} options={baseChartOptions(isDark)} />
      </div>
    </div>
  );
}

export function MoodTrendChart({ data, title = 'Mood Trend' }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = getChartColors(isDark);
  const recent = data.slice(-14);

  const chartData = {
    labels: recent.map((d) => formatShortDate(d.date)),
    datasets: [{
      label: 'Mood (1-5)',
      data: recent.map((d) => (d.moodCount > 0 ? d.moodScore / d.moodCount : null)),
      borderColor: colors.amber,
      backgroundColor: colors.amber + '33',
      fill: true,
      tension: 0.4,
      spanGaps: true,
      pointRadius: 3,
    }],
  };

  return (
    <div className="widget-card animate-fade-in">
      <h3 className="mb-4 text-sm font-semibold">😊 {title}</h3>
      <div className="h-[220px]">
        <Line
          data={chartData}
          options={{
            ...baseChartOptions(isDark),
            scales: {
              ...baseChartOptions(isDark).scales,
              y: { ...baseChartOptions(isDark).scales?.y, max: 5, min: 0 },
            },
          }}
        />
      </div>
    </div>
  );
}
