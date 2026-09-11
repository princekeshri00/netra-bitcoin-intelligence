import { useEffect, useState } from 'react';
import type { PaginatedResponse, WalletListItem, WalletRiskBreakdown } from '../types';
import { fetchWalletRisk, fetchWallets } from '../api/client';
import RiskBadge from './RiskBadge';
import { Wallet, Search, ShieldAlert, Cpu, Layers, ArrowUpRight, Copy, Check, Activity, BarChart2, Shield } from 'lucide-react';

export default function WalletRiskView() {
  const [wallets, setWallets] = useState<PaginatedResponse<WalletListItem> | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<WalletRiskBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    fetchWallets({ q: searchQuery, risk_level: riskFilter }).then((res) => {
      setWallets(res);
      setLoading(false);
      if (res.results.length > 0) {
        fetchWalletRisk(res.results[0].address).then((r) => setSelectedRisk(r));
      }
    });
  }, [searchQuery, riskFilter]);

  const handleSelectWallet = async (addr: string) => {
    const risk = await fetchWalletRisk(addr);
    setSelectedRisk(risk);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(text);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const getComponentMeta = (name: string) => {
    switch (name.toLowerCase()) {
      case 'structural':
        return { color: 'text-cyan-400', bar: 'from-cyan-500 to-blue-500', glow: 'rgba(6, 182, 212, 0.4)' };
      case 'temporal':
        return { color: 'text-amber-400', bar: 'from-amber-500 to-orange-500', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'velocity':
        return { color: 'text-orange-400', bar: 'from-orange-500 to-red-500', glow: 'rgba(249, 115, 22, 0.4)' };
      case 'obfuscation':
        return { color: 'text-rose-400', bar: 'from-rose-500 to-pink-500', glow: 'rgba(244, 63, 94, 0.4)' };
      case 'peer_risk':
      case 'peer':
        return { color: 'text-violet-400', bar: 'from-violet-500 to-indigo-500', glow: 'rgba(139, 92, 246, 0.4)' };
      default:
        return { color: 'text-emerald-400', bar: 'from-emerald-500 to-teal-500', glow: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  if (loading && !wallets) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="font-mono text-sm text-cyan-400/80">Loading Wallet Risk Intelligence Index...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Activity className="h-3 w-3 animate-pulse" /> Entity Intelligence
            </span>
            <span className="text-xs font-mono text-slate-400">/api/v1/wallets/</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Wallet className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            Wallet Entities & Multi-Vector Risk Breakdown
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Deconstructed behavioral vectors, multi-component risk scoring, and entity metrics
          </p>
        </div>

        {/* Search & Risk Filter */}
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400/60" />
            <input
              type="text"
              placeholder="Filter address hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/90 border border-cyan-500/20 text-xs font-mono rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 w-52 transition-all shadow-inner"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900/90 border border-cyan-500/20 text-xs font-mono rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all cursor-pointer"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">CRITICAL Tier</option>
            <option value="HIGH">HIGH Tier</option>
            <option value="MEDIUM">MEDIUM Tier</option>
            <option value="LOW">LOW Tier</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wallet List (5 cols) */}
        <div className="lg:col-span-5 cyber-panel-elevated overflow-hidden flex flex-col">
          <div className="bg-slate-950/80 px-5 py-3.5 border-b border-cyan-500/15 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Discovered Entities ({wallets?.count || 0})
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/70 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
              Sort: Risk Score DESC
            </span>
          </div>

          <div className="divide-y divide-slate-800/40 font-mono text-xs max-h-[580px] overflow-y-auto">
            {wallets?.results.map((w) => {
              const isSelected = selectedRisk?.address === w.address;
              return (
                <button
                  key={w.address}
                  onClick={() => handleSelectWallet(w.address)}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-cyan-950/40 border-l-4 border-cyan-400 text-white shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'
                      : 'hover:bg-slate-800/30 text-slate-300'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold font-mono truncate text-xs ${isSelected ? 'text-cyan-300 glow-text-cyan' : 'text-slate-200 group-hover:text-cyan-400'}`}>
                        {w.address}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                        {w.tx_count} TXs
                      </span>
                      <span className="text-emerald-400 font-medium">↓ {w.total_received} BTC</span>
                      <span className="text-rose-400 font-medium">↑ {w.total_sent} BTC</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-xs text-rose-400 font-mono block">
                        {w.risk_score}
                        <span className="text-[10px] text-slate-500">/100</span>
                      </span>
                      <RiskBadge level={w.risk_level} />
                    </div>
                    <ArrowUpRight className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Wallet Component Risk Breakdown (7 cols) */}
        <div className="lg:col-span-7 cyber-panel-elevated p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-cyan-500/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider uppercase block">
                  Vector Decomposition Engine
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-lg font-bold text-white font-mono break-all">
                    {selectedRisk ? selectedRisk.address : 'No wallet selected'}
                  </h2>
                  {selectedRisk && (
                    <button
                      onClick={() => copyToClipboard(selectedRisk.address)}
                      className="text-slate-400 hover:text-cyan-400 p-1 transition-colors"
                      title="Copy Address"
                    >
                      {copiedAddr === selectedRisk.address ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {selectedRisk && <RiskBadge level={selectedRisk.risk_level} />}
            </div>

            {selectedRisk ? (
              <div className="space-y-6 mt-6">
                {/* Score & Confidence Hero Cards */}
                <div className="grid grid-cols-2 gap-4 font-mono">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                      Composite Risk Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-rose-400 glow-text-rose">
                        {selectedRisk.risk_score}
                      </span>
                      <span className="text-slate-500 text-sm font-bold">/ 100</span>
                    </div>
                    <div className="mt-2 text-[10px] text-rose-400/80 flex items-center gap-1 font-sans">
                      <ShieldAlert className="h-3 w-3" /> Tier: {selectedRisk.risk_level}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                      Model Confidence
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-emerald-400 glow-text-emerald">
                        {(selectedRisk.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-emerald-400/80 flex items-center gap-1 font-sans">
                      <BarChart2 className="h-3 w-3" /> Statistical Significance: High
                    </div>
                  </div>
                </div>

                {/* Component Progress Bars */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                      Individual Risk Vectors & Applied Weights
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Heuristic Engine v2.4</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {Object.entries(selectedRisk.components).map(([key, val]) => {
                      const weight = selectedRisk.weights[key as keyof typeof selectedRisk.weights] ?? 0.2;
                      const meta = getComponentMeta(key);
                      const percent = Math.min(100, Math.round(val * 100));

                      return (
                        <div
                          key={key}
                          className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-cyan-500/30 transition-all space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
                              <span className="font-bold text-white capitalize text-sm">{key} Vector</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                Weight: {(weight * 100).toFixed(0)}%
                              </span>
                              <span className={`font-bold ${meta.color}`}>
                                {percent}% Risk
                              </span>
                            </div>
                          </div>

                          <div className="h-2.5 w-full bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                            <div
                              className={`h-full bg-gradient-to-r ${meta.bar} rounded-full transition-all duration-500`}
                              style={{
                                width: `${percent}%`,
                                boxShadow: `0 0 10px ${meta.glow}`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                Select a wallet entity from the index to inspect its decomposed risk profile.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Entity Status: <span className="text-emerald-400 font-semibold">Indexed in Active Graph</span></span>
            <span>Algorithm: <span className="text-cyan-400 font-semibold">RandomForest + Multi-hop Contagion</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
