import { useState } from 'react';
import type { ActivityEntry, Category, TimeBlock } from '../db/types';
import { CATEGORIES } from '../db/types';
import { clampNumber } from '../lib/dates';
import { EntryForm } from './EntryForm';
import { EntryCard } from './EntryCard';

type Props = {
  block: TimeBlock;
  label: string;
  hint: string;
  entries: ActivityEntry[];
  onAdd: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  onUpdate: (entry: ActivityEntry) => void;
  onDelete: (id: string) => void;
};

export function TimeBlockSection({
  block,
  label,
  hint,
  entries,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [addingCategory, setAddingCategory] = useState<Category | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (data: Omit<ActivityEntry, 'id' | 'timestamp' | 'timeBlock' | 'category'>) => {
    if (addingCategory) {
      onAdd({ ...data, timeBlock: block, category: addingCategory });
      setAddingCategory(null);
    }
  };

  return (
    <section className="card">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {entries.length} entries
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setEditingId(null);
              setAddingCategory(cat.id);
            }}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-brand-950"
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {addingCategory && (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950">
          <EntryForm
            category={addingCategory}
            onSubmit={handleSubmit}
            onCancel={() => setAddingCategory(null)}
          />
        </div>
      )}

      <div className="space-y-2">
        {entries.length === 0 && !addingCategory && (
          <p className="py-4 text-center text-sm text-slate-400">No entries yet — tap a category above</p>
        )}
        {entries.map((entry) =>
          editingId === entry.id ? (
            <div key={entry.id} className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950">
              <EntryForm
                category={entry.category}
                initial={entry}
                onSubmit={(data) => {
                  onUpdate({ ...entry, ...data, timeBlock: block, category: entry.category });
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setAddingCategory(null);
                setEditingId(entry.id);
              }}
              onDelete={() => onDelete(entry.id)}
            />
          ),
        )}
      </div>
    </section>
  );
}

export function quickWaterEntry(block: TimeBlock, amountMl: number): Omit<ActivityEntry, 'id' | 'timestamp'> {
  return {
    timeBlock: block,
    category: 'hydration',
    hydration: { amountMl: clampNumber(amountMl, 0, 5000) },
  };
}

export function quickGymEntry(block: TimeBlock, durationMin: number): Omit<ActivityEntry, 'id' | 'timestamp'> {
  return {
    timeBlock: block,
    category: 'gym',
    gym: { durationMin: clampNumber(durationMin, 0, 600), activity: 'Workout' },
  };
}
