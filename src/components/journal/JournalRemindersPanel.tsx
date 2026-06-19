import type { JournalReminder, JournalTemplate } from '../../core/types';

type Props = {
  reminders: JournalReminder[];
  templates: JournalTemplate[];
  onChange: (reminders: JournalReminder[]) => void;
};

export function JournalRemindersPanel({ reminders, templates, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(reminders.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const requestPermission = async () => {
    if ('Notification' in window) await Notification.requestPermission();
  };

  const label = (r: JournalReminder) => {
    const t = templates.find((x) => x.id === r.templateId);
    const freq = r.frequency === 'daily' ? 'Daily' : r.frequency === 'weekly' ? `Weekly (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][r.dayOfWeek ?? 0]})` : `Monthly (day ${r.dayOfMonth ?? 1})`;
    return `${t?.icon ?? '📓'} ${t?.label ?? r.templateId} · ${freq} at ${r.time}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-slate-500">Browser reminders when this app is open</p>
        <button type="button" className="btn-secondary text-xs" onClick={requestPermission}>Enable notifications</button>
      </div>
      {reminders.map((r) => (
        <div key={r.id} className="widget-card flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{label(r)}</p>
            <p className="text-xs text-slate-400">{r.enabled ? 'Active' : 'Paused'}</p>
          </div>
          <button type="button" className={`rounded-xl px-3 py-1 text-xs ${r.enabled ? 'bg-brand-600 text-white' : 'btn-secondary'}`} onClick={() => toggle(r.id)}>
            {r.enabled ? 'On' : 'Off'}
          </button>
        </div>
      ))}
    </div>
  );
}
