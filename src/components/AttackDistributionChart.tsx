import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const ATTACK_DATA = [
  { name: 'Benign', value: 80.2, color: '#14b8a6' },
  { name: 'DoS / SYN Flood', value: 8.9, color: '#f43f5e' },
  { name: 'PortScan', value: 5.6, color: '#f59e0b' },
  { name: 'DDoS', value: 3.1, color: '#be123c' },
  { name: 'Brute Force', value: 1.2, color: '#6366f1' },
  { name: 'Web Attack', value: 0.6, color: '#06b6d4' },
  { name: 'Infiltration / Other', value: 0.4, color: '#475569' }
];

export const AttackDistributionChart: React.FC = () => {
  return (
    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center gap-3 mb-2 pb-3 border-b border-[#1a1a1a]">
        <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-500">
          <PieChartIcon className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-white">Attack Distribution</h3>
          <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono">Category shares from dataset</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ATTACK_DATA}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {ATTACK_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0c0c0c" strokeWidth={2} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: '#161616',
                borderColor: '#222',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px'
              }}
              formatter={(value: any) => [`${value}%`, 'Volume Share']}
            />

            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '10px', color: '#888', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
