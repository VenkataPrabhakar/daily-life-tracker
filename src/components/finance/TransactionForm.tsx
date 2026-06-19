import { useState } from 'react';
import type { CategoryDefinition, Transaction, TransactionType } from '../../core/types';
import { db } from '../../db/lifeOsDatabase';
import { toDateKey } from '../../lib/dates';

type Props = {
  type: TransactionType;
  categories: CategoryDefinition[];
  paymentMethods: { id: string; label: string }[];
  onAdded?: () => void;
};

export function TransactionForm({ type, categories, paymentMethods, onAdded }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!categoryId) {
      setError('Select a category');
      return;
    }
    setError('');
    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Math.round(parsed * 100) / 100,
      date,
      categoryId,
      paymentMethod: paymentMethod || undefined,
      notes: notes.trim() || undefined,
      recurring,
    };
    await db.transactions.put(tx);
    setAmount('');
    setNotes('');
    onAdded?.();
  };

  return (
    <form className="widget-card space-y-3" onSubmit={submit}>
      <h3 className="text-sm font-semibold">{type === 'expense' ? 'Add expense' : 'Add income'}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Category</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Payment method</label>
          <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Notes</label>
          <input className="input" placeholder="Optional description" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Recurring
        </label>
        <button type="submit" className="btn-primary">
          {type === 'expense' ? 'Add expense' : 'Add income'}
        </button>
        {error && <span className="text-sm text-rose-500">{error}</span>}
      </div>
    </form>
  );
}
