import { useEffect, useState } from 'react';
import type { AlertEvidenceResponse, AlertItem, AlertPropagationResponse } from '../types';
import { fetchAlertEvidence, fetchAlertPropagation, fetchAlerts } from '../api/client';
import RiskBadge from './RiskBadge';
import { ShieldAlert, Cpu, Download, ArrowRight, Layers, Share2, GitCommit } from 'lucide-react';

export default function AlertsView({
  selectedAlertId,
  onSelectAlert,
}: {
  selectedAlertId: string;
  onSelectAlert: (alertId: string) => void;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [evidenceRes, setEvidenceRes] = useState<AlertEvidenceResponse | null>(null);
  const [propagationRes, setPropagationRes] = useState<AlertPropagationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts().then((res) => {
      setAlerts(res.results);
    });
  }, []);

  useEffect(() => {
    if (!selectedAlertId) return;
    setLoading(true);
    Promise.all([fetchAlertEvidence(selectedAlertId), fetchAlertPropagation(selectedAlertId)]).then(
      ([evData, propData]) => {
        setEvidenceRes(evData);
        setPropagationRes(propData);
        setLoading(false);
      }
    );
  }, [selectedAlertId]);

  if (loading || !evidenceRes) {
    return <div className="p-8 font-mono text-slate-400">Loading Case Evidence & Propagation Graph...</div>;
  }

  const currentAlert = alerts.find((a) => a.alert_id === selectedAlertId) || alerts[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Alerts List (3 cols) */}
      <div className="lg:col-span-3 space-y-3">
        <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Ranked Alerts Queue ({alerts.length})</span>
          <span className="font-mono text-[10px] text-cyan-400">risk_score DESC</span>
        </h2>
        <div className="space-y-2">
          {alerts.map((a) => (
            <button
              key={a.alert_id}
              onClick={() => onSelectAlert(a.alert_id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                a.alert_id === selectedAlertId
                  ? 'bg-slate-900 text-white border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">{a.alert_id.substring(0, 8)}...</span>
                <RiskBadge level={a.risk_level} />
              </div>
              <div className="mt-2 text-xs font-mono text-slate-200 truncate">{a.entity_id}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {a.pattern_types.map((pt) => (
                  <span key={pt} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-semibold">
                    {pt}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Evidence & Propagation Workbench (9 cols) */}
      <div className="lg:col-span-9 space-y-6">
        {/* Header Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyan-400">ID: {currentAlert.alert_id}</span>
                <RiskBadge level={currentAlert.risk_level} />
                <span className="font-mono text-xs text-slate-500">
                  Created: {new Date(currentAlert.created_at).toLocaleString()}
                </span>
              </div>
              <h2 className="mt-1 font-serif text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                Target Entity: <span className="font-mono text-cyan-300">{currentAlert.entity_id}</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <div className="text-2xl font-black text-rose-400">{currentAlert.risk_score} / 100</div>
                <div className="text-[10px] uppercase text-slate-500">Risk Score</div>
              </div>
              <button
                onClick={() => window.alert(`Exported Evidence JSON for alert ${currentAlert.alert_id}`)}
                className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 p-2.5 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Export Evidence
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span className="text-slate-500">Pattern Types:</span>
            {currentAlert.pattern_types.map((p) => (
              <span key={p} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Explainability Evidence Items */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
          <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="h-4 w-4 text-cyan-400" />
            GET /api/v1/alerts/{'{alert_id}'}/evidence/ · Explainable Evidence Vectors
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {evidenceRes.evidence.map((ev, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider">{ev.evidence_type}</span>
                  <span className="text-slate-400 text-[10px]">Weight: {(ev.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="text-slate-200">{ev.description}</div>

                {ev.data.top_features && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {ev.data.top_features.map((tf) => (
                      <span key={tf.feature} className="bg-slate-900 px-2.5 py-1 rounded text-[11px] border border-slate-800 text-slate-300">
                        {tf.feature}: <span className="font-bold text-rose-400">z={tf.z_score}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Risk Contagion Propagation Path */}
        {propagationRes && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <GitCommit className="h-4 w-4 text-cyan-400" />
              GET /api/v1/alerts/{'{alert_id}'}/propagation/ · Risk Contagion Propagation Path
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Seed Wallet Origin: <span className="font-bold text-rose-400">{propagationRes.propagation_path.seed_wallet}</span></span>
                <span className="text-emerald-400 font-bold">Seed Score: {propagationRes.propagation_path.seed_score * 100}%</span>
              </div>

              <div className="space-y-2 pt-2">
                {propagationRes.propagation_path.hops.map((h, idx) => {
                  const hopNum = h.hop ?? (h as any).hop_distance ?? (idx + 1);
                  const walletAddr = h.wallet ?? (h as any).target_wallet ?? 'Unknown';
                  const scoreVal = typeof h.score === 'number'
                    ? (h.score > 1.0 ? h.score : h.score * 100)
                    : typeof (h as any).propagated_score === 'number'
                    ? ((h as any).propagated_score * 100)
                    : 0;
                  const txId = h.txid || (h as any).path_txids_json || 'N/A';

                  return (
                    <div key={`${hopNum}-${walletAddr}-${idx}`} className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="h-6 w-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold flex items-center justify-center text-[10px]">
                        H{hopNum}
                      </span>
                      <div className="flex-1 truncate">
                        <div className="text-white font-bold truncate">{walletAddr}</div>
                        <div className="text-[10px] text-slate-500">via tx: {txId}</div>
                      </div>
                      <div className="font-bold text-rose-400 font-mono">
                        {scoreVal.toFixed(0)}% Score
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
