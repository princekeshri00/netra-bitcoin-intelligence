import { useEffect, useState } from 'react';
import type { PaginatedResponse, TransactionDetail, TransactionListItem } from '../types';
import { fetchTransactionDetail, fetchTransactions } from '../api/client';
import { Search, Zap, ArrowRight, X, ExternalLink, Hash, Clock, Cpu, Copy, Check, Filter } from 'lucide-react';

export default function TransactionsExplorerView() {
  const [data, setData] = useState<PaginatedResponse<TransactionListItem> | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [addressFilter, setAddressFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchTransactions({ address: addressFilter, src_ip: ipFilter }).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [addressFilter, ipFilter]);

  const handleSelectTx = async (txid: string) => {
    const detail = await fetchTransactionDetail(txid);
    setSelectedTxDetail(detail);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="font-mono text-sm text-cyan-400/80">Querying Ledger Transaction Index...</p>
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
              <Zap className="h-3 w-3 text-cyan-400 animate-pulse" /> Ledger UTXO Explorer
            </span>
            <span className="text-xs font-mono text-slate-400">/api/v1/transactions/</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Hash className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            Transaction Index & Flow Verification
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Real-time query ledger showing {data?.count || 0} indexed transactions with IP network telemetry
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400/60" />
            <input
              type="text"
              placeholder="Filter address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              className="bg-slate-900/90 border border-cyan-500/20 text-xs font-mono rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 w-48 transition-all shadow-inner"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400/60" />
            <input
              type="text"
              placeholder="Filter relay IP..."
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              className="bg-slate-900/90 border border-cyan-500/20 text-xs font-mono rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 w-44 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="cyber-panel-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-cyan-400/80 border-b border-cyan-500/15 tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Block Height</th>
                <th className="px-6 py-4">Input / Output Value</th>
                <th className="px-6 py-4">UTXO Topology</th>
                <th className="px-6 py-4">Script Standard</th>
                <th className="px-6 py-4">Relay Source IP</th>
                <th className="px-6 py-4 text-right">Forensics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {data?.results.map((tx) => (
                <tr key={tx.txid} className="hover:bg-cyan-950/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-cyan-300 max-w-[200px] truncate group-hover:text-cyan-400 transition-colors" title={tx.txid}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                      <span>{tx.txid}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      #{tx.block_height}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-bold block">{tx.total_input_amount} BTC</span>
                    <span className="text-slate-500 text-[10px] block">Fee: {tx.fee} BTC</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <span className="text-cyan-300 font-semibold">{tx.input_count} In</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-amber-300 font-semibold">{tx.output_count} Out</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                      {tx.script_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400/90 font-mono bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                      {tx.src_ip}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSelectTx(tx.txid)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 hover:border-cyan-400 transition-all text-xs font-semibold hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
                    >
                      Deep Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Deep Details Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-panel-elevated max-w-2xl w-full p-6 space-y-5 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-cyan-500/30 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTxDetail(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-cyan-500/20 pb-4">
              <span className="font-mono text-[10px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                Transaction Deep Forensics
              </span>
              <div className="flex items-center gap-2 mt-2">
                <h2 className="font-mono text-base font-bold text-white break-all">{selectedTxDetail.txid}</h2>
                <button
                  onClick={() => copyToClipboard(selectedTxDetail.txid)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Copy TXID"
                >
                  {copiedId === selectedTxDetail.txid ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Block Height</span>
                <span className="font-bold text-white text-sm mt-0.5 block">#{selectedTxDetail.block_height}</span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Block Hash</span>
                <span className="font-bold text-cyan-300 truncate block mt-0.5" title={selectedTxDetail.block_hash}>
                  {selectedTxDetail.block_hash}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Version / Locktime</span>
                <span className="font-bold text-white text-sm mt-0.5 block">
                  v{selectedTxDetail.version} · LT:{selectedTxDetail.locktime}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Payload Size / Weight</span>
                <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                  {selectedTxDetail.transaction_size} B ({selectedTxDetail.transaction_weight} wu)
                </span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Relay Source Node</span>
                <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                  {selectedTxDetail.src_ip}:{selectedTxDetail.src_port || 8333}
                </span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Destination Ingress</span>
                <span className="font-bold text-cyan-400 text-sm mt-0.5 block">
                  {selectedTxDetail.dst_ip || '198.51.100.1'}:{selectedTxDetail.dst_port || 8333}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center">
              <span className="text-slate-500 text-[11px] font-mono">Consensus State: Fully Confirmed</span>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 px-5 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
