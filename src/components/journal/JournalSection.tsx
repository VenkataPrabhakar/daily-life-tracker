import type { DailyJournal } from '../../db/types';
import { DEFAULT_JOURNAL } from '../../db/types';

type Props = {
  journal: DailyJournal;
  onChange: (journal: DailyJournal) => void;
  onSave: () => void;
  saving?: boolean;
};

const fields: { key: keyof DailyJournal; label: string; placeholder: string; icon: string }[] = [
  { key: 'achievements', label: 'Achievements', placeholder: 'What went well today?', icon: '🏆' },
  { key: 'challenges', label: 'Challenges', placeholder: 'What was difficult?', icon: '⚡' },
  { key: 'tomorrowFocus', label: "Tomorrow's Focus", placeholder: 'One priority for tomorrow', icon: '🎯' },
];

export function JournalSection({ journal, onChange, onSave, saving }: Props) {
  const data = { ...DEFAULT_JOURNAL, ...journal };

  return (
    <section className="widget-card animate-fade-in space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Daily Journal</h2>
        <p className="text-sm text-slate-500">Reflect on your day and set tomorrow's intention</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {fields.map(({ key, label, placeholder, icon }) => (
          <label key={key} className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium">
              <span>{icon}</span> {label}
            </span>
            <textarea
              className="input min-h-[100px] resize-none"
              value={data[key]}
              placeholder={placeholder}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <button type="button" onClick={onSave} className="btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save journal'}
      </button>
    </section>
  );
}
