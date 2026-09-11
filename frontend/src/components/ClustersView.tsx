import { useEffect, useState } from 'react';
import type { ClusterInfo } from '../types';
import { fetchClusters } from '../api/client';
import { Layers, ShieldAlert, Cpu, ExternalLink, ArrowUpRight, Activity, Globe, Network } from 'lucide-react';

export default function ClustersView({ onInvestigate }: { onInvestigate?: (entity: string) => void }) {
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters().then((cData) => {
      setClusters(cData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="font-mono text-sm text-cyan-400/80">Extracting Entity Resolution & Heuristic Clusters...</p>
        </div>
      </div>
    );
  }

  const getClusterCardTheme = (score: number) => {
    if (score >= 80) {
      return {
        border: 'border-rose-500/30 hover:border-rose-500/60',
        glow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
        badge: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
        accentText: 'text-rose-400',
        btnHover: 'hover:bg-rose-500 hover:text-black hover:border-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      };
    } else if (score >= 60) {
      return {
        border: 'border-orange-500/30 hover:border-orange-500/60',
        glow: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]',
        badge: 'bg-orange-950/80 text-orange-400 border-orange-500/40',
        accentText: 'text-orange-400',
        btnHover: 'hover:bg-orange-500 hover:text-black hover:border-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      };
    } else {
      return {
        border: 'border-amber-500/30 hover:border-amber-500/60',
        glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
        badge: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
        accentText: 'text-amber-400',
        btnHover: 'hover:bg-amber-500 hover:text-black hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Network className="h-3 w-3 animate-pulse" /> Heuristic Grouping
            </span>
            <span className="text-xs font-mono text-slate-400">/api/v1/clusters/</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Layers className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            Entity Resolution & Risk Clusters
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Multi-input co-spending heuristics, CoinJoin mixer identification, and entity clustering
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 font-mono text-xs text-cyan-400 bg-slate-900/90 border border-cyan-500/20 px-3.5 py-2 rounded-lg shadow-inner">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span className="font-bold">{clusters.length} Clusters Discovered</span>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((c) => {
          const theme = getClusterCardTheme(c.riskScore);
          return (
            <div
              key={c.clusterId}
              className={`cyber-panel-elevated p-5 flex flex-col justify-between transition-all duration-300 ${theme.border} ${theme.glow} group relative overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                    {c.clusterId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${theme.badge}`}>
                    Risk {c.riskScore}/100
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {c.name}
                </h2>
                <div className={`mt-1.5 text-xs font-mono flex items-center gap-1.5 ${theme.accentText}`}>
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">{c.primaryRiskType}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Wallets Clustered</span>
                    <span className="font-bold text-cyan-300 text-sm mt-0.5 block">{c.walletCount} Addrs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Aggregated Volume</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{c.totalVolumeBtc} BTC</span>
                  </div>
                </div>

                {/* Associated IPs */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-cyan-400/80" /> Correlated Relay IPs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.associatedIps.map((ip) => (
                      <span
                        key={ip}
                        className="font-mono text-[11px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {ip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onInvestigate && onInvestigate(c.topAddresses[0])}
                className={`mt-5 w-full bg-slate-800/80 text-slate-200 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700/80 cursor-pointer ${theme.btnHover}`}
              >
                Inspect Cluster Graph <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
