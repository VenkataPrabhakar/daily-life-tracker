export {
  db,
  initDatabase,
  getAppConfig,
  saveAppConfig,
  exportLifeOSData,
  importLifeOSData,
  getDailyLog,
  saveDailyLog,
  getLogsInRange,
  getAllLogs,
  getGoals,
  saveGoals,
} from './lifeOsDatabase';

export async function exportAllData() {
  const { exportLifeOSData } = await import('./lifeOsDatabase');
  const full = await exportLifeOSData();
  return {
    version: full.version,
    exportedAt: full.exportedAt,
    logs: full.logs,
    goals: full.goals[0] ?? { id: 'default', hydrationMl: 2500, gymMin: 45, sleepMin: 480, calories: 2000, workMin: 480 },
  };
}

export async function importAllData(data: { logs?: unknown[]; goals?: unknown }) {
  const { importLifeOSData } = await import('./lifeOsDatabase');
  return importLifeOSData(data as Record<string, unknown>);
}

export async function clearAllData() {
  const { db } = await import('./lifeOsDatabase');
  const { createDefaultConfig } = await import('../config/defaults');
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
    await db.appConfig.put(createDefaultConfig());
    await db.goals.put({ id: 'default', hydrationMl: 2500, gymMin: 45, sleepMin: 480, calories: 2000, workMin: 480 });
  });
}
