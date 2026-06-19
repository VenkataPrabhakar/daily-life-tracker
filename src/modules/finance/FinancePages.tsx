import { useMemo, useState } from 'react';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { db } from '../../db/lifeOsDatabase';
import { StatWidget } from '../../components/widgets/StatWidget';
import { useAppConfig } from '../../context/ConfigContext';
import { TransactionForm } from '../../components/finance/TransactionForm';
import { CategorySpendingChart } from '../../components/finance/CategorySpendingChart';
import type { Transaction } from '../../core/types';
import {
  currentMonthKey,
  resolveCategoryLabel,
  spendingByParent,
} from '../../platform/finance/financeUtils';

function monthFilterKey(date: string) {
  return date.slice(0, 7);
}

export function TransactionModule({ type }: { type: 'income' | 'expense' }) {
  const { config } = useAppConfig();
  const [monthFilter, setMonthFilter] = useState(() => currentMonthKey());

  const transactions = useLiveQuery(
    () => db.transactions.where('type').equals(type).toArray().then((rows) =>
      rows.sort((a, b) => b.date.localeCompare(a.date)),
    ),
    [type],
  );

  const categories = type === 'expense' ? (config?.expenseCategories ?? []) : (config?.incomeSources ?? []);
  const paymentMethods = config?.paymentMethods ?? [];
  const financeTags = config?.financeTags ?? [];

  const filtered = useMemo(
    () => (transactions ?? []).filter((t) => monthFilterKey(t.date) === monthFilter),
    [transactions, monthFilter],
  );

  const total = filtered.reduce((a, t) => a + t.amount, 0);

  const chartItems = useMemo(() => {
    if (type === 'expense') return spendingByParent(transactions ?? [], categories, monthFilter);
    const byCat = new Map<string, number>();
    for (const t of filtered) {
      byCat.set(t.categoryId, (byCat.get(t.categoryId) ?? 0) + t.amount);
    }
    return categories.map((c) => ({ label: c.label, amount: byCat.get(c.id) ?? 0 }));
  }, [filtered, categories, type, transactions, monthFilter]);

  const remove = async (tx: Transaction) => {
    if (confirm('Delete this transaction?')) await db.transactions.delete(tx.id);
  };

  const payLabel = (id?: string) => paymentMethods.find((p) => p.id === id)?.label;
  const tagLabel = (id: string) => config?.financeTags.find((t) => t.id === id)?.label ?? id;

  return (
    <div className="space-y-4">
      <TransactionForm
        type={type}
        categories={categories}
        paymentMethods={paymentMethods}
        financeTags={financeTags}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input type="month" className="input w-auto text-sm" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
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
          title={type === 'expense' ? 'Spending by category' : 'Income by source'}
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
                    <p className="font-medium">{resolveCategoryLabel(categories, t.categoryId, t.subcategoryId)}</p>
                    <p className="text-xs text-slate-500">
                      {t.date}
                      {payLabel(t.paymentMethod) ? ` · ${payLabel(t.paymentMethod)}` : ''}
                      {t.frequency ? ` · ${t.frequency}` : ''}
                      {t.recurring ? ' · recurring' : ''}
                      {t.taxable === false ? ' · non-taxable' : ''}
                    </p>
                    {t.tags?.length ? (
                      <p className="text-xs text-brand-500">{t.tags.map((id) => `#${tagLabel(id)}`).join(' ')}</p>
                    ) : null}
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

export { FinanceOverview } from './FinanceOverview';
