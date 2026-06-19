import { useEffect, useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { useAppConfig } from '../context/ConfigContext';
import { db } from '../db/lifeOsDatabase';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { JournalTemplateCard } from '../components/journal/JournalTemplateCard';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { JournalHeatmap } from '../components/journal/JournalHeatmap';
import { JournalCalendar, JournalTimeline } from '../components/journal/JournalCalendar';
import { PromptLibrary } from '../components/journal/PromptLibrary';
import { JournalRemindersPanel } from '../components/journal/JournalRemindersPanel';
import type { JournalEntry, JournalPrompt, JournalTemplate } from '../core/types';
import {
  averageMetric,
  computeJournalStreak,
  entryPreview,
  moodEmoji,
  shouldFireReminder,
} from '../platform/journal/journalUtils';

type Tab = 'home' | 'write' | 'entries' | 'calendar' | 'timeline' | 'library' | 'reminders';

export function JournalModule() {
  const { config, updateConfig } = useAppConfig();
  const entries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().toArray(), []);
  const [tab, setTab] = useState<Tab>('home');
  const [activeTemplate, setActiveTemplate] = useState<JournalTemplate | null>(null);
  const [extraPrompt, setExtraPrompt] = useState<JournalPrompt | null>(null);
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const templates = config?.journalTemplates ?? [];
  const prompts = config?.journalPrompts ?? [];
  const reminders = config?.journalReminders ?? [];

  const streak = useMemo(() => computeJournalStreak(entries ?? []), [entries]);
  const countsByTemplate = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries ?? []) m.set(e.templateId, (m.get(e.templateId) ?? 0) + 1);
    return m;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let list = entries ?? [];
    if (favoritesOnly) list = list.filter((e) => e.favorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        entryPreview(e, 500).toLowerCase().includes(q)
        || e.tags?.some((t) => t.toLowerCase().includes(q))
        || templates.find((t) => t.id === e.templateId)?.label.toLowerCase().includes(q),
      );
    }
    return list;
  }, [entries, search, favoritesOnly, templates]);

  useEffect(() => {
    const tick = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const now = new Date();
      for (const r of reminders) {
        if (shouldFireReminder(now, r)) {
          const t = templates.find((x) => x.id === r.templateId);
          new Notification('Journal reminder', { body: `Time for your ${t?.label ?? 'journal entry'}` });
        }
      }
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [reminders, templates]);

  const openWrite = (template: JournalTemplate, prompt?: JournalPrompt | null) => {
    setActiveTemplate(template);
    setExtraPrompt(prompt ?? null);
    setTab('write');
  };

  const saveEntry = async (data: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    await db.journalEntries.put({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    setActiveTemplate(null);
    setExtraPrompt(null);
    setTab('home');
  };

  const toggleFavorite = async (entry: JournalEntry) => {
    await db.journalEntries.put({ ...entry, favorite: !entry.favorite });
  };

  const deleteEntry = async (id: string) => {
    if (confirm('Delete this entry?')) await db.journalEntries.delete(id);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'entries', label: 'Entries' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'library', label: 'Prompts' },
    { id: 'reminders', label: 'Reminders' },
  ];

  return (
    <ModuleShell title="Journal" subtitle="Your diary & reflection space — guided, beautiful, daily">
      <nav className="-mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'home' && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="widget-card bg-gradient-to-br from-brand-500/10 to-transparent">
              <p className="text-xs text-slate-500">Current streak</p>
              <p className="text-3xl font-bold">{streak.current} <span className="text-base font-normal text-slate-500">days</span></p>
            </div>
            <div className="widget-card">
              <p className="text-xs text-slate-500">Longest streak</p>
              <p className="text-3xl font-bold">{streak.longest}</p>
            </div>
            <div className="widget-card">
              <p className="text-xs text-slate-500">Total entries</p>
              <p className="text-3xl font-bold">{entries?.length ?? 0}</p>
            </div>
          </div>

          <JournalHeatmap entries={entries ?? []} />

          <div>
            <h3 className="mb-3 text-sm font-semibold">Choose your journal</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <JournalTemplateCard
                  key={t.id}
                  template={t}
                  entryCount={countsByTemplate.get(t.id) ?? 0}
                  onSelect={() => openWrite(t)}
                />
              ))}
            </div>
          </div>

          {(entries?.length ?? 0) > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Recent reflections</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {(entries ?? []).slice(0, 4).map((e) => {
                  const t = templates.find((x) => x.id === e.templateId);
                  return (
                    <div key={e.id} className="widget-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{t?.icon} {t?.label}</p>
                          <p className="text-xs text-slate-500">{e.date} {e.time && `· ${e.time}`} · {moodEmoji(e.mood)}</p>
                        </div>
                        {e.favorite && <span>⭐</span>}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{entryPreview(e)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="widget-card text-center"><p className="text-xs text-slate-500">Avg mood</p><p className="text-xl font-bold">{averageMetric(entries ?? [], 'mood') ?? '—'}</p></div>
            <div className="widget-card text-center"><p className="text-xs text-slate-500">Avg energy</p><p className="text-xl font-bold">{averageMetric(entries ?? [], 'energy') ?? '—'}</p></div>
            <div className="widget-card text-center"><p className="text-xs text-slate-500">Avg stress</p><p className="text-xl font-bold">{averageMetric(entries ?? [], 'stress') ?? '—'}</p></div>
          </div>
        </div>
      )}

      {tab === 'write' && activeTemplate && (
        <JournalEntryForm
          template={activeTemplate}
          extraPrompt={extraPrompt}
          onSave={saveEntry}
          onCancel={() => { setActiveTemplate(null); setTab('home'); }}
        />
      )}

      {tab === 'write' && !activeTemplate && (
        <p className="text-sm text-slate-400">Pick a journal type from Home to start writing.</p>
      )}

      {tab === 'entries' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input className="input flex-1 text-sm" placeholder="Search entries, tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} /> Favorites</label>
          </div>
          {filteredEntries.map((e) => {
            const t = templates.find((x) => x.id === e.templateId);
            return (
              <div key={e.id} className="widget-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{t?.icon} {t?.label}</p>
                    <p className="text-xs text-slate-500">{e.date} {e.time && `· ${e.time}`} {e.weather && `· ${e.weather}`}</p>
                    <p className="text-xs text-slate-400">Mood {e.mood}/5 · Energy {e.energy}/5 · Stress {e.stress}/5</p>
                    {e.tags?.length ? <p className="mt-1 text-xs text-brand-500">{e.tags.map((tag) => `#${tag}`).join(' ')}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="text-sm" onClick={() => toggleFavorite(e)}>{e.favorite ? '⭐' : '☆'}</button>
                    <button type="button" className="text-xs text-rose-500" onClick={() => deleteEntry(e.id)}>Delete</button>
                  </div>
                </div>
                <p className="mt-2 text-sm">{entryPreview(e, 300)}</p>
                {e.attachments?.some((a) => a.type === 'image') && (
                  <div className="mt-2 flex gap-2">
                    {e.attachments.filter((a) => a.type === 'image').map((a) => (
                      <img key={a.id} src={a.dataUrl} alt={a.name} className="h-20 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredEntries.length === 0 && <p className="text-sm text-slate-400">No entries match your filters</p>}
        </div>
      )}

      {tab === 'calendar' && (
        <JournalCalendar
          entries={entries ?? []}
          onSelectDate={(d) => { setSearch(d); setTab('entries'); }}
        />
      )}

      {tab === 'timeline' && <JournalTimeline entries={entries ?? []} />}

      {tab === 'library' && (
        <PromptLibrary
          prompts={prompts}
          onUse={(p) => {
            const template = templates.find((t) => t.id === 'freeform') ?? templates[0];
            if (template) openWrite(template, p);
          }}
        />
      )}

      {tab === 'reminders' && (
        <JournalRemindersPanel
          reminders={reminders}
          templates={templates}
          onChange={(journalReminders) => updateConfig({ journalReminders })}
        />
      )}
    </ModuleShell>
  );
}
