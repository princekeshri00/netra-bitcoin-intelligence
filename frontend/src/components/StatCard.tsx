interface StatCardProps {
  label: string;
  value: number | string;
  flagged?: boolean;
  trend?: 'up' | 'down';
  tone?: 'warning' | 'success' | 'danger';
}

export default function StatCard({
  label,
  value,
  flagged = false,
  trend,
  tone,
}: StatCardProps) {
  let valueClass = 'text-ink';

  if (flagged || tone === 'danger') {
    valueClass = 'text-stamp';
  } else if (tone === 'warning') {
    valueClass = 'text-amber-600';
  } else if (tone === 'success') {
    valueClass = 'text-emerald-600';
  }

  return (
    <div className="border-l-2 border-paper-line pl-4 py-1">
      <div className="text-[12.5px] text-slate-500">
        {label}
      </div>

      <div className={`mt-1 flex items-center gap-2 font-mono text-[26px] font-semibold ${valueClass}`}>
        {value}

        {trend && (
          <span
            className={`text-sm ${
              trend === 'up'
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}
            aria-label={trend === 'up' ? 'Increasing' : 'Decreasing'}
          >
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}