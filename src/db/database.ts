import Dexie, { type Table } from 'dexie';
import type { DailyGoals, DailyLog } from './types';
import { DEFAULT_GOALS } from './types';

export class LifeTrackerDB extends Dexie {
  logs!: Table<DailyLog, string>;
  goals!: Table<DailyGoals, string>;

  constructor() {
    super('DailyLifeTracker');
    this.version(1).stores({
      logs: 'date',
      goals: 'id',
    });
  }
}

export const db = new LifeTrackerDB();

export async function getDailyLog(date: string): Promise<DailyLog> {
  const existing = await db.logs.get(date);
  if (existing) return existing;
  return { date, entries: [], updatedAt: new Date().toISOString() };
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  await db.logs.put({ ...log, updatedAt: new Date().toISOString() });
}

export async function getLogsInRange(startDate: string, endDate: string): Promise<DailyLog[]> {
  return db.logs.where('date').between(startDate, endDate, true, true).toArray();
}

export async function getAllLogs(): Promise<DailyLog[]> {
  return db.logs.orderBy('date').toArray();
}

export async function getGoals(): Promise<DailyGoals> {
  const existing = await db.goals.get('default');
  if (existing) return existing;
  await db.goals.put(DEFAULT_GOALS);
  return DEFAULT_GOALS;
}

export async function saveGoals(goals: DailyGoals): Promise<void> {
  await db.goals.put(goals);
}

export async function exportAllData() {
  const [logs, goals] = await Promise.all([getAllLogs(), getGoals()]);
  return {
    version: 2 as const,
    exportedAt: new Date().toISOString(),
    logs,
    goals,
  };
}

export async function importAllData(data: {
  logs?: DailyLog[];
  goals?: DailyGoals;
}): Promise<void> {
  await db.transaction('rw', db.logs, db.goals, async () => {
    if (data.logs?.length) {
      await db.logs.bulkPut(data.logs);
    }
    if (data.goals) {
      await db.goals.put({ ...data.goals, id: 'default' });
    }
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.logs, db.goals, async () => {
    await db.logs.clear();
    await db.goals.clear();
    await db.goals.put(DEFAULT_GOALS);
  });
}
