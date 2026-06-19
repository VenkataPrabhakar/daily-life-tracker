import { db } from '../../db/lifeOsDatabase';
import type { SearchResult } from '../../core/types';

function match(q: string, ...parts: (string | undefined)[]): boolean {
  const hay = parts.filter(Boolean).join(' ').toLowerCase();
  return hay.includes(q.toLowerCase());
}

export async function searchAll(query: string, limit = 30): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = query.trim();
  const results: SearchResult[] = [];

  const [
    habits, goals, tasks, journals, transactions, debts, documents, relationships, homeItems,
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
  ]);

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
    if (match(q, t.notes, t.categoryId, String(t.amount))) {
      results.push({ id: t.id, module: t.type === 'income' ? 'finance' : 'expenses', title: `$${t.amount} ${t.categoryId}`, date: t.date, path: t.type === 'income' ? '/finance/income' : '/expenses' });
    }
  }
  for (const d of debts) {
    if (match(q, d.name, d.lender)) results.push({ id: d.id, module: 'debt', title: d.name, subtitle: `$${d.balance}`, path: '/debt' });
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
