import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors } from '../../lib/chartSetup';
import type { HabitCategoryStats } from '../../lib/habitCategories';

type Props = { stats: HabitCategoryStats[]; title?: string };

export function HabitSuccessPieChart({ stats, title = 'Habit Success by Category' }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = getChartColors(isDark);

  const chartData = {
    labels: stats.map((s) => s.label),
    datasets: [{
      data: stats.map((s) => s.successRate),
      backgroundColor: [colors.brand, colors.emerald, colors.violet, colors.amber],
      borderWidth: 0,
    }],
  };

  return (
    <div className="widget-card animate-fade-in">
      <h3 className="mb-4 text-sm font-semibold">📊 {title}</h3>
      <div className="mx-auto h-[220px] max-w-[280px]">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: colors.text, padding: 12, font: { size: 11 } },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
