import { useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import { toDateKey } from '../lib/dates';
import { useLiveQuery } from '../hooks/useLiveQuery';

export function JournalModule() {
  const { config } = useAppConfig();
  const entries = useLiveQuery(async () => {
    const all = await db.journalEntries.orderBy('date').reverse().toArray();
    return all.slice(0, 20);
  }, []);
  const [templateId, setTemplateId] = useState(config?.journalTemplates[0]?.id ?? 'morning');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [responses, setResponses] = useState<Record<string, string>>({});
  const template = config?.journalTemplates.find((t) => t.id === templateId);

  const save = async () => {
    await db.journalEntries.put({
      id: crypto.randomUUID(),
      date,
      templateId,
      responses,
      createdAt: new Date().toISOString(),
    });
    setResponses({});
  };

  return (
    <ModuleShell title="Journal" subtitle="Template-based journaling — fully customizable prompts">
      <div className="flex flex-wrap gap-2">
        <select className="input w-auto" value={templateId} onChange={(e) => { setTemplateId(e.target.value); setResponses({}); }}>
          {config?.journalTemplates.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
        </select>
        <input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <button type="button" className="btn-primary" onClick={save}>Save entry</button>
      </div>
      {template && (
        <div className="widget-card grid gap-4 lg:grid-cols-2">
          {template.prompts.map((p) => (
            <label key={p.id} className="block">
              <span className="text-sm font-medium">{p.label}</span>
              <textarea className="input mt-1 min-h-[100px]" placeholder={p.placeholder} value={responses[p.id] ?? ''} onChange={(e) => setResponses((r) => ({ ...r, [p.id]: e.target.value }))} />
            </label>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-500">Recent entries</h3>
        {entries?.map((e) => (
          <div key={e.id} className="widget-card text-sm">
            <span className="font-medium">{e.date}</span> · {config?.journalTemplates.find((t) => t.id === e.templateId)?.label}
            <p className="mt-1 text-slate-500 truncate">{Object.values(e.responses).join(' · ')}</p>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}
