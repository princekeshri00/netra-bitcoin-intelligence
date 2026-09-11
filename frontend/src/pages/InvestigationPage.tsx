import { useEffect, useState } from 'react';
import GraphView from '../components/GraphView';
import RiskBadge from '../components/RiskBadge';
import WorkflowStepper from '../components/WorkflowStepper';
import {
  fetchAlertDetail,
  fetchAlertEvidence,
  fetchAlertGraph,
  fetchAlertPropagation,
  fetchWalletRisk,
} from '../api/client';
import type { AlertSummary, AlertEvidence, AlertPropagation, GraphData, WalletRisk } from '../types';
import {
  FileSearch,
  GitBranch,
  ShieldAlert,
  Share2,
  Activity,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Download,
} from 'lucide-react';

const COMPONENT_LABELS: Record<string, { label: string; gradient: string; text: string }> = {
  anomaly: {
    label: 'Isolation Forest Anomaly',
    gradient: 'from-cyan-500 to-blue-600',
    text: 'text-cyan-400',
  },
  peeling: {
    label: 'Peeling Chain Detection',
    gradient: 'from-orange-500 to-amber-500',
    text: 'text-orange-400',
  },
  coinjoin: {
    label: 'Coinjoin / Mixer Structure',
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-purple-400',
  },
  cluster: {
    label: 'Sybil Cluster Co-spending',
    gradient: 'from-indigo-500 to-cyan-500',
    text: 'text-indigo-400',
  },
  network: {
    label: 'P2P Network IP Correlation',
    gradient: 'from-teal-400 to-emerald-500',
    text: 'text-teal-400',
  },
  propagated: {
    label: 'Risk Contagion Spillover',
    gradient: 'from-rose-500 to-red-600',
    text: 'text-rose-400',
  },
};

