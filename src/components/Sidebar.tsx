import React, { useState } from 'react';
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Activity,
  Cpu,
  BarChart3,
  Database,
  FileText,
  Settings,
  Server,
  Network,
  Router,
  Wifi,
  Signal,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { MonitoredNetwork, MonitoredRouter } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  threatsCount: number;
  networks?: MonitoredNetwork[];
  routers?: MonitoredRouter[];
  activeConnectedId?: string;
  onSelectConnectedNetwork?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  threatsCount,
  networks = [],
  routers = [],
  activeConnectedId,
  onSelectConnectedNetwork
}) => {
  const [isNetworksExpanded, setIsNetworksExpanded] = useState<boolean>(true);
  const [selectedConnId, setSelectedConnId] = useState<string>(
    activeConnectedId || (routers[0]?.id || networks[0]?.id || 'rtr-starlink-01')
  );

  const currentId = activeConnectedId || selectedConnId;

  const handleSelectConnection = (id: string) => {
    setSelectedConnId(id);
    if (onSelectConnectedNetwork) {
      onSelectConnectedNetwork(id);
    }
  };

  // Find currently connected router or network
  const connectedRouter = routers.find(r => r.id === currentId);
  const connectedNetwork = networks.find(n => n.id === currentId);

  // Fallback default connected item
  const activeItem = connectedRouter || connectedNetwork || routers[0] || networks[0];

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Stream', icon: Radio },
    { id: 'networks', label: 'Network Setup', icon: Network },
    { id: 'routers', label: 'Router & Gateway', icon: Router },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: threatsCount > 0 ? threatsCount : null },
    { id: 'traffic', label: 'Traffic Analysis', icon: Activity },
    { id: 'models', label: 'Detection Models', icon: Cpu },
    { id: 'features', label: 'Feature Importance', icon: BarChart3 },
    { id: 'datasets', label: 'Datasets & Training', icon: Database },
    { id: 'reports', label: 'Executive Reports', icon: FileText }
  ];

  const systemItems = [
    { id: 'settings', label: 'Settings & Rules', icon: Settings }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-[#1f1f1f] text-[#d1d1d1] w-72 p-4 select-none">
      
      {/* Title Header */}
      <div className="px-2 py-1.5 mb-2 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666]">
          Command Center
        </span>
        <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800/40 text-[9px] font-mono">
          NIDS v2.4
        </span>
      </div>

      {/* Main Scrollable Nav Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        
        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-[#161616] text-white border-[#222]'
                    : 'text-[#888] hover:text-white border-transparent hover:bg-[#111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-500' : 'bg-transparent border border-[#333]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[10px] font-mono px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* --- SECTION: CONNECTED NETWORK & GATEWAY --- */}
        <div className="pt-2 border-t border-[#1a1a1a] space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#888] flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              Connected Network
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              ONLINE
            </span>
          </div>

          {activeItem ? (
            <div className="bg-[#0e1615] border border-teal-500/40 rounded-xl p-3 space-y-2 text-xs font-mono relative group shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-white font-bold text-xs truncate max-w-[170px]" title={activeItem.name}>
                    {activeItem.name}
                  </div>
                  <div className="text-[10px] text-teal-300 flex items-center gap-1">
                    <span className="font-semibold">
                      {'gateway_ip' in activeItem ? activeItem.gateway_ip : activeItem.cidr_or_range}
                    </span>
                    {'brand' in activeItem && (
                      <span className="text-[9px] text-[#888]">({activeItem.brand})</span>
                    )}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-800/60 flex items-center justify-center text-teal-400 shrink-0">
                  {'brand' in activeItem && activeItem.brand === 'Starlink Satellite' ? (
                    <Signal className="w-3.5 h-3.5 text-teal-400" />
                  ) : 'brand' in activeItem ? (
                    <Router className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Network className="w-3.5 h-3.5 text-teal-400" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#aaa] bg-[#070d0c] p-2 rounded-lg border border-teal-900/30">
                <div>
                  <span className="text-[#666] block text-[9px] uppercase">Telemetry</span>
                  <span className="text-teal-300 font-bold truncate block">
                    {'telemetry_protocol' in activeItem 
                      ? activeItem.telemetry_protocol 
                      : activeItem.detection_engine.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <span className="text-[#666] block text-[9px] uppercase">Performance</span>
                  <span className="text-white font-bold block">
                    {'wan_throughput_mbps' in activeItem 
                      ? `${activeItem.wan_throughput_mbps} Mbps` 
                      : `${activeItem.total_packets_inspected || 0} pkts`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleNavClick('brand' in activeItem ? 'routers' : 'networks')}
                className="w-full text-center py-1 rounded bg-teal-950/60 hover:bg-teal-900/80 border border-teal-800/50 text-[10px] text-teal-300 font-mono transition-colors flex items-center justify-center gap-1"
              >
                <span>Manage Connection Settings</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl text-center text-[10px] font-mono text-[#666]">
              No network currently connected
            </div>
          )}
        </div>

        {/* --- SECTION: AVAILABLE NETWORKS & ROUTERS --- */}
        <div className="pt-2 border-t border-[#1a1a1a] space-y-2">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setIsNetworksExpanded(!isNetworksExpanded)}
              className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#888] hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {isNetworksExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Available Networks ({networks.length + routers.length})</span>
            </button>

            <button
              onClick={() => handleNavClick('networks')}
              title="Add New Network"
              className="text-[#666] hover:text-teal-400 transition-colors p-1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isNetworksExpanded && (
            <div className="space-y-1.5 font-mono text-xs">
              
              {/* Routers / Gateways Subgroup */}
              {routers.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[9px] text-[#666] uppercase tracking-wider px-1">
                    Gateways & Routers
                  </div>
                  {routers.map(rtr => {
                    const isSelected = currentId === rtr.id;
                    const isStarlink = rtr.brand === 'Starlink Satellite' || rtr.name.toLowerCase().includes('starlink');
                    const isActive = rtr.status === 'Connected & Monitoring';

                    return (
                      <button
                        key={rtr.id}
                        onClick={() => handleSelectConnection(rtr.id)}
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500/60 text-white'
                            : 'bg-[#0c0c0c] hover:bg-[#121212] border-[#1a1a1a] text-[#aaa]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? 'bg-teal-400' : 'bg-[#555]'
                            }`}
                          />
                          {isStarlink ? (
                            <Signal className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          ) : (
                            <Router className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <div className="text-[11px] font-medium text-white truncate max-w-[130px]">
                              {rtr.name}
                            </div>
                            <div className="text-[9px] text-[#777]">
                              {rtr.gateway_ip}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161616] border border-[#222] text-[#888]">
                            {rtr.status === 'Connected & Monitoring' ? 'Live' : 'Paused'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Subnets / Monitored Networks Subgroup */}
              {networks.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[9px] text-[#666] uppercase tracking-wider px-1">
                    Subnets & CIDRs
                  </div>
                  {networks.map(net => {
                    const isSelected = currentId === net.id;
                    const isActive = net.status === 'Active';

                    return (
                      <button
                        key={net.id}
                        onClick={() => handleSelectConnection(net.id)}
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-teal-950/40 border-teal-500/60 text-white'
                            : 'bg-[#0c0c0c] hover:bg-[#121212] border-[#1a1a1a] text-[#aaa]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? 'bg-teal-400' : 'bg-[#555]'
                            }`}
                          />
                          <Network className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <div className="truncate">
                            <div className="text-[11px] font-medium text-white truncate max-w-[130px]">
                              {net.name}
                            </div>
                            <div className="text-[9px] text-[#777]">
                              {net.cidr_or_range}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161616] border border-[#222] text-[#888]">
                            {net.status}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Administration Section */}
        <div className="pt-2 border-t border-[#1a1a1a] space-y-1">
          <div className="px-2 py-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666]">
              Administration
            </span>
          </div>

          {systemItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-[#161616] text-white border-[#222]'
                    : 'text-[#888] hover:text-white border-transparent hover:bg-[#111]'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-500' : 'bg-transparent border border-[#333]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Engine Indicator */}
      <div className="mt-auto pt-3 border-t border-[#1f1f1f]">
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-500 shrink-0">
            <Server className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-medium text-white">NIDS Core Engine</div>
            <div className="flex items-center gap-1 text-[9px] text-teal-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
              MONITORING ACTIVE
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

