import type { Bill, CategoryDefinition, Debt, Transaction } from '../../core/types';

export function monthKey(date: string) {
  return date.slice(0, 7);
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function sumByType(transactions: Transaction[], type: 'income' | 'expense', month?: string) {
  return transactions
    .filter((t) => t.type === type && (!month || monthKey(t.date) === month))
    .reduce((a, t) => a + t.amount, 0);
}

export function savingsRate(income: number, expenses: number) {
  if (income <= 0) return 0;
  return Math.round(((income - expenses) / income) * 100);
}

export function categoryLabel(categories: CategoryDefinition[], id: string) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function parentCategories(categories: CategoryDefinition[]) {
  return categories.filter((c) => !c.parentId);
}

export function subcategories(categories: CategoryDefinition[], parentId: string) {
  return categories.filter((c) => c.parentId === parentId);
}

export function resolveCategoryLabel(categories: CategoryDefinition[], categoryId: string, subcategoryId?: string) {
  if (subcategoryId) {
    const sub = categories.find((c) => c.id === subcategoryId);
    if (sub) return sub.label;
  }
  return categoryLabel(categories, categoryId);
}

export function spendingByParent(
  transactions: Transaction[],
  categories: CategoryDefinition[],
  month?: string,
) {
  const parents = parentCategories(categories);
  const byParent = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense' || (month && monthKey(t.date) !== month)) continue;
    const cat = categories.find((c) => c.id === (t.subcategoryId ?? t.categoryId));
    const parentId = cat?.parentId ?? t.categoryId;
    byParent.set(parentId, (byParent.get(parentId) ?? 0) + t.amount);
  }
  return parents.map((p) => ({ label: p.label, amount: byParent.get(p.id) ?? 0 }));
}

export function creditUtilization(balance: number, limit?: number) {
  if (!limit || limit <= 0) return 0;
  return Math.round((balance / limit) * 100);
}

export function isCreditCard(debt: Debt) {
  return debt.typeId === 'credit-card';
}

export function billStatus(dueDate: string, paid: boolean): Bill['status'] {
  if (paid) return 'paid';
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return 'overdue';
  const diff = (new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000;
  if (diff <= 7) return 'pending';
  return 'upcoming';
}

export function computeFinanceTotals(input: {
  transactions: Transaction[];
  debts: Debt[];
  savings: { currentAmount: number }[];
  investments: { quantity: number; currentPrice: number }[];
  assets: { value: number }[];
  month?: string;
}) {
  const month = input.month ?? currentMonthKey();
  const monthlyIncome = sumByType(input.transactions, 'income', month);
  const monthlyExpenses = sumByType(input.transactions, 'expense', month);
  const debtRemaining = input.debts.reduce((a, d) => a + d.balance, 0);
  const savingsTotal = input.savings.reduce((a, s) => a + s.currentAmount, 0);
  const investValue = input.investments.reduce((a, i) => a + i.quantity * i.currentPrice, 0);
  const assetValue = input.assets.reduce((a, x) => a + x.value, 0);
  const totalAssets = savingsTotal + investValue + assetValue;
  const netWorth = totalAssets - debtRemaining;
  return {
    monthlyIncome,
    monthlyExpenses,
    savingsRate: savingsRate(monthlyIncome, monthlyExpenses),
    debtRemaining,
    investments: investValue,
    netWorth,
    totalAssets,
    rate: savingsRate(monthlyIncome, monthlyExpenses),
  };
}

export function lastNMonths(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(m.toISOString().slice(0, 7));
  }
  return out;
}

export function monthlyIncomeExpenseSeries(transactions: Transaction[], months: string[]) {
  return months.map((m) => ({
    month: m,
    income: sumByType(transactions, 'income', m),
    expenses: sumByType(transactions, 'expense', m),
  }));
}

export function debtPayoffProgress(debts: Debt[]) {
  const totalPrincipal = debts.reduce((a, d) => a + d.principal, 0);
  const totalBalance = debts.reduce((a, d) => a + d.balance, 0);
  const paid = Math.max(0, totalPrincipal - totalBalance);
  const pct = totalPrincipal > 0 ? Math.round((paid / totalPrincipal) * 100) : 0;
  return { paid, remaining: totalBalance, pct, totalPrincipal };
}
