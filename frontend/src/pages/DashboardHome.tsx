import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import {
  fetchDataset,
  triggerAnalysis,
  fetchJobStatus,
  fetchAnalysisStats,
  getStoredJobId,
  fetchAlerts,
} from '../api/client';
import type { Dataset, AnalysisJob, AnalysisStats, AlertSummary } from '../types';
import {
  Activity,
  ShieldAlert,
  Zap,
  Globe,
  Wallet,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ArrowUpRight,
  Database,
} from 'lucide-react';

export default function DashboardHome({ onOpenAlert }: { onOpenAlert?: (alertId: string) => void }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const ds = await fetchDataset();
        if (cancelled) return;
        setDataset(ds);

        // Fetch recent alerts for the quick-triage table
        fetchAlerts({ limit: 8 })
          .then((res) => {
            if (!cancelled) setRecentAlerts(res.results);
          })
          .catch(() => {});

        const storedJobId = getStoredJobId() || 'analysis_demo_01';
        if (storedJobId) {
          const j = await fetchJobStatus(storedJobId);
          if (cancelled) return;
          setJob(j);
          if (j.status === 'done' || j.status === 'completed') {
            const s = await fetchAnalysisStats(storedJobId);
            if (!cancelled) setStats(s);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRunAnalysis() {
    setError(null);
    try {
      const newJob = await triggerAnalysis();
      setJob(newJob);
      pollJob(newJob.job_id);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function pollJob(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const j = await fetchJobStatus(jobId);
        setJob(j);
        if (j.status === 'done' || j.status === 'completed' || j.status === 'failed') {
          clearInterval(interval);
          if (j.status === 'done' || j.status === 'completed') {
            const s = await fetchAnalysisStats(jobId);
            setStats(s);
          }
        }
      } catch (e: any) {
        clearInterval(interval);
        setError(e.message);
      }
    }, 2000);
  }

  const filteredAlerts = recentAlerts.filter(
    (a) =>
      a.entity_id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.alert_id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#080C15] text-slate-100 px-8 py-8 space-y-8 cyber-grid-bg">
      {/* Ambient Top Glow */}
      <div className="ambient-glow" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Intelligence Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              SYSTEM ACTIVE
            </span>
          </div>
          <p className="mt-1 text-xs lg:text-sm text-slate-400 font-mono">
            NETRA Forensic Engine · AI-Driven Graph Anomalies & Sybil Pattern Detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 text-xs font-mono text-slate-300">
            Dataset: <span className="text-cyan-400 font-semibold">{dataset?.dataset_id ?? 'demo_01'}</span>
          </div>
          <button
            onClick={() => window.alert('Exporting forensic intelligence summary...')}
            className="flex items-center gap-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 shadow-sm transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" /> Export Dossier
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Ingestion Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Processed Transactions"
          value={dataset ? dataset.stats.transactions.toLocaleString() : '10,544'}
          tone="cyan"
          trend="up"
          subtext="Block Range 750,000 - 750,004"
          icon={<Zap className="h-5 w-5 text-cyan-400" />}
        />
        <StatCard
          label="Tracked Wallets"
          value={dataset ? dataset.stats.wallets.toLocaleString() : '4,390'}
          tone="purple"
          subtext="Unique UTXO Endpoints"
          icon={<Wallet className="h-5 w-5 text-purple-400" />}
        />
        <StatCard
          label="Peer Node Observations"
          value={dataset ? dataset.stats.unique_ips.toLocaleString() : '10,544'}
          tone="warning"
          subtext="45 Distinct Autonomous Systems"
          icon={<Globe className="h-5 w-5 text-amber-400" />}
        />
        <StatCard
          label="Critical Alert Leads"
          value={stats ? stats.stats.critical_alerts : '2'}
          flagged
          tone="danger"
          trend="up"
          subtext="Immediate Investigation Warrant"
          icon={<ShieldAlert className="h-5 w-5 text-rose-400" />}
        />
      </div>

      {/* ML Pipeline Stage Execution Controller */}
      <div className="relative z-10 rounded-xl bg-slate-900/70 border border-slate-800/90 p-6 backdrop-blur-xl shadow-card-cyber">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Detection & Intelligence Pipeline</h2>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                READY
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Stages: Graph Construction → Isolation Forest & Autoencoder → Pattern Heuristics → PageRank Contagion
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={job?.status === 'running'}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" />
            {job?.status === 'running' ? 'Running Stage Analytics…' : 'Trigger Full Analysis'}
          </button>
        </div>

        {/* Stage Badges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { name: '1. Graph Construction', desc: '4.3k nodes / 27k edges' },
            { name: '2. Unsupervised ML', desc: 'Isolation Forest & Z-Scores' },
            { name: '3. Pattern Heuristics', desc: 'Peeling Chains & Mixers' },
            { name: '4. Sybil Clustering', desc: 'Common-Input Heuristics' },
            { name: '5. Risk Contagion', desc: 'Bi-directional PageRank' },
          ].map((stage, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-3 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{stage.name}</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-slate-400">{stage.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detection Results KPI Cards */}
      {stats && (
        <div className="relative z-10 space-y-3">
          <div className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
            Forensic Findings Breakdown
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Alerts" value={stats.stats.alerts_generated} tone="danger" flagged />
            <StatCard label="Critical Leads" value={stats.stats.critical_alerts} tone="danger" flagged />
            <StatCard label="Peeling Chains" value={stats.stats.peeling_chains_detected} tone="warning" />
            <StatCard label="Coinjoins / Mixers" value={stats.stats.coinjoin_like_detected} tone="purple" />
            <StatCard label="Sybil Clusters" value={stats.stats.entity_clusters} tone="cyan" />
            <StatCard label="ML Anomalies" value={stats.stats.anomalies_detected} tone="success" />
          </div>
        </div>
      )}

      {/* Quick Triage Feed Table */}
      <div className="relative z-10 rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-card-cyber backdrop-blur-xl">
        <div className="border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h2 className="text-sm font-bold text-white">Priority Leads for Investigation</h2>
            <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/20">
              Ranked by Risk Score
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by address or alert ID..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[10.5px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">Entity Address</th>
                <th className="py-3 px-6">Risk Assessment</th>
                <th className="py-3 px-6">Identified Patterns</th>
                <th className="py-3 px-6">Confidence</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((a) => (
                  <tr
                    key={a.alert_id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => onOpenAlert && onOpenAlert(a.alert_id)}
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                        {a.entity_id}
                      </div>
                      <div className="text-[10px] text-slate-500">{a.alert_id}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <RiskBadge level={a.risk_level} score={a.risk_score} />
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {a.pattern_types.map((p) => (
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
                            {p.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${Math.round(a.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-bold">{Math.round(a.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAlert) onOpenAlert(a.alert_id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 group-hover:border-cyan-400 transition-all"
                      >
                        Investigate <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    No matching alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
