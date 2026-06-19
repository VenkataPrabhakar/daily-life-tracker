import Dexie, { type Table } from 'dexie';
import type {
  Achievement,
  AppConfig,
  Bill,
  CalendarEvent,
  DailyGoals,
  DailyLog,
  Debt,
  DebtPayment,
  Goal,
  Habit,
  HabitLog,
  HealthEntry,
  HomeItem,
  Investment,
  JournalEntry,
  LifeDocument,
  Notification,
  Relationship,
  RelationshipInteraction,
  SavingsContribution,
  SavingsFund,
  Task,
  Transaction,
  Budget,
} from '../core/types';
import { createDefaultConfig } from '../config/defaults';
import { migrateConfig } from '../config/migrate';

export class LifeOSDatabase extends Dexie {
  appConfig!: Table<AppConfig, string>;
  logs!: Table<DailyLog, string>;
  goals!: Table<DailyGoals, string>;
  healthEntries!: Table<HealthEntry, string>;
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;
  goalItems!: Table<Goal, string>;
  journalEntries!: Table<JournalEntry, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  savingsFunds!: Table<SavingsFund, string>;
  savingsContributions!: Table<SavingsContribution, string>;
  debts!: Table<Debt, string>;
  debtPayments!: Table<DebtPayment, string>;
  investments!: Table<Investment, string>;
  bills!: Table<Bill, string>;
  tasks!: Table<Task, string>;
  notifications!: Table<Notification, string>;
  achievements!: Table<Achievement, string>;
  relationships!: Table<Relationship, string>;
  interactions!: Table<RelationshipInteraction, string>;
  homeItems!: Table<HomeItem, string>;
  documents!: Table<LifeDocument, string>;
  calendarEvents!: Table<CalendarEvent, string>;

  constructor() {
    super('DailyLifeTracker');
    this.version(1).stores({
      appConfig: 'id',
      logs: 'date',
      goals: 'id',
      healthEntries: 'id, date, metricId',
      habits: 'id, categoryId, active',
      habitLogs: 'id, habitId, date',
      goalItems: 'id, categoryId, active',
      journalEntries: 'id, date, templateId',
      transactions: 'id, type, date, categoryId',
      budgets: 'id, categoryId, year',
      savingsFunds: 'id',
      savingsContributions: 'id, fundId, date',
      debts: 'id',
      debtPayments: 'id, debtId, date',
      investments: 'id, typeId',
      bills: 'id, dueDate, status',
      tasks: 'id, status, categoryId',
      notifications: 'id, read, createdAt',
      achievements: 'id',
    });
    this.version(2).stores({
      relationships: 'id, categoryId',
      interactions: 'id, relationshipId, date',
      homeItems: 'id, categoryId, status',
      documents: 'id, categoryId, createdAt',
      calendarEvents: 'id, date, type',
    });
  }
}

export const db = new LifeOSDatabase();

export async function initDatabase(): Promise<AppConfig> {
  const existing = await db.appConfig.get('default');
  if (existing) {
    const migrated = migrateConfig(existing);
    if (migrated.version !== existing.version || !existing.lifeModes) {
      await db.appConfig.put(migrated);
    }
    return migrated;
  }
  const config = createDefaultConfig();
  await db.appConfig.put(config);
  await db.goals.put({
    id: 'default',
    hydrationMl: 2500,
    gymMin: 45,
    sleepMin: 480,
    calories: 2000,
    workMin: 480,
  });
  return config;
}

export async function getAppConfig(): Promise<AppConfig> {
  const cfg = await db.appConfig.get('default');
  if (cfg) return migrateConfig(cfg);
  return initDatabase();
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
  await db.appConfig.put(config);
}

