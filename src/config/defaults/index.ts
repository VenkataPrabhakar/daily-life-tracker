import type {
  AppConfig,
  CategoryDefinition,
  DashboardLayout,
  FieldDefinition,
  JournalTemplate,
  ModuleDefinition,
  WidgetDefinition,
} from '../../core/types';

export const MODULES: ModuleDefinition[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard', group: 'core' },
  { id: 'health', label: 'Health', icon: '💚', path: '/health', group: 'core' },
  { id: 'habits', label: 'Habits', icon: '🔄', path: '/habits', group: 'core' },
  { id: 'goals', label: 'Goals', icon: '🎯', path: '/goals', group: 'core' },
  { id: 'productivity', label: 'Productivity', icon: '⚡', path: '/productivity', group: 'core' },
  { id: 'journal', label: 'Journal', icon: '📓', path: '/journal', group: 'core' },
  { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', group: 'finance' },
  { id: 'expenses', label: 'Expenses', icon: '💸', path: '/finance/expenses', group: 'finance' },
  { id: 'debt', label: 'Debt', icon: '🏦', path: '/finance/debt', group: 'finance' },
  { id: 'investments', label: 'Investments', icon: '📈', path: '/finance/investments', group: 'finance' },
  { id: 'savings', label: 'Savings', icon: '🐷', path: '/finance/savings', group: 'finance' },
  { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar', group: 'core' },
  { id: 'timeline', label: 'Timeline', icon: '🕐', path: '/timeline', group: 'core' },
  { id: 'analytics', label: 'Analytics', icon: '📉', path: '/analytics', group: 'core' },
  { id: 'achievements', label: 'Achievements', icon: '🏆', path: '/achievements', group: 'core' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/notifications', group: 'system' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings', group: 'system' },
  { id: 'reports', label: 'Reports', icon: '📄', path: '/reports', group: 'system' },
  { id: 'backup', label: 'Backup', icon: '💾', path: '/backup', group: 'system' },
  { id: 'insights', label: 'AI Insights', icon: '✨', path: '/insights', group: 'core' },
];

export const WIDGETS: WidgetDefinition[] = [
  { id: 'daily-score', label: 'Daily Score', category: 'general', defaultW: 3, defaultH: 2, minW: 2, minH: 2 },
  { id: 'recovery', label: 'Recovery Score', category: 'health', defaultW: 4, defaultH: 3, minW: 3, minH: 2 },
  { id: 'streaks', label: 'Streaks', category: 'general', defaultW: 3, defaultH: 2 },
  { id: 'calendar-mini', label: 'Calendar', category: 'general', defaultW: 4, defaultH: 3 },
  { id: 'mood', label: 'Mood', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'sleep', label: 'Sleep', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'water', label: 'Water', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'steps', label: 'Steps', category: 'health', defaultW: 3, defaultH: 2 },
  { id: 'expense-summary', label: 'Expense Summary', category: 'finance', defaultW: 4, defaultH: 2 },
  { id: 'savings-progress', label: 'Savings Progress', category: 'finance', defaultW: 4, defaultH: 2 },
  { id: 'debt-progress', label: 'Debt Progress', category: 'finance', defaultW: 4, defaultH: 2 },
  { id: 'goals', label: 'Goals', category: 'general', defaultW: 4, defaultH: 2 },
  { id: 'journal', label: 'Journal', category: 'general', defaultW: 4, defaultH: 2 },
  { id: 'pomodoro', label: 'Pomodoro Timer', category: 'productivity', defaultW: 3, defaultH: 3 },
  { id: 'charts', label: 'Charts', category: 'general', defaultW: 6, defaultH: 3, minW: 4 },
  { id: 'upcoming-events', label: 'Upcoming Events', category: 'general', defaultW: 4, defaultH: 3 },
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

const expenseCats = [
  'housing', 'rent', 'mortgage', 'utilities', 'groceries', 'restaurants',
  'transportation', 'fuel', 'insurance', 'medical', 'gym', 'entertainment',
  'travel', 'shopping', 'subscriptions', 'education', 'taxes', 'emergency',
];

export const EXPENSE_CATEGORIES: CategoryDefinition[] = expenseCats.map((id) => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
  module: 'expenses',
}));

export const INCOME_SOURCES: CategoryDefinition[] = [
  'salary', 'bonus', 'freelancing', 'side-income', 'interest', 'dividends',
  'rental', 'business', 'custom',
].map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '), module: 'income' }));

export const DEBT_TYPES: CategoryDefinition[] = [
  'credit-card', 'student-loan', 'car-loan', 'mortgage', 'personal-loan',
  'family-loan', 'medical-debt', 'custom',
].map((id) => ({ id, label: id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), module: 'debt' }));

