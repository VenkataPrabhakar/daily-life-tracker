import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAll } from '../platform/search/globalSearch';
import type { SearchResult } from '../core/types';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length >= 2) {
        setResults(await searchAll(query));
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <input
        className="input w-full text-sm"
        placeholder="Search all Life OS data…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {results.map((r) => (
            <button
              key={`${r.module}-${r.id}`}
              type="button"
              className="flex w-full flex-col px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => { navigate(r.path); setOpen(false); setQuery(''); }}
            >
              <span className="text-sm font-medium">{r.title}</span>
              <span className="text-xs text-slate-500">{r.module}{r.date ? ` · ${r.date}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