export async function exportLifeOSData() {
  const [
    config, logs, goals, healthEntries, habits, habitLogs, goalItems,
    journalEntries, transactions, budgets, savingsFunds, savingsContributions,
    debts, debtPayments, investments, bills, tasks, notifications, achievements,
    relationships, interactions, homeItems, documents, calendarEvents,
  ] = await Promise.all([
    getAppConfig(),
    db.logs.toArray(),
    db.goals.toArray(),
    db.healthEntries.toArray(),
    db.habits.toArray(),
    db.habitLogs.toArray(),
    db.goalItems.toArray(),
    db.journalEntries.toArray(),
    db.transactions.toArray(),
    db.budgets.toArray(),
    db.savingsFunds.toArray(),
    db.savingsContributions.toArray(),
    db.debts.toArray(),
    db.debtPayments.toArray(),
    db.investments.toArray(),
    db.bills.toArray(),
    db.tasks.toArray(),
    db.notifications.toArray(),
    db.achievements.toArray(),
    db.relationships.toArray(),
    db.interactions.toArray(),
    db.homeItems.toArray(),
    db.documents.toArray(),
    db.calendarEvents.toArray(),
  ]);
  return {
    version: 4 as const,
    exportedAt: new Date().toISOString(),
    config,
    logs, goals, healthEntries, habits, habitLogs, goalItems,
    journalEntries, transactions, budgets, savingsFunds, savingsContributions,
    debts, debtPayments, investments, bills, tasks, notifications, achievements,
    relationships, interactions, homeItems, documents, calendarEvents,
  };
}

export async function importLifeOSData(data: Record<string, unknown>): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    if (data.config) await db.appConfig.put(migrateConfig(data.config as AppConfig));
    const arrays: [Table<unknown, string>, unknown[] | undefined][] = [
      [db.logs, data.logs as unknown[]],
      [db.goals, data.goals as unknown[]],
      [db.healthEntries, data.healthEntries as unknown[]],
      [db.habits, data.habits as unknown[]],
      [db.habitLogs, data.habitLogs as unknown[]],
      [db.goalItems, data.goalItems as unknown[]],
      [db.journalEntries, data.journalEntries as unknown[]],
      [db.transactions, data.transactions as unknown[]],
      [db.budgets, data.budgets as unknown[]],
      [db.savingsFunds, data.savingsFunds as unknown[]],
      [db.savingsContributions, data.savingsContributions as unknown[]],
      [db.debts, data.debts as unknown[]],
      [db.debtPayments, data.debtPayments as unknown[]],
      [db.investments, data.investments as unknown[]],
      [db.bills, data.bills as unknown[]],
      [db.tasks, data.tasks as unknown[]],
      [db.notifications, data.notifications as unknown[]],
      [db.achievements, data.achievements as unknown[]],
      [db.relationships, data.relationships as unknown[]],
      [db.interactions, data.interactions as unknown[]],
      [db.homeItems, data.homeItems as unknown[]],
      [db.documents, data.documents as unknown[]],
      [db.calendarEvents, data.calendarEvents as unknown[]],
    ];
    for (const [table, items] of arrays) {
      if (items?.length) await table.bulkPut(items);
    }
  });
}

export async function getDailyLog(date: string): Promise<DailyLog> {
  const existing = await db.logs.get(date);
  return existing ?? { date, entries: [], updatedAt: new Date().toISOString() };
}
export async function saveDailyLog(log: DailyLog) {
  await db.logs.put({ ...log, updatedAt: new Date().toISOString() });
}
export async function getLogsInRange(start: string, end: string) {
  return db.logs.where('date').between(start, end, true, true).toArray();
}
export async function getAllLogs() {
  return db.logs.orderBy('date').toArray();
}
export async function getGoals(): Promise<DailyGoals> {
  const g = await db.goals.get('default');
  return g ?? { id: 'default', hydrationMl: 2500, gymMin: 45, sleepMin: 480, calories: 2000, workMin: 480 };
}
export async function saveGoals(goals: DailyGoals) {
  await db.goals.put(goals);
}
