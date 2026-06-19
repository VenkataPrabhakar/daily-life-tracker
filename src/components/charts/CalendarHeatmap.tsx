import { format, parseISO } from 'date-fns';

type HeatmapDay = { date: string; score: number; level: number };

type Props = {
  data: HeatmapDay[];
  title?: string;
};

const LEVEL_COLORS = [
  'bg-slate-100 dark:bg-slate-800/80',
  'bg-emerald-200 dark:bg-emerald-900/60',
  'bg-emerald-400 dark:bg-emerald-700/80',
  'bg-emerald-500 dark:bg-emerald-600',
  'bg-emerald-600 dark:bg-emerald-500',
];

export function CalendarHeatmap({ data, title = 'Activity Calendar' }: Props) {
  // Group into weeks (GitHub-style: columns = weeks, rows = weekdays)
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  const firstDate = parseISO(data[0]?.date ?? new Date().toISOString());
  const startPad = firstDate.getDay();

  for (let i = 0; i < startPad; i++) {
    currentWeek.push({ date: '', score: 0, level: 0 });
  }

  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) weeks.push(currentWeek);

  const months: { label: string; col: number }[] = [];
  let lastMonth = '';
  weeks.forEach((week, wi) => {
    const first = week.find((d) => d.date);
    if (first) {
      const month = format(parseISO(first.date), 'MMM');
      if (month !== lastMonth) {
        months.push({ label: month, col: wi });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="widget-card animate-fade-in overflow-x-auto">
      <h3 className="mb-4 text-sm font-semibold">🗓️ {title}</h3>
      <div className="min-w-[680px]">
        <div className="mb-1 flex gap-1 pl-8 text-[10px] text-slate-400">
          {months.map((m) => (
            <span key={`${m.label}-${m.col}`} style={{ marginLeft: m.col === 0 ? 0 : `${m.col * 14 - 8}px` }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pr-1 text-[10px] text-slate-400">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <span key={i} className="h-3 leading-3">{d}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    title={day.date ? `${day.date}: activity level ${day.level}` : ''}
                    className={`h-3 w-3 rounded-sm transition hover:ring-2 hover:ring-brand-400 ${
                      day.date ? LEVEL_COLORS[day.level] : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
