import type { AppConfig, Budget, Transaction } from '../../core/types';
import { db } from '../../db/lifeOsDatabase';
import { evaluateFormula, setFormulaContext } from '../formula/engine';

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

export async function evaluateNotificationRules(config: AppConfig): Promise<void> {
  const rules = config.notificationRules.filter((r) => r.enabled);
  if (!rules.length) return;

  const [bills, transactions, budgets] = await Promise.all([
    db.bills.toArray(),
    db.transactions.toArray(),
    db.budgets.toArray(),
  ]);

  for (const rule of rules) {
    if (rule.trigger === 'bill-due') {
      for (const bill of bills) {
        if (bill.status === 'paid') continue;
        const days = daysUntil(bill.dueDate);
        if (rule.daysBefore !== undefined && days === rule.daysBefore) {
          await ensureNotification(`Bill: ${bill.name}`, `${rule.message} — $${bill.amount} due ${bill.dueDate}`, 'bill', bill.dueDate);
        }
      }
    }
    if (rule.trigger === 'budget-threshold') {
      await checkBudgetThresholds(transactions, budgets, rule.threshold ?? 80, rule.message);
    }
  }
}

async function checkBudgetThresholds(transactions: Transaction[], budgets: Budget[], threshold: number, message: string) {
  const now = new Date();
  for (const budget of budgets.filter((b) => b.period === 'month' && b.year === now.getFullYear() && (b.month ?? now.getMonth() + 1) === now.getMonth() + 1)) {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId && t.date.startsWith(`${budget.year}-${String(budget.month).padStart(2, '0')}`))
      .reduce((a, t) => a + t.amount, 0);
    const pct = budget.limit ? (spent / budget.limit) * 100 : 0;
    if (pct >= threshold) {
      await ensureNotification(`Budget: ${budget.categoryId}`, `${message} (${Math.round(pct)}%)`, 'budget');
    }
  }
}

async function ensureNotification(title: string, message: string, type: 'bill' | 'budget' | 'habit' | 'goal' | 'general', dueAt?: string) {
  const exists = await db.notifications.where('title').equals(title).count();
  if (exists) return;
  await db.notifications.put({
    id: crypto.randomUUID(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    dueAt,
  });
}

export function evaluateLifeRules(config: AppConfig, context: Record<string, number>): { ruleId: string; action: string }[] {
  setFormulaContext(context);
  return config.lifeRules
    .filter((r) => r.enabled)
    .filter((r) => {
      try {
        const [left, op, right] = r.condition.split(/\s+/);
        const l = context[left] ?? 0;
        const rv = Number(right);
        if (op === '<') return l < rv;
        if (op === '>') return l > rv;
        if (op === '<=') return l <= rv;
        if (op === '>=') return l >= rv;
        if (op === '==') return l === rv;
        return evaluateFormula(r.condition, context) > 0;
      } catch {
        return false;
      }
    })
    .map((r) => ({ ruleId: r.id, action: r.action }));
}
