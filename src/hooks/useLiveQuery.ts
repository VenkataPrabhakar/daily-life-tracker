import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

/** Reactive Dexie query — re-runs when underlying tables change. */
export function useLiveQuery<T>(queryFn: () => T | Promise<T>, deps: unknown[]): T | undefined {
  const [data, setData] = useState<T>();

  useEffect(() => {
    const observable = liveQuery(queryFn);
    const sub = observable.subscribe((result) => setData(result));
    return () => sub.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