export default function InvestigationPage({ alertId }: { alertId: string }) {
  const [alert, setAlert] = useState<AlertSummary | null>(null);
  const [evidence, setEvidence] = useState<AlertEvidence | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [propagation, setPropagation] = useState<AlertPropagation | null>(null);
  const [walletRisk, setWalletRisk] = useState<WalletRisk | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAlert(null);
    setEvidence(null);
    setGraph(null);
    setPropagation(null);
    setWalletRisk(null);
    setError(null);

    async function load() {
      try {
        const alertDetail = await fetchAlertDetail(alertId);
        if (cancelled) return;
        setAlert(alertDetail);

        fetchAlertEvidence(alertId).then((e) => !cancelled && setEvidence(e)).catch(() => {});
        fetchAlertGraph(alertId).then((g) => !cancelled && setGraph(g)).catch(() => {});
        fetchAlertPropagation(alertId).then((p) => !cancelled && setPropagation(p)).catch(() => {});
        if (alertDetail.entity_type === 'wallet') {
          fetchWalletRisk(alertDetail.entity_id)
            .then((w) => !cancelled && setWalletRisk(w))
            .catch(() => {});
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [alertId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#080C15] text-slate-100 p-8">
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-300">
          {error}
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-[#080C15] flex items-center justify-center text-slate-400 font-mono space-y-3">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-xs">Decrypting forensic casefile {alertId}…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080C15] text-slate-100 px-8 py-8 space-y-8 cyber-grid-bg">
      {/* Ambient Top Glow */}
      <div className="ambient-glow" />

      {/* Casefile Dossier Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-cyan-400 font-bold border border-cyan-500/30">
              CASE FILE
            </span>
            <span>{alert.alert_id}</span>
          </div>
          <h1 className="mt-2 font-mono text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="text-cyan-300 select-all">{alert.entity_id}</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono font-medium uppercase text-slate-300">
              {alert.entity_type}
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RiskBadge level={alert.risk_level} score={alert.risk_score} />
            <div className="flex flex-wrap gap-1.5">
              {alert.pattern_types.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-slate-800/90 border border-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-300"
                >
                  {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            <div className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs font-mono text-slate-400">
              ML Confidence: <span className="text-cyan-400 font-bold">{Math.round(alert.confidence * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WorkflowStepper active={['Connect', 'Analyse', 'Detect', 'Explain']} />
          <button
            onClick={() => window.alert('Exporting forensic case file...')}
            className="flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" /> Export File
          </button>
        </div>
      </div>

      {/* Main Forensic Workspace Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Center Column: Cytoscape Graph Explorer */}
        <div className="lg:col-span-7 flex flex-col rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-card-cyber backdrop-blur-xl">
          <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Interactive Graph Topology</h2>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {graph ? `${graph.nodes.length} nodes · ${graph.edges.length} edges` : 'Computing topology…'}
            </div>
          </div>

          <div className="relative h-[480px] bg-slate-950/90">
            {graph ? (
              <GraphView data={graph} focusId={alert.entity_id} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 font-mono space-y-2">
                <div className="text-center">
                  <div className="h-6 w-6 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-2" />
                  Building NetworkX Subgraph…
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11.5px] font-mono text-slate-400 flex items-center justify-between">
            <span>Scroll to zoom · Drag nodes to inspect flow · Blue = Normal · Red = Flagged Entity</span>
          </div>
        </div>

        {/* Right Column: Risk Weights & Explainable Evidence */}
        <div className="lg:col-span-5 space-y-6">
          {/* Risk Breakdown Progress Radar */}
          {walletRisk && (
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-card-cyber backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Risk Component Decomposition</h3>
                </div>
                <span className="font-mono text-xs text-slate-400">Total: {Math.round(walletRisk.risk_score)}/100</span>
              </div>

              <div className="space-y-3">
                {Object.entries(walletRisk.components).map(([key, value]) => {
                  const meta = COMPONENT_LABELS[key] || {
                    label: key,
                    gradient: 'from-cyan-500 to-blue-600',
                    text: 'text-cyan-400',
                  };
                  const pct = Math.round(value * 100);

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 font-medium">{meta.label}</span>
                        <span className={`font-bold ${meta.text}`}>{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explainable Evidence Vectors */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-card-cyber backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Explainable Evidence Vectors</h3>
            </div>

            {evidence && evidence.evidence.length > 0 ? (
              <div className="space-y-3.5">
                {evidence.evidence.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-3.5 hover:border-cyan-500/30 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-cyan-300 uppercase">
                        {item.evidence_type.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                        Weight {Math.round(item.weight * 100)}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 font-sans">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 font-mono">
                Computing multi-vector explainability…
              </div>
            )}
          </div>

          {/* Risk Propagation Path */}
          {propagation && propagation.propagation_path.hops.length > 0 && (
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-card-cyber backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Share2 className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Risk Contagion Propagation Path</h3>
              </div>

              <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-3 font-mono text-xs space-y-1">
                <div className="text-[10.5px] text-slate-500 uppercase">Infection Seed Source</div>
                <div className="text-rose-400 font-bold truncate">
                  {propagation.propagation_path.seed_wallet || 'Original High-Risk Origin'}
                </div>
              </div>

              <div className="space-y-2">
                {propagation.propagation_path.hops.slice(0, 4).map((h, idx) => {
                  const hopNum = h.hop ?? (h as any).hop_distance ?? (idx + 1);
                  const walletAddr = h.wallet ?? (h as any).target_wallet ?? 'Unknown Wallet';
                  const scoreVal = typeof h.score === 'number'
                    ? h.score
                    : typeof (h as any).propagated_score === 'number'
                    ? ((h as any).propagated_score * 100)
                    : 0;

                  return (
                    <div
                      key={`${hopNum}-${walletAddr}-${idx}`}
                      className="flex items-center gap-3 rounded-lg bg-slate-950/40 border border-slate-800/80 px-3 py-2 font-mono text-xs"
                    >
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                        HOP {hopNum}
                      </span>
                      <span className="truncate flex-1 text-slate-300" title={walletAddr}>
                        {walletAddr}
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {scoreVal.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legal / Investigation Disclaimer Notice */}
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-300 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Forensic Guidance:</strong> Entity matches high-degree peeling and clustering heuristics. Findings provide probabilistic lead scoring for intelligence workflows.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
