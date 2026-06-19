import { describe, expect, it } from 'vitest';
import {
  clampNumber,
  getDateRange,
  getDaysInRange,
  toDateKey,
} from './dates';

describe('toDateKey', () => {
  it('formats dates as YYYY-MM-DD', () => {
    expect(toDateKey(new Date('2026-06-18T15:00:00'))).toBe('2026-06-18');
  });
});

describe('getDateRange', () => {
  const anchor = new Date('2026-06-18T12:00:00');

  it('returns single day for day period', () => {
    expect(getDateRange('day', anchor)).toEqual({
      start: '2026-06-18',
      end: '2026-06-18',
    });
  });

  it('returns month boundaries for month period', () => {
    expect(getDateRange('month', anchor)).toEqual({
      start: '2026-06-01',
      end: '2026-06-30',
    });
  });

  it('returns year boundaries for year period', () => {
    expect(getDateRange('year', anchor)).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
    });
  });
});

describe('getDaysInRange', () => {
  it('lists each day in inclusive range', () => {
    expect(getDaysInRange('2026-06-01', '2026-06-03')).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
  });

  it('returns empty array for invalid dates', () => {
    expect(getDaysInRange('invalid', '2026-06-01')).toEqual([]);
  });
});

describe('clampNumber', () => {
  it('clamps values within range', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-1, 0, 10)).toBe(0);
    expect(clampNumber(99, 0, 10)).toBe(10);
    expect(clampNumber(Number.NaN, 0, 10)).toBe(0);
  });
});
