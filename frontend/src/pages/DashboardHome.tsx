import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import {
  fetchDataset,
  triggerAnalysis,
  fetchJobStatus,
  fetchAnalysisStats,
  getStoredJobId,
} from '../api/client';
import type { Dataset, AnalysisJob, AnalysisStats } from '../types';

export default function DashboardHome() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const ds = await fetchDataset();
        if (cancelled) return;
        setDataset(ds);

        const storedJobId = getStoredJobId();
        if (storedJobId) {
          const j = await fetchJobStatus(storedJobId);
          if (cancelled) return;
          setJob(j);
          if (j.status === 'done') {
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
        if (j.status === 'done' || j.status === 'failed') {
          clearInterval(interval);
          if (j.status === 'done') {
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

  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      <h1 className="font-serif text-[26px] font-semibold text-ink">Case Overview</h1>
      <p className="mt-1 text-sm text-slate-500">
        Dataset <span className="font-mono">{dataset?.dataset_id ?? '—'}</span> · Status{' '}
        <span className="font-mono">{dataset?.status ?? '—'}</span>
      </p>

      {error && (
        <div className="mt-6 rounded-sm border border-risk-high bg-risk-highSoft px-4 py-3 text-sm text-risk-high">
          {error}
        </div>
      )}

      {/* Ingestion-level stats — always available once dataset exists */}
      {dataset && (
        <div className="mt-8 grid grid-cols-4 gap-8">
          <StatCard label="Transactions" value={dataset.stats.transactions.toLocaleString()} />
          <StatCard label="Wallets" value={dataset.stats.wallets.toLocaleString()} />
          <StatCard label="Unique IPs" value={dataset.stats.unique_ips.toLocaleString()} />
          <StatCard label="Countries" value={dataset.stats.unique_countries} />
        </div>
      )}

      {/* Analysis pipeline status */}
      <div className="mt-10 rounded-sm border border-paper-line bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12.5px] font-medium text-slate-500">Detection Pipeline</div>
            {job ? (
              <div className="mt-1 text-sm text-ink">
                Status: <span className="font-mono">{job.status}</span>
                {job.current_stage && (
                  <span className="ml-2 text-slate-500">— currently: {job.current_stage}</span>
                )}
              </div>
            ) : (
              <div className="mt-1 text-sm text-slate-400">No analysis run yet for this dataset.</div>
            )}
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={job?.status === 'running'}
            className="rounded-sm bg-stamp px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {job?.status === 'running' ? 'Running…' : 'Run Analysis'}
          </button>
        </div>

        {job && job.stages_completed && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.stages_completed.map((s) => (
              <span key={s} className="rounded-sm bg-risk-lowSoft px-2 py-1 text-[11px] text-risk-low">
                {s} ✓
              </span>
            ))}
            {job.stages_remaining?.map((s) => (
              <span key={s} className="rounded-sm bg-paper px-2 py-1 text-[11px] text-slate-400">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Detection results — only once the job is done */}
      {stats && (
        <div className="mt-10 grid grid-cols-3 gap-8">
          <StatCard label="Alerts Generated" value={stats.stats.alerts_generated} flagged />
          <StatCard label="Critical Alerts" value={stats.stats.critical_alerts} flagged />
          <StatCard label="Peeling Chains Found" value={stats.stats.peeling_chains_detected} flagged />
          <StatCard label="Coinjoin-like Patterns" value={stats.stats.coinjoin_like_detected} />
          <StatCard label="Entity Clusters" value={stats.stats.entity_clusters} />
          <StatCard label="Anomalies Detected" value={stats.stats.anomalies_detected} />
        </div>
      )}
    </div>
  );
}
