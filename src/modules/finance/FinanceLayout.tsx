import { NavLink, Outlet } from 'react-router-dom';
import { ModuleShell } from '../../components/ModuleShell';

const tabs = [
  { to: '/finance', label: 'Overview', end: true },
  { to: '/finance/income', label: 'Income' },
  { to: '/finance/expenses', label: 'Expenses' },
  { to: '/finance/budget', label: 'Budget' },
  { to: '/finance/credit-cards', label: 'Credit Cards' },
  { to: '/finance/loans', label: 'Loans' },
  { to: '/finance/savings', label: 'Savings' },
  { to: '/finance/investments', label: 'Investments' },
  { to: '/finance/bills', label: 'Bills' },
  { to: '/finance/assets', label: 'Assets' },
  { to: '/finance/liabilities', label: 'Liabilities' },
  { to: '/finance/net-worth', label: 'Net Worth' },
  { to: '/finance/reports', label: 'Reports' },
];

export function FinanceLayout() {
  return (
    <ModuleShell title="Finance" subtitle="Personal finance — income, spending, debt, savings, and net worth">
      <nav className="-mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm ${isActive ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </ModuleShell>
  );
}
