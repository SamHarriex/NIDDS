import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { RealtimeTrafficChart } from './components/RealtimeTrafficChart';
import { AttackDistributionChart } from './components/AttackDistributionChart';
import { AlertTable } from './components/AlertTable';
import { AlertDetailModal } from './components/AlertDetailModal';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { TrafficAnalysisView } from './components/TrafficAnalysisView';
import { DetectionModelsView } from './components/DetectionModelsView';
import { FeatureAnalysisView } from './components/FeatureAnalysisView';
import { DatasetsView } from './components/DatasetsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { NetworkConfigView } from './components/NetworkConfigView';
import { RouterConfigView } from './components/RouterConfigView';

import {
  DashboardStats,
  Alert,
  TrafficLog,
  ModelMetrics,
  DatasetInfo,
  FeatureImportance,
  LiveStats,
  MonitoredNetwork,
  MonitoredRouter
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [networks, setNetworks] = useState<MonitoredNetwork[]>([]);
  const [routers, setRouters] = useState<MonitoredRouter[]>([]);
  const [activeConnectedId, setActiveConnectedId] = useState<string>('rtr-starlink-01');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Fetch initial system state
  const fetchAllData = useCallback(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch('/api/traffic/live')
      .then(res => res.json())
      .then(data => setLiveStats(data))
      .catch(console.error);

    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error);

    fetch('/api/traffic?limit=50')
      .then(res => res.json())
      .then(data => setTrafficLogs(data))
      .catch(console.error);

    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data))
      .catch(console.error);

    fetch('/api/features')
      .then(res => res.json())
      .then(data => setFeatures(data))
      .catch(console.error);

    fetch('/api/datasets')
      .then(res => res.json())
      .then(data => setDatasets(data))
      .catch(console.error);

    fetch('/api/networks')
      .then(res => res.json())
      .then(data => setNetworks(data))
      .catch(console.error);

    fetch('/api/routers')
      .then(res => res.json())
      .then(data => setRouters(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 4000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Alert Handlers
  const handleAcknowledgeAlert = (id: string) => {
    fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handleResolveAlert = (id: string) => {
    fetch(`/api/alerts/${id}/resolve`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handleExportAlertsCSV = () => {
    window.open('/api/reports/alerts?format=csv', '_blank');
  };

  // Demo mode toggle
  const handleToggleDemoMode = () => {
    const nextMode = !stats?.demo_mode;
    fetch('/api/settings/demo-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: nextMode })
    })
      .then(res => res.json())
      .then(() => fetchAllData())
      .catch(console.error);
  };

  // Monitoring controls
  const handleStartMonitoring = () => {
    fetch('/api/monitor/start', { method: 'POST' })
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handlePauseMonitoring = () => {
    fetch('/api/simulation/stop', { method: 'POST' })
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handleStopMonitoring = () => {
    fetch('/api/monitor/stop', { method: 'POST' })
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handleReplayDataset = () => {
    fetch('/api/simulation/replay', { method: 'POST' })
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handleGenerateTestTraffic = () => {
    fetch('/api/simulation/generate', { method: 'POST' })
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const handleResetSystem = () => {
    if (confirm('Reset system database to default benchmark state?')) {
      fetch('/api/system/reset', { method: 'POST' })
        .then(() => fetchAllData())
        .catch(console.error);
    }
  };

  const handleUploadDataset = (file: File) => {
    const formData = new FormData();
    formData.append('dataset', file);
    fetch('/api/datasets/upload', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(() => fetchAllData())
      .catch(console.error);
  };

  const activeThreatsCount = alerts.filter(a => a.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] flex flex-col font-sans selection:bg-teal-700 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        stats={stats}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleDemoMode={handleToggleDemoMode}
        onToggleMonitoring={handleStartMonitoring}
        onResetSystem={handleResetSystem}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          threatsCount={activeThreatsCount}
          networks={networks}
          routers={routers}
          activeConnectedId={activeConnectedId}
          onSelectConnectedNetwork={setActiveConnectedId}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* KPI Cards Grid */}
              <KPICards stats={stats} />

              {/* Main Real-Time Traffic & Attack Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RealtimeTrafficChart />
                </div>
                <div>
                  <AttackDistributionChart />
                </div>
              </div>

              {/* Alert Table */}
              <AlertTable
                alerts={alerts}
                onSelectAlert={setSelectedAlert}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
                onExportCSV={handleExportAlertsCSV}
              />
            </div>
          )}

          {/* TAB 2: LIVE MONITORING */}
          {activeTab === 'monitoring' && (
            <LiveMonitoringView
              stats={liveStats}
              trafficLogs={trafficLogs}
              onStart={handleStartMonitoring}
              onPause={handlePauseMonitoring}
              onStop={handleStopMonitoring}
              onReplayDataset={handleReplayDataset}
              onGenerateTestTraffic={handleGenerateTestTraffic}
            />
          )}

          {/* TAB: NETWORK CONFIGURATION */}
          {activeTab === 'networks' && (
            <NetworkConfigView
              networks={networks}
              routers={routers}
              onRefresh={fetchAllData}
              onSelectTab={setActiveTab}
            />
          )}

          {/* TAB: ROUTER & GATEWAY MONITORING */}
          {activeTab === 'routers' && (
            <RouterConfigView
              routers={routers}
              onRefresh={fetchAllData}
            />
          )}

          {/* TAB 3: ALERTS */}
          {activeTab === 'alerts' && (
            <AlertTable
              alerts={alerts}
              onSelectAlert={setSelectedAlert}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onExportCSV={handleExportAlertsCSV}
            />
          )}

          {/* TAB 4: TRAFFIC ANALYSIS */}
          {activeTab === 'traffic' && (
            <TrafficAnalysisView />
          )}

          {/* TAB 5: DETECTION MODELS */}
          {activeTab === 'models' && (
            <DetectionModelsView models={models} />
          )}

          {/* TAB 6: FEATURE ANALYSIS */}
          {activeTab === 'features' && (
            <FeatureAnalysisView features={features} />
          )}

          {/* TAB 7: DATASETS */}
          {activeTab === 'datasets' && (
            <DatasetsView
              datasets={datasets}
              onUploadDataset={handleUploadDataset}
              onTrainModel={fetchAllData}
            />
          )}

          {/* TAB 8: REPORTS */}
          {activeTab === 'reports' && (
            <ReportsView
              stats={stats}
              onExportAlertsCSV={handleExportAlertsCSV}
            />
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              onToggleDemoMode={handleToggleDemoMode}
              demoMode={stats?.demo_mode ?? true}
              onResetSystem={handleResetSystem}
            />
          )}

        </main>
      </div>

      {/* Alert Forensic Inspection Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
      />

    </div>
  );
}
