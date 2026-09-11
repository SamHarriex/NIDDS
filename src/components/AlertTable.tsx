import React, { useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import { Alert } from '../types';

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onExportCSV: () => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  onSelectAlert,
  onAcknowledgeAlert,
  onResolveAlert,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source_ip.includes(searchTerm) ||
      alert.destination_ip.includes(searchTerm) ||
      alert.attack_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || alert.severity.toUpperCase() === severityFilter;
    const matchesMethod = methodFilter === 'ALL' || alert.detection_method.toUpperCase() === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesSeverity && matchesMethod && matchesStatus;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/40';
      case 'high':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'medium':
        return 'bg-yellow-950/60 text-yellow-300 border-yellow-800/40';
      default:
        return 'bg-teal-950/60 text-teal-300 border-teal-800/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/40';
      case 'acknowledged':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      default:
        return 'bg-teal-950/40 text-teal-300 border-teal-800/40';
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-4">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-500">
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">
              Security Alert Incident Log
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono">Real-time threat inspection & action stream</p>
          </div>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 bg-[#161616] hover:bg-[#202020] text-white text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-full border border-[#222] transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search IP, ID, Attack..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#161616] border border-[#222] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Severity */}
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs text-[#d1d1d1] focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">Severity: All</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Method */}
        <select
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value)}
          className="bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs text-[#d1d1d1] focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">Method: All</option>
          <option value="SIGNATURE">Signature Engine</option>
          <option value="MACHINE LEARNING">Machine Learning</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs text-[#d1d1d1] focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">Status: All</option>
          <option value="NEW">New</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>

      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#1a1a1a] rounded-xl bg-[#080808]">
        <table className="w-full text-left text-xs text-[#d1d1d1]">
          <thead className="bg-[#111] border-b border-[#1a1a1a] text-[#666] font-mono uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Source → Destination</th>
              <th className="p-3">Attack Type</th>
              <th className="p-3">Method</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#181818] font-mono">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-[#555] font-sans italic">
                  No threat alerts match the selected search criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert, idx) => (
                <tr key={`${alert.id}-${idx}`} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3 text-[#666] whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-white">{alert.source_ip}:{alert.source_port}</div>
                    <div className="text-[10px] text-[#666]">→ {alert.destination_ip}:{alert.destination_port} ({alert.protocol})</div>
                  </td>

                  <td className="p-3 font-semibold text-white">
                    {alert.attack_type}
                  </td>

                  <td className="p-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#161616] text-[#888] border border-[#222]">
                      {alert.detection_method}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>

                  <td className="p-3 font-semibold text-teal-400">
                    {alert.confidence}%
                  </td>

                  <td className="p-3">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>

                  <td className="p-3 text-right space-x-1 whitespace-nowrap font-sans">
                    <button
                      onClick={() => onSelectAlert(alert)}
                      className="p-1.5 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-full transition-colors"
                      title="Inspect Threat Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {alert.status === 'New' && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full transition-colors"
                        title="Acknowledge Alert"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    {alert.status !== 'Resolved' && (
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full transition-colors"
                        title="Mark Resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
