import type { ReactNode } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { db } from '../db/lifeOsDatabase';
import { computeDayTotals } from '../lib/aggregates';
import { getGoals } from '../db/database';
import { useEffect, useState } from 'react';
import type { DailyGoals } from '../core/types';
import { RecoveryScoreWidget } from '../components/widgets/RecoveryScoreWidget';
import { StatWidget } from '../components/widgets/StatWidget';
import { formatMl, formatSleepHours, computeActivityStreak } from '../lib/aggregates';
import { WeeklyCompletionChart } from '../components/charts/WeeklyCompletionChart';
import { PomodoroWidget } from './PomodoroWidget';
import { useAppConfig } from '../context/ConfigContext';
import { evaluateFormula, setFormulaContext } from '../platform/formula/engine';
import { computeNetWorth } from '../platform/finance/debtCalculators';

type Props = { widgetId: string };

export function WidgetRenderer({ widgetId }: Props) {
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const savings = useLiveQuery(() => db.savingsFunds.toArray(), []);
  const debts = useLiveQuery(() => db.debts.toArray(), []);
  const goals = useLiveQuery(() => db.goalItems.toArray(), []);
  const bills = useLiveQuery(() => db.bills.toArray(), []);
  const investments = useLiveQuery(() => db.investments.toArray(), []);
  const relationships = useLiveQuery(() => db.relationships.toArray(), []);
  const { config } = useAppConfig();
  const [legacyGoals, setLegacyGoals] = useState<DailyGoals | null>(null);

  useEffect(() => { getGoals().then(setLegacyGoals); }, []);

  if (!logs || !legacyGoals) {
    return <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div>;
  }

  const dayTotals = logs.map((l) => computeDayTotals(l, legacyGoals)).sort((a, b) => a.date.localeCompare(b.date));
  const today = dayTotals.at(-1);
  const content = renderWidget(widgetId, {
    dayTotals, today, legacyGoals, transactions: transactions ?? [],
    savings: savings ?? [], debts: debts ?? [], goals: goals ?? [], bills: bills ?? [],
    investments: investments ?? [], relationships: relationships ?? [], config,
  });
  return <div className="h-full overflow-auto">{content}</div>;
}

