import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { baseChartOptions, getChartColors } from '../../lib/chartSetup';
import { formatShortDate } from '../../lib/dates';
import type { DayTotals } from '../../db/types';

type Props = { data: DayTotals[]; title?: string };

export function WeeklyCompletionChart({ data, title = 'Weekly Completion' }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = getChartColors(isDark);
  const last7 = data.slice(-7);

  const chartData = {
    labels: last7.map((d) => formatShortDate(d.date)),
    datasets: [{
      label: 'Completion %',
      data: last7.map((d) => d.completionPercent),
      backgroundColor: colors.brand + '99',
      borderColor: colors.brand,
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  return (
    <div className="widget-card animate-fade-in">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-[220px]">
        <Bar
          data={chartData}
          options={{
            ...baseChartOptions(isDark),
            scales: {
              ...baseChartOptions(isDark).scales,
              y: { ...baseChartOptions(isDark).scales?.y, max: 100 },
            },
          }}
        />
      </div>
    </div>
  );
}
