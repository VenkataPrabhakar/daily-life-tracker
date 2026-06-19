import { NavLink, Outlet } from 'react-router-dom';
import { InstallPrompt } from './InstallPrompt';
import { GlobalSearch } from './GlobalSearch';
import { LifeModeSelector } from './LifeModeSelector';
import { useAppConfig } from '../context/ConfigContext';

export function Layout() {
  const { config, loading } = useAppConfig();
  const modules = (config?.modules ?? []).filter((m) => m.enabled !== false);

  const groups = {
    core: modules.filter((m) => m.group === 'core'),
    finance: modules.filter((m) => m.group === 'finance'),
    life: modules.filter((m) => m.group === 'life'),
    system: modules.filter((m) => m.group === 'system'),
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">Loading Life OS...</p>
        </div>
      </div>
    );
  }

  const NavSection = ({ title, items }: { title: string; items: typeof modules }) => {
    if (!items.length) return null;
    return (
      <div className="mb-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/finance'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-0 md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col overflow-y-auto border-r border-slate-200/80 bg-white/90 p-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 md:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">◉</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Life OS</h1>
            <p className="text-[10px] text-slate-500">Personal operating system</p>
          </div>
        </div>
        <div className="mb-4 px-1"><GlobalSearch /></div>
        <NavSection title="Core" items={groups.core} />
        <NavSection title="Finance" items={groups.finance} />
        <NavSection title="Life" items={groups.life} />
        <NavSection title="System" items={groups.system} />
      </aside>

      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 px-4 py-2 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:pl-72">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <LifeModeSelector compact />
          <div className="md:hidden flex-1"><GlobalSearch /></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <Outlet />
      </main>

      <InstallPrompt />

      <nav className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-slate-200/80 bg-white/95 px-2 py-2 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95 md:hidden">
        {modules.slice(0, 8).map((item) => (
          <NavLink key={item.id} to={item.path} end={item.path === '/finance'} className={({ isActive }) =>
            `flex shrink-0 flex-col items-center rounded-xl px-2 py-1 text-[9px] ${isActive ? 'text-brand-600' : 'text-slate-500'}`
          }>
            <span className="text-lg">{item.icon}</span>
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
