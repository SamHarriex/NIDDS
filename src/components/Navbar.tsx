import React from 'react';
import { Shield, Radio, Activity, AlertTriangle, Menu, RefreshCw, Zap } from 'lucide-react';
import { DashboardStats } from '../types';

interface NavbarProps {
  stats: DashboardStats | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleDemoMode: () => void;
  onToggleMonitoring: () => void;
  onResetSystem: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  activeTab,
  onTabChange,
  onToggleDemoMode,
  onToggleMonitoring,
  onResetSystem,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  return (
    <header className="bg-[#0a0a0a] border-b border-[#1f1f1f] sticky top-0 z-40 text-[#d1d1d1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#666] hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#222] flex items-center justify-center text-teal-500 group-hover:border-teal-500/50 transition-colors">
                <Shield className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif italic text-2xl text-white tracking-tight">Campus NIDS</span>
                  <span className="bg-[#161616] border border-[#222] text-teal-400 text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full">
                    v3.0
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#666] hidden sm:block">
                  University Threat Operations Center
                </p>
              </div>
            </div>
          </div>

          {/* Quick Indicators & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161616] border border-[#222] text-xs">
              <span className={`w-2 h-2 rounded-full ${stats?.is_monitoring ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-white text-[11px] uppercase tracking-wider font-medium">
                {stats?.is_monitoring ? 'Live Stream' : 'Paused'}
              </span>
            </div>

            {/* Demo Mode Badge Toggle */}
            <button
              onClick={onToggleDemoMode}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                stats?.demo_mode
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
                  : 'bg-[#161616] border-[#222] text-[#666] hover:text-white'
              }`}
              title="Toggle Demo Mode with synthetic campus traffic"
            >
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Demo: {stats?.demo_mode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Quick Threat Alert Counter */}
            {stats && stats.active_threats > 0 && (
              <button
                onClick={() => onTabChange('alerts')}
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-300 font-medium hover:bg-rose-900/50 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span className="text-[11px] font-mono tracking-wider">{stats.active_threats} Threats</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              onClick={onResetSystem}
              className="p-2 text-[#666] hover:text-white hover:bg-[#161616] rounded-full border border-transparent hover:border-[#222] transition-colors"
              title="Reset Database to Benchmark Baseline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
