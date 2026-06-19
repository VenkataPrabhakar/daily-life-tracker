import { useMemo, useState } from 'react';
import { TIME_BLOCKS } from '../db/types';
import { useDailyLog } from '../hooks/useDailyLog';
import { entriesForTimeBlock, computeDayTotals, formatDuration, formatMl, progressPercent } from '../lib/aggregates';
import { toDateKey } from '../lib/dates';
import { QuickAddBar } from '../components/QuickAddBar';
import { SummaryCard } from '../components/SummaryCard';
import { TimeBlockSection, quickGymEntry, quickWaterEntry } from '../components/TimeBlockSection';
import { getGoals } from '../db/database';
import { useEffect } from 'react';
import type { DailyGoals } from '../db/types';

type Props = { initialDate?: string };

export function TodayPage({ initialDate }: Props = {}) {
  const [selectedDate, setSelectedDate] = useState(initialDate ?? toDateKey(new Date()));
  const { log, loading, addEntry, updateEntry, deleteEntry } = useDailyLog(selectedDate);
  const [goals, setGoals] = useState<DailyGoals | null>(null);

  useEffect(() => {
    getGoals().then(setGoals);
  }, []);

  const totals = useMemo(() => (log ? computeDayTotals(log) : null), [log]);

  if (loading || !log) {
    return <p className="text-center text-slate-500">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm text-slate-500">Log your day by time block</p>
        </div>
        <input
          type="date"
          className="input w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </header>

      {totals && goals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard label="Water" value={formatMl(totals.hydrationMl)} emoji="💧" percent={progressPercent(totals.hydrationMl, goals.hydrationMl)} />
          <SummaryCard label="Gym" value={formatDuration(totals.gymMin)} emoji="🏋️" percent={progressPercent(totals.gymMin, goals.gymMin)} />
          <SummaryCard label="Diet" value={`${totals.dietCalories} kcal`} emoji="🍽️" percent={progressPercent(totals.dietCalories, goals.calories)} />
          <SummaryCard label="Work" value={formatDuration(totals.workMin)} emoji="💼" percent={progressPercent(totals.workMin, goals.workMin)} />
          <SummaryCard label="Sleep" value={formatDuration(totals.sleepMin)} emoji="😴" percent={progressPercent(totals.sleepMin, goals.sleepMin)} />
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

      <QuickAddBar
        onQuickWater={(block, ml) => addEntry(quickWaterEntry(block, ml))}
        onQuickGym={(block, min) => addEntry(quickGymEntry(block, min))}
      />
    </div>
  );
}
