import { API_BASE, USE_MOCK, setUseMock, onConnectionChange, getConnectionStatus, type ConnectionStatus } from '../api/client';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Database, Zap, Wallet, GitBranch, ShieldAlert, Radio, Layers, Eye } from 'lucide-react';

export type Page = 'dashboard' | 'datasets' | 'transactions' | 'wallets' | 'graph' | 'alerts' | 'stream' | 'clusters';

export default function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const [isMocking, setIsMocking] = useState(USE_MOCK);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>(getConnectionStatus());

  useEffect(() => {
    return onConnectionChange(setConnStatus);
  }, []);

  const toggleMock = () => {
    const next = !isMocking;
    setIsMocking(next);
    setUseMock(next);
  };

  const items: { id: Page; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'datasets', label: 'Datasets & Pipeline', icon: <Database className="h-4 w-4" /> },
    { id: 'transactions', label: 'Transaction Explorer', icon: <Zap className="h-4 w-4" /> },
    { id: 'wallets', label: 'Wallet Risk Profiles', icon: <Wallet className="h-4 w-4" /> },
    { id: 'graph', label: 'Graph Explorer', icon: <GitBranch className="h-4 w-4" /> },
    { id: 'alerts', label: 'Alerts & Evidence', icon: <ShieldAlert className="h-4 w-4" />, badge: '47' },
    { id: 'stream', label: 'Live Stream', icon: <Radio className="h-4 w-4" /> },
    { id: 'clusters', label: 'Risk Clusters', icon: <Layers className="h-4 w-4" /> },
  ];

  return (
    <aside className="flex w-72 flex-shrink-0 flex-col bg-[var(--netra-surface)] border-r border-[var(--netra-border)] select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg netra-glow-cyan"
          style={{
            background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
          }}
        >
          <Eye className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
            NETRA
            <span className="text-[9px] font-mono font-semibold bg-[var(--netra-accent-glow)] text-[var(--netra-accent)] px-1.5 py-0.5 rounded border border-[var(--netra-accent)]/20">
              v1.0
            </span>
          </div>
          <div className="font-mono text-[10px] text-[var(--netra-text-muted)] leading-tight mt-0.5">
            Network Entity Tracking<br />& Risk Analysis
          </div>
        </div>
      </div>

      {/* Accent Bar */}
      <div className="h-[1px] mx-4" style={{ background: 'linear-gradient(90deg, transparent, var(--netra-accent), transparent)' }} />

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2.5 pt-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--netra-text-muted)]">
          Investigation Modules
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all flex items-center justify-between group ${
              page === item.id
                ? 'bg-[var(--netra-accent-glow)] text-[var(--netra-accent)] shadow-sm'
                : 'text-[var(--netra-text-muted)] hover:bg-white/[0.03] hover:text-[var(--netra-text)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`transition-colors ${page === item.id ? 'text-[var(--netra-accent)]' : 'text-[var(--netra-text-muted)] group-hover:text-[var(--netra-text)]'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold bg-red-500/15 text-red-400 border border-red-500/20 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* API Endpoint Mode Toggle */}
      <div className="border-t border-[var(--netra-border)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[var(--netra-text-muted)]">Data Source</span>
          <button
            onClick={toggleMock}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all border ${
              isMocking
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            {isMocking ? 'Mock Mode' : 'Live API'}
          </button>
        </div>

        {/* Connection Status */}
        {!isMocking && (
          <div className="flex items-center gap-2 animate-netra-fade-in">
            <span className={`h-2 w-2 rounded-full ${
              connStatus === 'connected' ? 'bg-emerald-400 animate-netra-pulse'
                : connStatus === 'checking' ? 'bg-amber-400 animate-pulse'
                : 'bg-red-400'
            }`} />
            <span className="text-[10px] font-mono text-[var(--netra-text-muted)]">
              {connStatus === 'connected' ? 'Backend Connected'
                : connStatus === 'checking' ? 'Checking...'
                : 'Backend Unreachable'}
            </span>
          </div>
        )}

        <div className="text-[9px] font-mono text-[var(--netra-text-muted)]/60 truncate" title="http://localhost:8000/api/v1/">
          {API_BASE}
        </div>
      </div>
    </aside>
  );
}
