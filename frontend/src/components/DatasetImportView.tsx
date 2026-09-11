import { useEffect, useState } from 'react';
import type { DatasetDetail } from '../types';
import { fetchDatasetDetail, importDataset, triggerAnalysis } from '../api/client';
import { Upload, Database, CheckCircle, AlertCircle, Play, Cpu, FileText, Check, ShieldCheck, Activity } from 'lucide-react';

export default function DatasetImportView() {
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDatasetDetail('demo_01')
      .then((data) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('Uploading transaction file...');
    try {
      const res = await importDataset(selectedFile, 'demo_01');
      setUploadStatus(`Ingestion Job Queued (ID: ${res.job_id}). Triggering ML Pipeline...`);
      await triggerAnalysis(res.dataset_id);
      const updated = await fetchDatasetDetail(res.dataset_id);
      setDataset(updated);
      setUploadStatus('Ingestion & Analysis Pipeline Completed Successfully!');
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="font-mono text-sm text-cyan-400/80">Loading dataset ingestion telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cyber-panel p-6 border-rose-500/30 space-y-3 max-w-lg mx-auto mt-12 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
        <div className="text-rose-400 font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Connection / Ingestion Error
        </div>
        <p className="text-sm text-slate-300 font-mono">{error}</p>
      </div>
    );
  }

  if (!dataset) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyan-500/15 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Database className="h-3 w-3 animate-pulse" /> Data Plane
            </span>
            <span className="text-xs font-mono text-slate-400">/api/v1/datasets/</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Database className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            Dataset Ingestion & ML Pipeline
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Ingest raw Bitcoin transaction records (UTXO, IP, Timestamps) and trigger behavioral scoring
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 font-mono text-xs text-cyan-400 bg-slate-900/90 border border-cyan-500/20 px-3.5 py-2 rounded-lg shadow-inner">
          Target Dataset: <span className="font-bold text-white ml-1">{dataset.dataset_id}</span> ({dataset.source_format})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form Card */}
        <div className="lg:col-span-6 cyber-panel-elevated p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Upload Raw Ingestion File
            </h2>
            <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              CSV / JSON Format
            </span>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="border-2 border-dashed border-cyan-500/25 hover:border-cyan-400/60 rounded-xl p-8 text-center bg-slate-950/60 transition-all cursor-pointer group hover:bg-cyan-950/20">
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
                <FileText className="h-10 w-10 text-cyan-400 mx-auto group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                <div className="text-sm font-mono font-semibold text-white">
                  {selectedFile ? (
                    <span className="text-cyan-300 font-bold">{selectedFile.name}</span>
                  ) : (
                    'Click to select or drag CSV / JSON dump'
                  )}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Expected fields: txid, timestamp, block_height, inputs, outputs, src_ip
                </div>
              </label>
            </div>

            {uploadStatus && (
              <div className="p-3.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-inner flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className={`w-full py-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedFile && !uploading
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.01]'
                  : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Play className="h-4 w-4" />
              {uploading ? 'Processing Ingestion Pipeline...' : 'Start Ingestion & Analysis Pipeline'}
            </button>
          </form>
        </div>

        {/* Dataset Stats Card */}
        <div className="lg:col-span-6 cyber-panel-elevated p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              Pipeline Telemetry & Validation Report
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="h-3 w-3" /> Schema Validated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Valid Records</span>
              <span className="font-bold text-emerald-400 text-xl flex items-center gap-2 mt-1.5 glow-text-emerald">
                <CheckCircle className="h-5 w-5" /> {dataset.stats.records_valid.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rejected / Malformed</span>
              <span className="font-bold text-rose-400 text-xl flex items-center gap-2 mt-1.5 glow-text-rose">
                <AlertCircle className="h-5 w-5" /> {dataset.stats.records_errored}
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-500/20">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Transactions</span>
              <span className="font-bold text-cyan-300 text-lg mt-1 block">
                {dataset.stats.transactions.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-violet-500/20">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Discovered Wallets</span>
              <span className="font-bold text-violet-300 text-lg mt-1 block">
                {dataset.stats.wallets.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Unique Ingress IPs</span>
              <span className="font-bold text-white text-lg mt-1 block">
                {dataset.stats.unique_ips.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Geographic Jurisdictions</span>
              <span className="font-bold text-white text-lg mt-1 block">
                {dataset.stats.unique_countries} Countries
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Storage: <span className="text-cyan-400">PostgreSQL / SQLite Vector</span></span>
            <span>Index Status: <span className="text-emerald-400 font-semibold">Online & Hot</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
