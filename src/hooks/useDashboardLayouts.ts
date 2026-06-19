import { useCallback, useEffect, useState } from 'react';
import type { DashboardLayout } from '../core/types';
import { getAppConfig, saveAppConfig } from '../db/lifeOsDatabase';

export function useDashboardLayouts() {
  const [dashboards, setDashboards] = useState<DashboardLayout[]>([]);
  const [activeId, setActiveId] = useState<string>('main');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const config = await getAppConfig();
    setDashboards(config.dashboards);
    setActiveId(config.dashboards.find((d) => d.isDefault)?.id ?? config.dashboards[0]?.id ?? 'main');
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeDashboard = dashboards.find((d) => d.id === activeId) ?? dashboards[0];

  const saveDashboard = async (layout: DashboardLayout) => {
    const config = await getAppConfig();
    const idx = config.dashboards.findIndex((d) => d.id === layout.id);
    const dashboardsNext = [...config.dashboards];
    if (idx >= 0) dashboardsNext[idx] = layout;
    else dashboardsNext.push(layout);
    await saveAppConfig({ ...config, dashboards: dashboardsNext });
    setDashboards(dashboardsNext);
  };

  const addDashboard = async (name: string) => {
    const config = await getAppConfig();
    const newDash: DashboardLayout = {
      id: crypto.randomUUID(),
      name,
      isDefault: false,
      items: [],
    };
    await saveAppConfig({ ...config, dashboards: [...config.dashboards, newDash] });
    await refresh();
    setActiveId(newDash.id);
  };

  return { dashboards, activeDashboard, activeId, setActiveId, saveDashboard, addDashboard, loading, refresh };
}
