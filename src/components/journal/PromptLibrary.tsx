import { useMemo, useState } from 'react';
import type { JournalPrompt, JournalPromptCategory } from '../../core/types';
import { PROMPT_CATEGORY_LABELS } from '../../config/defaults/journalDefaults';

type Props = {
  prompts: JournalPrompt[];
  onUse: (prompt: JournalPrompt) => void;
};

export function PromptLibrary({ prompts, onUse }: Props) {
  const [category, setCategory] = useState<JournalPromptCategory | 'all'>('all');
  const filtered = useMemo(
    () => (category === 'all' ? prompts : prompts.filter((p) => p.category === category)),
    [prompts, category],
  );

  const categories = Object.keys(PROMPT_CATEGORY_LABELS) as JournalPromptCategory[];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`rounded-full px-3 py-1 text-xs ${category === 'all' ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setCategory('all')}>All</button>
        {categories.map((c) => (
          <button key={c} type="button" className={`rounded-full px-3 py-1 text-xs ${category === c ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => setCategory(c)}>
            {PROMPT_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onUse(p)}
            className="widget-card text-left transition hover:border-brand-500/40 hover:shadow-md"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-brand-600">{PROMPT_CATEGORY_LABELS[p.category]}</span>
            <p className="mt-1 text-sm">{p.text}</p>
            <p className="mt-2 text-xs text-brand-500">Use prompt →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
