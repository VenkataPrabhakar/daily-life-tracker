import { getRecoveryColor, recoveryColorClasses, recoveryRingColor } from '../../lib/recovery';

type Props = {
  score: number;
  label?: string;
};

export function RecoveryScoreWidget({ score, label = 'Recovery' }: Props) {
  const color = getRecoveryColor(score);
  const ring = recoveryRingColor(score);
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`widget-card animate-fade-in border ${recoveryColorClasses(color)}`}>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider opacity-80">{label}</p>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="opacity-20"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ring}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-[10px] uppercase opacity-70">/ 100</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">
            {color === 'green' && 'Optimal recovery'}
            {color === 'yellow' && 'Moderate recovery'}
            {color === 'red' && 'Needs attention'}
          </p>
          <ul className="space-y-1 text-xs opacity-80">
            <li>Sleep · 40%</li>
            <li>Mood · 30%</li>
            <li>Water · 20%</li>
            <li>Exercise · 10%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
