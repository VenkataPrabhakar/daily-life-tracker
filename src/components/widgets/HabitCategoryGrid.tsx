import type { HabitCategoryStats } from '../../lib/habitCategories';

type Props = {
  stats: HabitCategoryStats[];
};

export function HabitCategoryGrid({ stats }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((cat) => (
        <div key={cat.id} className="widget-card animate-fade-in">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">{cat.emoji}</span>
            <span className="font-semibold">{cat.label}</span>
          </div>
          <p className="text-2xl font-bold">{cat.successRate}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {cat.activeDays} of {cat.totalDays} days active
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${cat.successRate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
