import React, { useState } from 'react';
import {
  Router,
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
  Wifi,
  Globe,
  RefreshCw,
  Cpu,
  Sliders,
  Server,
  Signal,
  ArrowUpRight,
  ArrowDownLeft,
  Tv,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MonitoredRouter, RouterBrand, RouterProtocolType } from '../types';

interface RouterConfigViewProps {
  routers: MonitoredRouter[];
  onRefresh: () => void;
}

export const RouterConfigView: React.FC<RouterConfigViewProps> = ({
  routers,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouter, setEditingRouter] = useState<MonitoredRouter | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Starlink Satellite' as RouterBrand,
    gateway_ip: '192.168.100.1',
    management_port: 9201,
    telemetry_protocol: 'Starlink gRPC Telemetry' as RouterProtocolType,
    subnet_monitored: '192.168.1.0/24',
    active_clients_count: 18
  });

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleOpenNewModal = () => {
    setEditingRouter(null);
    setFormData({
      name: 'Starlink Main Dishy Gateway',
      brand: 'Starlink Satellite',
      gateway_ip: '192.168.100.1',
      management_port: 9201,
      telemetry_protocol: 'Starlink gRPC Telemetry',
      subnet_monitored: '192.168.1.0/24',
      active_clients_count: 18
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rtr: MonitoredRouter) => {
    setEditingRouter(rtr);
    setFormData({
      name: rtr.name,
      brand: rtr.brand,
      gateway_ip: rtr.gateway_ip,
      management_port: rtr.management_port || 80,
      telemetry_protocol: rtr.telemetry_protocol,
      subnet_monitored: rtr.subnet_monitored,
      active_clients_count: rtr.active_clients_count || 12
    });
    setIsModalOpen(true);
  };

  const handleBrandChange = (brand: RouterBrand) => {
    let defaultIp = '192.168.1.1';
    let defaultPort = 80;
    let defaultProtocol: RouterProtocolType = 'WAN / LAN Mirroring';
    let defaultName = 'Home / Office Router Gateway';

    if (brand === 'Starlink Satellite') {
      defaultIp = '192.168.100.1';
      defaultPort = 9201;
      defaultProtocol = 'Starlink gRPC Telemetry';
      defaultName = 'Starlink Gen2 Dishy Router';
    } else if (brand === 'UniFi / Ubiquiti') {
      defaultIp = '192.168.1.1';
      defaultPort = 2055;
      defaultProtocol = 'NetFlow / IPFIX';
      defaultName = 'UniFi Security Gateway Pro';
    } else if (brand === 'pfSense / OPNsense') {
      defaultIp = '10.0.0.1';
      defaultPort = 514;
      defaultProtocol = 'Syslog UDP Feed';
      defaultName = 'pfSense Firewall Core Gateway';
    } else if (brand === 'MikroTik RouterOS') {
      defaultIp = '192.168.88.1';
      defaultPort = 8728;
      defaultProtocol = 'SNMP Polling (v2c/v3)';
      defaultName = 'MikroTik RouterOS Core Gateway';
    } else if (brand === 'Cisco / Enterprise') {
      defaultIp = '10.0.0.1';
      defaultPort = 161;
      defaultProtocol = 'SNMP Polling (v2c/v3)';
      defaultName = 'Cisco ISR Enterprise Router';
    }

    setFormData({
      ...formData,
      brand,
      name: defaultName,
      gateway_ip: defaultIp,
      management_port: defaultPort,
      telemetry_protocol: defaultProtocol
    });
  };

  const handleAddQuickPreset = (brand: RouterBrand, name: string, ip: string, port: number, proto: RouterProtocolType, subnet: string) => {
    setLoadingId('preset');
    fetch('/api/routers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        brand,
        gateway_ip: ip,
        management_port: port,
        telemetry_protocol: proto,
        subnet_monitored: subnet,
        active_clients_count: 22
      })
    })
      .then(res => res.json())
      .then(() => {
        setLoadingId(null);
        showNotification(`Connected and started real-time monitoring on ${name} (${ip})`);
        onRefresh();
      })
      .catch(err => {
        console.error(err);
        setLoadingId(null);
      });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.gateway_ip) return;

    if (editingRouter) {
      fetch(`/api/routers/${editingRouter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => res.json())
        .then(() => {
          setIsModalOpen(false);
          showNotification(`Updated router telemetry configuration for ${formData.name}`);
          onRefresh();
        })
        .catch(console.error);
    } else {
      fetch('/api/routers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => res.json())
        .then(() => {
          setIsModalOpen(false);
          showNotification(`Successfully connected router ${formData.name} for real-time threat monitoring!`);
          onRefresh();
        })
        .catch(console.error);
    }
  };

  const handleToggleStatus = (id: string, name: string) => {
    setLoadingId(id);
    fetch(`/api/routers/${id}/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(updated => {
        setLoadingId(null);
        showNotification(`Monitoring status for ${name} changed to ${updated.status}`);
        onRefresh();
      })
      .catch(() => setLoadingId(null));
  };

  const handleTestHandshake = (id: string, name: string) => {
    setLoadingId(`test-${id}`);
    fetch(`/api/routers/${id}/test-connection`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setLoadingId(null);
        showNotification(data.message || `Telemetry handshake verified for ${name}`);
        onRefresh();
      })
      .catch(() => setLoadingId(null));
  };

  const handleDeleteRouter = (id: string, name: string) => {
    if (confirm(`Disconnect and remove router monitoring configuration for "${name}"?`)) {
      fetch(`/api/routers/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          showNotification(`Router ${name} disconnected and removed`);
          onRefresh();
        })
        .catch(console.error);
    }
  };

  const activeCount = routers.filter(r => r.status === 'Connected & Monitoring').length;
  const totalThroughput = routers.reduce((acc, r) => acc + (r.wan_throughput_mbps || 0), 0);
  const totalThreats = routers.reduce((acc, r) => acc + (r.threats_intercepted || 0), 0);
  const totalClients = routers.reduce((acc, r) => acc + (r.active_clients_count || 0), 0);

  return (
    <div className="space-y-6">

      {/* Title & Primary Header */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
            <Router className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              Router & Gateway Real-Time Monitoring
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
              Connect Starlink Satellite Dishy, UniFi Gateways, pfSense Firewalls, or standard Home/Office routers for live threat inspection.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="cursor-pointer bg-teal-500 hover:bg-teal-400 text-black text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-teal-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Configure Router / Gateway</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="bg-teal-950/60 border border-teal-800/50 p-3.5 rounded-xl flex items-center justify-between text-teal-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-teal-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Router className="w-3.5 h-3.5 text-teal-400" />
            <span>CONNECTED ROUTERS</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{routers.length} Gateways</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>ACTIVE STREAMING</span>
          </div>
          <div className="text-xl font-bold text-teal-400 mt-1 flex items-center gap-2">
            <span>{activeCount} Live</span>
            {activeCount > 0 && <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />}
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>AGGREGATE WAN SPEED</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">{totalThroughput.toFixed(1)} Mbps</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-1">
          <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>ROUTER THREATS DETECTED</span>
          </div>
          <div className="text-xl font-bold text-rose-400 mt-1">{totalThreats} Intercepted</div>
        </div>
      </div>

      {/* 1-Click Router Presets */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
          <span className="text-xs font-serif italic text-white flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            1-Click Popular Router Telemetry Presets
          </span>
          <span className="text-[10px] font-mono text-[#666]">Click to auto-connect gateway telemetry</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => handleAddQuickPreset('Starlink Satellite', 'Starlink Satellite Dishy', '192.168.100.1', 9201, 'Starlink gRPC Telemetry', '192.168.1.0/24')}
            disabled={loadingId === 'preset'}
            className="px-3 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-teal-500/40 text-teal-300 font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Signal className="w-3.5 h-3.5 text-teal-400" />
            <span>+ Starlink Dishy Gateway (192.168.100.1)</span>
          </button>

          <button
            onClick={() => handleAddQuickPreset('UniFi / Ubiquiti', 'UniFi Security Gateway', '192.168.1.1', 2055, 'NetFlow / IPFIX', '192.168.1.0/24')}
            disabled={loadingId === 'preset'}
            className="px-3 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>+ UniFi UDM Pro Gateway (192.168.1.1)</span>
          </button>

          <button
            onClick={() => handleAddQuickPreset('pfSense / OPNsense', 'pfSense Core Firewall', '10.0.0.1', 514, 'Syslog UDP Feed', '10.0.0.0/16')}
            disabled={loadingId === 'preset'}
            className="px-3 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-2"
          >
            <Server className="w-3.5 h-3.5 text-teal-400" />
            <span>+ pfSense Router (10.0.0.1)</span>
          </button>

          <button
            onClick={() => handleAddQuickPreset('Generic Home/Office Gateway', 'Home Netgear/Asus Router', '192.168.1.1', 80, 'WAN / LAN Mirroring', '192.168.1.0/24')}
            disabled={loadingId === 'preset'}
            className="px-3 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] hover:text-teal-400 transition-all flex items-center gap-2"
          >
            <Wifi className="w-3.5 h-3.5 text-teal-400" />
            <span>+ Standard Router (192.168.1.1)</span>
          </button>
        </div>
      </div>

      {/* Routers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif italic text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            Configured Routers & Telemetry Telecommunications
          </h3>
          <span className="text-[10px] font-mono text-[#666] uppercase tracking-wider">
            {routers.length} Devices Monitored
          </span>
        </div>

        {routers.length === 0 ? (
          <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-8 text-center space-y-3 font-mono">
            <Router className="w-10 h-10 text-[#444] mx-auto" />
            <div className="text-sm text-white">No routers currently configured</div>
            <p className="text-xs text-[#666] max-w-md mx-auto">
              Click "Configure Router / Gateway" above or choose Starlink Dishy to begin streaming gateway telemetry and real-time threat detection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routers.map((rtr, idx) => {
              const isConnected = rtr.status === 'Connected & Monitoring';
              const isStarlink = rtr.brand === 'Starlink Satellite' || rtr.name.toLowerCase().includes('starlink');
              const isLoading = loadingId === rtr.id || loadingId === `test-${rtr.id}`;

              return (
                <div
                  key={`${rtr.id}-${idx}`}
                  className={`bg-[#0c0c0c] border p-5 rounded-xl space-y-4 transition-all ${
                    isConnected ? 'border-teal-500/80 shadow-md shadow-teal-500/5' : 'border-[#1a1a1a]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#1a1a1a]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isStarlink ? (
                          <Signal className="w-4 h-4 text-teal-400 shrink-0" />
                        ) : (
                          <Router className="w-4 h-4 text-teal-400 shrink-0" />
                        )}
                        <h4 className="text-base font-serif italic text-white">{rtr.name}</h4>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#161616] border border-[#222] text-teal-400 font-bold">
                          {rtr.gateway_ip}{rtr.management_port ? `:${rtr.management_port}` : ''}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#111] border border-[#222] text-[#888] text-[10px]">
                          {rtr.brand}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                          isConnected
                            ? 'bg-teal-950/80 border-teal-800/50 text-teal-300'
                            : 'bg-amber-950/80 border-amber-800/50 text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isConnected ? 'bg-teal-400 animate-ping' : 'bg-[#666]'
                          }`}
                        />
                        <span>{rtr.status.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Starlink Satellite Specific Telemetry Bar */}
                  {isStarlink && (
                    <div className="bg-teal-950/30 border border-teal-800/40 p-3 rounded-xl font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Signal className="w-3.5 h-3.5" />
                          Starlink Dishy Satellite Feed
                        </span>
                        <span>Signal Quality: {rtr.satellite_signal_quality ?? 98}%</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-[#d1d1d1]">
                        <div>
                          <div className="text-[9px] text-[#888] uppercase">Obstruction</div>
                          <div className="font-bold text-teal-300">
                            {rtr.satellite_obstruction_pct ?? 0.0}% (Clear Sky)
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-[#888] uppercase">gRPC Dish API</div>
                          <div className="font-bold text-teal-300">Active :9201</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-[#888] uppercase">Target Latency</div>
                          <div className="font-bold text-teal-300">{rtr.latency_ms} ms ping</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-teal-400" />
                        WAN THROUGHPUT
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {rtr.wan_throughput_mbps} Mbps
                      </div>
                    </div>

                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center gap-1">
                        <Activity className="w-3 h-3 text-teal-400" />
                        LATENCY / LOSS
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {rtr.latency_ms} ms ({rtr.packet_loss_pct}% loss)
                      </div>
                    </div>

                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest">PACKETS INSPECTED</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {(rtr.total_packets_processed || 0).toLocaleString()} pkts
                      </div>
                    </div>

                    <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                      <div className="text-[10px] text-[#666] uppercase tracking-widest">THREATS INTERCEPTED</div>
                      <div className="text-sm font-bold text-rose-400 mt-0.5">
                        {rtr.threats_intercepted || 0} Events
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Method & Subnet */}
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-[10px] text-[#666] uppercase tracking-widest">Router Protocol & Subnet:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-[#141414] text-[#d1d1d1] rounded text-[10px] border border-[#222]">
                        {rtr.telemetry_protocol}
                      </span>
                      <span className="px-2 py-0.5 bg-[#141414] text-teal-400 rounded text-[10px] border border-[#222]">
                        Subnet: {rtr.subnet_monitored}
                      </span>
                      <span className="px-2 py-0.5 bg-[#141414] text-[#888] rounded text-[10px] border border-[#222]">
                        {rtr.active_clients_count} Connected Clients
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a] font-mono text-xs gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleStatus(rtr.id, rtr.name)}
                      disabled={isLoading}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-all ${
                        isConnected
                          ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-800/50 text-amber-300'
                          : 'bg-teal-500 hover:bg-teal-400 text-black font-bold border-teal-400'
                      }`}
                    >
                      {isConnected ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isConnected ? 'Pause Stream' : 'Resume Telemetry'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestHandshake(rtr.id, rtr.name)}
                        disabled={isLoading}
                        title="Test telemetry connection & handshake ping"
                        className="px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Test Ping</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(rtr)}
                        title="Edit Router Configuration"
                        className="p-2 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#888] hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteRouter(rtr.id, rtr.name)}
                        title="Disconnect Router"
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

      {/* Configure / Edit Router Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Router className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-serif italic text-white">
                  {editingRouter ? 'Edit Router Telemetry' : 'Configure Router for Real-Time Monitoring'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#666] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 font-mono text-xs">
              
              {/* Router Brand Selection */}
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Router Model / Brand</label>
                <select
                  value={formData.brand}
                  onChange={e => handleBrandChange(e.target.value as RouterBrand)}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="Starlink Satellite">🛰️ Starlink Satellite Dishy Gateway</option>
                  <option value="UniFi / Ubiquiti">🛡️ UniFi / Ubiquiti Security Gateway / UDM Pro</option>
                  <option value="pfSense / OPNsense">🔒 pfSense / OPNsense Firewall Router</option>
                  <option value="MikroTik RouterOS">⚙️ MikroTik RouterOS / OpenWrt</option>
                  <option value="Generic Home/Office Gateway">📶 Standard Home/Office Gateway (ASUS, Netgear, TP-Link)</option>
                  <option value="Cisco / Enterprise">🏢 Cisco / Enterprise Router</option>
                </select>
              </div>

              {/* Router Name */}
              <div>
                <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Router Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starlink Main Terminal, Office Gateway"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Gateway IP & Port */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Gateway IP Address</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.100.1 or 192.168.1.1"
                    value={formData.gateway_ip}
                    onChange={e => setFormData({ ...formData, gateway_ip: e.target.value })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Management / Telemetry Port</label>
                  <input
                    type="number"
                    value={formData.management_port}
                    onChange={e => setFormData({ ...formData, management_port: parseInt(e.target.value) || 80 })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Telemetry Protocol & Subnet Monitored */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Telemetry Protocol</label>
                  <select
                    value={formData.telemetry_protocol}
                    onChange={e => setFormData({ ...formData, telemetry_protocol: e.target.value as RouterProtocolType })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="Starlink gRPC Telemetry">Starlink gRPC Telemetry</option>
                    <option value="Syslog UDP Feed">Syslog UDP Feed</option>
                    <option value="NetFlow / IPFIX">NetFlow / IPFIX</option>
                    <option value="SNMP Polling (v2c/v3)">SNMP Polling (v2c/v3)</option>
                    <option value="WAN / LAN Mirroring">WAN / LAN Mirroring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#888] uppercase tracking-wider mb-1">Subnet Routed</label>
                  <input
                    type="text"
                    placeholder="192.168.1.0/24"
                    value={formData.subnet_monitored}
                    onChange={e => setFormData({ ...formData, subnet_monitored: e.target.value })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
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
                  {editingRouter ? 'Save Router Telemetry' : 'Start Realtime Router Monitoring'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
