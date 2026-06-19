import { format, parseISO, subDays } from 'date-fns';
import type { JournalEntry } from '../../core/types';
import { toDateKey } from '../../lib/dates';

export function currentTimeLabel() {
  return format(new Date(), 'HH:mm');
}

export function entryPreview(entry: JournalEntry, max = 120) {
  const text = Object.values(entry.responses).filter(Boolean).join(' · ');
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function computeJournalStreak(entries: JournalEntry[]) {
  if (!entries.length) return { current: 0, longest: 0 };
  const days = new Set(entries.map((e) => e.date));
  let current = 0;
  let d = new Date();
  while (days.has(toDateKey(d))) {
    current++;
    d = subDays(d, 1);
  }
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const day of sorted) {
    const dt = parseISO(day);
    if (prev && dt.getTime() - prev.getTime() === 86400000) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = dt;
  }
  return { current, longest };
}

export function heatmapData(entries: JournalEntry[], weeks = 12) {
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(e.date, (counts.get(e.date) ?? 0) + 1);
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = toDateKey(d);
    cells.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return cells;
}

export function entriesByDate(entries: JournalEntry[]) {
  const map = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return map;
}

export function moodEmoji(value?: number) {
  if (!value) return '😐';
  if (value <= 1) return '😞';
  if (value <= 2) return '😕';
  if (value <= 3) return '😐';
  if (value <= 4) return '🙂';
  return '😄';
}

export function averageMetric(entries: JournalEntry[], key: 'mood' | 'energy' | 'stress') {
  const vals = entries.map((e) => e[key]).filter((v): v is number => typeof v === 'number');
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function shouldFireReminder(now: Date, reminder: { frequency: string; time: string; dayOfWeek?: number; dayOfMonth?: number; enabled: boolean }) {
  if (!reminder.enabled) return false;
  const [hh, mm] = reminder.time.split(':').map(Number);
  if (now.getHours() !== hh || now.getMinutes() !== mm) return false;
  if (reminder.frequency === 'daily') return true;
  if (reminder.frequency === 'weekly') return now.getDay() === (reminder.dayOfWeek ?? 0);
  if (reminder.frequency === 'monthly') return now.getDate() === (reminder.dayOfMonth ?? 1);
  return false;
}
