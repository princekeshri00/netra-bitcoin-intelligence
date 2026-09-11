import { useEffect, useState } from 'react';
import type { StreamTransaction } from '../types';
import { fetchStreamSample } from '../api/client';
import { Radio, Play, Pause, RefreshCw, AlertTriangle, ShieldCheck, Zap, Activity, Globe, Wifi } from 'lucide-react';

export default function StreamView() {
  const [stream, setStream] = useState<StreamTransaction[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    fetchStreamSample().then((data) => setStream(data));
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const isAnomaly = Math.random() > 0.6;
      const newTx: StreamTransaction = {
        txid: `tx_live_${Math.random().toString(36).substring(2, 9)}`,
        sender: `1${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
        receiver: `3${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
        amount: +(Math.random() * (isAnomaly ? 25 : 2)).toFixed(3),
        timestamp: new Date().toISOString(),
        ip: isAnomaly ? `185.220.101.${Math.floor(Math.random() * 200)}` : `103.${Math.floor(Math.random() * 200)}.12.${Math.floor(Math.random() * 200)}`,
        country: isAnomaly ? 'TOR Exit (DE)' : 'India (IN)',
        isAnomalous: isAnomaly,
        anomalyScore: isAnomaly ? Math.floor(75 + Math.random() * 22) : Math.floor(5 + Math.random() * 20),
      };

      setStream((prev) => [newTx, ...prev.slice(0, 19)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const anomalousCount = stream.filter((s) => s.isAnomalous).length;
  const totalVolume = stream.reduce((acc, s) => acc + s.amount, 0).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Socket Ingestion Live
            </span>
            <span className="text-xs font-mono text-slate-400">/api/v1/stream/sample/</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Radio className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
            Live Ingestion Stream Simulator
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Continuous peer-to-peer mempool packet feed evaluating sub-second anomaly detection
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isStreaming
                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40 hover:bg-rose-900 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="h-4 w-4" /> Pause Ingestion
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Resume Ingestion
              </>
            )}
          </button>
          <button
            onClick={() => setStream([])}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-lg text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
          >
            Clear Buffer
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cyber-panel p-4 border border-cyan-500/20">
          <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">Buffer Queue</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{stream.length} TXs</span>
          <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">2.5s Polling Interval</span>
        </div>
        <div className="cyber-panel p-4 border border-rose-500/20">
          <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">Anomalies Detected</span>
          <span className="text-2xl font-black text-rose-400 glow-text-rose font-mono mt-1 block">
            {anomalousCount}
          </span>
          <span className="text-[10px] text-rose-400/80 font-mono mt-0.5 block">
            {stream.length > 0 ? ((anomalousCount / stream.length) * 100).toFixed(0) : 0}% Flag Rate
          </span>
        </div>
        <div className="cyber-panel p-4 border border-emerald-500/20">
          <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">Buffer Volume</span>
          <span className="text-2xl font-black text-emerald-400 glow-text-emerald font-mono mt-1 block">
            {totalVolume} BTC
          </span>
          <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5 block">Simulated Flow</span>
        </div>
        <div className="cyber-panel p-4 border border-violet-500/20">
          <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">Ingress Protocol</span>
          <span className="text-2xl font-black text-violet-300 font-mono mt-1 block">Bitcoin P2P</span>
          <span className="text-[10px] text-violet-400/80 font-mono mt-0.5 block">Port 8333 Mainnet</span>
        </div>
      </div>

      {/* Stream Table */}
      <div className="cyber-panel-elevated overflow-hidden">
        <div className="bg-slate-950/80 px-6 py-4 border-b border-cyan-500/15 flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">Live Packet Stream Feed</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-2 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> WebSocket Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-cyan-400/80 uppercase text-[10px] border-b border-cyan-500/15 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Sender → Receiver</th>
                <th className="px-6 py-3.5">Value</th>
                <th className="px-6 py-3.5">Ingress IP / Geo</th>
                <th className="px-6 py-3.5">Anomaly Vector</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {stream.map((tx) => (
                <tr
                  key={tx.txid}
                  className={`transition-colors ${
                    tx.isAnomalous
                      ? 'bg-rose-950/25 hover:bg-rose-950/40 border-l-2 border-rose-500'
                      : 'hover:bg-slate-800/30 text-slate-300'
                  }`}
                >
                  <td className="px-6 py-3.5 text-slate-400">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-cyan-300 font-mono">
                    {tx.txid}
                  </td>
                  <td className="px-6 py-3.5 text-slate-300">
                    <span className="text-slate-400">{tx.sender}</span>
                    <span className="text-cyan-400 mx-1.5">→</span>
                    <span className="text-slate-300">{tx.receiver}</span>
                  </td>
                  <td className="px-6 py-3.5 font-bold">
                    <span className={tx.isAnomalous ? 'text-rose-400 font-black' : 'text-emerald-400'}>
                      {tx.amount} BTC
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-300">{tx.ip}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {tx.country}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            tx.isAnomalous ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, tx.anomalyScore)}%` }}
                        />
                      </div>
                      <span
                        className={`font-bold text-[11px] ${
                          tx.isAnomalous ? 'text-rose-400 glow-text-rose' : 'text-emerald-400'
                        }`}
                      >
                        {tx.anomalyScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {tx.isAnomalous ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                        <AlertTriangle className="h-3 w-3" /> Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                        <ShieldCheck className="h-3 w-3" /> Nominal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
