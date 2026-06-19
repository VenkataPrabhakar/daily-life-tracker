import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { db } from '../../db/lifeOsDatabase';
import { computeFinanceTotals, currentMonthKey, monthKey, sumByType } from './financeUtils';

export type FinanceReportPeriod = 'week' | 'month' | 'quarter' | 'year';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function periodMonths(period: FinanceReportPeriod) {
  const now = new Date();
  const count = period === 'week' ? 1 : period === 'month' ? 1 : period === 'quarter' ? 3 : 12;
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export async function exportFinanceJson(period: FinanceReportPeriod = 'month') {
  const [transactions, debts, savings, investments, assets, bills] = await Promise.all([
    db.transactions.toArray(),
    db.debts.toArray(),
    db.savingsFunds.toArray(),
    db.investments.toArray(),
    db.assets.toArray(),
    db.bills.toArray(),
  ]);
  const months = periodMonths(period);
  const filtered = transactions.filter((t) => months.includes(monthKey(t.date)));
  const blob = new Blob([JSON.stringify({
    period,
    exportedAt: new Date().toISOString(),
    summary: computeFinanceTotals({ transactions, debts, savings, investments, assets, month: currentMonthKey() }),
    transactions: filtered,
    debts, savings, investments, assets, bills,
  }, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `finance-${period}-${new Date().toISOString().slice(0, 10)}.json`);
}

export async function exportFinanceCsv(period: FinanceReportPeriod = 'month') {
  const transactions = await db.transactions.toArray();
  const months = periodMonths(period);
  const rows = [['date', 'type', 'amount', 'category', 'subcategory', 'notes', 'tags']];
  for (const t of transactions.filter((x) => months.includes(monthKey(x.date)))) {
    rows.push([t.date, t.type, String(t.amount), t.categoryId, t.subcategoryId ?? '', t.notes ?? '', (t.tags ?? []).join(';')]);
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv' }), `finance-${period}.csv`);
}

export async function exportFinanceExcel(period: FinanceReportPeriod = 'month') {
  const [transactions, debts, savings, investments, assets, bills] = await Promise.all([
    db.transactions.toArray(),
    db.debts.toArray(),
    db.savingsFunds.toArray(),
    db.investments.toArray(),
    db.assets.toArray(),
    db.bills.toArray(),
  ]);
  const months = periodMonths(period);
  const filtered = transactions.filter((t) => months.includes(monthKey(t.date)));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filtered), 'Transactions');
  if (debts.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debts), 'Debts');
  if (savings.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(savings), 'Savings');
  if (investments.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(investments), 'Investments');
  if (assets.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assets), 'Assets');
  if (bills.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bills), 'Bills');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `finance-${period}.xlsx`);
}

export async function exportFinancePdf(period: FinanceReportPeriod = 'month') {
  const [transactions, debts, savings, investments, assets] = await Promise.all([
    db.transactions.toArray(),
    db.debts.toArray(),
    db.savingsFunds.toArray(),
    db.investments.toArray(),
    db.assets.toArray(),
  ]);
  const summary = computeFinanceTotals({ transactions, debts, savings, investments, assets, month: currentMonthKey() });
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Finance Report — ${period}`, 14, 20);
  doc.setFontSize(11);
  let y = 34;
  const lines = [
    `Monthly Income: $${summary.monthlyIncome.toLocaleString()}`,
    `Monthly Expenses: $${summary.monthlyExpenses.toLocaleString()}`,
    `Savings Rate: ${summary.savingsRate}%`,
    `Debt Remaining: $${summary.debtRemaining.toLocaleString()}`,
    `Investments: $${summary.investments.toLocaleString()}`,
    `Net Worth: $${summary.netWorth.toLocaleString()}`,
  ];
  for (const line of lines) {
    doc.text(line, 14, y);
    y += 8;
  }
  doc.save(`finance-report-${period}.pdf`);
}

export type FinanceExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

export async function exportFinanceReport(format: FinanceExportFormat, period: FinanceReportPeriod = 'month') {
  switch (format) {
    case 'json': return exportFinanceJson(period);
    case 'csv': return exportFinanceCsv(period);
    case 'excel': return exportFinanceExcel(period);
    case 'pdf': return exportFinancePdf(period);
  }
}

export async function financeReportSummary(period: FinanceReportPeriod = 'month') {
  const [transactions, debts, savings, investments, assets] = await Promise.all([
    db.transactions.toArray(),
    db.debts.toArray(),
    db.savingsFunds.toArray(),
    db.investments.toArray(),
    db.assets.toArray(),
  ]);
  const months = periodMonths(period);
  const income = months.reduce((a, m) => a + sumByType(transactions, 'income', m), 0);
  const expenses = months.reduce((a, m) => a + sumByType(transactions, 'expense', m), 0);
  const totals = computeFinanceTotals({ transactions, debts, savings, investments, assets });
  return { ...totals, periodIncome: income, periodExpenses: expenses, period };
}
