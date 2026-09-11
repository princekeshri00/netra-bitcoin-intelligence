import { useEffect, useState } from 'react';
import RiskBadge from '../components/RiskBadge';
import WorkflowStepper from '../components/WorkflowStepper';
import { fetchAlerts } from '../api/client';
import type { AlertSummary, PatternType, RiskLevel } from '../types';
import { ShieldAlert, Search, Filter, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const PATTERN_LABELS: Record<PatternType, string> = {
  peeling_chain: 'Peeling Chain',
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filtered = alerts?.filter(
    (a) =>
      a.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.alert_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.pattern_types.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen bg-[#080C15] text-slate-100 px-8 py-8 space-y-6 cyber-grid-bg">
      {/* Ambient Glow */}
      <div className="ambient-glow" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-rose-400" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
              Ranked Alert Log
            </h1>
            <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-rose-400 border border-rose-500/30">
              {count} Active Leads
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Sorted by Risk Severity Descending · Multi-heuristic Anomaly Vector Scoring
          </p>
        </div>

        <WorkflowStepper active={['Search', 'Trace']} />
      </div>

      {/* Filter and Search Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Risk Level Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
            const active = riskFilter === level;
            let activeClass = 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan';
            if (level === 'CRITICAL') activeClass = 'bg-rose-500 text-white font-bold shadow-glow-rose';
            if (level === 'HIGH') activeClass = 'bg-orange-500 text-white font-bold shadow-glow-orange';
            if (level === 'MEDIUM') activeClass = 'bg-amber-500 text-slate-950 font-bold shadow-glow-amber';
            if (level === 'LOW') activeClass = 'bg-emerald-500 text-slate-950 font-bold shadow-glow-emerald';

            return (
              <button
                key={level}
                onClick={() => {
                  setRiskFilter(level);
                  setOffset(0);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-mono transition-all duration-200 border ${
                  active
                    ? `${activeClass} border-transparent`
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search address, pattern, or alert ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg bg-slate-900/90 border border-slate-800 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-full sm:w-72 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Leads List */}
      <div className="relative z-10 rounded-xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden shadow-card-cyber backdrop-blur-xl">
        {filtered && filtered.length > 0 ? (
          filtered.map((alert) => (
            <div
              key={alert.alert_id}
              onClick={() => onOpen(alert.alert_id)}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-slate-800/40 transition-all cursor-pointer group gap-4"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <RiskBadge level={alert.risk_level} score={alert.risk_score} />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors truncate">
                      {alert.entity_id}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                      {alert.entity_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{alert.alert_id}</span>
                    <span className="text-slate-600">·</span>
                    {alert.pattern_types.map((p) => (
                      <span
                        key={p}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                          p.includes('peeling')
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : p.includes('coinjoin')
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {PATTERN_LABELS[p] ?? p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-300 font-semibold">
                    Confidence: <span className="text-cyan-400">{Math.round(alert.confidence * 100)}%</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {new Date(alert.created_at).toLocaleDateString()} · {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all">
                  Case File <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : alerts === null ? (
          <div className="p-12 text-center text-slate-400 font-mono space-y-3">
            <div className="h-6 w-6 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-xs">Loading ranked leads from intelligence engine...</p>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 font-sans">
            No alerts match the active filter criteria.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-mono text-slate-400">
        <div>
          Showing <span className="text-white font-bold">{alerts?.length ? offset + 1 : 0}</span> –{' '}
          <span className="text-white font-bold">{Math.min(offset + limit, count)}</span> of{' '}
          <span className="text-cyan-400 font-bold">{count}</span> leads
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= count}
            className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
