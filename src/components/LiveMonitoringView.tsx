import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Zap,
  Activity,
  Radio,
  Clock,
  ShieldAlert,
  Terminal,
  Cpu
} from 'lucide-react';
import { LiveStats, TrafficLog } from '../types';

interface LiveMonitoringViewProps {
  stats: LiveStats | null;
  trafficLogs: TrafficLog[];
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReplayDataset: () => void;
  onGenerateTestTraffic: () => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  stats,
  trafficLogs,
  onStart,
  onPause,
  onStop,
  onReplayDataset,
  onGenerateTestTraffic
}) => {
  const [logs, setLogs] = useState<TrafficLog[]>([]);

  useEffect(() => {
    setLogs(trafficLogs);
  }, [trafficLogs]);

  return (
    <div className="space-y-6">
      
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
            <Radio className="w-5 h-5 text-teal-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              Live Network Traffic Monitoring & Simulation Engine
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
              Real-time packet inspection, ML detection pipeline, and campus network simulation.
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-500 hover:bg-teal-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start</span>
          </button>

          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-amber-300 text-xs font-mono uppercase tracking-wider transition-all"
          >
            <Pause className="w-3 h-3 fill-current" />
            <span>Pause</span>
          </button>

          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-rose-300 text-xs font-mono uppercase tracking-wider transition-all"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>

          <button
            onClick={onReplayDataset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] border border-[#222] text-[#d1d1d1] text-xs font-mono uppercase tracking-wider transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay</span>
          </button>

          <button
            onClick={onGenerateTestTraffic}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-mono uppercase tracking-wider transition-all"
          >
            <Zap className="w-3 h-3" />
            <span>Inject Attack</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Display Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#666]">Traffic Rate</div>
          <div className="text-2xl font-serif text-teal-400 mt-1">
            {stats?.traffic_rate_pps || 1240} <span className="text-[10px] font-mono text-[#555]">pkts/s</span>
          </div>
          <div className="text-[10px] text-[#555] font-mono mt-0.5">Campus Core Link</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#666]">Packets Processed</div>
          <div className="text-2xl font-serif text-white mt-1">
            {stats?.packets_processed.toLocaleString() || '1,284,392'}
          </div>
          <div className="text-[10px] text-[#555] font-mono mt-0.5">Total Captured</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#666]">Flow Records</div>
          <div className="text-2xl font-serif text-white mt-1">
            {stats?.records_processed.toLocaleString() || '84,210'}
          </div>
          <div className="text-[10px] text-[#555] font-mono mt-0.5">Extracted Flows</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#666]">Threats Detected</div>
          <div className="text-2xl font-serif text-rose-400 mt-1">
            {stats?.threats_detected.toLocaleString() || '4,821'}
          </div>
          <div className="text-[10px] text-[#555] font-mono mt-0.5">Threat Detections</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#666]">Accuracy Rate</div>
          <div className="text-2xl font-serif text-teal-400 mt-1">
            {stats?.detection_rate_pct || 99.1}%
          </div>
          <div className="text-[10px] text-[#555] font-mono mt-0.5">Model Ensemble</div>
        </div>

        <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#666]">Processing Latency</div>
          <div className="text-2xl font-serif text-teal-300 mt-1">
            {stats?.avg_latency_ms || 0.14} <span className="text-[10px] font-mono text-[#555]">ms</span>
          </div>
          <div className="text-[10px] text-[#555] font-mono mt-0.5">Per-Packet Ingestion</div>
        </div>
      </div>

      {/* Live Stream Terminal & Packet Inspector */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-xl">
        <div className="bg-[#0e0e0e] p-3.5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#d1d1d1]">
              LIVE_INSPECTION_STREAM [SIG_ENGINE + RANDOM_FOREST_VOTING]
            </span>
          </div>

          <span className="text-[10px] text-[#666] font-mono uppercase tracking-widest">
            Auto-scroll: ACTIVE
          </span>
        </div>

        <div className="p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
          {logs.map((log, idx) => (
            <div
              key={`${log.id}-${idx}`}
              className={`p-2.5 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                log.is_malicious
                  ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                  : 'bg-[#0f0f0f] border-[#1f1f1f] text-[#d1d1d1]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[#555] text-[10px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-mono ${log.is_malicious ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' : 'bg-teal-950/60 text-teal-300 border border-teal-800/40'}`}>
                  {log.classification}
                </span>
                <span className="text-white font-semibold">{log.source_ip}:{log.source_port} → {log.destination_ip}:{log.destination_port}</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#888] font-mono">
                <span>Pkts: {log.packet_count}</span>
                <span>Bytes: {log.bytes.toLocaleString()}</span>
                <span>Latency: {log.latency_ms}ms</span>
                <span className="text-teal-400 font-bold">{log.confidence}% Conf</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
