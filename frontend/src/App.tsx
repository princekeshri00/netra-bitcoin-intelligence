import { useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import AlertsPage from './pages/AlertsPage';
import InvestigationPage from './pages/InvestigationPage';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [activeAlertId, setActiveAlertId] = useState<string>('ALT-001');

  function openInvestigation(alertId: string) {
    setActiveAlertId(alertId);
    setPage('investigation');
  }

  return (
    <div className="flex h-screen bg-paper">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto">
        {page === 'dashboard' && <DashboardHome />}
        {page === 'alerts' && <AlertsPage onOpen={openInvestigation} />}
        {page === 'investigation' && <InvestigationPage alertId={activeAlertId} />}
      </main>
    </div>
  );
}
