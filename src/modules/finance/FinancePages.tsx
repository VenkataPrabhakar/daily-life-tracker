import { useLiveQuery } from '../../hooks/useLiveQuery';
import { db } from '../../db/lifeOsDatabase';
import { StatWidget } from '../../components/widgets/StatWidget';
import { HabitSuccessPieChart } from '../../components/charts/HabitSuccessPieChart';
import { useAppConfig } from '../../context/ConfigContext';

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

export function TransactionModule({ type }: { type: 'income' | 'expense' }) {
  const { config } = useAppConfig();
  const transactions = useLiveQuery(async () => {
    const all = await db.transactions.where('type').equals(type).toArray();
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [type]);
  const categories = type === 'expense' ? config?.expenseCategories : config?.incomeSources;

  const add = async (amount: number, categoryId: string) => {
    await db.transactions.put({
      id: crypto.randomUUID(),
      type,
      amount,
      date: new Date().toISOString().slice(0, 10),
      categoryId,
      recurring: false,
    });
  };

  const byCategory = categories?.map((c) => ({
    id: c.id,
    label: c.label,
    emoji: '💰',
    activeDays: transactions?.filter((t) => t.categoryId === c.id).length ?? 0,
    totalDays: 1,
    successRate: Math.round(((transactions?.filter((t) => t.categoryId === c.id).reduce((a, t) => a + t.amount, 0) ?? 0) / Math.max(1, transactions?.reduce((a, t) => a + t.amount, 0) ?? 1)) * 100),
  })) ?? [];

  return (
    <div className="space-y-4">
      <div className="widget-card flex flex-wrap gap-2">
        {categories?.slice(0, 6).map((c) => (
          <button key={c.id} type="button" className="btn-secondary text-xs" onClick={() => add(50, c.id)}>+ $50 {c.label}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <HabitSuccessPieChart stats={byCategory as never} title={`${type} by category`} />
        <div className="widget-card space-y-2">
          {transactions?.slice(0, 15).map((t) => (
            <div key={t.id} className="flex justify-between text-sm">
              <span>{categories?.find((c) => c.id === t.categoryId)?.label ?? t.categoryId}</span>
              <span>${t.amount} · {t.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
