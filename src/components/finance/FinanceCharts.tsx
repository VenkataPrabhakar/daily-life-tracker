import { Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors } from '../../lib/chartSetup';

type MonthPoint = { month: string; income: number; expenses: number };

export function IncomeVsExpenseChart({ data, title = 'Income vs Expense' }: { data: MonthPoint[]; title?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = getChartColors(resolvedTheme === 'dark');
  const labels = data.map((d) => d.month.slice(5));

  return (
    <div className="widget-card">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-[240px]">
        <Bar
          data={{
            labels,
            datasets: [
              { label: 'Income', data: data.map((d) => d.income), backgroundColor: colors.emerald, borderRadius: 4 },
              { label: 'Expenses', data: data.map((d) => d.expenses), backgroundColor: colors.rose, borderRadius: 4 },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: colors.text, boxWidth: 12 } } },
            scales: {
              x: { ticks: { color: colors.text }, grid: { display: false } },
              y: { ticks: { color: colors.text }, grid: { color: colors.grid }, beginAtZero: true },
            },
          }}
        />
      </div>
    </div>
  );
}

type Snapshot = { date: string; netWorth: number };

export function NetWorthTrendChart({ snapshots, title = 'Net Worth Trend' }: { snapshots: Snapshot[]; title?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = getChartColors(resolvedTheme === 'dark');
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    return (
      <div className="widget-card flex h-[240px] items-center justify-center text-sm text-slate-400">
        Visit overview monthly to build trend data
      </div>
    );
  }

  return (
    <div className="widget-card">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-[240px]">
        <Line
          data={{
            labels: sorted.map((s) => s.date),
            datasets: [{
              label: 'Net Worth',
              data: sorted.map((s) => s.netWorth),
              borderColor: colors.violet,
              backgroundColor: `${colors.violet}33`,
              fill: true,
              tension: 0.3,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: colors.text }, grid: { display: false } },
              y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
            },
          }}
        />
      </div>
    </div>
  );
}

export function DebtPayoffChart({ paid, remaining, title = 'Debt Payoff Progress' }: { paid: number; remaining: number; title?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = getChartColors(resolvedTheme === 'dark');
  const total = paid + remaining;

  if (total <= 0) {
    return (
      <div className="widget-card flex h-[240px] items-center justify-center text-sm text-slate-400">
        No debt tracked yet
      </div>
    );
  }

  return (
    <div className="widget-card">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-[240px]">
        <Bar
          data={{
            labels: ['Paid', 'Remaining'],
            datasets: [{
              data: [paid, remaining],
              backgroundColor: [colors.emerald, colors.rose],
              borderRadius: 6,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: colors.text }, grid: { color: colors.grid }, beginAtZero: true },
              y: { ticks: { color: colors.text }, grid: { display: false } },
            },
          }}
        />
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {Math.round((paid / total) * 100)}% paid · ${remaining.toLocaleString()} remaining
      </p>
    </div>
  );
}
