import React from 'react';
import { useApp } from '../providers/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoTourBanner } from './DemoTourBanner';
import { ToastContainer } from './ToastContainer';

// Pages
import { DashboardPage } from '../../modules/dashboard/pages/DashboardPage';
import { LiveMonitorPage } from '../../modules/live-monitor/LiveMonitorPage';
import { AnalysisPage } from '../../modules/analysis/pages/AnalysisPage';
import { DetectionsPage } from '../../modules/detections/pages/DetectionsPage';
import { SegmentationPage } from '../../modules/segmentation/pages/SegmentationPage';
import { PatternsPage } from '../../modules/patterns/pages/PatternsPage';
import { AlertsPage } from '../../modules/alerts/pages/AlertsPage';
import { HistoryPage } from '../../modules/history/pages/HistoryPage';
import { ScenariosPage } from '../../modules/scenarios/pages/ScenariosPage';
import { ClassesPage } from '../../modules/classes/pages/ClassesPage';
import { SettingsPage } from '../../modules/settings/pages/SettingsPage';
import { ProceduresManualPage } from '../../modules/procedures/pages/ProceduresManualPage';

export const AppShell: React.FC = () => {
  const { currentPage } = useApp();

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'live_monitor':
        return <LiveMonitorPage />;
      case 'analysis':
        return <AnalysisPage />;
      case 'detections_explorer':
        return <DetectionsPage />;
      case 'segmentation_explorer':
        return <SegmentationPage />;
      case 'patterns_explorer':
        return <PatternsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'history':
        return <HistoryPage />;
      case 'scenarios':
        return <ScenariosPage />;
      case 'classes':
        return <ClassesPage />;
      case 'rules':
        return <PatternsPage />; // Also rule configuration
      case 'settings':
        return <SettingsPage />;
      case 'procedures_manual':
        return <ProceduresManualPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Guided Tour Floating Banner (Section 15 Guion Empresa) */}
        <DemoTourBanner />

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global In-App Notifications */}
      <ToastContainer />
    </div>
  );
};
