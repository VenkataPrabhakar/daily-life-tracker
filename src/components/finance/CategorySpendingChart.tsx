import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors } from '../../lib/chartSetup';

type Item = { label: string; amount: number };

type Props = { items: Item[]; title?: string };

export function CategorySpendingChart({ items, title = 'Spending by category' }: Props) {
  const { resolvedTheme } = useTheme();
  const colors = getChartColors(resolvedTheme === 'dark');
  const sorted = [...items].filter((i) => i.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 8);

  if (sorted.length === 0) {
    return (
      <div className="widget-card flex h-[220px] items-center justify-center text-sm text-slate-400">
        No transactions yet — add one above
      </div>
    );
  }

  return (
    <div className="widget-card">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-[240px]">
        <Bar
          data={{
            labels: sorted.map((i) => i.label),
            datasets: [{
              label: 'Amount ($)',
              data: sorted.map((i) => i.amount),
              backgroundColor: colors.brand,
              borderRadius: 6,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
              y: { ticks: { color: colors.text }, grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  );
}
