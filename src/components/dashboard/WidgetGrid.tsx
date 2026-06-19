import { useCallback } from 'react';
import GridLayout, { WidthProvider, type Layout, type LayoutItem } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { DashboardLayout } from '../../core/types';
import { WidgetRenderer } from '../../widgets/WidgetRenderer';
import { useAppConfig } from '../../context/ConfigContext';

const ResponsiveGridLayout = WidthProvider(GridLayout);

type Props = {
  dashboard: DashboardLayout;
  onSave: (layout: DashboardLayout) => void;
  editable?: boolean;
};

export function WidgetGrid({ dashboard, onSave, editable = true }: Props) {
  const { config } = useAppConfig();

  const layout: LayoutItem[] = dashboard.items.map((item) => ({
    i: item.instanceId,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: config?.widgets.find((w) => w.id === item.widgetId)?.minW ?? 2,
    minH: config?.widgets.find((w) => w.id === item.widgetId)?.minH ?? 2,
  }));

  const onLayoutChange = useCallback(
    (newLayout: Layout) => {
      const items = dashboard.items.map((item) => {
        const l = newLayout.find((n) => n.i === item.instanceId);
        return l ? { ...item, x: l.x, y: l.y, w: l.w, h: l.h } : item;
      });
      onSave({ ...dashboard, items });
    },
    [dashboard, onSave],
  );

  return (
    <ResponsiveGridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={60}
      isDraggable={editable}
      isResizable={editable}
      onLayoutChange={onLayoutChange}
      draggableHandle=".widget-drag-handle"
    >
      {dashboard.items.map((item) => {
        const def = config?.widgets.find((w) => w.id === item.widgetId);
        return (
          <div key={item.instanceId} className="widget-card overflow-hidden !p-0">
            <div className="widget-drag-handle flex cursor-grab items-center justify-between border-b border-slate-200/60 px-3 py-2 dark:border-slate-700/60">
              <span className="text-xs font-semibold">{def?.label ?? item.widgetId}</span>
              <span className="text-slate-400">⠿</span>
            </div>
            <div className="p-3" style={{ height: 'calc(100% - 36px)' }}>
              <WidgetRenderer widgetId={item.widgetId} />
            </div>
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
