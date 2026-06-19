import { useMemo, useState } from 'react';
import type { CategoryDefinition, FinanceTag, IncomeFrequency, Transaction, TransactionType } from '../../core/types';
import { db } from '../../db/lifeOsDatabase';
import { toDateKey } from '../../lib/dates';
import { parentCategories, subcategories } from '../../platform/finance/financeUtils';

type Props = {
  type: TransactionType;
  categories: CategoryDefinition[];
  paymentMethods: { id: string; label: string }[];
  financeTags?: FinanceTag[];
  onAdded?: () => void;
};

const FREQUENCIES: { id: IncomeFrequency; label: string }[] = [
  { id: 'one-time', label: 'One-time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Biweekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export function TransactionForm({ type, categories, paymentMethods, financeTags = [], onAdded }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [parentId, setParentId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<IncomeFrequency>('one-time');
  const [taxable, setTaxable] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const parents = useMemo(() => (type === 'expense' ? parentCategories(categories) : categories), [type, categories]);
  const subs = useMemo(() => (parentId ? subcategories(categories, parentId) : []), [categories, parentId]);

  const activeParent = parentId || parents[0]?.id || '';
  const activeSub = subcategoryId || subs[0]?.id || '';
  const activeCategory = type === 'expense'
    ? (activeSub || activeParent)
    : categoryId;

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!activeCategory) {
      setError('Select a category');
      return;
    }
    setError('');
    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Math.round(parsed * 100) / 100,
      date,
      categoryId: type === 'expense' ? activeParent : activeCategory,
      subcategoryId: type === 'expense' && activeSub ? activeSub : undefined,
      paymentMethod: paymentMethod || undefined,
      notes: notes.trim() || undefined,
      tags: selectedTags.length ? selectedTags : undefined,
      recurring,
      frequency: type === 'income' ? frequency : undefined,
      taxable: type === 'income' ? taxable : undefined,
    };
    await db.transactions.put(tx);
    setAmount('');
    setNotes('');
    setSelectedTags([]);
    onAdded?.();
  };

  return (
    <form className="widget-card space-y-3" onSubmit={submit}>
      <h3 className="text-sm font-semibold">{type === 'expense' ? 'Add expense' : 'Add income'}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Amount ($)</label>
          <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        {type === 'expense' ? (
          <>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Category</label>
              <select className="input" value={activeParent} onChange={(e) => { setParentId(e.target.value); setSubcategoryId(''); }} required>
                {parents.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.label}</option>)}
              </select>
            </div>
            {subs.length > 0 && (
              <div>
                <label className="mb-1 block text-xs text-slate-500">Subcategory</label>
                <select className="input" value={activeSub} onChange={(e) => setSubcategoryId(e.target.value)}>
                  {subs.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs text-slate-500">Payment method</label>
              <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {paymentMethods.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Source</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Frequency</label>
              <select className="input" value={frequency} onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}>
                {FREQUENCIES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-xs text-slate-500">Notes</label>
          <input className="input" placeholder="Optional description" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      {financeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {financeTags.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`rounded-full px-2.5 py-0.5 text-xs ${selectedTags.includes(t.id) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
              onClick={() => toggleTag(t.id)}
            >
              #{t.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Recurring
        </label>
        {type === 'income' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={taxable} onChange={(e) => setTaxable(e.target.checked)} />
            Taxable
          </label>
        )}
        <button type="submit" className="btn-primary">
          {type === 'expense' ? 'Add expense' : 'Add income'}
        </button>
        {error && <span className="text-sm text-rose-500">{error}</span>}
      </div>
    </form>
  );
}
