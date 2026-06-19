import { useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { WidgetGrid } from '../components/dashboard/WidgetGrid';
import { useDashboardLayouts } from '../hooks/useDashboardLayouts';
import { useAppConfig } from '../context/ConfigContext';

export function DashboardModule() {
  const { dashboards, activeDashboard, activeId, setActiveId, saveDashboard, addDashboard, loading } = useDashboardLayouts();
  const { config } = useAppConfig();
  const [editMode, setEditMode] = useState(true);

  if (loading || !activeDashboard) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  }

  const addWidget = async (widgetId: string) => {
    const def = config?.widgets.find((w) => w.id === widgetId);
    if (!def) return;
    const item = {
      instanceId: crypto.randomUUID(),
      widgetId,
      x: 0,
      y: Infinity,
      w: def.defaultW,
      h: def.defaultH,
    };
    await saveDashboard({ ...activeDashboard, items: [...activeDashboard.items, item] });
  };

  return (
    <ModuleShell
      title="Dashboard"
      subtitle="Drag, resize, and customize your Life OS command center"
      actions={
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto text-sm" value={activeId} onChange={(e) => setActiveId(e.target.value)}>
            {dashboards.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button type="button" className="btn-secondary text-sm" onClick={() => addDashboard(`Dashboard ${dashboards.length + 1}`)}>+ Dashboard</button>
          <button type="button" className="btn-secondary text-sm" onClick={() => setEditMode((e) => !e)}>{editMode ? 'Lock' : 'Edit'}</button>
        </div>
      }
    >
      {editMode && (
        <div className="widget-card flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Add widget:</span>
          {config?.widgets.map((w) => (
            <button key={w.id} type="button" className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => addWidget(w.id)}>
              {w.label}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-x-auto">
        <WidgetGrid dashboard={activeDashboard} onSave={saveDashboard} editable={editMode} />
      </div>
    </ModuleShell>
  );
}
