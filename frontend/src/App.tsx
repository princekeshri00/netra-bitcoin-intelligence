import { useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import AlertsPage from './pages/AlertsPage';
import InvestigationPage from './pages/InvestigationPage';
import GraphExplorerView from './components/GraphExplorerView';
import WalletRiskView from './components/WalletRiskView';
import TransactionsExplorerView from './components/TransactionsExplorerView';
import ClustersView from './components/ClustersView';
import StreamView from './components/StreamView';
import DatasetImportView from './components/DatasetImportView';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [activeAlertId, setActiveAlertId] = useState<string>('cf1b4045-9e56-47fe-83a3-4ec44f2b6a4c');

  function openInvestigation(alertId: string) {
    setActiveAlertId(alertId);
    setPage('investigation');
  }

  return (
    <div className="flex h-screen bg-[#080C15] text-slate-100 overflow-hidden font-sans">
      <Sidebar page={page} onNavigate={setPage} />

      <main className="flex-1 overflow-y-auto min-w-0">
        {page === 'dashboard' && <DashboardHome onOpenAlert={openInvestigation} />}
        {page === 'alerts' && <AlertsPage onOpen={openInvestigation} />}
        {page === 'investigation' && <InvestigationPage alertId={activeAlertId} />}
        {page === 'graph' && (
          <div className="p-8 min-h-screen bg-[#080C15] cyber-grid-bg">
            <GraphExplorerView alertId={activeAlertId} onSelectAlert={openInvestigation} />
          </div>
        )}
        {page === 'wallets' && (
          <div className="p-8 min-h-screen bg-[#080C15] cyber-grid-bg">
            <WalletRiskView />
          </div>
        )}
        {page === 'transactions' && (
          <div className="p-8 min-h-screen bg-[#080C15] cyber-grid-bg">
            <TransactionsExplorerView />
          </div>
        )}
        {page === 'clusters' && (
          <div className="p-8 min-h-screen bg-[#080C15] cyber-grid-bg">
            <ClustersView onInvestigate={openInvestigation} />
          </div>
        )}
        {page === 'stream' && (
          <div className="p-8 min-h-screen bg-[#080C15] cyber-grid-bg">
            <StreamView />
          </div>
        )}
        {page === 'datasets' && (
          <div className="p-8 min-h-screen bg-[#080C15] cyber-grid-bg">
            <DatasetImportView />
          </div>
        )}
      </main>
    </div>
  );
}
