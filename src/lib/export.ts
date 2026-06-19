import { jsPDF } from 'jspdf';
import type { DailyGoals, DailyLog } from '../db/types';
import { computeDayTotals, formatDuration, formatMl, formatSleepHours } from './aggregates';
import { exportAllData } from '../db/database';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportJsonBackup() {
  const data = await exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `daily-life-tracker-${new Date().toISOString().slice(0, 10)}.json`);
}

export async function exportCsv(logs: DailyLog[], goals: DailyGoals) {
  const headers = [
    'date',
    'hydration_ml',
    'gym_min',
    'diet_calories',
    'protein_g',
    'work_min',
    'sleep_min',
    'mood_avg',
    'recovery_score',
    'completion_pct',
    'entries_count',
    'achievements',
    'challenges',
    'tomorrow_focus',
  ];

  const rows = logs.map((log) => {
    const t = computeDayTotals(log, goals);
    const moodAvg = t.moodCount > 0 ? (t.moodScore / t.moodCount).toFixed(1) : '';
    return [
      log.date,
      t.hydrationMl,
      t.gymMin,
      t.dietCalories,
      t.proteinG,
      t.workMin,
      t.sleepMin,
      moodAvg,
      t.recoveryScore,
      t.completionPercent,
      log.entries.length,
      escapeCsv(log.journal?.achievements ?? ''),
      escapeCsv(log.journal?.challenges ?? ''),
      escapeCsv(log.journal?.tomorrowFocus ?? ''),
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `daily-life-tracker-${new Date().toISOString().slice(0, 10)}.csv`);
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportPdf(logs: DailyLog[], goals: DailyGoals) {
  const doc = new jsPDF();
  const date = new Date().toISOString().slice(0, 10);
  let y = 20;

  doc.setFontSize(18);
  doc.text('Daily Life Tracker Report', 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated ${date} · ${logs.length} days`, 14, y);
  y += 12;
  doc.setTextColor(0);

  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  for (const log of recent) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const t = computeDayTotals(log, goals);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(log.date, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = [
      `Water: ${formatMl(t.hydrationMl)} · Gym: ${formatDuration(t.gymMin)} · Sleep: ${formatSleepHours(t.sleepMin)}`,
      `Recovery: ${t.recoveryScore}% · Completion: ${t.completionPercent}% · Entries: ${log.entries.length}`,
    ];
    if (log.journal?.achievements) lines.push(`Win: ${log.journal.achievements.slice(0, 80)}`);
    for (const line of lines) {
      doc.text(line, 14, y);
      y += 5;
    }
    y += 4;
  }

  doc.save(`daily-life-tracker-report-${date}.pdf`);
}
