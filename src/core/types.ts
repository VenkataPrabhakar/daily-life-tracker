/** Life OS — extensible field types for any module */
export * from './platform-types';
import type { ExtendedAppConfigFields, ModuleGroup } from './platform-types';
export type { CalendarViewMode, LifeModeId, ModuleGroup, ReportPeriod, SearchResult } from './platform-types';
export type FieldType =
  | 'checkbox'
  | 'number'
  | 'duration'
  | 'rating'
  | 'text'
  | 'dropdown'
  | 'date'
  | 'currency';

export type FieldDefinition = {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean;
  required?: boolean;
};

export type CategoryDefinition = {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  parentId?: string;
  module: string;
};

export type JournalTemplate = {
  id: string;
  label: string;
  icon: string;
  description?: string;
  category?: 'daily' | 'reflection' | 'activity' | 'free';
  prompts: { id: string; label: string; placeholder?: string; hint?: string }[];
  userCreated?: boolean;
};

export type JournalPromptCategory =
  | 'self-reflection'
  | 'career'
  | 'finance'
  | 'health'
  | 'relationships'
  | 'gratitude'
  | 'productivity';

export type JournalPrompt = {
  id: string;
  text: string;
  category: JournalPromptCategory;
};

export type JournalReminderFrequency = 'daily' | 'weekly' | 'monthly';

export type JournalReminder = {
  id: string;
  templateId: string;
  frequency: JournalReminderFrequency;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  enabled: boolean;
};

export type JournalAttachment = {
  id: string;
  type: 'image' | 'audio';
  name: string;
  dataUrl: string;
  createdAt: string;
};

export type WidgetDefinition = {
  id: string;
  label: string;
  description?: string;
  category: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  formulaId?: string;
  userCreated?: boolean;
};

export type DashboardWidgetInstance = {
  instanceId: string;
  widgetId: string;
  config?: Record<string, unknown>;
};

export type DashboardLayout = {
  id: string;
  name: string;
  isDefault: boolean;
  theme?: string;
  items: (DashboardWidgetInstance & { x: number; y: number; w: number; h: number })[];
};

export type ModuleDefinition = {
  id: string;
  label: string;
  icon: string;
  path: string;
  group: ModuleGroup;
  description?: string;
  enabled?: boolean;
};

export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'streak' | 'milestone';

export type Habit = {
  id: string;
  name: string;
  categoryId: string;
  frequency: HabitFrequency;
  priority: 'low' | 'medium' | 'high';
  targetValue?: number;
  unit?: string;
  dependsOn?: string[];
  suggestion?: string;
  active: boolean;
  createdAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value?: number;
  note?: string;
};

export type GoalType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'one-time'
  | 'recurring'
  | 'milestone'
  | 'streak';

export type Goal = {
  id: string;
  title: string;
  type: GoalType;
  categoryId: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  active: boolean;
  createdAt: string;
};

export type HealthEntry = {
  id: string;
  date: string;
  metricId: string;
  value: string | number | boolean;
};

export type JournalEntry = {
  id: string;
  date: string;
  time?: string;
  templateId: string;
  responses: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
  mood?: number;
  energy?: number;
  stress?: number;
  weather?: string;
  tags?: string[];
  favorite?: boolean;
  attachments?: JournalAttachment[];
  libraryPromptIds?: string[];
};

export type TransactionType = 'income' | 'expense';
export type IncomeFrequency = 'one-time' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
export type BudgetMode = 'custom' | '503020' | 'zero-based';

export type FinanceTag = {
  id: string;
  label: string;
  color?: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  subcategoryId?: string;
  sourceId?: string;
  paymentMethod?: string;
  notes?: string;
  tags?: string[];
  recurring: boolean;
  recurringRule?: string;
  frequency?: IncomeFrequency;
  taxable?: boolean;
  attachmentUrl?: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  period: 'month' | 'year';
  year: number;
  month?: number;
  limit: number;
  mode?: BudgetMode;
};

export type SavingsFund = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  monthlyContribution?: number;
  icon?: string;
};

export type SavingsContribution = {
  id: string;
  fundId: string;
  amount: number;
  date: string;
  note?: string;
};

export type Debt = {
  id: string;
  name: string;
  typeId: string;
  principal: number;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDay?: number;
  statementDay?: number;
  creditLimit?: number;
  emi?: number;
  remainingMonths?: number;
  lender?: string;
  notes?: string;
};

export type DebtPayment = {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note?: string;
};

export type Investment = {
  id: string;
  name: string;
  typeId: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
};

export type Bill = {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  recurringRule?: string;
  status: 'paid' | 'pending' | 'overdue' | 'upcoming';
  autopay?: boolean;
  reminderDays?: number;
};

export type Asset = {
  id: string;
  name: string;
  typeId: string;
  value: number;
  notes?: string;
};

export type NetWorthSnapshot = {
  id: string;
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
};

