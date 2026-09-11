import type { RiskLevel } from '../types';

const ring: Record<RiskLevel, string> = {
  CRITICAL: 'border-risk-critical text-risk-critical',
  HIGH: 'border-risk-high text-risk-high',
  MEDIUM: 'border-risk-medium text-risk-medium',
  LOW: 'border-risk-low text-risk-low',
};

// A stamped ring, not a filled pill — reads as "case marking" rather than a
// generic status chip. CRITICAL gets a double ring so it's unmistakable at
// a glance even before the label registers.
export default function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const isCritical = level === 'CRITICAL';
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${
          isCritical ? `border-2 border-double ${ring[level]}` : `border-2 ${ring[level]}`
        }`}
      >
        {score !== undefined ? Math.round(score) : '—'}
      </span>
      <span className={`text-xs font-medium tracking-wide ${ring[level].split(' ')[1]}`}>{level}</span>
    </span>
  );
}
