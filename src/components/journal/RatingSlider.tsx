type Props = {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
};

export function RatingSlider({ label, emoji, value, onChange, lowLabel = 'Low', highLabel = 'High' }: Props) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-3 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/50">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{emoji} {label}</span>
        <span className="text-lg font-bold text-brand-600">{value || '—'}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value || 3}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
