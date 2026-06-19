import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  parseISO,
  isValid,
} from 'date-fns';
import type { DashboardPeriod } from '../db/types';

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDateKey(key: string): Date {
  return parseISO(key);
}

export function getCurrentTimeBlock(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getDateRange(period: DashboardPeriod, anchor: Date): { start: string; end: string } {
  const end = toDateKey(anchor);

  switch (period) {
    case 'day':
      return { start: end, end };
    case 'month': {
      const start = toDateKey(startOfMonth(anchor));
      const monthEnd = toDateKey(endOfMonth(anchor));
      return { start, end: monthEnd };
    }
    case '6months': {
      const start = toDateKey(startOfMonth(subMonths(anchor, 5)));
      return { start, end };
    }
    case 'year': {
      const start = toDateKey(startOfYear(anchor));
      const yearEnd = toDateKey(endOfYear(anchor));
      return { start, end: yearEnd };
    }
  }
}

export function getDaysInRange(start: string, end: string): string[] {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  if (!isValid(startDate) || !isValid(endDate)) return [];
  return eachDayOfInterval({ start: startDate, end: endDate }).map(toDateKey);
}

export function formatDisplayDate(dateKey: string, pattern = 'MMM d, yyyy'): string {
  const date = parseISO(dateKey);
  return isValid(date) ? format(date, pattern) : dateKey;
}

export function formatShortDate(dateKey: string): string {
  return formatDisplayDate(dateKey, 'MMM d');
}

export function formatMonthLabel(dateKey: string): string {
  return formatDisplayDate(dateKey, 'MMM yyyy');
}

export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function generateId(): string {
  return crypto.randomUUID();
}
