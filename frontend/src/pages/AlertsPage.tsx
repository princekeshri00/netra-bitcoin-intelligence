import { useEffect, useState } from 'react';
import RiskBadge from '../components/RiskBadge';
import WorkflowStepper from '../components/WorkflowStepper';
import { fetchAlerts } from '../api/client';
import type { AlertSummary, PatternType, RiskLevel } from '../types';

const PATTERN_LABELS: Record<PatternType, string> = {
  peeling_chain: 'Peeling chain',
  coinjoin: 'Coinjoin-like',
  anomaly: 'Anomaly',
  fan_out: 'Fan-out',
  fan_in: 'Fan-in',
};

export default function AlertsPage({ onOpen }: { onOpen: (alertId: string) => void }) {
  const [alerts, setAlerts] = useState<AlertSummary[] | null>(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    let cancelled = false;
    setAlerts(null);
    fetchAlerts({
      risk_level: riskFilter === 'ALL' ? undefined : riskFilter,
      limit,
      offset,
    })
      .then((page) => {
        if (cancelled) return;
        setAlerts(page.results);
        setCount(page.count);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [riskFilter, offset]);

  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[26px] font-semibold text-ink">Alert Log</h1>
          <p className="mt-1 text-sm text-slate-500">
            {count} ranked lead{count !== 1 ? 's' : ''} — highest risk first.
          </p>
        </div>
        <WorkflowStepper active={['Search', 'Trace']} />
      </div>

      <div className="mt-6 flex gap-2">
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
          <button
            key={level}
            onClick={() => {
              setRiskFilter(level);
              setOffset(0);
            }}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium ${
              riskFilter === level ? 'bg-ink text-white' : 'bg-white text-slate-500 border border-paper-line'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-sm border border-risk-high bg-risk-highSoft px-4 py-3 text-sm text-risk-high">
          {error}
        </div>
      )}

      <div className="mt-6 border-t border-paper-line">
        {alerts?.map((alert) => (
          <button
            key={alert.alert_id}
            onClick={() => onOpen(alert.alert_id)}
            className="flex w-full items-center gap-6 border-b border-paper-line py-4 text-left hover:bg-white"
          >
            <RiskBadge level={alert.risk_level} score={alert.risk_score} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-[13px] text-ink">{alert.entity_id}</div>
              <div className="mt-0.5 flex gap-1.5">
                {alert.pattern_types.map((p) => (
                  <span key={p} className="rounded-sm bg-paper px-1.5 py-0.5 text-[10.5px] text-slate-500">
                    {PATTERN_LABELS[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
            <span className="flex-shrink-0 rounded-sm bg-paper px-2 py-1 text-[11px] uppercase text-slate-500">
              {alert.entity_type}
            </span>
            <span className="w-32 flex-shrink-0 text-right font-mono text-[11px] text-slate-400">
              {new Date(alert.created_at).toLocaleString()}
            </span>
          </button>
        ))}

        {alerts && alerts.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No alerts match this filter.</p>
        )}
        {!alerts && !error && <p className="py-10 text-center text-sm text-slate-400">Loading alert log…</p>}
      </div>

      {count > limit && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="text-stamp disabled:text-slate-300"
          >
            ← Previous
          </button>
          <span className="text-slate-400">
            {offset + 1}–{Math.min(offset + limit, count)} of {count}
          </span>
          <button
            disabled={offset + limit >= count}
            onClick={() => setOffset(offset + limit)}
            className="text-stamp disabled:text-slate-300"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
