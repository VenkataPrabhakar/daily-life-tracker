import type {
  AppConfig,
  CategoryDefinition,
  DashboardLayout,
  FieldDefinition,
  ModuleDefinition,
  WidgetDefinition,
} from '../../core/types';
import { createExtendedConfigFields } from './extensions';
import {
  buildExpenseCategories,
  INCOME_SOURCES,
  FINANCE_TAGS,
  ASSET_TYPES,
} from './financeCategories';
import {
  JOURNAL_TEMPLATES,
  JOURNAL_PROMPTS,
  DEFAULT_JOURNAL_REMINDERS,
} from './journalDefaults';

export const MODULES: ModuleDefinition[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard', group: 'core' },
  { id: 'health', label: 'Health', icon: '💚', path: '/health', group: 'core' },
  { id: 'habits', label: 'Habits', icon: '🔄', path: '/habits', group: 'core' },
  { id: 'goals', label: 'Goals', icon: '🎯', path: '/goals', group: 'core' },
  { id: 'productivity', label: 'Productivity', icon: '⚡', path: '/productivity', group: 'core' },
  { id: 'journal', label: 'Journal', icon: '📓', path: '/journal', group: 'core' },
  { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar', group: 'core' },
  { id: 'timeline', label: 'Timeline', icon: '🕐', path: '/timeline', group: 'core' },
  { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', group: 'finance' },
  { id: 'analytics', label: 'Analytics', icon: '📉', path: '/analytics', group: 'system' },
  { id: 'reports', label: 'Reports', icon: '📄', path: '/reports', group: 'system' },
  { id: 'achievements', label: 'Achievements', icon: '🏆', path: '/achievements', group: 'system' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/notifications', group: 'system' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', group: 'system' },
];

export const WIDGETS: WidgetDefinition[] = [
  { id: 'daily-score', label: 'Daily Score', category: 'general', defaultW: 3, defaultH: 2, minW: 2, minH: 2, formulaId: 'daily-score' },
  { id: 'recovery', label: 'Recovery Score', category: 'health', defaultW: 4, defaultH: 3, minW: 3, minH: 2, formulaId: 'recovery-index' },
  { id: 'streaks', label: 'Streaks', category: 'general', defaultW: 3, defaultH: 2 },
  { id: 'calendar-mini', label: 'Calendar', category: 'general', defaultW: 4, defaultH: 3 },
  { id: 'mood', label: 'Mood', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'sleep', label: 'Sleep', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'water', label: 'Water', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'steps', label: 'Steps', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'expense-summary', label: 'Expense Summary', category: 'finance', defaultW: 4, defaultH: 2 },
  { id: 'savings-progress', label: 'Savings Progress', category: 'finance', defaultW: 4, defaultH: 2 },
  { id: 'debt-progress', label: 'Debt Progress', category: 'finance', defaultW: 4, defaultH: 2 },
  { id: 'net-worth', label: 'Net Worth', category: 'finance', defaultW: 4, defaultH: 2, formulaId: 'net-worth' },
  { id: 'goals', label: 'Goals', category: 'general', defaultW: 4, defaultH: 2 },
  { id: 'journal', label: 'Journal', category: 'general', defaultW: 4, defaultH: 2 },
  { id: 'pomodoro', label: 'Pomodoro Timer', category: 'productivity', defaultW: 3, defaultH: 3 },
  { id: 'charts', label: 'Charts', category: 'general', defaultW: 6, defaultH: 3, minW: 4 },
  { id: 'upcoming-events', label: 'Upcoming Events', category: 'general', defaultW: 4, defaultH: 3 },
  { id: 'life-mode', label: 'Life Mode', category: 'general', defaultW: 3, defaultH: 2 },
  { id: 'relationships', label: 'Relationships', category: 'life', defaultW: 4, defaultH: 2 },
];

export const HEALTH_METRICS: FieldDefinition[] = [
  { id: 'sleep', label: 'Sleep', type: 'duration', unit: 'min' },
  { id: 'water', label: 'Water', type: 'number', unit: 'ml' },
  { id: 'weight', label: 'Weight', type: 'number', unit: 'kg' },
  { id: 'body-fat', label: 'Body Fat', type: 'number', unit: '%' },
  { id: 'calories', label: 'Calories', type: 'number', unit: 'kcal' },
  { id: 'protein', label: 'Protein', type: 'number', unit: 'g' },
  { id: 'fiber', label: 'Fiber', type: 'number', unit: 'g' },
  { id: 'carbs', label: 'Carbs', type: 'number', unit: 'g' },
  { id: 'fat', label: 'Fat', type: 'number', unit: 'g' },
  { id: 'sodium', label: 'Sodium', type: 'number', unit: 'mg' },
  { id: 'sugar', label: 'Sugar', type: 'number', unit: 'g' },
  { id: 'steps', label: 'Steps', type: 'number', unit: 'steps' },
  { id: 'workout', label: 'Workout', type: 'duration', unit: 'min' },
  { id: 'recovery', label: 'Recovery', type: 'rating', min: 1, max: 5 },
  { id: 'mood', label: 'Mood', type: 'rating', min: 1, max: 5 },
  { id: 'stress', label: 'Stress', type: 'rating', min: 1, max: 5 },
];

const expenseCats = buildExpenseCategories();

export const EXPENSE_CATEGORIES: CategoryDefinition[] = expenseCats;

export { INCOME_SOURCES } from './financeCategories';

export const DEBT_TYPES: CategoryDefinition[] = [
  'credit-card', 'student-loan', 'car-loan', 'mortgage', 'personal-loan',
  'family-loan', 'medical-debt', 'custom',
].map((id) => ({ id, label: id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), module: 'debt' }));

export const INVESTMENT_TYPES: CategoryDefinition[] = [
  'stocks', 'etfs', 'mutual-funds', 'crypto', 'bonds', 'gold', 'real-estate', 'retirement', 'custom',
].map((id) => ({ id, label: id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), module: 'investments' }));

