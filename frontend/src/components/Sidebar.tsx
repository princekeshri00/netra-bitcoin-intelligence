import {
  LayoutDashboard,
  ShieldAlert,
  FileSearch,
  GitBranch,
  Wallet,
  Zap,
  Layers,
  Radio,
  Database,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export type Page =
  | 'dashboard'
  | 'alerts'
  | 'investigation'
  | 'graph'
  | 'wallets'
  | 'transactions'
  | 'clusters'
  | 'stream'
  | 'datasets';

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  alertCount?: number;
}

export default function Sidebar({ page, onNavigate, alertCount = 47 }: SidebarProps) {
  const primaryItems: { id: Page; label: string; hint: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      hint: 'Intelligence overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'alerts',
      label: 'Alert Log',
      hint: 'Ranked suspicious leads',
      icon: <ShieldAlert className="h-4 w-4" />,
      badge: String(alertCount),
    },
    {
      id: 'investigation',
      label: 'Case File',
      hint: 'Forensic drilldown',
      icon: <FileSearch className="h-4 w-4" />,
    },
  ];

  const explorerItems: { id: Page; label: string; hint: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'graph',
      label: 'Graph Explorer',
      hint: 'Cytoscape topology',
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      id: 'wallets',
      label: 'Wallet Profiles',
      hint: 'Risk radar & counterparties',
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      hint: 'Search & network IPs',
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: 'clusters',
      label: 'Risk Clusters',
      hint: 'Sybil & mixing rings',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: 'stream',
      label: 'Live Stream',
      hint: 'Real-time broadcast monitor',
      icon: <Radio className="h-4 w-4" />,
      badge: 'LIVE',
    },
    {
      id: 'datasets',
      label: 'Dataset Ingestion',
      hint: 'CSV pipeline & parser',
      icon: <Database className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col bg-[#0A0F1D] border-r border-slate-800/80 text-slate-300 select-none">
      {/* Platform Branding */}
      <div className="px-6 pb-5 pt-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Activity className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-lg font-black tracking-widest bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                NETRA
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[10.5px] font-medium tracking-tight text-slate-400">
              Bitcoin Transaction Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
            Investigation Suite
          </div>
          <nav className="space-y-1">
            {primaryItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-white font-medium border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-[13px] leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">
                        {item.hint}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                        item.id === 'alerts'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
            Forensic Explorers
          </div>
          <nav className="space-y-1">
            {explorerItems.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-white font-medium border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-[12.5px] leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">
                        {item.hint}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Status Panel */}
      <div className="border-t border-slate-800/80 p-4 space-y-3 bg-[#070B14]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-medium text-emerald-400">
              Live Backend Active
            </span>
          </div>
          <a
            href="http://localhost:8000/api/schema/swagger-ui/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-cyan-400 transition-colors"
            title="Open Swagger API Docs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="rounded-lg bg-slate-900/90 border border-slate-800 px-3 py-2 font-mono text-[10px] text-slate-400 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Target Dataset:</span>
            <span className="text-cyan-300 font-semibold">demo_01</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ingested TXs:</span>
            <span className="text-slate-300">10,544</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
