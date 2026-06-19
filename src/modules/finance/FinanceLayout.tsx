import { NavLink, Outlet } from 'react-router-dom';
import { ModuleShell } from '../../components/ModuleShell';

const tabs = [
  { to: '/finance', label: 'Overview', end: true },
  { to: '/finance/income', label: 'Income' },
  { to: '/finance/expenses', label: 'Expenses' },
  { to: '/finance/budget', label: 'Budget' },
  { to: '/finance/savings', label: 'Savings' },
  { to: '/finance/debt', label: 'Debt' },
  { to: '/finance/investments', label: 'Investments' },
  { to: '/finance/reports', label: 'Reports' },
  { to: '/finance/net-worth', label: 'Net Worth' },
];

export function FinanceLayout() {
  return (
    <ModuleShell title="Finance" subtitle="Income, expenses, savings, debt, investments & net worth">
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`
          }>{t.label}</NavLink>
        ))}
      </nav>
      <Outlet />
    </ModuleShell>
  );
}
