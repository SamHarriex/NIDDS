import React from 'react';
import { X, ShieldAlert, CheckCircle, Clock, Globe, ArrowRight, HelpCircle, FileText } from 'lucide-react';
import { Alert } from '../types';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onResolve
}) => {
  if (!alert) return null;

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

  const getMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case 'signature':
        return 'bg-[#161616] text-[#d1d1d1] border-[#333]';
      case 'machine learning':
        return 'bg-[#161616] text-teal-300 border-[#333]';
      default:
        return 'bg-[#161616] text-teal-300 border-[#333]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-500">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif italic text-white">Threat Forensics Inspection</h2>
                <span className="text-xs text-[#666] font-mono">[{alert.id}]</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono">Campus Network NIDS Analysis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#666] hover:text-white rounded-full hover:bg-[#161616] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#d1d1d1]">
          
          {/* Top Threat Badges Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#141414] p-3 rounded-xl border border-[#1f1f1f]">
              <div className="text-[10px] uppercase tracking-widest text-[#666] mb-1">Attack Type</div>
              <div className="text-sm font-semibold text-white">{alert.attack_type}</div>
            </div>

            <div className="bg-[#141414] p-3 rounded-xl border border-[#1f1f1f]">
              <div className="text-[10px] uppercase tracking-widest text-[#666] mb-1">Severity</div>
              <span className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadge(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>

            <div className="bg-[#141414] p-3 rounded-xl border border-[#1f1f1f]">
              <div className="text-[10px] uppercase tracking-widest text-[#666] mb-1">Method</div>
              <span className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getMethodBadge(alert.detection_method)}`}>
                {alert.detection_method}
              </span>
            </div>

            <div className="bg-[#141414] p-3 rounded-xl border border-[#1f1f1f]">
              <div className="text-[10px] uppercase tracking-widest text-[#666] mb-1">Confidence</div>
              <div className="text-sm font-mono font-bold text-teal-400">{alert.confidence}%</div>
            </div>
          </div>

          {/* Flow Network Coordinates */}
          <div className="bg-[#141414] p-4 rounded-xl border border-[#1f1f1f]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-mono mb-3">
              Network Flow Vector
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono bg-[#0c0c0c] p-3.5 rounded-lg border border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[10px] text-[#555]">SOURCE IP : PORT</div>
                  <div className="text-white font-bold">{alert.source_ip}:{alert.source_port}</div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-[#444] hidden sm:block" />

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[10px] text-[#555]">DESTINATION IP : PORT</div>
                  <div className="text-white font-bold">{alert.destination_ip}:{alert.destination_port}</div>
                </div>
              </div>

              <div className="sm:border-l sm:border-[#222] sm:pl-4">
                <div className="text-[10px] text-[#555]">PROTOCOL</div>
                <div className="text-teal-400 font-bold">{alert.protocol}</div>
              </div>
            </div>
          </div>

          {/* Description & Explainable AI Reason */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-mono mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                Incident Description
              </h4>
              <div className="p-3.5 bg-[#141414] border border-[#1f1f1f] rounded-xl text-xs text-[#d1d1d1] leading-relaxed">
                {alert.description}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-mono mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                Explainable AI Threat Attribution
              </h4>
              <div className="p-3.5 bg-teal-950/20 border border-teal-500/20 rounded-xl text-xs text-teal-200 leading-relaxed font-mono">
                {alert.explanation}
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between text-xs text-[#666] pt-2 border-t border-[#1f1f1f] font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamp: {new Date(alert.timestamp).toLocaleString()}</span>
            </div>

            <div>
              Status: <span className="text-white font-semibold">{alert.status}</span>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-end gap-3">
          {alert.status === 'New' && (
            <button
              onClick={() => {
                onAcknowledge(alert.id);
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-mono uppercase tracking-wider hover:bg-amber-900/50 transition-colors"
            >
              Acknowledge Alert
            </button>
          )}

          {alert.status !== 'Resolved' && (
            <button
              onClick={() => {
                onResolve(alert.id);
                onClose();
              }}
              className="px-5 py-2 rounded-full bg-white text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Resolved
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#161616] border border-[#222] text-[#d1d1d1] text-xs font-mono uppercase tracking-wider hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
