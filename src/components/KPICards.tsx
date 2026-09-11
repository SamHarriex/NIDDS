import React from 'react';
import { Activity, ShieldAlert, AlertTriangle, CheckCircle, Target, Percent, Zap } from 'lucide-react';
import { DashboardStats } from '../types';

interface KPICardsProps {
  stats: DashboardStats | null;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'TOTAL TRAFFIC',
      value: stats.total_traffic.toLocaleString(),
      subtitle: 'Processed Packets',
      icon: Activity,
      color: 'text-teal-400'
    },
    {
      title: 'THREATS DETECTED',
      value: stats.total_alerts.toLocaleString(),
      subtitle: 'Total Security Events',
      icon: ShieldAlert,
      color: 'text-rose-400'
    },
    {
      title: 'ACTIVE THREATS',
      value: stats.active_threats.toLocaleString(),
      subtitle: 'Unresolved Incidents',
      icon: AlertTriangle,
      color: 'text-amber-400'
    },
    {
      title: 'CRITICAL ALERTS',
      value: stats.critical_alerts.toLocaleString(),
      subtitle: 'High Severity Threats',
      icon: Zap,
      color: 'text-rose-500'
    },
    {
      title: 'BENIGN TRAFFIC',
      value: `${stats.benign_traffic_pct}%`,
      subtitle: 'Normal Operations',
      icon: CheckCircle,
      color: 'text-teal-500'
    },
    {
      title: 'MODEL ACCURACY',
      value: `${stats.detection_accuracy}%`,
      subtitle: 'Random Forest Ensemble',
      icon: Target,
      color: 'text-teal-400'
    },
    {
      title: 'FALSE POSITIVES',
      value: `${stats.false_positive_rate}%`,
      subtitle: 'Benchmark Evaluation',
      icon: Percent,
      color: 'text-[#888]'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl border border-[#1a1a1a] bg-[#0c0c0c] flex flex-col justify-between transition-all hover:border-[#2a2a2a]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-[#666]">
                {card.title}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color}`} />
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-[10px] text-[#555] font-mono mt-1 uppercase">
                {card.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
