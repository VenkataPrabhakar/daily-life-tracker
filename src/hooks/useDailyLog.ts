import { useCallback, useEffect, useState } from 'react';
import { getDailyLog, saveDailyLog } from '../db/database';
import type { ActivityEntry, DailyLog } from '../db/types';
import { generateId } from '../lib/dates';

export function useDailyLog(date: string) {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getDailyLog(date);
    setLog(data);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback(
    async (updated: DailyLog) => {
      setLog(updated);
      await saveDailyLog(updated);
    },
    [],
  );

  const addEntry = useCallback(
    async (entry: Omit<ActivityEntry, 'id' | 'timestamp'> & { timestamp?: string }) => {
      if (!log) return;
      const newEntry: ActivityEntry = {
        ...entry,
        id: generateId(),
        timestamp: entry.timestamp ?? new Date().toISOString(),
      };
      await persist({ ...log, entries: [...log.entries, newEntry] });
    },
    [log, persist],
  );

  const updateEntry = useCallback(
    async (entry: ActivityEntry) => {
      if (!log) return;
      await persist({
        ...log,
        entries: log.entries.map((e) => (e.id === entry.id ? entry : e)),
      });
    },
    [log, persist],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!log) return;
      await persist({ ...log, entries: log.entries.filter((e) => e.id !== id) });
    },
    [log, persist],
  );

  const saveJournal = useCallback(
    async (journal: DailyLog['journal']) => {
      if (!log) return;
      await persist({ ...log, journal });
    },
    [log, persist],
  );

  return { log, loading, refresh, addEntry, updateEntry, deleteEntry, saveJournal };
}
