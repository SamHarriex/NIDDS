import React from 'react';
import { Activity, Globe, Shield, ArrowUpRight, ArrowDownLeft, Server } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const PROTOCOL_BREAKDOWN = [
  { protocol: 'TCP', count: 84210, bytes: '48.2 MB', pct: 64.2 },
  { protocol: 'HTTPS', count: 28410, bytes: '21.4 MB', pct: 21.6 },
  { protocol: 'HTTP', count: 12100, bytes: '8.1 MB', pct: 9.2 },
  { protocol: 'DNS', count: 4210, bytes: '1.2 MB', pct: 3.2 },
  { protocol: 'SSH', count: 1840, bytes: '0.8 MB', pct: 1.4 },
  { protocol: 'UDP / Other', count: 820, bytes: '0.3 MB', pct: 0.4 }
];

const TOP_SOURCE_TALKERS = [
  { ip: '192.168.10.45', label: 'Student Lab Host (Attacker)', packets: 14210, attacks: 'DoS Hulk / SYN Flood' },
  { ip: '172.16.4.12', label: 'Wireless Gateway', packets: 8420, attacks: 'SSH Brute Force' },
  { ip: '10.0.5.88', label: 'Research Server', packets: 6120, attacks: 'PortScan Sweep' },
  { ip: '198.51.100.14', label: 'External Internet Peer', packets: 3410, attacks: 'SQL Injection' },
  { ip: '10.0.4.102', label: 'Library Workstation', packets: 1820, attacks: 'Benign Traffic' }
];

export const TrafficAnalysisView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
          <Activity className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl font-serif italic text-white">
            Network Traffic Protocol & Flow Analysis
          </h2>
          <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
            Detailed breakdown of network flow protocols, top talker source IPs, and packet volume distribution.
          </p>
        </div>
      </div>

      {/* Protocol Bar Chart */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a1a]">
          <Server className="w-4 h-4 text-teal-400" />
          <h3 className="text-base font-serif italic text-white">
            Captured Flow Distribution by Protocol Volume
          </h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PROTOCOL_BREAKDOWN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.7} />
              <XAxis dataKey="protocol" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  borderColor: '#222',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="count" name="Flow Count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Talkers Table */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1a1a1a]">
          <Globe className="w-4 h-4 text-teal-400" />
          <h3 className="text-base font-serif italic text-white">
            Top Source IP Talkers & Activity Vector
          </h3>
        </div>

        <div className="overflow-x-auto border border-[#1a1a1a] rounded-xl bg-[#080808]">
          <table className="w-full text-left text-xs text-[#d1d1d1]">
            <thead className="bg-[#111] border-b border-[#1a1a1a] text-[#666] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Source IP Address</th>
                <th className="p-3">Campus Subnet / Role</th>
                <th className="p-3">Total Flow Volume</th>
                <th className="p-3">Associated Security Activity</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#181818] font-mono">
              {TOP_SOURCE_TALKERS.map(t => (
                <tr key={t.ip} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3 font-bold text-teal-400">{t.ip}</td>
                  <td className="p-3 text-[#d1d1d1] font-sans">{t.label}</td>
                  <td className="p-3 text-white font-bold">{t.packets.toLocaleString()} pkts</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${t.attacks.includes('Benign') ? 'bg-teal-950/60 text-teal-300 border border-teal-800/40' : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'}`}>
                      {t.attacks}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
