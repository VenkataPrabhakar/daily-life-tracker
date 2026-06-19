import type { Category, DailyGoals, DayTotals, HabitCategory } from '../db/types';
import { HABIT_CATEGORIES } from '../db/types';

/** Map activity categories to wellness habit groups. */
export function getHabitCategoryForActivity(category: Category): HabitCategory {
  const group = HABIT_CATEGORIES.find((g) => g.categories.includes(category));
  return group?.id ?? 'health';
}

export function getHabitCategoryLabel(id: HabitCategory): string {
  return HABIT_CATEGORIES.find((g) => g.id === id)?.label ?? id;
}

export type HabitCategoryStats = {
  id: HabitCategory;
  label: string;
  emoji: string;
  activeDays: number;
  totalDays: number;
  successRate: number;
};

export function computeHabitCategoryStats(
  dayTotals: DayTotals[],
  goals: DailyGoals,
): HabitCategoryStats[] {
  const totalDays = dayTotals.length || 1;

  return HABIT_CATEGORIES.map((group) => {
    let activeDays = 0;

    for (const day of dayTotals) {
      const hit = group.categories.some((cat) => {
        switch (cat) {
          case 'gym':
            return day.gymMin >= goals.gymMin * 0.5;
          case 'hydration':
            return day.hydrationMl >= goals.hydrationMl * 0.5;
          case 'diet':
            return day.dietCalories > 0;
          case 'work':
            return day.workMin >= goals.workMin * 0.25;
          case 'sleep':
            return day.sleepMin >= goals.sleepMin * 0.5;
          case 'mood':
            return day.moodCount > 0;
          case 'note':
            return day.noteCount > 0;
          default:
            return false;
        }
      });
      if (hit) activeDays++;
    }

    return {
      id: group.id,
      label: group.label,
      emoji: group.emoji,
      activeDays,
      totalDays,
      successRate: Math.round((activeDays / totalDays) * 100),
    };
  });
}
