export type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'night';

export type Category = 'gym' | 'diet' | 'hydration' | 'work' | 'sleep' | 'note' | 'mood';

export type HabitCategory = 'fitness' | 'nutrition' | 'productivity' | 'health';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FocusScore = 1 | 2 | 3 | 4 | 5;
export type QualityScore = 1 | 2 | 3 | 4 | 5;
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type DailyJournal = {
  achievements: string;
  challenges: string;
  tomorrowFocus: string;
};

export type ActivityEntry = {
  id: string;
  timeBlock: TimeBlock;
  category: Category;
  timestamp: string;
  hydration?: { amountMl: number };
  gym?: { durationMin: number; activity: string; caloriesBurned?: number };
  diet?: {
    meal: MealType;
    calories: number;
    proteinG?: number;
    description?: string;
  };
  work?: { durationMin: number; task: string; focusScore?: FocusScore };
  sleep?: { durationMin: number; quality?: QualityScore };
  note?: { text: string };
  mood?: { score: MoodScore; note?: string };
};

export type DailyLog = {
  date: string;
  entries: ActivityEntry[];
  journal?: DailyJournal;
  updatedAt: string;
};

export type DailyGoals = {
  id: 'default';
  hydrationMl: number;
  gymMin: number;
  sleepMin: number;
  calories: number;
  workMin: number;
};

export type DashboardPeriod = 'day' | 'month' | '6months' | 'year';

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
  version: 2;
  exportedAt: string;
  logs: DailyLog[];
  goals: DailyGoals;
};

export type ThemeMode = 'light' | 'dark' | 'system';

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
  id: HabitCategory;
  label: string;
  emoji: string;
  categories: Category[];
}[] = [
  { id: 'fitness', label: 'Fitness', emoji: '🏋️', categories: ['gym'] },
  { id: 'nutrition', label: 'Nutrition', emoji: '🍽️', categories: ['diet', 'hydration'] },
  { id: 'productivity', label: 'Productivity', emoji: '💼', categories: ['work', 'note'] },
  { id: 'health', label: 'Health', emoji: '💚', categories: ['sleep', 'mood'] },
];

export const CATEGORIES: { id: Category; label: string; emoji: string; habitCategory: HabitCategory }[] = [
  { id: 'hydration', label: 'Water', emoji: '💧', habitCategory: 'nutrition' },
  { id: 'gym', label: 'Gym', emoji: '🏋️', habitCategory: 'fitness' },
  { id: 'diet', label: 'Diet', emoji: '🍽️', habitCategory: 'nutrition' },
  { id: 'work', label: 'Work', emoji: '💼', habitCategory: 'productivity' },
  { id: 'sleep', label: 'Sleep', emoji: '😴', habitCategory: 'health' },
  { id: 'mood', label: 'Mood', emoji: '😊', habitCategory: 'health' },
  { id: 'note', label: 'Note', emoji: '📝', habitCategory: 'productivity' },
];

export function getCategoryMeta(category: Category) {
  return CATEGORIES.find((c) => c.id === category);
}
