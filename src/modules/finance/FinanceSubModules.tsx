import { useMemo, useState } from 'react';
import { db } from '../../db/lifeOsDatabase';
import { useAppConfig } from '../../context/ConfigContext';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import type { Debt, SavingsFund } from '../../core/types';
import { calculateDebtPayoff } from '../../platform/finance/debtCalculators';
import { creditUtilization, isCreditCard, billStatus, currentMonthKey, parentCategories, computeFinanceTotals, sumByType } from '../../platform/finance/financeUtils';
import { exportFinanceReport, type FinanceReportPeriod } from '../../platform/finance/financeReports';
import { DEFAULT_SAVINGS_FUNDS } from '../../config/defaults/financeCategories';

export function SavingsModule() {
  const funds = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('10000');
  const [contribution, setContribution] = useState('100');

  const add = async () => {
    if (!name.trim()) return;
    await db.savingsFunds.put({
      id: crypto.randomUUID(),
      name: name.trim(),
      targetAmount: parseFloat(target) || 10000,
      currentAmount: 0,
      monthlyContribution: parseFloat(contribution) || undefined,
    });
    setName('');
  };

  const seedDefaults = async () => {
    for (const f of DEFAULT_SAVINGS_FUNDS) {
      const exists = funds?.some((x) => x.name === f.name);
      if (!exists) {
        await db.savingsFunds.put({ id: crypto.randomUUID(), name: f.name, targetAmount: 5000, currentAmount: 0, icon: f.icon });
      }
    }
  };

  const contribute = async (fund: SavingsFund, amount: number) => {
    await db.savingsFunds.put({ ...fund, currentAmount: fund.currentAmount + amount });
    await db.savingsContributions.put({ id: crypto.randomUUID(), fundId: fund.id, amount, date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-3">
      <div className="widget-card flex flex-wrap gap-2">
        <input className="input" placeholder="Fund name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="input w-28" placeholder="Target $" value={target} onChange={(e) => setTarget(e.target.value)} />
        <input type="number" className="input w-28" placeholder="Monthly $" value={contribution} onChange={(e) => setContribution(e.target.value)} />
        <button type="button" className="btn-primary" onClick={add}>Add fund</button>
        <button type="button" className="btn-secondary" onClick={seedDefaults}>Add default goals</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {funds?.map((f) => {
          const pct = f.targetAmount ? Math.round((f.currentAmount / f.targetAmount) * 100) : 0;
          return (
            <div key={f.id} className="widget-card">
              <p className="font-semibold">{f.icon ? `${f.icon} ` : ''}{f.name}</p>
              <p className="text-2xl font-bold">${f.currentAmount.toLocaleString()}</p>
              <p className="text-xs text-slate-500">
                Target ${f.targetAmount.toLocaleString()} · {pct}%
                {f.monthlyContribution ? ` · $${f.monthlyContribution}/mo` : ''}
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => contribute(f, f.monthlyContribution ?? 100)}>Contribute</button>
                <button type="button" className="text-xs text-rose-500" onClick={() => db.savingsFunds.delete(f.id)}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DebtForm({ onSave, types }: { onSave: (d: Omit<Debt, 'id'>) => void; types: { id: string; label: string }[] }) {
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState(types[0]?.id ?? 'personal-loan');
  const [principal, setPrincipal] = useState('5000');
  const [balance, setBalance] = useState('5000');
  const [rate, setRate] = useState('6');
  const [minPay, setMinPay] = useState('150');
  const [lender, setLender] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDay, setDueDay] = useState('15');

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      typeId,
      principal: parseFloat(principal) || 0,
      balance: parseFloat(balance) || 0,
      interestRate: parseFloat(rate) || 0,
      minimumPayment: parseFloat(minPay) || 0,
      lender: lender || undefined,
      creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      dueDay: parseInt(dueDay, 10) || undefined,
    });
    setName('');
  };

  return (
    <div className="widget-card grid gap-2 sm:grid-cols-3">
      <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="input" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
        {types.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <input className="input" placeholder="Lender" value={lender} onChange={(e) => setLender(e.target.value)} />
      <input type="number" className="input" placeholder="Principal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
      <input type="number" className="input" placeholder="Balance" value={balance} onChange={(e) => setBalance(e.target.value)} />
      <input type="number" className="input" placeholder="APR %" value={rate} onChange={(e) => setRate(e.target.value)} />
      <input type="number" className="input" placeholder="Min payment" value={minPay} onChange={(e) => setMinPay(e.target.value)} />
      <input type="number" className="input" placeholder="Due day" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
      {typeId === 'credit-card' && (
        <input type="number" className="input" placeholder="Credit limit" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
      )}
      <button type="button" className="btn-primary sm:col-span-3" onClick={submit}>Add</button>
    </div>
  );
}

export function CreditCardsModule() {
  const { config } = useAppConfig();
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const cards = (debts ?? []).filter(isCreditCard);
  const types = (config?.debtTypes ?? []).filter((t) => t.id === 'credit-card');

  const add = async (d: Omit<Debt, 'id'>) => {
    await db.debts.put({ ...d, id: crypto.randomUUID(), typeId: 'credit-card' });
  };

  const pay = async (debt: Debt, amount: number) => {
    await db.debts.put({ ...debt, balance: Math.max(0, debt.balance - amount) });
    await db.debtPayments.put({ id: crypto.randomUUID(), debtId: debt.id, amount, date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-3">
      <DebtForm types={types.length ? types : [{ id: 'credit-card', label: 'Credit Card' }]} onSave={add} />
      {cards.length === 0 && <p className="text-sm text-slate-400">No credit cards tracked</p>}
      {cards.map((c) => {
        const util = creditUtilization(c.balance, c.creditLimit);
        const available = (c.creditLimit ?? 0) - c.balance;
        return (
          <div key={c.id} className={`widget-card ${util >= 80 ? 'border-amber-500/50' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-slate-500">
                  Balance ${c.balance.toLocaleString()}
                  {c.creditLimit ? ` · Limit $${c.creditLimit.toLocaleString()} · ${util}% used` : ''}
                </p>
                <p className="text-xs text-slate-400">
                  APR {c.interestRate}% · Min ${c.minimumPayment}
                  {c.dueDay ? ` · Due day ${c.dueDay}` : ''}
                  {c.creditLimit ? ` · Available $${available.toLocaleString()}` : ''}
                </p>
                {util >= 80 && <p className="mt-1 text-xs text-amber-500">High utilization — consider paying down</p>}
              </div>
              <button type="button" className="btn-secondary text-xs" onClick={() => pay(c, c.minimumPayment)}>Pay minimum</button>
            </div>
            {c.creditLimit && (
              <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className={`h-2 rounded-full ${util >= 80 ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, util)}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LoansModule() {
  const { config, updateConfig } = useAppConfig();
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const [extraPayment, setExtraPayment] = useState(0);
  const loanTypes = (config?.debtTypes ?? []).filter((t) => t.id !== 'credit-card');
  const loans = (debts ?? []).filter((d) => !isCreditCard(d));

  const add = async (d: Omit<Debt, 'id'>) => {
    await db.debts.put({ ...d, id: crypto.randomUUID() });
  };

  const pay = async (debt: Debt, amount: number) => {
    await db.debts.put({ ...debt, balance: Math.max(0, debt.balance - amount) });
    await db.debtPayments.put({ id: crypto.randomUUID(), debtId: debt.id, amount, date: new Date().toISOString().slice(0, 10) });
  };

  const strategy = config?.debtStrategy ?? 'snowball';
  const sorted = [...loans].sort((a, b) =>
    strategy === 'avalanche' ? b.interestRate - a.interestRate : a.balance - b.balance,
  );

  const payoffPlan = useMemo(
    () => calculateDebtPayoff(loans, strategy === 'custom' ? 'snowball' : strategy, extraPayment),
    [loans, strategy, extraPayment],
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
        <div><p className="text-xs text-slate-500">Payoff timeline</p><p className="text-2xl font-bold">{payoffPlan.months} mo</p></div>
        <div><p className="text-xs text-slate-500">Total interest</p><p className="text-2xl font-bold">${Math.round(payoffPlan.totalInterest).toLocaleString()}</p></div>
        <div>
          <label className="text-xs text-slate-500">Extra monthly payment</label>
          <input type="number" className="input mt-1" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} />
        </div>
      </div>
      <DebtForm types={loanTypes} onSave={add} />
      {sorted.map((d) => (
        <div key={d.id} className="widget-card flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{d.name}</p>
            <p className="text-sm text-slate-500">
              ${d.balance.toLocaleString()} · {d.interestRate}% APR · min ${d.minimumPayment}
              {d.lender ? ` · ${d.lender}` : ''}
            </p>
          </div>
          <button type="button" className="btn-secondary text-xs" onClick={() => pay(d, d.minimumPayment)}>Pay minimum</button>
        </div>
      ))}
    </div>
  );
}

/** @deprecated use CreditCardsModule or LoansModule */
export function DebtModule() {
  return <LoansModule />;
}

export function InvestmentsModule() {
  const { config } = useAppConfig();
  const items = useLiveQuery(() => db.investments.toArray(), []);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState(config?.investmentTypes[0]?.id ?? 'stocks');
  const [qty, setQty] = useState('1');
  const [cost, setCost] = useState('100');
  const [price, setPrice] = useState('110');

  const add = async () => {
    if (!name.trim()) return;
    await db.investments.put({
      id: crypto.randomUUID(),
      name: name.trim(),
      typeId,
      quantity: parseFloat(qty) || 1,
      purchasePrice: parseFloat(cost) || 0,
      currentPrice: parseFloat(price) || 0,
    });
    setName('');
  };

  const total = items?.reduce((a, i) => a + i.quantity * i.currentPrice, 0) ?? 0;
  const gain = items?.reduce((a, i) => a + (i.currentPrice - i.purchasePrice) * i.quantity, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="widget-card"><p className="text-xs text-slate-500">Portfolio</p><p className="text-2xl font-bold">${total.toLocaleString()}</p></div>
        <div className="widget-card"><p className="text-xs text-slate-500">Gain/Loss</p><p className={`text-2xl font-bold ${gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${gain.toLocaleString()}</p></div>
      </div>
      <div className="widget-card grid gap-2 sm:grid-cols-3">
        <input className="input" placeholder="Asset name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          {config?.investmentTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <input type="number" className="input" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
        <input type="number" className="input" placeholder="Avg cost" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input type="number" className="input" placeholder="Current value" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button type="button" className="btn-primary" onClick={add}>Add asset</button>
      </div>
      {items?.map((i) => {
        const value = i.quantity * i.currentPrice;
        const gl = (i.currentPrice - i.purchasePrice) * i.quantity;
        const alloc = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
          <div key={i.id} className="widget-card flex justify-between text-sm">
            <span>{i.name} · {config?.investmentTypes.find((t) => t.id === i.typeId)?.label} · {alloc}%</span>
            <span>{i.quantity} @ ${i.currentPrice} · <span className={gl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>${gl.toFixed(0)}</span></span>
          </div>
        );
      })}
    </div>
  );
}

export function BudgetModule() {
  const { config, updateConfig } = useAppConfig();
  const budgets = useLiveQuery(() => db.budgets.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.where('type').equals('expense').toArray(), []);
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('500');

  const categories = config?.expenseCategories ?? [];
  const parents = parentCategories(categories);
  const activeCategory = categoryId || parents[0]?.id || '';
  const budgetMode = config?.budgetMode ?? 'custom';
  const month = currentMonthKey();

  const incomeTx = useLiveQuery(() => db.transactions.where('type').equals('income').toArray(), []);
  const monthIncome = (incomeTx ?? [])
    .filter((t) => t.date.startsWith(month))
    .reduce((a, t) => a + t.amount, 0);

  const alerts = budgets?.map((b) => {
    const monthPrefix = `${b.year}-${String(b.month ?? 1).padStart(2, '0')}`;
    const spent = transactions?.filter((t) => {
      const cat = categories.find((c) => c.id === (t.subcategoryId ?? t.categoryId));
      const parent = cat?.parentId ?? t.categoryId;
      return parent === b.categoryId && t.date.startsWith(monthPrefix);
    }).reduce((a, t) => a + t.amount, 0) ?? 0;
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
      mode: budgetMode,
    });
    setLimit('500');
  };

  const apply503020 = async () => {
    if (monthIncome <= 0) return;
    const now = new Date();
    const needs = ['housing', 'utilities', 'food', 'transportation', 'insurance', 'healthcare'];
    const wants = ['entertainment', 'shopping', 'travel', 'fitness'];
    const perNeed = (monthIncome * 0.5) / needs.length;
    const perWant = (monthIncome * 0.3) / wants.length;
    for (const id of [...needs, ...wants]) {
      await db.budgets.put({
        id: crypto.randomUUID(),
        categoryId: id,
        period: 'month',
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        limit: needs.includes(id) ? perNeed : perWant,
        mode: '503020',
      });
    }
    updateConfig({ budgetMode: '503020' });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(['custom', '503020', 'zero-based'] as const).map((m) => (
          <button key={m} type="button" className={`rounded-xl px-3 py-1 text-sm ${budgetMode === m ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            onClick={() => updateConfig({ budgetMode: m })}>
            {m === '503020' ? '50/30/20' : m === 'zero-based' ? 'Zero-based' : 'Custom'}
          </button>
        ))}
        {budgetMode === '503020' && (
          <button type="button" className="btn-secondary text-sm" onClick={apply503020}>Apply template (${monthIncome.toLocaleString()} income)</button>
        )}
      </div>
      <div className="widget-card flex flex-wrap gap-2">
        <select className="input w-auto text-sm" value={activeCategory} onChange={(e) => setCategoryId(e.target.value)}>
          {parents.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
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
          <button type="button" className="mt-2 text-xs text-slate-400 hover:text-rose-500" onClick={() => db.budgets.delete(a.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

export function BillsModule() {
  const { config } = useAppConfig();
  const bills = useLiveQuery(() => db.bills.toArray(), []);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('100');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [autopay, setAutopay] = useState(false);
  const [reminderDays, setReminderDays] = useState('3');

  const add = async () => {
    if (!name.trim()) return;
    await db.bills.put({
      id: crypto.randomUUID(),
      name: name.trim(),
      categoryId: config?.expenseCategories[0]?.id ?? 'utilities',
      amount: parseFloat(amount) || 0,
      dueDate,
      recurring: true,
      status: billStatus(dueDate, false),
      autopay,
      reminderDays: parseInt(reminderDays, 10) || 3,
    });
    setName('');
  };

  const markPaid = async (id: string) => {
    const b = bills?.find((x) => x.id === id);
    if (b) await db.bills.put({ ...b, status: 'paid' });
  };

  const sorted = [...(bills ?? [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="space-y-3">
      <div className="widget-card grid gap-2 sm:grid-cols-3">
        <input className="input" placeholder="Bill name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="input" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autopay} onChange={(e) => setAutopay(e.target.checked)} /> Autopay</label>
        <input type="number" className="input" placeholder="Reminder days" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} />
        <button type="button" className="btn-primary" onClick={add}>Add bill</button>
      </div>
      {sorted.map((b) => (
        <div key={b.id} className="widget-card flex flex-wrap items-center justify-between gap-2 text-sm">
          <div>
            <p className="font-medium">{b.name}</p>
            <p className="text-xs text-slate-500">
              ${b.amount} · due {b.dueDate}
              {b.autopay ? ' · autopay' : ''}
              {b.reminderDays ? ` · remind ${b.reminderDays}d before` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={b.status === 'overdue' ? 'text-rose-500' : b.status === 'paid' ? 'text-emerald-500' : 'text-slate-500'}>{b.status}</span>
            {b.status !== 'paid' && <button type="button" className="btn-secondary text-xs" onClick={() => markPaid(b.id)}>Mark paid</button>}
            <button type="button" className="text-xs text-rose-500" onClick={() => db.bills.delete(b.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssetsModule() {
  const { config } = useAppConfig();
  const assets = useLiveQuery(() => db.assets.toArray(), []);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState(config?.assetTypes[0]?.id ?? 'checking');
  const [value, setValue] = useState('1000');

  const add = async () => {
    if (!name.trim()) return;
    await db.assets.put({ id: crypto.randomUUID(), name: name.trim(), typeId, value: parseFloat(value) || 0 });
    setName('');
  };

  const total = assets?.reduce((a, x) => a + x.value, 0) ?? 0;

  return (
    <div className="space-y-3">
      <StatCard label="Total assets" value={`$${total.toLocaleString()}`} />
      <div className="widget-card grid gap-2 sm:grid-cols-3">
        <input className="input" placeholder="Account / asset name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          {config?.assetTypes.map((t) => <option key={t.id} value={t.id}>{t.icon ? `${t.icon} ` : ''}{t.label}</option>)}
        </select>
        <input type="number" className="input" placeholder="Value $" value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button" className="btn-primary sm:col-span-3" onClick={add}>Add asset</button>
      </div>
      {assets?.map((a) => (
        <div key={a.id} className="widget-card flex justify-between text-sm">
          <span>{a.name} · {config?.assetTypes.find((t) => t.id === a.typeId)?.label}</span>
          <span>${a.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="widget-card"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>;
}

export function LiabilitiesModule() {
  const { config } = useAppConfig();
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const total = debts?.reduce((a, d) => a + d.balance, 0) ?? 0;
  const cards = (debts ?? []).filter(isCreditCard);
  const loans = (debts ?? []).filter((d) => !isCreditCard(d));

  return (
    <div className="space-y-3">
      <StatCard label="Total liabilities" value={`$${total.toLocaleString()}`} />
      {cards.length > 0 && (
        <div className="widget-card">
          <h3 className="mb-2 text-sm font-semibold">Credit cards</h3>
          {cards.map((c) => (
            <div key={c.id} className="flex justify-between text-sm py-1">
              <span>{c.name}</span>
              <span>${c.balance.toLocaleString()}{c.creditLimit ? ` · ${creditUtilization(c.balance, c.creditLimit)}% util` : ''}</span>
            </div>
          ))}
        </div>
      )}
      {loans.length > 0 && (
        <div className="widget-card">
          <h3 className="mb-2 text-sm font-semibold">Loans</h3>
          {loans.map((l) => (
            <div key={l.id} className="flex justify-between text-sm py-1">
              <span>{l.name} · {config?.debtTypes.find((t) => t.id === l.typeId)?.label}</span>
              <span>${l.balance.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      {!debts?.length && <p className="text-sm text-slate-400">No liabilities tracked — add credit cards or loans</p>}
    </div>
  );
}

export function NetWorthModule() {
  const savings = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const investments = useLiveQuery(() => db.investments.toArray(), []);
  const assets = useLiveQuery(() => db.assets.toArray(), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const snapshots = useLiveQuery(() => db.netWorthSnapshots.toArray(), []);

  const assetTotal = (savings?.reduce((a, s) => a + s.currentAmount, 0) ?? 0)
    + (investments?.reduce((a, i) => a + i.quantity * i.currentPrice, 0) ?? 0)
    + (assets?.reduce((a, x) => a + x.value, 0) ?? 0);
  const liabilities = debts?.reduce((a, d) => a + d.balance, 0) ?? 0;
  const netWorth = assetTotal - liabilities;

  const yearly = useMemo(() => {
    const byYear = new Map<string, number>();
    for (const s of snapshots ?? []) {
      const year = s.date.slice(0, 4);
      byYear.set(year, s.netWorth);
    }
    return [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [snapshots]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Net worth" value={`$${netWorth.toLocaleString()}`} />
        <StatCard label="Assets" value={`$${assetTotal.toLocaleString()}`} />
        <StatCard label="Liabilities" value={`$${liabilities.toLocaleString()}`} />
      </div>
      {yearly.length > 0 && (
        <div className="widget-card">
          <h3 className="mb-2 text-sm font-semibold">Yearly trend</h3>
          {yearly.map(([year, nw]) => (
            <div key={year} className="flex justify-between text-sm py-1">
              <span>{year}</span>
              <span className="font-medium">${nw.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

export function FinanceReportsModule() {
  const [period, setPeriod] = useState<FinanceReportPeriod>('month');
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const savings = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const investments = useLiveQuery(() => db.investments.toArray(), []);
  const assets = useLiveQuery(() => db.assets.toArray(), []);

  const summary = useMemo(() => {
    if (!transactions) return undefined;
    const months = periodMonths(period);
    const periodIncome = months.reduce((a, m) => a + sumByType(transactions, 'income', m), 0);
    const periodExpenses = months.reduce((a, m) => a + sumByType(transactions, 'expense', m), 0);
    const totals = computeFinanceTotals({
      transactions,
      debts: debts ?? [],
      savings: savings ?? [],
      investments: investments ?? [],
      assets: assets ?? [],
    });
    return { ...totals, periodIncome, periodExpenses, period };
  }, [transactions, debts, savings, investments, assets, period]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['week', 'month', 'quarter', 'year'] as FinanceReportPeriod[]).map((p) => (
          <button key={p} type="button" className={`rounded-xl px-3 py-1 text-sm capitalize ${period === p ? 'bg-brand-600 text-white' : 'btn-secondary'}`}
            onClick={() => setPeriod(p)}>{p === 'quarter' ? 'Quarterly' : p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'Yearly'}</button>
        ))}
      </div>
      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Period income" value={`$${summary.periodIncome.toLocaleString()}`} />
          <StatCard label="Period expenses" value={`$${summary.periodExpenses.toLocaleString()}`} />
          <StatCard label="Net worth" value={`$${summary.netWorth.toLocaleString()}`} />
          <StatCard label="Savings rate" value={`${summary.savingsRate}%`} />
          <StatCard label="Debt remaining" value={`$${summary.debtRemaining.toLocaleString()}`} />
        </div>
      )}
      <div className="widget-card flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => exportFinanceReport('json', period)}>Export JSON</button>
        <button type="button" className="btn-secondary" onClick={() => exportFinanceReport('csv', period)}>Export CSV</button>
        <button type="button" className="btn-secondary" onClick={() => exportFinanceReport('excel', period)}>Export Excel</button>
        <button type="button" className="btn-primary" onClick={() => exportFinanceReport('pdf', period)}>Export PDF</button>
      </div>
    </div>
  );
}
