import { FinanceOverview } from './FinanceOverview';
import { TransactionModule } from './FinancePages';
import {
  SavingsModule,
  LoansModule,
  CreditCardsModule,
  InvestmentsModule,
  BudgetModule,
  BillsModule,
  AssetsModule,
  LiabilitiesModule,
  NetWorthModule,
  FinanceReportsModule,
} from './FinanceSubModules';

export function FinanceOverviewPage() {
  return <FinanceOverview />;
}

export function FinanceIncomePage() {
  return <TransactionModule type="income" />;
}

export function FinanceExpensesPage() {
  return <TransactionModule type="expense" />;
}

export function FinanceBudgetPage() {
  return <BudgetModule />;
}

export function FinanceCreditCardsPage() {
  return <CreditCardsModule />;
}

export function FinanceLoansPage() {
  return <LoansModule />;
}

export function FinanceSavingsPage() {
  return <SavingsModule />;
}

export function FinanceInvestmentsPage() {
  return <InvestmentsModule />;
}

export function FinanceBillsPage() {
  return <BillsModule />;
}

export function FinanceAssetsPage() {
  return <AssetsModule />;
}

export function FinanceLiabilitiesPage() {
  return <LiabilitiesModule />;
}

export function FinanceNetWorthPage() {
  return <NetWorthModule />;
}

export function FinanceReportsPage() {
  return <FinanceReportsModule />;
}

/** Legacy standalone wrappers — redirect routes still use these module shells elsewhere */
export {
  FinanceOverviewPage as FinanceHubModule,
  FinanceExpensesPage as ExpensesModule,
  FinanceIncomePage as IncomeModule,
  FinanceSavingsPage as SavingsPageModule,
  FinanceLoansPage as DebtPageModule,
  FinanceInvestmentsPage as InvestmentsPageModule,
  FinanceNetWorthPage as NetWorthPageModule,
};
