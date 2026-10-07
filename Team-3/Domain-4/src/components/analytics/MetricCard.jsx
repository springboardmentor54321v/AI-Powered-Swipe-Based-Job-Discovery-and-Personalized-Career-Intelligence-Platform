import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}) {
  const colorMap = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    emerald: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    purple: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
    amber: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    blue: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
  };

  const badgeColor = colorMap[color] || colorMap.primary;

  return (
    <div className="surface-card p-5 sm:p-6 rounded-3xl border border-white/[0.08] bg-[#12131a] flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-content-subtle tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border shrink-0 ${badgeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value !== undefined && value !== null ? value : '—'}
          </span>
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
              trend.isPositive ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
            }`}>
              {trend.isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {trend.text}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-content-muted">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
