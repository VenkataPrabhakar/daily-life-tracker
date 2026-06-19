export type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'night';

export type Category = 'gym' | 'diet' | 'hydration' | 'work' | 'sleep' | 'note';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FocusScore = 1 | 2 | 3 | 4 | 5;

export type QualityScore = 1 | 2 | 3 | 4 | 5;

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
};

export type DailyLog = {
  date: string;
  entries: ActivityEntry[];
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
  workMin: number;
  sleepMin: number;
  noteCount: number;
  gymDays: number;
};

export type ExportData = {
  version: 1;
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

export const TIME_BLOCKS: { id: TimeBlock; label: string; hint: string }[] = [
  { id: 'morning', label: 'Morning', hint: '5am – 12pm' },
  { id: 'afternoon', label: 'Afternoon', hint: '12pm – 5pm' },
  { id: 'evening', label: 'Evening', hint: '5pm – 9pm' },
  { id: 'night', label: 'Night', hint: '9pm – 5am' },
];

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'hydration', label: 'Water', emoji: '💧' },
  { id: 'gym', label: 'Gym', emoji: '🏋️' },
  { id: 'diet', label: 'Diet', emoji: '🍽️' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'sleep', label: 'Sleep', emoji: '😴' },
  { id: 'note', label: 'Note', emoji: '📝' },
];
