import { useAppConfig } from '../context/ConfigContext';
import type { LifeModeId } from '../core/types';

export function LifeModeSelector({ compact = false }: { compact?: boolean }) {
  const { config, updateConfig } = useAppConfig();
  if (!config) return null;

  const active = config.lifeModes.find((m) => m.id === config.activeLifeModeId);

  return (
    <div className={compact ? 'flex gap-1 overflow-x-auto' : 'flex flex-wrap gap-2'}>
      {!compact && <span className="text-xs font-semibold uppercase text-slate-500">Life Mode</span>}
      {config.lifeModes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          title={mode.description}
          className={`shrink-0 rounded-xl px-2.5 py-1 text-xs transition ${
            config.activeLifeModeId === mode.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'btn-secondary'
          }`}
          onClick={() => updateConfig({ activeLifeModeId: mode.id as LifeModeId })}
        >
          {mode.icon} {compact ? '' : mode.label}
        </button>
      ))}
      {active && compact && <span className="self-center text-xs text-slate-500">{active.label}</span>}
    </div>
  );
}
