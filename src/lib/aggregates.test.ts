import { describe, expect, it } from 'vitest';
import type { DailyLog } from '../db/types';
import { DEFAULT_GOALS } from '../db/types';
import {
  aggregateTotals,
  computeDayTotals,
  computeGymStreak,
  computeHabitConsistency,
  computeWeeklyCompletion,
  formatDuration,
  formatMl,
  progressPercent,
} from './aggregates';
import { computeRecoveryScore } from './recovery';

const sampleLog: DailyLog = {
  date: '2026-06-18',
  updatedAt: '2026-06-18T12:00:00.000Z',
  entries: [
    {
      id: '1',
      timeBlock: 'morning',
      category: 'hydration',
      timestamp: '2026-06-18T08:00:00.000Z',
      hydration: { amountMl: 500 },
    },
    {
      id: '2',
      timeBlock: 'morning',
      category: 'gym',
      timestamp: '2026-06-18T09:00:00.000Z',
      gym: { durationMin: 45, activity: 'Weights' },
    },
    {
      id: '3',
      timeBlock: 'afternoon',
      category: 'diet',
      timestamp: '2026-06-18T13:00:00.000Z',
      diet: { meal: 'lunch', calories: 600, proteinG: 40 },
    },
    {
      id: '4',
      timeBlock: 'night',
      category: 'mood',
      timestamp: '2026-06-18T22:00:00.000Z',
      mood: { score: 4 },
    },
  ],
};

describe('computeDayTotals', () => {
  it('sums category values for a day', () => {
    const totals = computeDayTotals(sampleLog, DEFAULT_GOALS);
    expect(totals.hydrationMl).toBe(500);
    expect(totals.gymMin).toBe(45);
    expect(totals.dietCalories).toBe(600);
    expect(totals.proteinG).toBe(40);
    expect(totals.moodCount).toBe(1);
    expect(totals.gymDays).toBe(1);
    expect(totals.recoveryScore).toBeGreaterThan(0);
  });
});

describe('computeRecoveryScore', () => {
  it('weights sleep, mood, water, and exercise', () => {
    const totals = computeDayTotals(sampleLog, DEFAULT_GOALS);
    const score = computeRecoveryScore(totals, DEFAULT_GOALS);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('aggregateTotals', () => {
  it('aggregates multiple days', () => {
    const day1 = computeDayTotals(sampleLog, DEFAULT_GOALS);
    const day2 = computeDayTotals({ ...sampleLog, date: '2026-06-17', entries: [] }, DEFAULT_GOALS);
    const result = aggregateTotals([day1, day2]);
    expect(result.days).toBe(2);
    expect(result.hydrationMl).toBe(500);
    expect(result.gymDays).toBe(1);
  });
});

describe('computeGymStreak', () => {
  it('counts consecutive gym days from most recent', () => {
    const streak = computeGymStreak([
      { ...computeDayTotals(sampleLog), date: '2026-06-18' },
      { ...computeDayTotals(sampleLog), date: '2026-06-17', gymMin: 30, gymDays: 1 },
      { ...computeDayTotals({ ...sampleLog, entries: [] }), date: '2026-06-16' },
    ]);
    expect(streak).toBe(2);
  });
});

describe('computeWeeklyCompletion', () => {
  it('averages completion across last 7 days', () => {
    const days = Array.from({ length: 7 }, (_, i) => ({
      ...computeDayTotals(sampleLog, DEFAULT_GOALS),
      date: `2026-06-${10 + i}`,
      completionPercent: 80,
    }));
    expect(computeWeeklyCompletion(days)).toBe(80);
  });
});

describe('computeHabitConsistency', () => {
  it('returns percentage of days with activity', () => {
    const consistency = computeHabitConsistency(
      [
        { ...computeDayTotals(sampleLog), date: '2026-06-18' },
        { ...computeDayTotals({ ...sampleLog, entries: [] }), date: '2026-06-17' },
      ],
      'gymMin',
    );
    expect(consistency).toBe(50);
  });
});

describe('formatters', () => {
  it('formats duration under and over an hour', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats ml and liters', () => {
    expect(formatMl(500)).toBe('500ml');
    expect(formatMl(1500)).toBe('1.5L');
  });

  it('calculates progress percent with bounds', () => {
    expect(progressPercent(50, 100)).toBe(50);
    expect(progressPercent(150, 100)).toBe(100);
    expect(progressPercent(10, 0)).toBe(0);
  });
});
