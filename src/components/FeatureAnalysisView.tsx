import React from 'react';
import { BarChart3, Info, CheckCircle2, Sliders } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { FeatureImportance } from '../types';

interface FeatureAnalysisViewProps {
  features: FeatureImportance[];
}

export const FeatureAnalysisView: React.FC<FeatureAnalysisViewProps> = ({ features }) => {
  const chartData = features.map(f => ({
    name: f.feature_name,
    importance: Number((f.gini_importance * 100).toFixed(2))
  }));

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
          <BarChart3 className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl font-serif italic text-white">
            Feature Selection & Random Forest Gini Importance Analysis
          </h2>
          <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
            Top 20 network flow features selected after Pearson correlation analysis (threshold &lt; 0.95).
          </p>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl text-xs text-[#d1d1d1] flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="font-mono text-xs">
          <span className="font-bold text-white block mb-0.5 uppercase tracking-wider">Random Forest Gini Importance</span>
          Higher feature importance indicates greater contribution to the classifier's decision-making process. Highly correlated features (&gt; 0.95 correlation) were removed during preprocessing to optimize model generalization.
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a1a]">
          <Sliders className="w-4 h-4 text-teal-400" />
          <h3 className="text-base font-serif italic text-white">
            Top 20 Features Ranking (Gini Importance %)
          </h3>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.7} />
              <XAxis type="number" stroke="#666" fontSize={10} unit="%" />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888"
                fontSize={10}
                width={120}
                tick={{ fill: '#d1d1d1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  borderColor: '#222',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
                formatter={(val: any) => [`${val}%`, 'Gini Importance']}
              />
              <Bar dataKey="importance" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Features Table */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-4">
        <div className="pb-3 border-b border-[#1a1a1a]">
          <h3 className="text-base font-serif italic text-white">Top Selected Feature Characteristics</h3>
        </div>

        <div className="overflow-x-auto border border-[#1a1a1a] rounded-xl bg-[#080808]">
          <table className="w-full text-left text-xs text-[#d1d1d1]">
            <thead className="bg-[#111] border-b border-[#1a1a1a] text-[#666] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Feature Characteristic</th>
                <th className="p-3">Gini Score</th>
                <th className="p-3">Normal Value</th>
                <th className="p-3">Attack Value</th>
                <th className="p-3">Feature Role & Description</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#181818]">
              {features.map(f => (
                <tr key={f.rank} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3 font-mono font-bold text-teal-400">#{f.rank}</td>
                  <td className="p-3 font-bold text-white">{f.feature_name}</td>
                  <td className="p-3 font-mono font-bold text-teal-300">
                    {(f.gini_importance * 100).toFixed(2)}%
                  </td>
                  <td className="p-3 font-mono text-teal-200">{f.sample_value_benign}</td>
                  <td className="p-3 font-mono text-rose-300">{f.sample_value_attack}</td>
                  <td className="p-3 text-[#888] font-mono">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
