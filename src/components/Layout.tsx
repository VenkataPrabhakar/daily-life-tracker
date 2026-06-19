import { NavLink, Outlet } from 'react-router-dom';
import { InstallPrompt } from './InstallPrompt';

const navItems = [
  { to: '/', label: 'Today', icon: '📋' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-0 md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200/80 bg-white/80 p-5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:flex">
        <div className="mb-10 px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              ◉
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Daily Life</h1>
              <p className="text-[11px] text-slate-500">Wellness tracker</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <Outlet />
      </main>

      <InstallPrompt />

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200/80 bg-white/90 px-2 py-2 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
