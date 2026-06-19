import { ModuleShell } from '../../components/ModuleShell';
import { FinanceOverview, TransactionModule } from './FinancePages';
import { SavingsModule, DebtModule, InvestmentsModule, BudgetModule, NetWorthModule } from './FinanceSubModules';

export function FinanceHubModule() {
  return (
    <ModuleShell title="Finance" subtitle="Income, expenses, budgets, and cash flow overview">
      <FinanceOverview />
      <div className="mt-4"><BudgetModule /></div>
    </ModuleShell>
  );
}

export function ExpensesModule() {
  return (
    <ModuleShell title="Expenses" subtitle="Track spending by category with charts">
      <TransactionModule type="expense" />
    </ModuleShell>
  );
}

export function IncomeModule() {
  return (
    <ModuleShell title="Income" subtitle="Salary, freelance, dividends, and other sources">
      <TransactionModule type="income" />
    </ModuleShell>
  );
}

export function SavingsPageModule() {
  return <ModuleShell title="Savings" subtitle="Emergency fund, vacation, and custom savings goals"><SavingsModule /></ModuleShell>;
}

export function DebtPageModule() {
  return <ModuleShell title="Debt Management" subtitle="Snowball, avalanche, and payoff forecasts"><DebtModule /></ModuleShell>;
}

export function InvestmentsPageModule() {
  return <ModuleShell title="Investments" subtitle="Stocks, ETFs, crypto, and portfolio allocation"><InvestmentsModule /></ModuleShell>;
}

export function NetWorthPageModule() {
  return <ModuleShell title="Net Worth" subtitle="Assets minus liabilities over time"><NetWorthModule /></ModuleShell>;
}
