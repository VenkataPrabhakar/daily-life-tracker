import type { Insight } from '../../lib/insights';

type Props = {
  insights: Insight[];
};

const typeStyles = {
  positive: 'border-emerald-500/30 bg-emerald-500/10',
  neutral: 'border-slate-500/30 bg-slate-500/10',
  suggestion: 'border-amber-500/30 bg-amber-500/10',
};

export function InsightsPanel({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <section className="widget-card animate-fade-in">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <span>✨</span> AI Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-xl border p-3 text-sm transition hover:scale-[1.01] ${typeStyles[insight.type]}`}
          >
            <span className="mr-2">{insight.icon}</span>
            {insight.message}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        Insights generated locally from your stored data — private and offline.
      </p>
    </section>
  );
}
