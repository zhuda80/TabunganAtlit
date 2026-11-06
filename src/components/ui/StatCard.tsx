import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'blue' | 'emerald' | 'rose' | 'default';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  onClick,
}) => {
  const variantStyles = {
    gold: {
      card: 'border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 hover:border-amber-500/50',
      iconBox: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      valColor: 'text-amber-400',
    },
    blue: {
      card: 'border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 hover:border-blue-500/50',
      iconBox: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      valColor: 'text-white',
    },
    emerald: {
      card: 'border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 hover:border-emerald-500/50',
      iconBox: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      valColor: 'text-emerald-400',
    },
    rose: {
      card: 'border-rose-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 hover:border-rose-500/50',
      iconBox: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      valColor: 'text-rose-400',
    },
    default: {
      card: 'border-slate-800 bg-slate-900/90 hover:border-slate-700',
      iconBox: 'bg-slate-800 text-slate-300 border border-slate-700',
      valColor: 'text-white',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border backdrop-blur-sm transition-all duration-200 shadow-lg ${style.card} ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${style.valColor}`}>
              {value}
            </h3>
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className={`p-3.5 rounded-2xl shrink-0 shadow-inner ${style.iconBox}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className={trend.isPositive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
            {trend.value}
          </span>
          <span className="text-slate-500">vs periode lalu</span>
        </div>
      )}
    </div>
  );
};
