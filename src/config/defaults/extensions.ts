import type {
  BadgeDefinition,
  CategoryDefinition,
  ChartDefinition,
  FormulaDefinition,
  LifeModeDefinition,
  LifeRuleDefinition,
  NotificationRule,
  Profile,
  ThemeDefinition,
  UnitDefinition,
} from '../../core/types';

export const LIFE_MODES: LifeModeDefinition[] = [
  { id: 'work', label: 'Work', icon: '💼', description: 'Focus on productivity and career goals' },
  { id: 'vacation', label: 'Vacation', icon: '🏖️', description: 'Relaxation and travel mode' },
  { id: 'sick', label: 'Sick', icon: '🤒', description: 'Recovery and rest priority' },
  { id: 'travel', label: 'Travel', icon: '✈️', description: 'On-the-go logging' },
  { id: 'bulk', label: 'Bulk', icon: '💪', description: 'Fitness and nutrition focus' },
  { id: 'cut', label: 'Cut', icon: '📉', description: 'Calorie deficit and debt payoff' },
];

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  name: 'Personal',
  isDefault: true,
  createdAt: new Date().toISOString(),
};

export const THEMES: ThemeDefinition[] = [
  { id: 'brand-light', label: 'Brand Light', mode: 'light', brandHue: 220, accentHue: 160, isBuiltIn: true },
  { id: 'brand-dark', label: 'Brand Dark', mode: 'dark', brandHue: 220, accentHue: 160, isBuiltIn: true },
  { id: 'forest', label: 'Forest', mode: 'dark', brandHue: 145, accentHue: 90, isBuiltIn: true },
  { id: 'sunset', label: 'Sunset', mode: 'light', brandHue: 25, accentHue: 340, isBuiltIn: true },
  { id: 'ocean', label: 'Ocean', mode: 'dark', brandHue: 200, accentHue: 180, isBuiltIn: true },
];

export const FORMULAS: FormulaDefinition[] = [
  { id: 'daily-score', label: 'Daily Score', expression: 'completionPercent', module: 'dashboard', unit: '%' },
  { id: 'net-worth', label: 'Net Worth', expression: 'savings + investments - debts', module: 'finance', unit: '$' },
  { id: 'recovery-index', label: 'Recovery Index', expression: 'recoveryScore', module: 'health', unit: 'pts' },
];

export const BADGES: BadgeDefinition[] = [
  { id: 'first-log', title: 'First Log', description: 'Log your first day', icon: '🌱', criteriaType: 'count', criteriaRef: 'logs', target: 1 },
  { id: 'week-warrior', title: 'Week Warrior', description: '7 days of activity', icon: '🔥', criteriaType: 'streak', criteriaRef: 'activity', target: 7 },
  { id: 'habit-master', title: 'Habit Master', description: 'Complete 30 habits', icon: '✅', criteriaType: 'count', criteriaRef: 'habitLogs', target: 30 },
  { id: 'debt-free', title: 'Debt Free', description: 'Pay off all debts', icon: '🎉', criteriaType: 'formula', criteriaRef: 'net-worth', target: 0 },
];

export const CHARTS: ChartDefinition[] = [
  { id: 'health-weekly', label: 'Health Weekly', chartType: 'line', dataSource: 'healthMetrics', period: 'week', module: 'health' },
  { id: 'expense-monthly', label: 'Monthly Spending', chartType: 'bar', dataSource: 'expenseCategories', period: 'month', module: 'expenses' },
  { id: 'habit-heatmap', label: 'Habit Heatmap', chartType: 'heatmap', dataSource: 'habitLogs', period: 'year', module: 'habits' },
  { id: 'net-worth-trend', label: 'Net Worth Trend', chartType: 'line', dataSource: 'netWorth', period: 'year', module: 'net-worth' },
];

