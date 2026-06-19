import { db } from '../../db/lifeOsDatabase';
import { getAppConfig } from '../../db/lifeOsDatabase';
import type { SearchResult } from '../../core/types';
import { categoryLabel } from '../finance/financeUtils';

function match(q: string, ...parts: (string | undefined)[]): boolean {
  const hay = parts.filter(Boolean).join(' ').toLowerCase();
  return hay.includes(q.toLowerCase());
}

export async function searchAll(query: string, limit = 30): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = query.trim();
  const results: SearchResult[] = [];
  const config = await getAppConfig();

  const [
    habits, goals, tasks, journals, transactions, debts, documents, relationships, homeItems,
    savings, investments, bills, assets,
  ] = await Promise.all([
    db.habits.toArray(),
    db.goalItems.toArray(),
    db.tasks.toArray(),
    db.journalEntries.toArray(),
    db.transactions.toArray(),
    db.debts.toArray(),
    db.documents.toArray(),
    db.relationships.toArray(),
    db.homeItems.toArray(),
    db.savingsFunds.toArray(),
    db.investments.toArray(),
    db.bills.toArray(),
    db.assets.toArray(),
  ]);

  const expenseCats = config.expenseCategories;
  const incomeSources = config.incomeSources;

  for (const h of habits) {
    if (match(q, h.name)) results.push({ id: h.id, module: 'habits', title: h.name, path: '/habits' });
  }
  for (const g of goals) {
    if (match(q, g.title)) results.push({ id: g.id, module: 'goals', title: g.title, path: '/goals' });
  }
  for (const t of tasks) {
    if (match(q, t.title)) results.push({ id: t.id, module: 'productivity', title: t.title, date: t.dueDate, path: '/productivity' });
  }
  for (const j of journals) {
    if (match(q, j.templateId, ...Object.values(j.responses))) {
      results.push({ id: j.id, module: 'journal', title: `Journal ${j.date}`, date: j.date, path: '/journal' });
    }
  }
  for (const t of transactions) {
    const catLabel = categoryLabel(
      t.type === 'expense' ? expenseCats : incomeSources,
      t.subcategoryId ?? t.categoryId,
    );
    if (match(q, t.notes, t.categoryId, t.subcategoryId, catLabel, String(t.amount), ...(t.tags ?? []))) {
      results.push({
        id: t.id,
        module: 'finance',
        title: `$${t.amount} · ${catLabel}`,
        date: t.date,
        path: t.type === 'income' ? '/finance/income' : '/finance/expenses',
      });
    }
  }
  for (const d of debts) {
    if (match(q, d.name, d.lender, d.typeId)) {
      results.push({
        id: d.id,
        module: 'finance',
        title: d.name,
        subtitle: `$${d.balance}`,
        path: d.typeId === 'credit-card' ? '/finance/credit-cards' : '/finance/loans',
      });
    }
  }
  for (const s of savings) {
    if (match(q, s.name)) results.push({ id: s.id, module: 'finance', title: s.name, subtitle: `$${s.currentAmount}`, path: '/finance/savings' });
  }
  for (const i of investments) {
    if (match(q, i.name, i.typeId)) results.push({ id: i.id, module: 'finance', title: i.name, path: '/finance/investments' });
  }
  for (const b of bills) {
    if (match(q, b.name, b.categoryId, String(b.amount))) {
      results.push({ id: b.id, module: 'finance', title: b.name, subtitle: `$${b.amount}`, date: b.dueDate, path: '/finance/bills' });
    }
  }
  for (const a of assets) {
    if (match(q, a.name, a.typeId, String(a.value))) {
      results.push({ id: a.id, module: 'finance', title: a.name, subtitle: `$${a.value}`, path: '/finance/assets' });
    }
  }
  for (const d of documents) {
    if (match(q, d.title, d.notes, ...(d.tags ?? []))) results.push({ id: d.id, module: 'documents', title: d.title, path: '/documents' });
  }
  for (const r of relationships) {
    if (match(q, r.name, r.notes, r.email)) results.push({ id: r.id, module: 'relationships', title: r.name, path: '/relationships' });
  }
  for (const h of homeItems) {
    if (match(q, h.name, h.notes, h.location)) results.push({ id: h.id, module: 'home', title: h.name, path: '/home' });
  }

  return results.slice(0, limit);
}
