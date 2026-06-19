import { useEffect, useMemo } from 'react';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { db } from '../../db/lifeOsDatabase';
import { StatWidget } from '../../components/widgets/StatWidget';
import { CategorySpendingChart } from '../../components/finance/CategorySpendingChart';
import { IncomeVsExpenseChart, NetWorthTrendChart, DebtPayoffChart } from '../../components/finance/FinanceCharts';
import {
  computeFinanceTotals,
  currentMonthKey,
  debtPayoffProgress,
  lastNMonths,
  monthlyIncomeExpenseSeries,
  spendingByParent,
} from '../../platform/finance/financeUtils';
import { useAppConfig } from '../../context/ConfigContext';

export function FinanceOverview() {
  const { config } = useAppConfig();
  const month = currentMonthKey();
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const savings = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const investments = useLiveQuery(() => db.investments.toArray(), []);
  const assets = useLiveQuery(() => db.assets.toArray(), []);
  const bills = useLiveQuery(() => db.bills.toArray(), []);
  const snapshots = useLiveQuery(() => db.netWorthSnapshots.toArray(), []);

  const totals = useMemo(
    () => computeFinanceTotals({
      transactions: transactions ?? [],
      debts: debts ?? [],
      savings: savings ?? [],
      investments: investments ?? [],
      assets: assets ?? [],
      month,
    }),
    [transactions, debts, savings, investments, assets, month],
  );

  useEffect(() => {
    if (!transactions) return;
    const id = month;
    db.netWorthSnapshots.put({
      id,
      date: month,
      assets: totals.totalAssets,
      liabilities: totals.debtRemaining,
      netWorth: totals.netWorth,
    });
  }, [totals.totalAssets, totals.debtRemaining, totals.netWorth, month, transactions]);

  const months = lastNMonths(6);
  const incomeExpense = monthlyIncomeExpenseSeries(transactions ?? [], months);
  const categoryChart = spendingByParent(transactions ?? [], config?.expenseCategories ?? [], month);
  const debtProgress = debtPayoffProgress(debts ?? []);

  const upcomingBills = (bills ?? [])
    .filter((b) => b.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget label="Monthly Income" value={`$${totals.monthlyIncome.toLocaleString()}`} emoji="💵" accent="emerald" />
        <StatWidget label="Monthly Expenses" value={`$${totals.monthlyExpenses.toLocaleString()}`} emoji="💸" accent="rose" />
        <StatWidget label="Savings Rate" value={`${totals.savingsRate}%`} emoji="📈" accent="violet" />
        <StatWidget label="Debt Remaining" value={`$${totals.debtRemaining.toLocaleString()}`} emoji="🏦" accent="amber" />
        <StatWidget label="Investments" value={`$${totals.investments.toLocaleString()}`} emoji="📊" />
        <StatWidget label="Net Worth" value={`$${totals.netWorth.toLocaleString()}`} emoji="💎" accent="violet" />
        <StatWidget
          label="Upcoming Bills"
          value={String(upcomingBills.length)}
          emoji="📅"
          accent={upcomingBills.some((b) => b.dueDate < today) ? 'rose' : undefined}
        />
      </div>

      {upcomingBills.length > 0 && (
        <div className="widget-card">
          <h3 className="mb-2 text-sm font-semibold">Upcoming bills</h3>
          <div className="space-y-1">
            {upcomingBills.map((b) => (
              <div key={b.id} className="flex justify-between text-sm">
                <span>{b.name}</span>
                <span className={b.dueDate < today ? 'text-rose-500' : 'text-slate-500'}>
                  ${b.amount} · due {b.dueDate} · {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeVsExpenseChart data={incomeExpense} />
        <CategorySpendingChart items={categoryChart} title="Spending categories" />
        <NetWorthTrendChart snapshots={snapshots ?? []} />
        <DebtPayoffChart paid={debtProgress.paid} remaining={debtProgress.remaining} />
      </div>
    </div>
  );
}
