import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { exportLifeOSData } from '../../db/lifeOsDatabase';
import { computeDayTotals } from '../../lib/aggregates';
import type { DailyGoals, DailyLog } from '../../core/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportFullJson() {
  const data = await exportLifeOSData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `life-os-${new Date().toISOString().slice(0, 10)}.json`);
}

export async function exportFullCsv() {
  const data = await exportLifeOSData();
  const rows: string[][] = [['module', 'id', 'date', 'summary']];
  for (const t of data.transactions) {
    rows.push(['transaction', t.id, t.date, `${t.type} $${t.amount} ${t.categoryId}`]);
  }
  for (const h of data.habitLogs) {
    rows.push(['habitLog', h.id, h.date, h.completed ? 'completed' : 'skipped']);
  }
  for (const j of data.journalEntries) {
    rows.push(['journal', j.id, j.date, j.templateId]);
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv' }), `life-os-${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function exportFullExcel() {
  const data = await exportLifeOSData();
  const wb = XLSX.utils.book_new();
  const sheets: [string, unknown[]][] = [
    ['Transactions', data.transactions],
    ['Habits', data.habits],
    ['Goals', data.goalItems],
    ['Health', data.healthEntries],
    ['Debts', data.debts],
    ['Savings', data.savingsFunds],
    ['Investments', data.investments],
  ];
  for (const [name, rows] of sheets) {
    if (rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name);
  }
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `life-os-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportReportPdf(logs: DailyLog[], goals: DailyGoals, period: string) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Life OS Report — ${period}`, 14, 20);
  doc.setFontSize(10);
  let y = 32;
  const totals = logs.map((l) => computeDayTotals(l, goals));
  for (const d of totals.slice(-14)) {
    doc.text(`${d.date}: ${d.completionPercent}% complete · recovery ${d.recoveryScore}`, 14, y);
    y += 7;
    if (y > 270) { doc.addPage(); y = 20; }
  }
  doc.save(`life-os-report-${period}.pdf`);
}

export type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

export async function exportLifeOS(format: ExportFormat, logs?: DailyLog[], goals?: DailyGoals, period = 'monthly') {
  switch (format) {
    case 'json': return exportFullJson();
    case 'csv': return exportFullCsv();
    case 'excel': return exportFullExcel();
    case 'pdf':
      if (logs && goals) return exportReportPdf(logs, goals, period);
      return exportFullJson();
  }
}
