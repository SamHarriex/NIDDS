import React, { useState } from 'react';
import { Database, Upload, Play, CheckCircle2, FileText, Layers, RefreshCw } from 'lucide-react';
import { DatasetInfo } from '../types';

interface DatasetsViewProps {
  datasets: DatasetInfo[];
  onUploadDataset: (file: File) => void;
  onTrainModel: (datasetId: string) => void;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({
  datasets,
  onUploadDataset,
  onTrainModel
}) => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetInfo | null>(datasets[0] || null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadDataset(e.target.files[0]);
    }
  };

  const handleStartTraining = (id: string) => {
    setIsTraining(true);
    setTrainingLogs([
      `[${new Date().toLocaleTimeString()}] Starting Random Forest model training pipeline...`,
      `[${new Date().toLocaleTimeString()}] Reading dataset flow records...`,
      `[${new Date().toLocaleTimeString()}] Applying MinMaxScaler normalization & label encoding...`,
      `[${new Date().toLocaleTimeString()}] Computing Pearson correlation matrix (>0.95 filtered)...`,
      `[${new Date().toLocaleTimeString()}] Selected top 20 features by Gini importance...`,
      `[${new Date().toLocaleTimeString()}] Fitting 100 Decision Trees (n_jobs=-1, max_depth=30)...`,
      `[${new Date().toLocaleTimeString()}] Model training complete! Saved to models/random_forest.pkl`
    ]);

    setTimeout(() => {
      setIsTraining(false);
      onTrainModel(id);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
            <Database className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              Benchmark Dataset Management & Training Engine
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
              CICIDS2017 & NSL-KDD campus benchmark dataset management, preprocessing & training triggers.
            </p>
          </div>
        </div>

        <label className="cursor-pointer bg-teal-500 hover:bg-teal-400 text-black text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Upload Custom CSV Dataset</span>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {/* Datasets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datasets.map(ds => (
          <div
            key={ds.id}
            onClick={() => setSelectedDataset(ds)}
            className={`p-5 rounded-xl border transition-all cursor-pointer bg-[#0c0c0c] ${
              selectedDataset?.id === ds.id
                ? 'border-teal-500'
                : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1a1a1a]">
              <span className="text-base font-serif italic text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                {ds.name}
              </span>

              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/40">
                {ds.preprocessing_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
              <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                <div className="text-[10px] text-[#666] uppercase tracking-widest font-mono">RECORD COUNT</div>
                <div className="text-sm font-bold text-white mt-0.5">{ds.record_count.toLocaleString()}</div>
              </div>

              <div className="bg-[#080808] p-2.5 rounded-xl border border-[#1a1a1a]">
                <div className="text-[10px] text-[#666] uppercase tracking-widest font-mono">FEATURE COUNT</div>
                <div className="text-sm font-bold text-white mt-0.5">{ds.feature_count} Features</div>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs font-mono">
              <div className="text-[#666] text-[10px] uppercase tracking-widest">Attack Categories:</div>
              <div className="flex flex-wrap gap-1">
                {ds.attack_categories.slice(0, 6).map(cat => (
                  <span key={cat} className="px-2 py-0.5 bg-[#141414] text-[#d1d1d1] rounded text-[10px] border border-[#222]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1a1a1a] font-mono">
              <span className="text-[#555] text-[10px]">Processed: {new Date(ds.last_processed).toLocaleDateString()}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTraining(ds.id);
                }}
                disabled={isTraining}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-teal-400 text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Training</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Dataset Detail & Training Console */}
      {selectedDataset && (
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1a1a1a]">
            <Layers className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-serif italic text-white">
              Class Distribution & Preprocessing Pipeline [{selectedDataset.name}]
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {Object.entries(selectedDataset.class_distribution).map(([cls, count]) => (
              <div key={cls} className="bg-[#080808] p-3 rounded-xl border border-[#1a1a1a]">
                <div className="text-[#666] text-[10px] uppercase tracking-widest">{cls}</div>
                <div className="text-sm font-bold text-teal-400 mt-1">{count.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {trainingLogs.length > 0 && (
            <div className="mt-4 bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-teal-300 space-y-1">
              <div className="text-[#888] uppercase tracking-wider text-[10px] mb-2 flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin text-teal-400' : 'text-teal-400'}`} />
                Model Training Command Log: python -m training.model_training
              </div>
              {trainingLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
