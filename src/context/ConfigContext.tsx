import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppConfig } from '../core/types';
import { getAppConfig, initDatabase, saveAppConfig } from '../db/lifeOsDatabase';
import { mergePluginConfig } from '../platform/plugin/registry';

type ConfigContextValue = {
  config: AppConfig | null;
  loading: boolean;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  refresh: () => Promise<void>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    await initDatabase();
    const cfg = mergePluginConfig(await getAppConfig());
    setConfig(cfg);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateConfig = async (patch: Partial<AppConfig>) => {
    if (!config) return;
    const next = { ...config, ...patch };
    await saveAppConfig(next);
    setConfig(next);
  };

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig, refresh }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useAppConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useAppConfig must be used within ConfigProvider');
  return ctx;
}
