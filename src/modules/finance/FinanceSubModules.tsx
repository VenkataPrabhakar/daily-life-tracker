import { useState, useMemo } from 'react';
import { db } from '../../db/lifeOsDatabase';
import { useAppConfig } from '../../context/ConfigContext';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import type { Debt, SavingsFund } from '../../core/types';
import { calculateDebtPayoff } from '../../platform/finance/debtCalculators';

export function SavingsModule() {
  const funds = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(10000);

  const add = async () => {
    if (!name.trim()) return;
    await db.savingsFunds.put({ id: crypto.randomUUID(), name, targetAmount: target, currentAmount: 0 });
    setName('');
  };

  const contribute = async (fund: SavingsFund, amount: number) => {
    await db.savingsFunds.put({ ...fund, currentAmount: fund.currentAmount + amount });
    await db.savingsContributions.put({ id: crypto.randomUUID(), fundId: fund.id, amount, date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="widget-card flex gap-2 sm:col-span-2">
        <input className="input" placeholder="Fund name (Emergency, Vacation...)" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="input w-32" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
        <button type="button" className="btn-primary" onClick={add}>Add Fund</button>
      </div>
      {funds?.map((f) => {
        const pct = f.targetAmount ? Math.round((f.currentAmount / f.targetAmount) * 100) : 0;
        return (
          <div key={f.id} className="widget-card">
            <p className="font-semibold">{f.name}</p>
            <p className="text-2xl font-bold">${f.currentAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Target ${f.targetAmount.toLocaleString()} · {pct}%</p>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
            <button type="button" className="btn-secondary mt-3 text-xs" onClick={() => contribute(f, 100)}>+$100</button>
          </div>
        );
      })}
    </div>
  );
}

export function DebtModule() {
  const { config, updateConfig } = useAppConfig();
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const [name, setName] = useState('');
  const [extraPayment, setExtraPayment] = useState(0);

  const add = async () => {
    if (!name.trim()) return;
    await db.debts.put({
      id: crypto.randomUUID(), name, typeId: config?.debtTypes[0]?.id ?? 'credit-card',
      principal: 5000, balance: 5000, interestRate: 18, minimumPayment: 150,
    });
    setName('');
  };

  const pay = async (debt: Debt, amount: number) => {
    await db.debts.put({ ...debt, balance: Math.max(0, debt.balance - amount) });
    await db.debtPayments.put({ id: crypto.randomUUID(), debtId: debt.id, amount, date: new Date().toISOString().slice(0, 10) });
  };

  const strategy = config?.debtStrategy ?? 'snowball';
  const sorted = [...(debts ?? [])].sort((a, b) =>
    strategy === 'avalanche' ? b.interestRate - a.interestRate : a.balance - b.balance,
  );

  const payoffPlan = useMemo(
    () => calculateDebtPayoff(debts ?? [], strategy === 'custom' ? 'snowball' : strategy, extraPayment),
    [debts, strategy, extraPayment],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['snowball', 'avalanche', 'custom'] as const).map((s) => (
          <button key={s} type="button" className={`rounded-xl px-3 py-1 text-sm capitalize ${strategy === s ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            onClick={() => updateConfig({ debtStrategy: s })}>{s}</button>
        ))}
      </div>
      <div className="widget-card grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Payoff timeline</p>
          <p className="text-2xl font-bold">{payoffPlan.months} mo</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Total interest</p>
          <p className="text-2xl font-bold">${Math.round(payoffPlan.totalInterest).toLocaleString()}</p>
        </div>
        <div>
          <label className="text-xs text-slate-500">Extra monthly payment</label>
          <input type="number" className="input mt-1" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} />
        </div>
      </div>
      <div className="widget-card flex gap-2">
        <input className="input" placeholder="Debt name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" className="btn-primary" onClick={add}>Add Debt</button>
      </div>
      {sorted.map((d) => (
        <div key={d.id} className="widget-card flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{d.name}</p>
            <p className="text-sm text-slate-500">${d.balance.toLocaleString()} · {d.interestRate}% APR · min ${d.minimumPayment}</p>
          </div>
          <button type="button" className="btn-secondary text-xs" onClick={() => pay(d, d.minimumPayment)}>Pay minimum</button>
        </div>
      ))}
    </div>
  );
}

export function InvestmentsModule() {
  const { config } = useAppConfig();
  const items = useLiveQuery(() => db.investments.toArray(), []);

  const add = async () => {
    await db.investments.put({
      id: crypto.randomUUID(), name: 'New Asset', typeId: config?.investmentTypes[0]?.id ?? 'stocks',
      quantity: 1, purchasePrice: 100, currentPrice: 110,
    });
  };

  const total = items?.reduce((a, i) => a + i.quantity * i.currentPrice, 0) ?? 0;
  const gain = items?.reduce((a, i) => a + (i.currentPrice - i.purchasePrice) * i.quantity, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="widget-card"><p className="text-xs text-slate-500">Portfolio</p><p className="text-2xl font-bold">${total.toLocaleString()}</p></div>
        <div className="widget-card"><p className="text-xs text-slate-500">Gain/Loss</p><p className={`text-2xl font-bold ${gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${gain.toLocaleString()}</p></div>
        <div className="widget-card flex items-end"><button type="button" className="btn-primary" onClick={add}>Add Asset</button></div>
      </div>
      {items?.map((i) => {
        const gl = (i.currentPrice - i.purchasePrice) * i.quantity;
        return (
          <div key={i.id} className="widget-card flex justify-between text-sm">
            <span>{i.name} · {config?.investmentTypes.find((t) => t.id === i.typeId)?.label}</span>
            <span>{i.quantity} @ ${i.currentPrice} · <span className={gl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>${gl.toFixed(0)}</span></span>
          </div>
        );
      })}
    </div>
  );
}

export function BudgetModule() {
  const { config } = useAppConfig();
  const budgets = useLiveQuery(() => db.budgets.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.where('type').equals('expense').toArray(), []);
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('500');

  const categories = config?.expenseCategories ?? [];
  const activeCategory = categoryId || categories[0]?.id || '';

  const alerts = budgets?.map((b) => {
    const monthPrefix = `${b.year}-${String(b.month ?? 1).padStart(2, '0')}`;
    const spent = transactions?.filter((t) => t.categoryId === b.categoryId && t.date.startsWith(monthPrefix)).reduce((a, t) => a + t.amount, 0) ?? 0;
    const pct = b.limit ? Math.round((spent / b.limit) * 100) : 0;
    return { ...b, spent, pct, label: categories.find((c) => c.id === b.categoryId)?.label ?? b.categoryId };
  }) ?? [];

  const addBudget = async () => {
    const parsed = parseFloat(limit);
    if (!activeCategory || !parsed || parsed <= 0) return;
    const now = new Date();
    await db.budgets.put({
      id: crypto.randomUUID(),
      categoryId: activeCategory,
      period: 'month',
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      limit: parsed,
    });
    setLimit('500');
  };

  const removeBudget = async (id: string) => {
    await db.budgets.delete(id);
  };

  return (
    <div className="space-y-3">
      <div className="widget-card flex flex-wrap gap-2">
        <select className="input w-auto text-sm" value={activeCategory} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input type="number" className="input w-28 text-sm" placeholder="Limit $" value={limit} onChange={(e) => setLimit(e.target.value)} min="1" />
        <button type="button" className="btn-primary text-sm" onClick={addBudget}>Set budget</button>
      </div>
      {alerts.length === 0 && <p className="text-sm text-slate-400">No budgets yet — set one above</p>}
      {alerts.map((a) => (
        <div key={a.id} className={`widget-card ${a.pct >= 100 ? 'border-rose-500/50' : a.pct >= 80 ? 'border-amber-500/50' : ''}`}>
          <div className="flex justify-between text-sm">
            <span>{a.label}</span>
            <span>{a.pct}% · ${a.spent.toFixed(0)}/${a.limit}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div className={`h-2 rounded-full ${a.pct >= 100 ? 'bg-rose-500' : a.pct >= 80 ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, a.pct)}%` }} />
          </div>
          {a.pct >= 100 && <p className="mt-1 text-xs text-rose-500">Budget exceeded</p>}
          {a.pct >= 80 && a.pct < 100 && <p className="mt-1 text-xs text-amber-500">80% threshold reached</p>}
          <button type="button" className="mt-2 text-xs text-slate-400 hover:text-rose-500" onClick={() => removeBudget(a.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export function BillsModule() {
  const bills = useLiveQuery(() => db.bills.toArray(), []);

  const add = async () => {
    const due = new Date(); due.setDate(due.getDate() + 7);
    await db.bills.put({
      id: crypto.randomUUID(), name: 'New Bill', categoryId: 'utilities', amount: 100,
      dueDate: due.toISOString().slice(0, 10), recurring: true, status: 'upcoming',
    });
  };

  return (
    <div className="space-y-2">
      <button type="button" className="btn-primary" onClick={add}>Add Bill</button>
      {bills?.map((b) => (
        <div key={b.id} className="widget-card flex justify-between text-sm">
          <span>{b.name}</span>
          <span className={b.status === 'overdue' ? 'text-rose-500' : 'text-slate-500'}>${b.amount} · {b.dueDate} · {b.status}</span>
        </div>
      ))}
    </div>
  );
}

export function NetWorthModule() {
  const savings = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const investments = useLiveQuery(() => db.investments.toArray(), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const assets = (savings?.reduce((a, s) => a + s.currentAmount, 0) ?? 0) + (investments?.reduce((a, i) => a + i.quantity * i.currentPrice, 0) ?? 0);
  const liabilities = debts?.reduce((a, d) => a + d.balance, 0) ?? 0;
  return (
    <div className="widget-card text-center">
      <p className="text-sm text-slate-500">Net Worth</p>
      <p className="text-4xl font-bold">${(assets - liabilities).toLocaleString()}</p>
      <p className="mt-2 text-sm text-slate-500">Assets ${assets.toLocaleString()} · Liabilities ${liabilities.toLocaleString()}</p>
    </div>
  );
}
