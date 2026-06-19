import { useMemo, useState } from 'react';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { db } from '../../db/lifeOsDatabase';
import { StatWidget } from '../../components/widgets/StatWidget';
import { useAppConfig } from '../../context/ConfigContext';
import { TransactionForm } from '../../components/finance/TransactionForm';
import { CategorySpendingChart } from '../../components/finance/CategorySpendingChart';
import type { Transaction } from '../../core/types';

export function FinanceOverview() {
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const savings = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const investments = useLiveQuery(() => db.investments.toArray(), []);

  const income = transactions?.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0) ?? 0;
  const expenses = transactions?.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0) ?? 0;
  const debtBal = debts?.reduce((a, d) => a + d.balance, 0) ?? 0;
  const savingsTotal = savings?.reduce((a, s) => a + s.currentAmount, 0) ?? 0;
  const investValue = investments?.reduce((a, i) => a + i.quantity * i.currentPrice, 0) ?? 0;
  const netWorth = savingsTotal + investValue - debtBal;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget label="Income" value={`$${income.toLocaleString()}`} emoji="💵" accent="emerald" />
        <StatWidget label="Expenses" value={`$${expenses.toLocaleString()}`} emoji="💸" accent="rose" />
        <StatWidget label="Net Cash Flow" value={`$${(income - expenses).toLocaleString()}`} emoji="📊" />
        <StatWidget label="Net Worth" value={`$${netWorth.toLocaleString()}`} emoji="🏦" accent="violet" />
      </div>
    </div>
  );
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

export function TransactionModule({ type }: { type: 'income' | 'expense' }) {
  const { config } = useAppConfig();
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));

  const transactions = useLiveQuery(
    () => db.transactions.where('type').equals(type).toArray().then((rows) =>
      rows.sort((a, b) => b.date.localeCompare(a.date)),
    ),
    [type],
  );

  const categories = type === 'expense' ? (config?.expenseCategories ?? []) : (config?.incomeSources ?? []);
  const paymentMethods = config?.paymentMethods ?? [];

  const filtered = useMemo(
    () => (transactions ?? []).filter((t) => monthKey(t.date) === monthFilter),
    [transactions, monthFilter],
  );

  const total = filtered.reduce((a, t) => a + t.amount, 0);

  const chartItems = useMemo(() => {
    const byCat = new Map<string, number>();
    for (const t of filtered) {
      byCat.set(t.categoryId, (byCat.get(t.categoryId) ?? 0) + t.amount);
    }
    return categories.map((c) => ({
      label: c.label,
      amount: byCat.get(c.id) ?? 0,
    }));
  }, [filtered, categories]);

  const remove = async (tx: Transaction) => {
    if (confirm('Delete this transaction?')) await db.transactions.delete(tx.id);
  };

  const label = (id: string) => categories.find((c) => c.id === id)?.label ?? id;
  const payLabel = (id?: string) => paymentMethods.find((p) => p.id === id)?.label;

  return (
    <div className="space-y-4">
      <TransactionForm
        type={type}
        categories={categories}
        paymentMethods={paymentMethods}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="month"
          className="input w-auto text-sm"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
        <StatWidget
          label={type === 'expense' ? 'Month total' : 'Month income'}
          value={`$${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
          emoji={type === 'expense' ? '💸' : '💵'}
          accent={type === 'expense' ? 'rose' : 'emerald'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategorySpendingChart
          items={chartItems}
          title={type === 'expense' ? 'Expenses by category' : 'Income by source'}
        />
        <div className="widget-card">
          <h3 className="mb-3 text-sm font-semibold">Recent transactions</h3>
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400">No {type} entries this month</p>
          ) : (
            <div className="max-h-[280px] space-y-2 overflow-y-auto">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-2 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-800">
                  <div>
                    <p className="font-medium">{label(t.categoryId)}</p>
                    <p className="text-xs text-slate-500">
                      {t.date}
                      {payLabel(t.paymentMethod) ? ` · ${payLabel(t.paymentMethod)}` : ''}
                      {t.recurring ? ' · recurring' : ''}
                    </p>
                    {t.notes && <p className="text-xs text-slate-400">{t.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold">${t.amount.toLocaleString()}</span>
                    <button type="button" className="text-xs text-rose-500 hover:underline" onClick={() => remove(t)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