export const INVESTMENT_TYPES: CategoryDefinition[] = [
  'stocks', 'etfs', 'mutual-funds', 'crypto', 'bonds', 'gold', 'real-estate', 'retirement', 'custom',
].map((id) => ({ id, label: id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), module: 'investments' }));

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  { id: 'morning', label: 'Morning Journal', icon: '🌅', prompts: [
    { id: 'intention', label: "Today's Intention", placeholder: 'What matters most today?' },
    { id: 'gratitude', label: 'Gratitude', placeholder: 'Three things you appreciate' },
  ]},
  { id: 'night', label: 'Night Journal', icon: '🌙', prompts: [
    { id: 'wins', label: 'Wins', placeholder: 'What went well?' },
    { id: 'challenges', label: 'Challenges', placeholder: 'What was difficult?' },
    { id: 'tomorrow', label: "Tomorrow's Focus", placeholder: 'One priority for tomorrow' },
  ]},
  { id: 'gratitude', label: 'Gratitude Journal', icon: '🙏', prompts: [
    { id: 'grateful1', label: 'Grateful for...' },
    { id: 'grateful2', label: 'Another...' },
    { id: 'grateful3', label: 'And another...' },
  ]},
  { id: 'workout', label: 'Workout Journal', icon: '🏋️', prompts: [
    { id: 'activity', label: 'Activity' }, { id: 'duration', label: 'Duration' }, { id: 'notes', label: 'Notes' },
  ]},
  { id: 'food', label: 'Food Journal', icon: '🍽️', prompts: [
    { id: 'meals', label: 'Meals' }, { id: 'calories', label: 'Calories' }, { id: 'notes', label: 'Notes' },
  ]},
  { id: 'travel', label: 'Travel Journal', icon: '✈️', prompts: [
    { id: 'location', label: 'Location' }, { id: 'highlights', label: 'Highlights' },
  ]},
  { id: 'dream', label: 'Dream Journal', icon: '💭', prompts: [
    { id: 'dream', label: 'Dream', placeholder: 'Describe your dream...' },
  ]},
  { id: 'freeform', label: 'Freeform Journal', icon: '📝', prompts: [
    { id: 'content', label: 'Write freely', placeholder: 'Start writing...' },
  ]},
];

export const DEFAULT_DASHBOARD: DashboardLayout = {
  id: 'main',
  name: 'Main Dashboard',
  isDefault: true,
  items: [
    { instanceId: 'w1', widgetId: 'daily-score', x: 0, y: 0, w: 3, h: 2 },
    { instanceId: 'w2', widgetId: 'recovery', x: 3, y: 0, w: 4, h: 3 },
    { instanceId: 'w3', widgetId: 'streaks', x: 7, y: 0, w: 3, h: 2 },
    { instanceId: 'w4', widgetId: 'water', x: 0, y: 2, w: 3, h: 2 },
    { instanceId: 'w5', widgetId: 'sleep', x: 0, y: 4, w: 3, h: 2 },
    { instanceId: 'w6', widgetId: 'mood', x: 3, y: 3, w: 3, h: 2 },
    { instanceId: 'w7', widgetId: 'expense-summary', x: 6, y: 2, w: 4, h: 2 },
    { instanceId: 'w8', widgetId: 'charts', x: 0, y: 6, w: 6, h: 3 },
    { instanceId: 'w9', widgetId: 'goals', x: 6, y: 4, w: 4, h: 2 },
    { instanceId: 'w10', widgetId: 'upcoming-events', x: 6, y: 6, w: 4, h: 3 },
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
    dashboards: [DEFAULT_DASHBOARD],
    debtStrategy: 'snowball',
    version: 1,
  };
}
