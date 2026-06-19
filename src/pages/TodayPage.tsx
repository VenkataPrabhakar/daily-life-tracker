import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_JOURNAL, TIME_BLOCKS, type DailyGoals, type DailyJournal } from '../db/types';
import { useDailyLog } from '../hooks/useDailyLog';
import {
  entriesForTimeBlock,
  computeDayTotals,
  formatDuration,
  formatMl,
  progressPercent,
} from '../lib/aggregates';
import { toDateKey } from '../lib/dates';
import { QuickAddBar } from '../components/QuickAddBar';
import { StatWidget } from '../components/widgets/StatWidget';
import { RecoveryScoreWidget } from '../components/widgets/RecoveryScoreWidget';
import { TimeBlockSection, quickGymEntry, quickWaterEntry } from '../components/TimeBlockSection';
import { JournalSection } from '../components/journal/JournalSection';
import { getGoals } from '../db/database';

type Props = { initialDate?: string };

export function TodayPage({ initialDate }: Props = {}) {
  const [selectedDate, setSelectedDate] = useState(initialDate ?? toDateKey(new Date()));
  const { log, loading, addEntry, updateEntry, deleteEntry, saveJournal } = useDailyLog(selectedDate);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [journal, setJournal] = useState<DailyJournal>(DEFAULT_JOURNAL);
  const [journalSaving, setJournalSaving] = useState(false);

  useEffect(() => {
    getGoals().then(setGoals);
  }, []);

  useEffect(() => {
    if (log?.journal) setJournal({ ...DEFAULT_JOURNAL, ...log.journal });
    else setJournal(DEFAULT_JOURNAL);
  }, [log?.date, log?.journal]);

  const totals = useMemo(
    () => (log && goals ? computeDayTotals(log, goals) : null),
    [log, goals],
  );

  const handleSaveJournal = async () => {
    setJournalSaving(true);
    await saveJournal(journal);
    setJournalSaving(false);
  };

  if (loading || !log) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Daily Log</p>
          <h1 className="text-3xl font-bold tracking-tight">Today</h1>
          <p className="mt-1 text-sm text-slate-500">Track habits by time block</p>
        </div>
        <input
          type="date"
          className="input w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </header>

      {totals && goals && (
        <div className="grid gap-4 lg:grid-cols-3">
          <RecoveryScoreWidget score={totals.recoveryScore} />
          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            <StatWidget label="Water" value={formatMl(totals.hydrationMl)} emoji="💧" percent={progressPercent(totals.hydrationMl, goals.hydrationMl)} />
            <StatWidget label="Gym" value={formatDuration(totals.gymMin)} emoji="🏋️" percent={progressPercent(totals.gymMin, goals.gymMin)} accent="emerald" />
            <StatWidget label="Diet" value={`${totals.dietCalories} kcal`} emoji="🍽️" percent={progressPercent(totals.dietCalories, goals.calories)} />
            <StatWidget label="Sleep" value={formatDuration(totals.sleepMin)} emoji="😴" percent={progressPercent(totals.sleepMin, goals.sleepMin)} accent="violet" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {TIME_BLOCKS.map((block) => (
          <TimeBlockSection
            key={block.id}
            block={block.id}
            label={block.label}
            hint={block.hint}
            entries={entriesForTimeBlock(log.entries, block.id)}
            onAdd={addEntry}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
          />
        ))}
      </div>

      <JournalSection
        journal={journal}
        onChange={setJournal}
        onSave={handleSaveJournal}
        saving={journalSaving}
      />

      <QuickAddBar
        onQuickWater={(block, ml) => addEntry(quickWaterEntry(block, ml))}
        onQuickGym={(block, min) => addEntry(quickGymEntry(block, min))}
      />
    </div>
  );
}
