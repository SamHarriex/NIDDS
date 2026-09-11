import React, { useState } from 'react';
import {
  Network,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  Radio,
  Shield,
  Activity,
  Zap,
  Check,
  X,
  Server,
  Wifi,
  Globe,
  Sliders,
  RefreshCw,
  Cpu,
  Layers,
  Router,
  Signal
} from 'lucide-react';
import { MonitoredNetwork, MonitoredRouter, NetworkType, DetectionProfile, Protocol } from '../types';

interface NetworkConfigViewProps {
  networks: MonitoredNetwork[];
  routers?: MonitoredRouter[];
  onRefresh: () => void;
  onSelectTab?: (tab: string) => void;
}

export const NetworkConfigView: React.FC<NetworkConfigViewProps> = ({
  networks,
  routers = [],
  onRefresh,
  onSelectTab
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<MonitoredNetwork | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Subnet (CIDR)' as NetworkType,
    cidr_or_range: '',
    interface_name: 'eth0',
    detection_profile: 'Aggressive (High Sensitivity)' as DetectionProfile,
    detection_engine: 'ML + Signature Pipeline' as any,
    primary_protocols: ['TCP', 'HTTP', 'HTTPS', 'DNS', 'SSH'] as Protocol[],
    promiscuous_mode: true,
    start_detecting: true
  });

  const availableProtocols: Protocol[] = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'SSH'];

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleOpenNewModal = () => {
    setEditingNetwork(null);
    setFormData({
      name: '',
      type: 'Subnet (CIDR)',
      cidr_or_range: '10.0.5.0/24',
      interface_name: 'eth0',
      detection_profile: 'Aggressive (High Sensitivity)',
      detection_engine: 'ML + Signature Pipeline',
      primary_protocols: ['TCP', 'HTTP', 'HTTPS', 'DNS', 'SSH'],
      promiscuous_mode: true,
      start_detecting: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (net: MonitoredNetwork) => {
    setEditingNetwork(net);
    setFormData({
      name: net.name,
      type: net.type,
      cidr_or_range: net.cidr_or_range,
      interface_name: net.interface_name || 'eth0',
      detection_profile: net.detection_profile,
      detection_engine: net.detection_engine,
      primary_protocols: net.primary_protocols || ['TCP', 'HTTP'],
      promiscuous_mode: net.promiscuous_mode ?? true,
      start_detecting: net.status === 'Active'
    });
    setIsModalOpen(true);
  };

  const handleAddPreset = (name: string, cidr: string, type: NetworkType, iface: string) => {
    setLoadingId('preset');
    fetch('/api/networks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        type,
        cidr_or_range: cidr,
        interface_name: iface,
        detection_profile: 'Aggressive (High Sensitivity)',
        detection_engine: 'ML + Signature Pipeline',
        start_detecting: true,
        primary_protocols: ['TCP', 'HTTP', 'HTTPS', 'DNS', 'SSH'],
        promiscuous_mode: true
      })
    })
      .then(res => res.json())
      .then(() => {
        setLoadingId(null);
        showNotification(`Configured and started detection on ${name} (${cidr})`);
        onRefresh();
      })
      .catch(err => {
        console.error(err);
        setLoadingId(null);
      });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cidr_or_range) return;

    if (editingNetwork) {
      // Update
      fetch(`/api/networks/${editingNetwork.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          cidr_or_range: formData.cidr_or_range,
          interface_name: formData.interface_name,
          detection_profile: formData.detection_profile,
          detection_engine: formData.detection_engine,
          primary_protocols: formData.primary_protocols,
          promiscuous_mode: formData.promiscuous_mode,
          status: formData.start_detecting ? 'Active' : 'Paused'
        })
      })
        .then(res => res.json())
        .then(() => {
          setIsModalOpen(false);
          showNotification(`Updated network settings for ${formData.name}`);
          onRefresh();
        })
        .catch(console.error);
    } else {
      // Create
      fetch('/api/networks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          cidr_or_range: formData.cidr_or_range,
          interface_name: formData.interface_name,
          detection_profile: formData.detection_profile,
          detection_engine: formData.detection_engine,
          primary_protocols: formData.primary_protocols,
          promiscuous_mode: formData.promiscuous_mode,
          start_detecting: formData.start_detecting
        })
      })
        .then(res => res.json())
        .then(() => {
          setIsModalOpen(false);
          showNotification(`Successfully configured network ${formData.name} for detection!`);
          onRefresh();
        })
        .catch(console.error);
    }
  };

  const handleToggleDetection = (id: string, name: string) => {
    setLoadingId(id);
    fetch(`/api/networks/${id}/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(updated => {
        setLoadingId(null);
        showNotification(`Detection state for ${name} changed to ${updated.status}`);
        onRefresh();
      })
      .catch(() => setLoadingId(null));
  };

  const handleSimulateTraffic = (id: string, name: string) => {
    setLoadingId(`sim-${id}`);
    fetch(`/api/networks/${id}/simulate`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setLoadingId(null);
        showNotification(`Simulated test traffic and threat scan on ${name}`);
        onRefresh();
      })
      .catch(() => setLoadingId(null));
  };

  const handleDeleteNetwork = (id: string, name: string) => {
    if (confirm(`Remove network configuration for "${name}"?`)) {
      fetch(`/api/networks/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          showNotification(`Network ${name} removed`);
          onRefresh();
        })
        .catch(console.error);
    }
  };

  const toggleProtocol = (proto: Protocol) => {
    if (formData.primary_protocols.includes(proto)) {
      setFormData({
        ...formData,
        primary_protocols: formData.primary_protocols.filter(p => p !== proto)
      });
    } else {
      setFormData({
        ...formData,
        primary_protocols: [...formData.primary_protocols, proto]
      });
    }
  };

  const totalInspected = networks.reduce((acc, n) => acc + (n.total_packets_inspected || 0), 0);
  const activeCount = networks.filter(n => n.status === 'Active').length;
  const totalThreats = networks.reduce((acc, n) => acc + (n.threats_detected_count || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Router Telemetry Quick Banner */}
      <div className="bg-[#0e1615] border border-teal-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-950 border border-teal-800/60 flex items-center justify-center text-teal-400 shrink-0">
            <Router className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2">
              <span>Router & Gateway Real-Time Monitoring Hub</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/50 text-[10px]">
                {routers.length} Routers Configured
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] mt-0.5">
              Connect Starlink Satellite Dishy, UniFi Gateways, pfSense Firewalls, or standard Home/Office routers for live threat inspection.
            </p>
          </div>
        </div>

        {onSelectTab && (
          <button
            onClick={() => onSelectTab('routers')}
            className="shrink-0 px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Signal className="w-3.5 h-3.5" />
            <span>Open Router Telemetry</span>
          </button>
        )}
      </div>
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
            <Network className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              Network Configuration & Detection Setup
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
              Configure subnets, CIDR ranges, or physical adapters to start real-time threat detection.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="cursor-pointer bg-teal-500 hover:bg-teal-400 text-black text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-teal-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Configure New Network</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="bg-teal-950/60 border border-teal-800/50 p-3.5 rounded-xl flex items-center justify-between text-teal-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-teal-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-teal-400" />
            <span>CONFIGURED NETWORKS</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{networks.length} Subnets</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>ACTIVE DETECTING</span>
          </div>
          <div className="text-xl font-bold text-teal-400 mt-1 flex items-center gap-2">
            <span>{activeCount} Active</span>
            {activeCount > 0 && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>PACKETS INSPECTED</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{totalInspected.toLocaleString()} pkts</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>SUBNET THREATS</span>
          </div>
          <div className="text-xl font-bold text-rose-400 mt-1">{totalThreats} Flagged</div>
        </div>
      </div>

      {/* Quick Presets Section */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
          <span className="text-xs font-serif italic text-white flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            1-Click Preset Subnet Configurations
          </span>
          <span className="text-[10px] font-mono text-[#666]">Click to add and start instant detection</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => handleAddPreset('Student Wi-Fi Segment', '172.20.0.0/16', 'Subnet (CIDR)', 'wlan1')}
            disabled={loadingId === 'preset'}
            className="px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Wifi className="w-3 h-3 text-teal-400" />
            <span>+ Student Wi-Fi (172.20.0.0/16)</span>
          </button>

          <button
            onClick={() => handleAddPreset('Research AI Lab Subnet', '192.168.50.0/24', 'IP Range', 'vlan50')}
            disabled={loadingId === 'preset'}
            className="px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Cpu className="w-3 h-3 text-teal-400" />
            <span>+ AI Research Lab (192.168.50.0/24)</span>
          </button>

          <button
            onClick={() => handleAddPreset('Cloud DMZ Cluster Gateway', '10.100.1.0/24', 'Gateway / Edge', 'eth2')}
            disabled={loadingId === 'preset'}
            className="px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Globe className="w-3 h-3 text-teal-400" />
            <span>+ Cloud DMZ (10.100.1.0/24)</span>
          </button>

          <button
            onClick={() => handleAddPreset('IoT Campus Sensor Grid', '192.168.100.0/24', 'Subnet (CIDR)', 'vlan100')}
            disabled={loadingId === 'preset'}
            className="px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Layers className="w-3 h-3 text-teal-400" />
            <span>+ IoT Sensor Grid (192.168.100.0/24)</span>
          </button>
        </div>
      </div>

      {/* Monitored Networks Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif italic text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            Configured Networks & Subnet Detection Status
          </h3>
          <span className="text-[10px] font-mono text-[#666] uppercase tracking-wider">
            {networks.length} Networks Defined
          </span>
        </div>

        {networks.length === 0 ? (
          <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-8 text-center space-y-3 font-mono">
            <Network className="w-10 h-10 text-[#444] mx-auto" />
            <div className="text-sm text-white">No networks currently configured for detection</div>
            <p className="text-xs text-[#666] max-w-md mx-auto">
              Click "Configure New Network" above or choose a preset to start capturing and inspecting traffic on your target network segment.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold uppercase tracking-wider rounded-full transition-all"
            >
              Configure Network Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {networks.map((net, idx) => {
              const isActive = net.status === 'Active';
              const isLoading = loadingId === net.id || loadingId === `sim-${net.id}`;

              return (
                <div
                  key={`${net.id}-${idx}`}
                  className={`bg-[#0c0c0c] border p-5 rounded-xl space-y-4 transition-all ${
                    isActive ? 'border-teal-500/80 shadow-md shadow-teal-500/5' : 'border-[#1a1a1a]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#1a1a1a]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-serif italic text-white">{net.name}</h4>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#161616] border border-[#222] text-teal-400 font-bold">
                          {net.cidr_or_range}
                        </span>
                        {net.interface_name && (
                          <span className="px-2 py-0.5 rounded bg-[#111] border border-[#222] text-[#888] text-[10px]">
                            Interface: {net.interface_name}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#111] border border-[#222] text-[#666] text-[10px]">
                          {net.type}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-teal-950/80 border-teal-800/50 text-teal-300'
                            : net.status === 'Paused'
                            ? 'bg-amber-950/80 border-amber-800/50 text-amber-300'
                            : 'bg-[#161616] border-[#222] text-[#888]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-teal-400 animate-ping' : 'bg-[#666]'
                          }`}
                        />
                        <span>{isActive ? 'DETECTING' : net.status.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Metadata Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest">DETECTION PROFILE</div>
                      <div className="text-xs font-bold text-[#d1d1d1] mt-0.5 truncate" title={net.detection_profile}>
                        {net.detection_profile}
                      </div>
                    </div>

                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest">DETECTION ENGINE</div>
                      <div className="text-xs font-bold text-[#d1d1d1] mt-0.5 truncate" title={net.detection_engine}>
                        {net.detection_engine}
                      </div>
                    </div>

                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest">PACKETS INSPECTED</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {(net.total_packets_inspected || 0).toLocaleString()} pkts
                      </div>
                    </div>

                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest">THREATS INTERCEPTED</div>
                      <div className="text-sm font-bold text-rose-400 mt-0.5">
                        {net.threats_detected_count || 0} Events
                      </div>
                    </div>
                  </div>

                  {/* Protocol Tags */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="text-[10px] text-[#666] uppercase tracking-widest">Monitored Protocols:</div>
                    <div className="flex flex-wrap gap-1">
                      {net.primary_protocols?.map(proto => (
                        <span key={proto} className="px-2 py-0.5 bg-[#141414] text-[#d1d1d1] rounded text-[10px] border border-[#222]">
                          {proto}
                        </span>
                      ))}
                      {net.promiscuous_mode && (
                        <span className="px-2 py-0.5 bg-teal-950/40 border border-teal-800/30 text-teal-400 rounded text-[10px]">
                          Promiscuous Mode
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a] font-mono text-xs gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleDetection(net.id, net.name)}
                      disabled={isLoading}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-all ${
                        isActive
                          ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-800/50 text-amber-300'
                          : 'bg-teal-500 hover:bg-teal-400 text-black font-bold border-teal-400'
                      }`}
                    >
                      {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isActive ? 'Pause Detection' : 'Start Detecting'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSimulateTraffic(net.id, net.name)}
                        disabled={isLoading}
                        title="Simulate Test Traffic and Threat Scan on this network"
                        className="p-2 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(net)}
                        title="Edit Network Settings"
                        className="p-2 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#888] hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNetwork(net.id, net.name)}
                        title="Remove Network Configuration"
                        className="p-2 rounded-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configure / Edit Network Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-serif italic text-white">
                  {editingNetwork ? 'Edit Network Configuration' : 'Configure New Network for Detection'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#666] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 font-mono text-xs">
              
              {/* Network Name */}
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Network Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Building LAN, Student Wi-Fi, Server Subnet"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Network Type & Interface */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Network Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as NetworkType })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="Subnet (CIDR)">Subnet (CIDR)</option>
                    <option value="IP Range">IP Range</option>
                    <option value="VLAN / Interface">VLAN / Interface</option>
                    <option value="Gateway / Edge">Gateway / Edge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Network Interface</label>
                  <input
                    type="text"
                    placeholder="eth0, wlan0, vlan10"
                    value={formData.interface_name}
                    onChange={e => setFormData({ ...formData, interface_name: e.target.value })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Subnet CIDR or Range */}
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Subnet CIDR / IP Address Range</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10.0.1.0/24 or 192.168.10.1 - 192.168.10.254"
                  value={formData.cidr_or_range}
                  onChange={e => setFormData({ ...formData, cidr_or_range: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Detection Profile & Engine */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Detection Profile</label>
                  <select
                    value={formData.detection_profile}
                    onChange={e => setFormData({ ...formData, detection_profile: e.target.value as DetectionProfile })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="Aggressive (High Sensitivity)">Aggressive (High Sensitivity)</option>
                    <option value="Standard Enterprise">Standard Enterprise</option>
                    <option value="Zero Trust / Strict">Zero Trust / Strict</option>
                    <option value="Passive">Passive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Detection Pipeline</label>
                  <select
                    value={formData.detection_engine}
                    onChange={e => setFormData({ ...formData, detection_engine: e.target.value as any })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="ML + Signature Pipeline">ML + Signature Pipeline</option>
                    <option value="Signature Only">Signature Only</option>
                    <option value="Machine Learning Anomaly">Machine Learning Anomaly</option>
                  </select>
                </div>
              </div>

              {/* Monitored Protocols Selection */}
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1.5">Monitored Protocols</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableProtocols.map(proto => {
                    const isSelected = formData.primary_protocols.includes(proto);
                    return (
                      <button
                        type="button"
                        key={proto}
                        onClick={() => toggleProtocol(proto)}
                        className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                          isSelected
                            ? 'bg-teal-950/80 border-teal-800/60 text-teal-300 font-bold'
                            : 'bg-[#161616] border-[#222] text-[#666]'
                        }`}
                      >
                        {proto}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 space-y-2 border-t border-[#1a1a1a]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.promiscuous_mode}
                    onChange={e => setFormData({ ...formData, promiscuous_mode: e.target.checked })}
                    className="rounded bg-[#161616] border-[#222] text-teal-500 focus:ring-0"
                  />
                  <span className="text-xs text-[#d1d1d1]">Enable Promiscuous Mode Packet Capture</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.start_detecting}
                    onChange={e => setFormData({ ...formData, start_detecting: e.target.checked })}
                    className="rounded bg-[#161616] border-[#222] text-teal-500 focus:ring-0"
                  />
                  <span className="text-xs text-teal-400 font-bold">Start Threat Detection Immediately on Creation</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold uppercase tracking-wider shadow-lg shadow-teal-500/10 transition-all"
                >
                  {editingNetwork ? 'Save Network Settings' : 'Start Network Detection'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
