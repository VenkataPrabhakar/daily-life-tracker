import { useState } from 'react';
import { getAllLogs, getGoals } from '../../db/database';
import { exportCsv, exportJsonBackup, exportPdf } from '../../lib/export';

export function ExportPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const runExport = async (type: 'json' | 'csv' | 'pdf') => {
    setLoading(type);
    setStatus(null);
    try {
      if (type === 'json') {
        await exportJsonBackup();
      } else {
        const [logs, goals] = await Promise.all([getAllLogs(), getGoals()]);
        if (type === 'csv') await exportCsv(logs, goals);
        else await exportPdf(logs, goals);
      }
      setStatus(`${type.toUpperCase()} exported successfully`);
    } catch {
      setStatus('Export failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="widget-card space-y-4">
      <div>
        <h2 className="font-semibold">Export Data</h2>
        <p className="text-sm text-slate-500">Download your wellness data in multiple formats</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['json', 'csv', 'pdf'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => runExport(type)}
            disabled={!!loading}
            className="btn-secondary capitalize"
          >
            {loading === type ? 'Exporting...' : `Export ${type.toUpperCase()}`}
          </button>
        ))}
      </div>
      {status && <p className="text-sm text-brand-600">{status}</p>}
    </section>
  );
}
