import type { DailyGoals, DayTotals } from '../db/types';
import {
  averageMood,
  computeHabitConsistency,
  getWeekOverWeekSleepChange,
} from './aggregates';

export type Insight = {
  id: string;
  type: 'positive' | 'neutral' | 'suggestion';
  message: string;
  icon: string;
};

/**
 * Rule-based insights derived from stored wellness data.
 * No external AI API — fast, private, and offline-friendly.
 */
export function generateInsights(
  dayTotals: DayTotals[],
  goals: DailyGoals,
): Insight[] {
  const insights: Insight[] = [];
  if (dayTotals.length === 0) {
    return [{
      id: 'start',
      type: 'suggestion',
      message: 'Start logging today to unlock personalized insights about your habits.',
      icon: '✨',
    }];
  }

  const last7 = dayTotals.slice(-7);
  const prev7 = dayTotals.slice(-14, -7);
  const sleepChange = getWeekOverWeekSleepChange(dayTotals);

  if (sleepChange > 15) {
    insights.push({
      id: 'sleep-up',
      type: 'positive',
      message: 'Sleep has improved this week compared to last week. Keep your bedtime routine consistent.',
      icon: '😴',
    });
  } else if (sleepChange < -15) {
    insights.push({
      id: 'sleep-down',
      type: 'suggestion',
      message: 'Sleep dipped this week. Try winding down 30 minutes earlier tonight.',
      icon: '🌙',
    });
  }

  const proteinDays = last7.filter((d) => d.proteinG >= 80).length;
  if (proteinDays >= 5) {
    insights.push({
      id: 'protein',
      type: 'positive',
      message: 'Protein consistency is excellent — you hit strong intake on most days this week.',
      icon: '💪',
    });
  }

  const hydrationConsistency = computeHabitConsistency(last7, 'hydrationMl');
  const moodAvg = averageMood(last7);
  const hydrationAvg = last7.reduce((a, d) => a + d.hydrationMl, 0) / (last7.length || 1);

  if (hydrationConsistency >= 70 && moodAvg >= 3.5) {
    insights.push({
      id: 'water-mood',
      type: 'positive',
      message: 'Water intake appears to correlate with better mood scores this week.',
      icon: '💧',
    });
  } else if (hydrationAvg < goals.hydrationMl * 0.6) {
    insights.push({
      id: 'water-low',
      type: 'suggestion',
      message: 'Hydration is below target. Small, frequent sips can lift energy and focus.',
      icon: '🚰',
    });
  }

  const gymDays = last7.filter((d) => d.gymMin > 0).length;
  if (gymDays >= 4) {
    insights.push({
      id: 'gym-strong',
      type: 'positive',
      message: `Strong fitness week — ${gymDays} training days logged. Recovery score benefits from consistency.`,
      icon: '🏋️',
    });
  } else if (gymDays === 0 && prev7.some((d) => d.gymMin > 0)) {
    insights.push({
      id: 'gym-miss',
      type: 'neutral',
      message: 'No gym sessions this week yet. Even a 20-minute walk counts toward movement.',
      icon: '🚶',
    });
  }

  const avgRecovery = Math.round(
    last7.reduce((a, d) => a + d.recoveryScore, 0) / (last7.length || 1),
  );
  if (avgRecovery >= 80) {
    insights.push({
      id: 'recovery-high',
      type: 'positive',
      message: `Recovery score averaging ${avgRecovery} — your sleep, mood, and hydration are aligned.`,
      icon: '💚',
    });
  } else if (avgRecovery < 60) {
    insights.push({
      id: 'recovery-low',
      type: 'suggestion',
      message: 'Recovery is trending low. Prioritize sleep and hydration before intense training.',
      icon: '🔋',
    });
  }

  const completionAvg = Math.round(
    last7.reduce((a, d) => a + d.completionPercent, 0) / (last7.length || 1),
  );
  if (completionAvg >= 75) {
    insights.push({
      id: 'completion',
      type: 'positive',
      message: `${completionAvg}% weekly completion — you're building strong daily habits.`,
      icon: '🎯',
    });
  }

  return insights.slice(0, 5);
}
