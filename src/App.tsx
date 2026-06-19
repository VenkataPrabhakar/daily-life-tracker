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
import {
  FinanceHubModule, ExpensesModule, IncomeModule,
  SavingsPageModule, DebtPageModule, InvestmentsPageModule, NetWorthPageModule,
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
        <Route path="/finance" element={<FinanceHubModule />} />
        <Route path="/income" element={<IncomeModule />} />
        <Route path="/expenses" element={<ExpensesModule />} />
        <Route path="/debt" element={<DebtPageModule />} />
        <Route path="/savings" element={<SavingsPageModule />} />
        <Route path="/investments" element={<InvestmentsPageModule />} />
        <Route path="/net-worth" element={<NetWorthPageModule />} />
        <Route path="/relationships" element={<RelationshipsModule />} />
        <Route path="/home" element={<HomeModule />} />
        <Route path="/documents" element={<DocumentsModule />} />
        <Route path="/analytics" element={<AnalyticsModule />} />
        <Route path="/reports" element={<ReportsModule />} />
        <Route path="/achievements" element={<AchievementsModule />} />
        <Route path="/notifications" element={<NotificationsModule />} />
        <Route path="/settings" element={<SettingsModule />} />
        {/* Legacy redirects */}
        <Route path="/finance/income" element={<IncomeModule />} />
        <Route path="/finance/expenses" element={<Navigate to="/expenses" replace />} />
        <Route path="/finance/debt" element={<Navigate to="/debt" replace />} />
        <Route path="/finance/savings" element={<Navigate to="/savings" replace />} />
        <Route path="/finance/investments" element={<Navigate to="/investments" replace />} />
        <Route path="/finance/net-worth" element={<Navigate to="/net-worth" replace />} />
        <Route path="/insights" element={<Navigate to="/analytics" replace />} />
        <Route path="/backup" element={<Navigate to="/settings" replace />} />
        <Route path="/history" element={<Navigate to="/calendar" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
