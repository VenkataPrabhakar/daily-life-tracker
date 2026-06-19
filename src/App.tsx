import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TodayPage } from './pages/TodayPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardModule } from './modules/DashboardModule';
import { HealthModule } from './modules/HealthModule';
import { HabitsModule } from './modules/HabitsModule';
import { GoalsModule } from './modules/GoalsModule';
import { JournalModule } from './modules/JournalModule';
import { ProductivityModule } from './modules/ProductivityModule';
import { FinanceLayout } from './modules/finance/FinanceLayout';
import { FinanceOverview, TransactionModule } from './modules/finance/FinancePages';
import { SavingsModule, DebtModule, InvestmentsModule, BudgetModule, NetWorthModule } from './modules/finance/FinanceSubModules';
import {
  InsightsModule, AnalyticsModule, CalendarModule, TimelineModule,
  AchievementsModule, NotificationsModule, ReportsModule, BackupModule,
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
        <Route path="/finance" element={<FinanceLayout />}>
          <Route index element={<FinanceOverview />} />
          <Route path="income" element={<TransactionModule type="income" />} />
          <Route path="expenses" element={<TransactionModule type="expense" />} />
          <Route path="budget" element={<BudgetModule />} />
          <Route path="savings" element={<SavingsModule />} />
          <Route path="debt" element={<DebtModule />} />
          <Route path="investments" element={<InvestmentsModule />} />
          <Route path="reports" element={<ReportsModule />} />
          <Route path="net-worth" element={<NetWorthModule />} />
        </Route>
        <Route path="/calendar" element={<CalendarModule />} />
        <Route path="/timeline" element={<TimelineModule />} />
        <Route path="/analytics" element={<AnalyticsModule />} />
        <Route path="/achievements" element={<AchievementsModule />} />
        <Route path="/notifications" element={<NotificationsModule />} />
        <Route path="/insights" element={<InsightsModule />} />
        <Route path="/reports" element={<ReportsModule />} />
        <Route path="/backup" element={<BackupModule />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Legacy redirects */}
        <Route path="/history" element={<Navigate to="/calendar" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
