import type { ActivityEntry, Category } from '../db/types';
import { formatDuration, formatMl } from '../lib/aggregates';

type Props = {
  entry: ActivityEntry;
  onEdit: () => void;
  onDelete: () => void;
};

const CATEGORY_LABELS: Record<Category, string> = {
  hydration: 'Water',
  gym: 'Gym',
  diet: 'Diet',
  work: 'Work',
  sleep: 'Sleep',
  note: 'Note',
};

function entrySummary(entry: ActivityEntry): string {
  switch (entry.category) {
    case 'hydration':
      return formatMl(entry.hydration?.amountMl ?? 0);
    case 'gym':
      return `${entry.gym?.activity ?? 'Workout'} · ${formatDuration(entry.gym?.durationMin ?? 0)}`;
    case 'diet':
      return `${entry.diet?.meal ?? 'meal'} · ${entry.diet?.calories ?? 0} kcal`;
    case 'work':
      return `${entry.work?.task ?? 'Task'} · ${formatDuration(entry.work?.durationMin ?? 0)}`;
    case 'sleep':
      return `${formatDuration(entry.sleep?.durationMin ?? 0)}${entry.sleep?.quality ? ` · ${entry.sleep.quality}/5` : ''}`;
    case 'note':
      return entry.note?.text ?? '';
  }
}

export function EntryCard({ entry, onEdit, onDelete }: Props) {
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {CATEGORY_LABELS[entry.category]}
          </span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <p className="mt-0.5 truncate text-sm">{entrySummary(entry)}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={onEdit} className="rounded p-1 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
          Edit
        </button>
        <button type="button" onClick={onDelete} className="rounded p-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
          Del
        </button>
      </div>
    </div>
  );
}
