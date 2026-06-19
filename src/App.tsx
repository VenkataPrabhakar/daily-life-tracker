import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TodayPage } from './pages/TodayPage';
import { DashboardModule } from './modules/DashboardModule';
import { HealthModule } from './modules/HealthModule';
import { HabitsModule } from './modules/HabitsModule';
import { GoalsModule } from './modules/GoalsModule';
import { JournalModule } from './modules/JournalModule';
import { ProductivityModule } from './modules/ProductivityModule';
import { CalendarModule } from './modules/calendar/CalendarModule';
import { RelationshipsModule, HomeModule, DocumentsModule } from './modules/life/LifeModules';
import { SettingsModule } from './modules/settings/SettingsModule';
import { FinanceLayout } from './modules/finance/FinanceLayout';
import {
  FinanceOverviewPage,
  FinanceIncomePage,
  FinanceExpensesPage,
  FinanceBudgetPage,
  FinanceCreditCardsPage,
  FinanceLoansPage,
  FinanceSavingsPage,
  FinanceInvestmentsPage,
  FinanceBillsPage,
  FinanceAssetsPage,
  FinanceLiabilitiesPage,
  FinanceNetWorthPage,
  FinanceReportsPage,
} from './modules/finance/FinanceStandalone';
import {
  AnalyticsModule, TimelineModule, AchievementsModule, NotificationsModule, ReportsModule,
} from './modules/SystemModules';

function TodayWithDateParam() {
  const [params] = useSearchParams();
  const date = params.get('date');
  return date ? <TodayPage key={date} initialDate={date} /> : <TodayPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TodayWithDateParam />} />
        <Route path="/dashboard" element={<DashboardModule />} />
        <Route path="/health" element={<HealthModule />} />
        <Route path="/habits" element={<HabitsModule />} />
        <Route path="/goals" element={<GoalsModule />} />
        <Route path="/productivity" element={<ProductivityModule />} />
        <Route path="/journal" element={<JournalModule />} />
        <Route path="/calendar" element={<CalendarModule />} />
        <Route path="/timeline" element={<TimelineModule />} />

        <Route path="/finance" element={<FinanceLayout />}>
          <Route index element={<FinanceOverviewPage />} />
          <Route path="income" element={<FinanceIncomePage />} />
          <Route path="expenses" element={<FinanceExpensesPage />} />
          <Route path="budget" element={<FinanceBudgetPage />} />
          <Route path="credit-cards" element={<FinanceCreditCardsPage />} />
          <Route path="loans" element={<FinanceLoansPage />} />
          <Route path="savings" element={<FinanceSavingsPage />} />
          <Route path="investments" element={<FinanceInvestmentsPage />} />
          <Route path="bills" element={<FinanceBillsPage />} />
          <Route path="assets" element={<FinanceAssetsPage />} />
          <Route path="liabilities" element={<FinanceLiabilitiesPage />} />
          <Route path="net-worth" element={<FinanceNetWorthPage />} />
          <Route path="reports" element={<FinanceReportsPage />} />
        </Route>

        <Route path="/analytics" element={<AnalyticsModule />} />
        <Route path="/reports" element={<ReportsModule />} />
        <Route path="/achievements" element={<AchievementsModule />} />
        <Route path="/notifications" element={<NotificationsModule />} />
        <Route path="/settings" element={<SettingsModule />} />
        <Route path="/relationships" element={<RelationshipsModule />} />
        <Route path="/home" element={<HomeModule />} />
        <Route path="/documents" element={<DocumentsModule />} />

        {/* Legacy finance routes */}
        <Route path="/income" element={<Navigate to="/finance/income" replace />} />
        <Route path="/expenses" element={<Navigate to="/finance/expenses" replace />} />
        <Route path="/debt" element={<Navigate to="/finance/loans" replace />} />
        <Route path="/savings" element={<Navigate to="/finance/savings" replace />} />
        <Route path="/investments" element={<Navigate to="/finance/investments" replace />} />
        <Route path="/net-worth" element={<Navigate to="/finance/net-worth" replace />} />
        <Route path="/finance/debt" element={<Navigate to="/finance/loans" replace />} />

        <Route path="/insights" element={<Navigate to="/analytics" replace />} />
        <Route path="/backup" element={<Navigate to="/settings" replace />} />
        <Route path="/history" element={<Navigate to="/calendar" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
