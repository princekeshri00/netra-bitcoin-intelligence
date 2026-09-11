import type { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const styles: Record<RiskLevel, {
  bg: string;
  border: string;
  text: string;
  glow: string;
  dot: string;
}> = {
  CRITICAL: {
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_16px_rgba(244,63,94,0.35)]',
    dot: 'bg-rose-400',
  },
  HIGH: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    glow: 'shadow-[0_0_14px_rgba(249,115,22,0.3)]',
    dot: 'bg-orange-400',
  },
  MEDIUM: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    dot: 'bg-amber-400',
  },
  LOW: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    dot: 'bg-emerald-400',
  },
};

export default function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const conf = styles[level] || styles.LOW;
  const isCritical = level === 'CRITICAL';

  return (
    <div className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 ${conf.bg} ${conf.border} ${conf.glow} backdrop-blur-sm transition-all duration-200`}>
      <span className="relative flex h-2 w-2">
        {isCritical && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${conf.dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${conf.dot}`} />
      </span>
      {score !== undefined && (
        <span className="font-mono text-xs font-bold text-white">
          {Math.round(score)}
        </span>
      )}
      <span className={`text-[11px] font-semibold tracking-wider uppercase ${conf.text}`}>
        {level}
      </span>
    </div>
  );
}
