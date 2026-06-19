import type { Debt } from '../../core/types';

export type DebtPayoffStep = {
  month: number;
  debtName: string;
  payment: number;
  remaining: number;
  interestPaid: number;
};

export type DebtPayoffPlan = {
  strategy: 'snowball' | 'avalanche';
  months: number;
  totalInterest: number;
  steps: DebtPayoffStep[];
};

function sortDebts(debts: Debt[], strategy: 'snowball' | 'avalanche'): Debt[] {
  return [...debts].filter((d) => d.balance > 0).sort((a, b) =>
    strategy === 'avalanche' ? b.interestRate - a.interestRate : a.balance - b.balance,
  );
}

/** Simulate monthly payoff using snowball or avalanche with extra payment. */
export function calculateDebtPayoff(
  debts: Debt[],
  strategy: 'snowball' | 'avalanche',
  extraMonthly = 0,
  maxMonths = 360,
): DebtPayoffPlan {
  const balances = sortDebts(debts, strategy).map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.balance,
    rate: d.interestRate / 100 / 12,
    min: d.minimumPayment,
  }));

  const steps: DebtPayoffStep[] = [];
  let month = 0;
  let totalInterest = 0;

  while (balances.some((b) => b.balance > 0.01) && month < maxMonths) {
    month++;
    let pool = extraMonthly;
    for (const b of balances) {
      const interest = b.balance * b.rate;
      totalInterest += interest;
      b.balance += interest;
      const pay = Math.min(b.min, b.balance);
      b.balance -= pay;
      pool += b.min;
      if (b.balance > 0.01) {
        steps.push({ month, debtName: b.name, payment: pay, remaining: b.balance, interestPaid: interest });
      }
    }
    const target = balances.find((b) => b.balance > 0.01);
    if (target) {
      const extra = Math.min(pool - balances.reduce((s, b) => s + (b.balance > 0 ? b.min : 0), 0) + extraMonthly, target.balance);
      const applied = Math.max(extraMonthly, extra);
      target.balance = Math.max(0, target.balance - applied);
    }
  }

  return { strategy, months: month, totalInterest, steps: steps.slice(0, 120) };
}

export function computeNetWorth(
  savings: number,
  investments: number,
  debts: number,
): number {
  return savings + investments - debts;
}
