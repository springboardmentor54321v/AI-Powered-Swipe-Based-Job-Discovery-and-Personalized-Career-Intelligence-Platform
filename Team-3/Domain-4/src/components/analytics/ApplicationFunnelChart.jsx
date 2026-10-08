import React from 'react';
import { Send, ArrowDown } from 'lucide-react';

export default function ApplicationFunnelChart({ funnel = {}, title = "Application Conversion Funnel", filterBadge = null }) {
  const stages = [
    { key: 'saved', label: 'Saved Roles', count: funnel.saved ?? 0, color: 'from-amber-500/80 to-amber-600/80', textColor: 'text-amber-400' },
    { key: 'applied', label: 'Applied', count: funnel.applied ?? 0, color: 'from-blue-500/80 to-blue-600/80', textColor: 'text-blue-400' },
    { key: 'shortlisted', label: 'Shortlisted', count: funnel.shortlisted ?? 0, color: 'from-emerald-500/80 to-emerald-600/80', textColor: 'text-emerald-400' },
    { key: 'interview', label: 'Interview Stage', count: funnel.interview ?? 0, color: 'from-purple-500/80 to-purple-600/80', textColor: 'text-purple-400' },
  ];

  const total = Math.max(...stages.map((s) => s.count), 1);
  const hasData = stages.some((s) => s.count > 0);

  return (
    <div className="surface-card p-6 rounded-3xl border border-white/[0.08] bg-[#12131a] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-xs text-content-muted mt-0.5">
            Stage progression and conversion ratios
          </p>
        </div>
        {filterBadge && (
          <span className="text-[10px] text-content-subtle bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
            {filterBadge}
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="py-12 text-center text-xs text-content-subtle border border-dashed border-white/[0.06] rounded-2xl">
          No application activity recorded in this period.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {stages.map((stg, idx) => {
            const widthPct = Math.max(12, Math.round((stg.count / total) * 100));
            const prevCount = idx > 0 ? stages[idx - 1].count : null;
            const convRate = prevCount && prevCount > 0 ? Math.round((stg.count / prevCount) * 100) : null;

            return (
              <div key={stg.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-content">{stg.label}</span>
                  <div className="flex items-center gap-2">
                    {convRate !== null && (
                      <span className="text-[10px] text-content-subtle">
                        {convRate}% of prior stage
                      </span>
                    )}
                    <span className={`font-extrabold ${stg.textColor}`}>{stg.count}</span>
                  </div>
                </div>

                {/* Funnel Progress Bar */}
                <div className="w-full bg-white/[0.04] h-6 rounded-xl overflow-hidden p-0.5 border border-white/[0.06]">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className={`h-full rounded-lg bg-gradient-to-r ${stg.color} transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-sm`}
                  >
                    {stg.count > 0 ? stg.count : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
