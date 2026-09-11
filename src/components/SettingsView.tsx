import React, { useState, useEffect } from 'react';
import { Settings, Shield, Terminal, RefreshCw, Save, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import { SignatureRule } from '../types';

interface SettingsViewProps {
  onToggleDemoMode: () => void;
  demoMode: boolean;
  onResetSystem: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onToggleDemoMode,
  demoMode,
  onResetSystem
}) => {
  const [rules, setRules] = useState<SignatureRule[]>([]);
  const [activeLogTab, setActiveLogTab] = useState<'application' | 'detection' | 'errors'>('application');
  const [logs, setLogs] = useState<{ application: string[]; detection: string[]; errors: string[] }>({
    application: [],
    detection: [],
    errors: []
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Fetch rules & logs
    fetch('/api/rules')
      .then(res => res.json())
      .then(data => setRules(data))
      .catch(console.error);

    fetch('/api/logs')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(console.error);
  }, []);

  const handleRuleToggle = (id: string, currentEnabled: boolean) => {
    fetch(`/api/rules/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !currentEnabled })
    })
      .then(res => res.json())
      .then(updated => {
        setRules(prev => prev.map(r => r.id === id ? updated : r));
      })
      .catch(console.error);
  };

  const handleThresholdChange = (id: string, newThreshold: number) => {
    fetch(`/api/rules/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold: newThreshold })
    })
      .then(res => res.json())
      .then(updated => {
        setRules(prev => prev.map(r => r.id === id ? updated : r));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-400">
            <Settings className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">
              Signature Engine Rules & System Settings
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[#666] font-mono mt-0.5">
              Configure signature thresholds, view application logs, and control Demo Mode.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/40 px-3 py-1.5 rounded-full font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Rule Saved
          </div>
        )}
      </div>

      {/* Signature Rules Editor */}
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-serif italic text-white">
              Configurable Signature Rules (rules/signatures.json)
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#666]">Stored separately from code</span>
        </div>

        <div className="space-y-3">
          {rules.map((rule, idx) => (
            <div
              key={`${rule.id}-${idx}`}
              className="p-4 bg-[#080808] border border-[#1a1a1a] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-sm font-bold text-white font-sans">{rule.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#161616] border border-[#222] text-[#888]">
                    {rule.id}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/40">
                    {rule.category}
                  </span>
                </div>
                <p className="text-xs text-[#888] font-mono">{rule.description}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#666] text-[10px] uppercase tracking-wider">Threshold:</span>
                  <input
                    type="number"
                    value={rule.threshold}
                    onChange={e => handleThresholdChange(rule.id, parseInt(e.target.value) || 1)}
                    className="w-20 bg-[#161616] border border-[#222] rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  onClick={() => handleRuleToggle(rule.id, rule.enabled)}
                  className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
                    rule.enabled
                      ? 'bg-teal-950/60 border-teal-800/40 text-teal-300'
                      : 'bg-[#161616] border-[#222] text-[#555]'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Mode & System Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Demo Mode Card */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-base font-serif italic text-white">Campus Demo Mode</h3>
          <p className="text-xs text-[#888] font-mono">
            Enables synthetic traffic replay and automated security event simulation when offline.
          </p>
          <button
            onClick={onToggleDemoMode}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider border transition-all ${
              demoMode
                ? 'bg-teal-500 text-black border-teal-400 font-bold'
                : 'bg-[#161616] border-[#222] text-[#888]'
            }`}
          >
            Demo Mode is currently {demoMode ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Database Reset Card */}
        <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-base font-serif italic text-white">Reset System Database</h3>
          <p className="text-xs text-[#888] font-mono">
            Re-initializes SQLite database tables to original benchmark baseline values.
          </p>
          <button
            onClick={onResetSystem}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-mono uppercase tracking-wider transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Database to Benchmark State</span>
          </button>
        </div>

      </div>

      {/* System Logs Viewer */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-xl">
        <div className="bg-[#0e0e0e] p-3.5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#d1d1d1]">System Logs Viewer (logs/)</span>
          </div>

          <div className="flex items-center gap-2">
            {(['application', 'detection', 'errors'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveLogTab(tab)}
                className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${
                  activeLogTab === tab
                    ? 'bg-teal-500 text-black font-bold'
                    : 'text-[#666] hover:text-[#d1d1d1] hover:bg-[#161616]'
                }`}
              >
                {tab}.log
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-1 text-[#d1d1d1]">
          {logs[activeLogTab]?.length === 0 ? (
            <div className="text-[#555] italic">Log file is currently empty.</div>
          ) : (
            logs[activeLogTab]?.map((line, idx) => (
              <div key={idx} className="hover:bg-[#121212] p-0.5 rounded">{line}</div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
