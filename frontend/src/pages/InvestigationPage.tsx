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

const COMPONENT_LABELS: Record<string, string> = {
  anomaly: 'Anomaly score',
  peeling: 'Peeling chain',
  coinjoin: 'Coinjoin-like',
  cluster: 'Cluster association',
  network: 'Network correlation',
  propagated: 'Risk propagation',
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

        // Independent calls — fire together, each renders as it resolves
        // rather than blocking the whole page on the slowest one.
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
      <div className="mx-auto max-w-5xl px-10 py-10">
        <div className="rounded-sm border border-risk-high bg-risk-highSoft px-4 py-3 text-sm text-risk-high">
          {error}
        </div>
      </div>
    );
  }

  if (!alert) {
    return <div className="px-10 py-10 text-sm text-slate-400">Opening case file…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs text-slate-400">{alert.alert_id}</div>
          <h1 className="mt-1 font-mono text-lg font-semibold text-ink">{alert.entity_id}</h1>
        </div>
        <WorkflowStepper active={['Connect', 'Analyse', 'Detect', 'Explain']} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <RiskBadge level={alert.risk_level} score={alert.risk_score} />
        <div className="flex gap-1.5">
          {alert.pattern_types.map((p) => (
            <span key={p} className="rounded-sm bg-paper px-2 py-1 text-[11px] text-slate-500">
              {p.replace('_', ' ')}
            </span>
          ))}
        </div>
        <span className="text-sm text-slate-500">
          confidence <span className="font-mono text-ink">{Math.round(alert.confidence * 100)}%</span>
        </span>
      </div>

      <div className="mt-8 grid grid-cols-5 gap-8">
        {/* Graph */}
        <div className="col-span-3 rounded-sm border border-paper-line bg-white">
          <div className="border-b border-paper-line px-5 py-3 text-[12.5px] font-medium text-slate-500">
            Connected Entities
          </div>
          <div className="h-96">
            {graph ? (
              <GraphView data={graph} focusId={alert.entity_id} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Loading graph…
              </div>
            )}
          </div>
        </div>

        {/* Evidence panel */}
        <div className="col-span-2 space-y-6">
          {/* Risk component breakdown — only for wallet entities */}
          {walletRisk && (
            <div className="rounded-sm border border-paper-line bg-white p-5">
              <div className="text-[12.5px] font-medium text-slate-500">Risk Breakdown</div>
              <div className="mt-3 space-y-2">
                {Object.entries(walletRisk.components).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-36 flex-shrink-0 text-[11.5px] text-slate-600">
                      {COMPONENT_LABELS[key] ?? key}
                    </span>
                    <div className="h-1.5 flex-1 rounded-sm bg-paper">
                      <div className="h-1.5 rounded-sm bg-stamp" style={{ width: `${value * 100}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-slate-400">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence list */}
          <div className="rounded-sm border border-paper-line bg-white p-5">
            <div className="text-[12.5px] font-medium text-slate-500">Why this was flagged</div>
            {evidence ? (
              <div className="mt-3 space-y-4">
                {evidence.evidence.map((item, i) => (
                  <div key={i} className="border-l-2 border-stamp-soft pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-ink">
                        {item.evidence_type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[10.5px] text-slate-400">
                        weight {Math.round(item.weight * 100)}%
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Loading evidence…</p>
            )}
          </div>

          {/* Propagation path */}
          {propagation && propagation.propagation_path.hops.length > 0 && (
            <div className="rounded-sm border border-paper-line bg-white p-5">
              <div className="text-[12.5px] font-medium text-slate-500">Risk Propagation Path</div>
              <div className="mt-3 space-y-2">
                <div className="font-mono text-[11.5px] text-slate-500">
                  seed: {propagation.propagation_path.seed_wallet} (score{' '}
                  {propagation.propagation_path.seed_score})
                </div>
                {propagation.propagation_path.hops.map((h) => (
                  <div key={h.hop} className="flex items-center gap-3 font-mono text-[11.5px]">
                    <span className="text-slate-400">hop {h.hop}</span>
                    <span className="truncate text-ink">{h.wallet}</span>
                    <span className="ml-auto text-slate-400">{h.score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-sm border border-risk-mediumSoft bg-risk-mediumSoft px-4 py-3 text-[12px] leading-relaxed text-risk-medium">
            This entity shows patterns that warrant investigation — this is a prioritization
            signal, not confirmation of wrongdoing.
          </div>
        </div>
      </div>
    </div>
  );
}
