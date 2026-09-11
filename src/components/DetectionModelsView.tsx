import React, { useState } from 'react';
import {
  Cpu,
  BarChart2,
  GitCommit,
  Layers,
  CheckCircle2,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { ModelMetrics } from '../types';

interface DetectionModelsViewProps {
  models: ModelMetrics[];
}

export const DetectionModelsView: React.FC<DetectionModelsViewProps> = ({ models }) => {
  const [selectedModel, setSelectedModel] = useState<string>('Random Forest');
  const [selectedDataset, setSelectedDataset] = useState<string>('CICIDS2017');

  const currentModelData = models.find(m => m.model === selectedModel) || models[1] || models[0];

  const comparisonData = [
    { name: 'Decision Tree', Accuracy: 97.1, Precision: 96.4, Recall: 97.0, F1: 96.7, FPR: 2.9, AUC: 0.965 },
    { name: 'Random Forest', Accuracy: 98.7, Precision: 97.9, Recall: 98.5, F1: 98.2, FPR: 1.8, AUC: 0.994 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
            <Cpu className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              Machine Learning Detection Models
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
              Comparative performance evaluation on benchmark dataset CICIDS2017 & NSL-KDD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDataset}
            onChange={e => setSelectedDataset(e.target.value)}
            className="bg-[#161616] border border-[#222] text-xs text-[#d1d1d1] rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-teal-500"
          >
            <option value="CICIDS2017">Dataset: CICIDS2017</option>
            <option value="NSL-KDD">Dataset: NSL-KDD</option>
          </select>

          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-[#161616] border border-[#222] text-xs text-[#d1d1d1] rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-teal-500"
          >
            <option value="Random Forest">Model: Random Forest (Primary)</option>
            <option value="Decision Tree">Model: Decision Tree</option>
          </select>
        </div>
      </div>

      {/* Target Baseline vs Experimental Metrics Table */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-serif italic text-white">
              Classifier Performance Comparison Table
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#666]">Actual experimental metrics</span>
        </div>

        <div className="overflow-x-auto border border-[#1a1a1a] rounded-xl bg-[#080808]">
          <table className="w-full text-left text-xs text-[#d1d1d1]">
            <thead className="bg-[#111] border-b border-[#1a1a1a] text-[#666] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Model Architecture</th>
                <th className="p-3.5">Accuracy %</th>
                <th className="p-3.5">Precision %</th>
                <th className="p-3.5">Recall %</th>
                <th className="p-3.5">F1 Score %</th>
                <th className="p-3.5">FPR %</th>
                <th className="p-3.5">AUC Score</th>
                <th className="p-3.5">Train Time</th>
                <th className="p-3.5">Inference</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#181818] font-mono">
              <tr className={selectedModel === 'Decision Tree' ? 'bg-[#141414]' : ''}>
                <td className="p-3.5 font-bold font-sans text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  Decision Tree
                </td>
                <td className="p-3.5 font-bold text-white">97.1%</td>
                <td className="p-3.5 text-[#888]">96.4%</td>
                <td className="p-3.5 text-[#888]">97.0%</td>
                <td className="p-3.5 text-[#888]">96.7%</td>
                <td className="p-3.5 text-amber-400">2.9%</td>
                <td className="p-3.5 text-[#888]">0.965</td>
                <td className="p-3.5 text-[#555]">4.82s</td>
                <td className="p-3.5 text-[#555]">0.42ms</td>
              </tr>

              <tr className={selectedModel === 'Random Forest' ? 'bg-[#141414] font-bold' : ''}>
                <td className="p-3.5 font-bold font-sans text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  Random Forest (Primary)
                </td>
                <td className="p-3.5 font-bold text-teal-400">98.7%</td>
                <td className="p-3.5 text-teal-300">97.9%</td>
                <td className="p-3.5 text-teal-300">98.5%</td>
                <td className="p-3.5 text-teal-300">98.2%</td>
                <td className="p-3.5 text-teal-400">1.8%</td>
                <td className="p-3.5 font-bold text-teal-300">0.994</td>
                <td className="p-3.5 text-[#555]">14.35s</td>
                <td className="p-3.5 text-[#555]">0.18ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Metric Bar Chart comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a1a]">
            <BarChart2 className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-serif italic text-white">
              Accuracy, Precision & Recall Chart
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.7} />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis domain={[90, 100]} stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161616',
                    borderColor: '#222',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#888' }} />
                <Bar dataKey="Accuracy" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precision" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROC Curves */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a1a]">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-serif italic text-white">
              ROC Curve (AUC = {currentModelData?.auc || 0.994})
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentModelData?.roc_curve || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.7} />
                <XAxis dataKey="fpr" name="False Positive Rate" stroke="#666" fontSize={10} />
                <YAxis dataKey="tpr" name="True Positive Rate" stroke="#666" fontSize={10} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161616',
                    borderColor: '#222',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  name="True Positive Rate"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Confusion Matrix */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-serif italic text-white">
              Multi-Class Confusion Matrix [{selectedModel}]
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#666]">Actual vs Predicted Matrix</span>
        </div>

        {currentModelData?.confusion_matrix && (
          <div className="overflow-x-auto border border-[#1a1a1a] rounded-xl p-4 bg-[#080808]">
            <div className="text-center text-[10px] uppercase font-mono tracking-widest text-[#666] mb-2">
              Predicted Class →
            </div>

            <table className="w-full border-collapse text-xs text-center font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-[#555] font-mono uppercase text-[10px] border-b border-[#1a1a1a]">Actual Class ↓</th>
                  {currentModelData.confusion_matrix.labels.map(label => (
                    <th key={label} className="p-2 text-white font-bold border-b border-[#1a1a1a]">{label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentModelData.confusion_matrix.matrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-2 font-bold text-white font-mono text-left border-r border-[#1a1a1a]">
                      {currentModelData.confusion_matrix.labels[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-3 border border-[#1a1a1a] font-bold ${
                            isDiagonal
                              ? 'bg-teal-950/60 text-teal-300 border-teal-800/40'
                              : val > 0
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                              : 'text-[#444]'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