export type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  categoryId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  durationMin?: number;
  pomodoroCount?: number;
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'bill' | 'budget' | 'habit' | 'goal' | 'general';
  read: boolean;
  createdAt: string;
  dueAt?: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
};

export type AppConfig = {
  id: 'default';
  modules: ModuleDefinition[];
  widgets: WidgetDefinition[];
  healthMetrics: FieldDefinition[];
  expenseCategories: CategoryDefinition[];
  incomeSources: CategoryDefinition[];
  debtTypes: CategoryDefinition[];
  investmentTypes: CategoryDefinition[];
  journalTemplates: JournalTemplate[];
  journalPrompts: JournalPrompt[];
  journalReminders: JournalReminder[];
  habitCategories: CategoryDefinition[];
  goalCategories: CategoryDefinition[];
  taskCategories: CategoryDefinition[];
  paymentMethods: { id: string; label: string }[];
  financeTags: FinanceTag[];
  assetTypes: CategoryDefinition[];
  budgetMode: BudgetMode;
  dashboards: DashboardLayout[];
  debtStrategy: 'snowball' | 'avalanche' | 'custom';
  version: number;
} & ExtendedAppConfigFields;

// Legacy types preserved for backward compatibility
export type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'night';
export type Category = 'gym' | 'diet' | 'hydration' | 'work' | 'sleep' | 'note' | 'mood';
export type ActivityEntry = {
  id: string;
  timeBlock: TimeBlock;
  category: Category;
  timestamp: string;
  hydration?: { amountMl: number };
  gym?: { durationMin: number; activity: string; caloriesBurned?: number };
  diet?: { meal: string; calories: number; proteinG?: number; description?: string };
  work?: { durationMin: number; task: string; focusScore?: number };
  sleep?: { durationMin: number; quality?: number };
  note?: { text: string };
  mood?: { score: number; note?: string };
};
export type DailyLog = { date: string; entries: ActivityEntry[]; journal?: DailyJournal; updatedAt: string };
export type DailyGoals = {
  id: 'default';
  hydrationMl: number;
  gymMin: number;
  sleepMin: number;
  calories: number;
  workMin: number;
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type DashboardPeriod = 'day' | 'month' | '6months' | 'year';

export type DailyJournal = {
  achievements: string;
  challenges: string;
  tomorrowFocus: string;
};

export type HabitCategoryLegacy = 'fitness' | 'nutrition' | 'productivity' | 'health';

export type DayTotals = {
  date: string;
  hydrationMl: number;
  gymMin: number;
  dietCalories: number;
  proteinG: number;
  workMin: number;
  sleepMin: number;
  noteCount: number;
  gymDays: number;
  moodScore: number;
  moodCount: number;
  activityScore: number;
  completionPercent: number;
  recoveryScore: number;
};

export type ExportData = {
  version: number;
  exportedAt: string;
  logs: DailyLog[];
  goals: DailyGoals;
};

export const DEFAULT_GOALS: DailyGoals = {
  id: 'default',
  hydrationMl: 2500,
  gymMin: 45,
  sleepMin: 480,
  calories: 2000,
  workMin: 480,
};

export const DEFAULT_JOURNAL: DailyJournal = {
  achievements: '',
  challenges: '',
  tomorrowFocus: '',
};

export const TIME_BLOCKS: { id: TimeBlock; label: string; hint: string }[] = [
  { id: 'morning', label: 'Morning', hint: '5am – 12pm' },
  { id: 'afternoon', label: 'Afternoon', hint: '12pm – 5pm' },
  { id: 'evening', label: 'Evening', hint: '5pm – 9pm' },
  { id: 'night', label: 'Night', hint: '9pm – 5am' },
];

export const HABIT_CATEGORIES: {
  id: HabitCategoryLegacy;
  label: string;
  emoji: string;
  categories: Category[];
}[] = [
  { id: 'fitness', label: 'Fitness', emoji: '🏋️', categories: ['gym'] },
  { id: 'nutrition', label: 'Nutrition', emoji: '🍽️', categories: ['diet', 'hydration'] },
  { id: 'productivity', label: 'Productivity', emoji: '💼', categories: ['work', 'note'] },
  { id: 'health', label: 'Health', emoji: '💚', categories: ['sleep', 'mood'] },
];

export const CATEGORIES: { id: Category; label: string; emoji: string; habitCategory: HabitCategoryLegacy }[] = [
  { id: 'hydration', label: 'Water', emoji: '💧', habitCategory: 'nutrition' },
  { id: 'gym', label: 'Gym', emoji: '🏋️', habitCategory: 'fitness' },
  { id: 'diet', label: 'Diet', emoji: '🍽️', habitCategory: 'nutrition' },
  { id: 'work', label: 'Work', emoji: '💼', habitCategory: 'productivity' },
  { id: 'sleep', label: 'Sleep', emoji: '😴', habitCategory: 'health' },
  { id: 'mood', label: 'Mood', emoji: '😊', habitCategory: 'health' },
  { id: 'note', label: 'Note', emoji: '📝', habitCategory: 'productivity' },
];
