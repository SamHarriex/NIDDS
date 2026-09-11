import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Activity, RefreshCw } from 'lucide-react';

interface TrafficPoint {
  time: string;
  volume: number;
  benign: number;
  malicious: number;
  alerts: number;
}

export const RealtimeTrafficChart: React.FC = () => {
  const [data, setData] = useState<TrafficPoint[]>([]);

  useEffect(() => {
    // Generate initial time-series history
    const initialData: TrafficPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const timeStr = new Date(now - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const benign = Math.floor(800 + Math.random() * 400);
      const malicious = Math.floor(20 + Math.random() * 120);
      initialData.push({
        time: timeStr,
        volume: benign + malicious,
        benign,
        malicious,
        alerts: Math.floor(malicious / 35)
      });
    }
    setData(initialData);

    // Update live data points every 5 seconds
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const benign = Math.floor(850 + Math.random() * 350);
      const malicious = Math.floor(10 + Math.random() * 140);

      setData(prev => {
        const next = [...prev.slice(1)];
        next.push({
          time: timeStr,
          volume: benign + malicious,
          benign,
          malicious,
          alerts: Math.floor(malicious / 30)
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-500">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Real-Time Traffic Flow</h3>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono">Packet volume distribution • Updated every 5s</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-[#666]">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Live Stream</span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBenign" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.7} />
            <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} />
            <YAxis stroke="#666" fontSize={10} tickLine={false} />

            <Tooltip
              contentStyle={{
                backgroundColor: '#161616',
                borderColor: '#222',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px'
              }}
            />

            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#888' }} />

            <Area
              type="monotone"
              dataKey="benign"
              name="Benign Flow (pkts/s)"
              stroke="#14b8a6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBenign)"
            />

            <Area
              type="monotone"
              dataKey="malicious"
              name="Malicious Vector (pkts/s)"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMalicious)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