function renderWidget(
  id: string,
  ctx: {
    dayTotals: ReturnType<typeof computeDayTotals>[];
    today?: ReturnType<typeof computeDayTotals>;
    legacyGoals: DailyGoals;
    transactions: { type: string; amount: number }[];
    savings: { name: string; currentAmount: number; targetAmount: number }[];
    debts: { name: string; balance: number; principal: number }[];
    goals: { title: string; currentValue: number; targetValue: number }[];
    bills: { name: string; dueDate: string; status: string }[];
    investments: { quantity: number; currentPrice: number }[];
    relationships: { name: string }[];
    config: ReturnType<typeof useAppConfig>['config'];
  },
): ReactNode {
  switch (id) {
    case 'daily-score':
      return <StatWidget label="Daily Score" value={`${ctx.today?.completionPercent ?? 0}%`} emoji="⭐" percent={ctx.today?.completionPercent} />;
    case 'recovery':
      return <RecoveryScoreWidget score={ctx.today?.recoveryScore ?? 0} />;
    case 'streaks':
      return <StatWidget label="Activity Streak" value={`${computeActivityStreak(ctx.dayTotals)} days`} emoji="🔥" accent="amber" />;
    case 'mood':
      return <StatWidget label="Mood" value={ctx.today && ctx.today.moodCount ? `${(ctx.today.moodScore / ctx.today.moodCount).toFixed(1)}/5` : '—'} emoji="😊" />;
    case 'sleep':
      return <StatWidget label="Sleep" value={ctx.today ? formatSleepHours(ctx.today.sleepMin) : '—'} emoji="😴" accent="violet" />;
    case 'water':
      return <StatWidget label="Water" value={ctx.today ? formatMl(ctx.today.hydrationMl) : '—'} emoji="💧" />;
    case 'steps': {
      const steps = ctx.today?.activityScore ? ctx.today.activityScore * 2000 : 0;
      return <StatWidget label="Steps (est.)" value={steps.toLocaleString()} emoji="👟" />;
    }
    case 'expense-summary': {
      const spent = ctx.transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      return <StatWidget label="Expenses" value={`$${spent.toLocaleString()}`} subValue={`${ctx.transactions.length} transactions`} emoji="💸" accent="rose" />;
    }
    case 'savings-progress': {
      const total = ctx.savings.reduce((a, s) => a + s.currentAmount, 0);
      const target = ctx.savings.reduce((a, s) => a + s.targetAmount, 0);
      const pct = target ? Math.round((total / target) * 100) : 0;
      return <StatWidget label="Savings" value={`$${total.toLocaleString()}`} subValue={`${pct}% of targets`} emoji="🐷" percent={pct} accent="emerald" />;
    }
    case 'debt-progress': {
      const balance = ctx.debts.reduce((a, d) => a + d.balance, 0);
      const principal = ctx.debts.reduce((a, d) => a + d.principal, 0);
      const paid = principal ? Math.round(((principal - balance) / principal) * 100) : 0;
      return <StatWidget label="Debt Remaining" value={`$${balance.toLocaleString()}`} subValue={`${paid}% paid off`} emoji="🏦" percent={paid} />;
    }
    case 'net-worth': {
      const savingsTotal = ctx.savings.reduce((a, s) => a + s.currentAmount, 0);
      const investTotal = ctx.investments.reduce((a, i) => a + i.quantity * i.currentPrice, 0);
      const debtTotal = ctx.debts.reduce((a, d) => a + d.balance, 0);
      const nw = computeNetWorth(savingsTotal, investTotal, debtTotal);
      return <StatWidget label="Net Worth" value={`$${nw.toLocaleString()}`} emoji="💎" accent="violet" />;
    }
    case 'life-mode': {
      const mode = ctx.config?.lifeModes.find((m) => m.id === ctx.config?.activeLifeModeId);
      return <StatWidget label="Life Mode" value={mode?.label ?? 'Work'} subValue={mode?.description} emoji={mode?.icon ?? '💼'} />;
    }
    case 'relationships':
      return <StatWidget label="Relationships" value={String(ctx.relationships.length)} subValue="contacts tracked" emoji="👥" />;
    case 'goals':
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-500">Active Goals</p>
          {ctx.goals.slice(0, 3).map((g) => (
            <div key={g.title} className="text-sm">
              <div className="flex justify-between"><span>{g.title}</span><span>{Math.round((g.currentValue / g.targetValue) * 100)}%</span></div>
              <div className="mt-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-1 rounded-full bg-brand-500" style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }} /></div>
            </div>
          ))}
          {ctx.goals.length === 0 && <p className="text-xs text-slate-400">No goals yet</p>}
        </div>
      );
    case 'journal':
      return <StatWidget label="Journal" value="Write today" subValue="Open Journal module" emoji="📓" />;
    case 'pomodoro':
      return <PomodoroWidget />;
    case 'charts':
      return <WeeklyCompletionChart data={ctx.dayTotals.slice(-14)} title="Completion Trend" />;
    case 'calendar-mini':
    case 'upcoming-events': {
      const upcoming = ctx.bills.filter((b) => b.status !== 'paid').slice(0, 4);
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-500">Upcoming</p>
          {upcoming.length ? upcoming.map((b) => (
            <div key={b.name} className="flex justify-between text-sm"><span>{b.name}</span><span className="text-slate-500">{b.dueDate}</span></div>
          )) : <p className="text-xs text-slate-400">No upcoming bills</p>}
        </div>
      );
    }
    default: {
      const def = ctx.config?.widgets.find((w) => w.id === id);
      if (def?.formulaId && ctx.config) {
        const formula = ctx.config.formulas.find((f) => f.id === def.formulaId);
        if (formula) {
          setFormulaContext({
            completionPercent: ctx.today?.completionPercent ?? 0,
            recoveryScore: ctx.today?.recoveryScore ?? 0,
            savings: ctx.savings.reduce((a, s) => a + s.currentAmount, 0),
            debts: ctx.debts.reduce((a, d) => a + d.balance, 0),
            investments: ctx.investments.reduce((a, i) => a + i.quantity * i.currentPrice, 0),
          });
          const val = evaluateFormula(formula.expression);
          return <StatWidget label={def.label} value={`${val}${formula.unit ?? ''}`} emoji="📐" />;
        }
      }
      if (def?.userCreated) return <StatWidget label={def.label} value="Custom" subValue="Configure formula in Settings" emoji="🧩" />;
      return <p className="text-xs text-slate-400">Widget: {id}</p>;
    }
  }
}
