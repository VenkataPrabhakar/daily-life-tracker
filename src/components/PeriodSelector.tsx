import type { DashboardPeriod } from '../db/types';

const PERIODS: { id: DashboardPeriod; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' },
  { id: '6months', label: '6 Months' },
  { id: 'year', label: 'Year' },
];

type Props = {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
};

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            value === p.id
              ? 'bg-brand-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
