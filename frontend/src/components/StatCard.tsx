import { TrendingUp, TrendingDown, ShieldAlert, Activity, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  flagged?: boolean;
  trend?: 'up' | 'down';
  tone?: 'warning' | 'success' | 'danger' | 'cyan' | 'purple';
  subtext?: string;
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  flagged = false,
  trend,
  tone,
  subtext,
  icon,
}: StatCardProps) {
  let accentColor = 'from-cyan-500/80 to-blue-600/80';
  let valueColor = 'text-white';
  let borderGlow = 'border-cyan-500/20 hover:border-cyan-500/40';
  let glowEffect = 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]';

  if (flagged || tone === 'danger') {
    accentColor = 'from-rose-500 to-red-600';
    valueColor = 'text-rose-400';
    borderGlow = 'border-rose-500/30 hover:border-rose-500/60';
    glowEffect = 'hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]';
  } else if (tone === 'warning') {
    accentColor = 'from-amber-400 to-orange-500';
    valueColor = 'text-amber-400';
    borderGlow = 'border-amber-500/30 hover:border-amber-500/60';
    glowEffect = 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]';
  } else if (tone === 'success') {
    accentColor = 'from-emerald-400 to-teal-500';
    valueColor = 'text-emerald-400';
    borderGlow = 'border-emerald-500/30 hover:border-emerald-500/60';
    glowEffect = 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]';
  } else if (tone === 'purple') {
    accentColor = 'from-purple-500 to-indigo-600';
    valueColor = 'text-purple-400';
    borderGlow = 'border-purple-500/30 hover:border-purple-500/60';
    glowEffect = 'hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]';
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/80 backdrop-blur-md p-5 border ${borderGlow} ${glowEffect} transition-all duration-300 group`}
    >
      {/* Top Accent Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
          {label}
        </span>
        {icon ? (
          <div className="rounded-lg bg-slate-800/80 p-2 text-slate-400 group-hover:text-white transition-colors">
            {icon}
          </div>
        ) : flagged ? (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className={`font-mono text-2xl lg:text-3xl font-bold tracking-tight ${valueColor}`}>
          {value}
        </div>

        {trend && (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
              trend === 'up'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend === 'up' ? 'HIGH' : 'LOW'}
          </div>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-[11px] text-slate-500 font-mono truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}