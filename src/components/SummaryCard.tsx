type Props = {
  label: string;
  value: string;
  subValue?: string;
  percent?: number;
  emoji?: string;
};

export function SummaryCard({ label, value, subValue, percent, emoji }: Props) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        {emoji && <span className="text-xl">{emoji}</span>}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subValue && <p className="mt-1 text-xs text-slate-500">{subValue}</p>}
      {percent !== undefined && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{percent}% of goal</p>
        </div>
      )}
    </div>
  );
}
