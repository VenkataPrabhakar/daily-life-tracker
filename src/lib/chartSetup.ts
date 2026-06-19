import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function getChartColors(isDark: boolean) {
  return {
    text: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.15)',
    brand: '#0ea5e9',
    emerald: '#10b981',
    amber: '#f59e0b',
    violet: '#8b5cf6',
    rose: '#f43f5e',
    orange: '#f97316',
  };
}

export function baseChartOptions(isDark: boolean) {
  const colors = getChartColors(isDark);
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#fff',
        titleColor: isDark ? '#f1f5f9' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: colors.text, font: { size: 11 } },
        grid: { color: colors.grid },
        border: { display: false },
      },
      y: {
        ticks: { color: colors.text, font: { size: 11 } },
        grid: { color: colors.grid },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };
}
