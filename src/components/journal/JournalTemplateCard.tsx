import type { JournalTemplate } from '../../core/types';

type Props = {
  template: JournalTemplate;
  entryCount?: number;
  onSelect: () => void;
  active?: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  daily: 'from-amber-500/15 to-orange-500/10 border-amber-500/30',
  reflection: 'from-violet-500/15 to-indigo-500/10 border-violet-500/30',
  activity: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/30',
  free: 'from-slate-500/15 to-slate-400/10 border-slate-500/30',
};

export function JournalTemplateCard({ template, entryCount = 0, onSelect, active }: Props) {
  const color = CATEGORY_COLORS[template.category ?? 'free'] ?? CATEGORY_COLORS.free;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg ${color} ${active ? 'ring-2 ring-brand-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl">{template.icon}</span>
        {entryCount > 0 && (
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
            {entryCount} entries
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold">{template.label}</h3>
      {template.description && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{template.description}</p>
      )}
      <p className="mt-3 text-xs font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
        Start writing →
      </p>
    </button>
  );
}
