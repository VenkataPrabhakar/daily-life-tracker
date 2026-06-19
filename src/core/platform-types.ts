/** Platform extensibility types — Life OS v2 */
import type { CategoryDefinition, FieldDefinition, ThemeMode } from './types';

export type ModuleGroup = 'core' | 'finance' | 'life' | 'system';

export type LifeModeId = 'work' | 'vacation' | 'sick' | 'travel' | 'bulk' | 'cut';

export type LifeModeDefinition = {
  id: LifeModeId;
  label: string;
  icon: string;
  description?: string;
  dashboardId?: string;
};

export type Profile = {
  id: string;
  name: string;
  avatar?: string;
  isDefault: boolean;
  createdAt: string;
};

export type FormulaDefinition = {
  id: string;
  label: string;
  expression: string;
  module: string;
  unit?: string;
  description?: string;
};

export type ThemeDefinition = {
  id: string;
  label: string;
  mode: ThemeMode;
  brandHue: number;
  accentHue: number;
  isBuiltIn?: boolean;
};

export type BadgeDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteriaType: 'streak' | 'count' | 'formula' | 'manual';
  criteriaRef: string;
  target: number;
};

export type ChartDefinition = {
  id: string;
  label: string;
  chartType: 'line' | 'bar' | 'pie' | 'heatmap';
  dataSource: string;
  period: 'week' | 'month' | 'year';
  module: string;
};

export type NotificationRule = {
  id: string;
  label: string;
  trigger: 'bill-due' | 'budget-threshold' | 'habit-reminder' | 'goal-deadline' | 'custom';
  daysBefore?: number;
  threshold?: number;
  message: string;
  enabled: boolean;
};

export type Relationship = {
  id: string;
  name: string;
  categoryId: string;
  email?: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  lastContact?: string;
  profileId?: string;
};

export type RelationshipInteraction = {
  id: string;
  relationshipId: string;
  date: string;
  type: 'call' | 'text' | 'meet' | 'gift' | 'other';
  notes?: string;
};

export type HomeItem = {
  id: string;
  name: string;
  categoryId: string;
  status: 'active' | 'maintenance' | 'archived';
  location?: string;
  dueDate?: string;
  cost?: number;
  notes?: string;
};

export type LifeDocument = {
  id: string;
  title: string;
  categoryId: string;
  tags?: string[];
  url?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'event' | 'bill' | 'task' | 'habit' | 'journal' | 'custom';
  sourceId?: string;
  allDay?: boolean;
  color?: string;
};

export type CalendarViewMode = 'month' | 'week' | 'agenda' | 'list';

export type SearchResult = {
  id: string;
  module: string;
  title: string;
  subtitle?: string;
  date?: string;
  path: string;
};

export type ReportPeriod = 'week' | 'month' | 'year';

export type ExtendedAppConfigFields = {
  profiles: Profile[];
  lifeModes: LifeModeDefinition[];
  activeProfileId: string;
  activeLifeModeId: LifeModeId;
  activeThemeId: string;
  formulas: FormulaDefinition[];
  themes: ThemeDefinition[];
  badges: BadgeDefinition[];
  charts: ChartDefinition[];
  notificationRules: NotificationRule[];
  relationshipCategories: CategoryDefinition[];
  homeCategories: CategoryDefinition[];
  documentCategories: CategoryDefinition[];
  customMetrics: FieldDefinition[];
};