export const NOTIFICATION_RULES: NotificationRule[] = [
  { id: 'bill-3d', label: 'Bill due in 3 days', trigger: 'bill-due', daysBefore: 3, message: 'Bill due soon', enabled: true },
  { id: 'bill-1d', label: 'Bill due tomorrow', trigger: 'bill-due', daysBefore: 1, message: 'Bill due tomorrow', enabled: true },
  { id: 'budget-80', label: 'Budget 80% reached', trigger: 'budget-threshold', threshold: 80, message: 'Budget nearly exhausted', enabled: true },
  { id: 'budget-100', label: 'Budget exceeded', trigger: 'budget-threshold', threshold: 100, message: 'Budget exceeded', enabled: true },
];

export const LIFE_RULES: LifeRuleDefinition[] = [
  { id: 'sleep-workout', label: 'Low sleep → light workout', condition: 'sleep < 360', action: 'Suggest light workout instead of intense training', module: 'habits', enabled: true },
  { id: 'stress-journal', label: 'High stress → journal', condition: 'stress >= 4', action: 'Open evening journal prompt', module: 'journal', enabled: true },
  { id: 'budget-alert', label: 'Overspend → review', condition: 'expenses > income', action: 'Review budget categories', module: 'finance', enabled: true },
];

export const UNITS: UnitDefinition[] = [
  { id: 'ml', label: 'Milliliters', symbol: 'ml', category: 'health' },
  { id: 'kg', label: 'Kilograms', symbol: 'kg', category: 'health' },
  { id: 'kcal', label: 'Calories', symbol: 'kcal', category: 'health' },
  { id: 'g', label: 'Grams', symbol: 'g', category: 'health' },
  { id: 'min', label: 'Minutes', symbol: 'min', category: 'time' },
  { id: 'usd', label: 'US Dollars', symbol: '$', category: 'finance' },
  { id: 'pct', label: 'Percent', symbol: '%', category: 'general' },
];

export const RELATIONSHIP_CATEGORIES: CategoryDefinition[] = [
  { id: 'family', label: 'Family', module: 'relationships', icon: '👨‍👩‍👧' },
  { id: 'friends', label: 'Friends', module: 'relationships', icon: '👥' },
  { id: 'colleagues', label: 'Colleagues', module: 'relationships', icon: '🏢' },
  { id: 'mentors', label: 'Mentors', module: 'relationships', icon: '🎓' },
];

export const HOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'maintenance', label: 'Maintenance', module: 'home', icon: '🔧' },
  { id: 'cleaning', label: 'Cleaning', module: 'home', icon: '🧹' },
  { id: 'inventory', label: 'Inventory', module: 'home', icon: '📦' },
  { id: 'utilities', label: 'Utilities', module: 'home', icon: '💡' },
  { id: 'projects', label: 'Projects', module: 'home', icon: '🏠' },
];

export const DOCUMENT_CATEGORIES: CategoryDefinition[] = [
  { id: 'identity', label: 'Identity', module: 'documents', icon: '🪪' },
  { id: 'financial', label: 'Financial', module: 'documents', icon: '📄' },
  { id: 'medical', label: 'Medical', module: 'documents', icon: '🏥' },
  { id: 'legal', label: 'Legal', module: 'documents', icon: '⚖️' },
  { id: 'insurance', label: 'Insurance', module: 'documents', icon: '🛡️' },
];

export function createExtendedConfigFields() {
  return {
    profiles: [DEFAULT_PROFILE],
    lifeModes: LIFE_MODES,
    activeProfileId: 'default',
    activeLifeModeId: 'work' as const,
    activeThemeId: 'brand-light',
    formulas: FORMULAS,
    themes: THEMES,
    badges: BADGES,
    charts: CHARTS,
    notificationRules: NOTIFICATION_RULES,
    lifeRules: LIFE_RULES,
    units: UNITS,
    relationshipCategories: RELATIONSHIP_CATEGORIES,
    homeCategories: HOME_CATEGORIES,
    documentCategories: DOCUMENT_CATEGORIES,
    customMetrics: [],
  };
}
