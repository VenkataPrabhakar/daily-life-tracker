type Props = {
  label: string;
  value: string;
  subValue?: string;
  emoji?: string;
  percent?: number;
  accent?: 'brand' | 'emerald' | 'amber' | 'violet' | 'rose';
  className?: string;
};

const accentMap = {
  brand: 'from-brand-500/20 to-brand-600/5 border-brand-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
  violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
};

export function StatWidget({
  label,
  value,
  subValue,
  emoji,
  percent,
  accent = 'brand',
  className = '',
}: Props) {
  return (
    <div
      className={`widget-card animate-fade-in bg-gradient-to-br ${accentMap[accent]} ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {emoji && <span className="text-xl">{emoji}</span>}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {subValue && <p className="mt-1 text-xs text-slate-500">{subValue}</p>}
      {percent !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