export { JOURNAL_TEMPLATES } from './journalDefaults';

export const DEFAULT_DASHBOARD: DashboardLayout = {
  id: 'main',
  name: 'Main Dashboard',
  isDefault: true,
  items: [
    { instanceId: 'w1', widgetId: 'daily-score', x: 0, y: 0, w: 3, h: 2 },
    { instanceId: 'w2', widgetId: 'recovery', x: 3, y: 0, w: 4, h: 3 },
    { instanceId: 'w3', widgetId: 'life-mode', x: 7, y: 0, w: 3, h: 2 },
    { instanceId: 'w4', widgetId: 'water', x: 0, y: 2, w: 3, h: 2 },
    { instanceId: 'w5', widgetId: 'net-worth', x: 6, y: 2, w: 4, h: 2 },
    { instanceId: 'w6', widgetId: 'charts', x: 0, y: 4, w: 6, h: 3 },
    { instanceId: 'w7', widgetId: 'goals', x: 6, y: 4, w: 4, h: 2 },
    { instanceId: 'w8', widgetId: 'upcoming-events', x: 6, y: 6, w: 4, h: 3 },
  ],
};

export function createDefaultConfig(): AppConfig {
  return {
    id: 'default',
    modules: MODULES,
    widgets: WIDGETS,
    healthMetrics: HEALTH_METRICS,
    expenseCategories: EXPENSE_CATEGORIES,
    incomeSources: INCOME_SOURCES,
    debtTypes: DEBT_TYPES,
    investmentTypes: INVESTMENT_TYPES,
    journalTemplates: JOURNAL_TEMPLATES,
    journalPrompts: JOURNAL_PROMPTS,
    journalReminders: DEFAULT_JOURNAL_REMINDERS,
    habitCategories: [
      { id: 'fitness', label: 'Fitness', module: 'habits', icon: '🏋️' },
      { id: 'nutrition', label: 'Nutrition', module: 'habits', icon: '🍽️' },
      { id: 'mindfulness', label: 'Mindfulness', module: 'habits', icon: '🧘' },
      { id: 'productivity', label: 'Productivity', module: 'habits', icon: '💼' },
    ],
    goalCategories: [
      { id: 'health', label: 'Health', module: 'goals' },
      { id: 'finance', label: 'Finance', module: 'goals' },
      { id: 'career', label: 'Career', module: 'goals' },
      { id: 'personal', label: 'Personal', module: 'goals' },
    ],
    taskCategories: [
      { id: 'coding', label: 'Coding', module: 'productivity' },
      { id: 'reading', label: 'Reading', module: 'productivity' },
      { id: 'learning', label: 'Learning', module: 'productivity' },
      { id: 'deep-work', label: 'Deep Work', module: 'productivity' },
    ],
    paymentMethods: [
      { id: 'cash', label: 'Cash' },
      { id: 'debit', label: 'Debit Card' },
      { id: 'credit', label: 'Credit Card' },
      { id: 'bank', label: 'Bank Transfer' },
    ],
    financeTags: FINANCE_TAGS,
    assetTypes: ASSET_TYPES,
    budgetMode: 'custom',
    dashboards: [DEFAULT_DASHBOARD],
    debtStrategy: 'snowball',
    version: 5,
    ...createExtendedConfigFields(),
  };
}

export { createExtendedConfigFields };
