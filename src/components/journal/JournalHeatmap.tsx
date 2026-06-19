import { useMemo } from 'react';
import { heatmapData } from '../../platform/journal/journalUtils';
import type { JournalEntry } from '../../core/types';

type Props = { entries: JournalEntry[]; weeks?: number };

export function JournalHeatmap({ entries, weeks = 12 }: Props) {
  const cells = useMemo(() => heatmapData(entries, weeks), [entries, weeks]);
  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="widget-card">
      <h3 className="mb-3 text-sm font-semibold">Writing activity</h3>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
        {cells.map((c) => {
          const intensity = c.count / max;
          return (
            <div
              key={c.date}
              title={`${c.date}: ${c.count} ${c.count === 1 ? 'entry' : 'entries'}`}
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{
                backgroundColor: c.count === 0
                  ? 'rgba(148,163,184,0.2)'
                  : `rgba(14, 165, 233, ${0.25 + intensity * 0.75})`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-400">Last {weeks} weeks · darker = more entries</p>
    </div>
  );
}
