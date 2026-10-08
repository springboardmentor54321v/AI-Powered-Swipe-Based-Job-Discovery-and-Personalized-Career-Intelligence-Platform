import React from 'react';
import { TrendingUp, Building2, Rocket } from 'lucide-react';

export default function HiringTrendChart({ trends = {}, title = "Market Hiring Trends & Skill Demand", filterBadge = null }) {
  const topSkills = Array.isArray(trends.top_skills)
    ? trends.top_skills
    : Array.isArray(trends.topSkills)
    ? trends.topSkills
    : Array.isArray(trends.top_in_demand_skills)
    ? trends.top_in_demand_skills
    : [];

  const rawShare = typeof trends.startup_percentage === 'number'
    ? trends.startup_percentage
    : typeof trends.hiring_activity_by_company_type?.startup_share_pct === 'number'
    ? trends.hiring_activity_by_company_type.startup_share_pct
    : null;

  const hasShare = rawShare !== null;
  const startupShare = hasShare ? Math.round(rawShare) : null;
  const mncShare = hasShare ? 100 - startupShare : null;

  const maxCount = Math.max(
    ...topSkills.map((s) => (typeof s === 'object' ? (s.count ?? s.demand_count ?? 1) : 1)),
    1
  );

  const hasData = topSkills.length > 0 || hasShare;
  const isEngineError = Boolean(trends.error);

  return (
    <div className="surface-card p-6 rounded-3xl border border-white/[0.08] bg-[#12131a] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Active ecosystem requisitions across tech industry hubs
          </p>
        </div>
        {filterBadge && (
          <span className="text-[10px] text-content-subtle bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
            {filterBadge}
          </span>
        )}
      </div>

      {isEngineError && (
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs flex items-start gap-2">
          <span className="font-bold shrink-0">Note:</span>
          <span>
            {trends.error} — Backend intelligence engine unreachable in current Linux environment (cross-domain dependency on Domain-1/Domain-3).
          </span>
        </div>
      )}

      {!hasData ? (
        <div className="py-12 text-center text-xs text-content-subtle border border-dashed border-white/[0.06] rounded-2xl">
          No aggregate market trends data currently reported by the intelligence engine.
        </div>
      ) : (
        <>
          {/* Startup vs MNC Ratio */}
          {hasShare && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Startup Requisitions ({startupShare}%)</span>
                </span>
                <span className="flex items-center gap-1.5 font-bold text-blue-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>MNC & Enterprise ({mncShare}%)</span>
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-white/[0.05] overflow-hidden flex">
                <div
                  style={{ width: `${startupShare}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-l-full"
                  title={`Startup: ${startupShare}%`}
                />
                <div
                  style={{ width: `${mncShare}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-full"
                  title={`MNC: ${mncShare}%`}
                />
              </div>
            </div>
          )}

          {/* Top Skills Demand */}
          {topSkills.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-content-subtle uppercase tracking-wider block">
                Most Demanded Competencies in Job Descriptions
              </span>

              <div className="space-y-2.5">
                {topSkills.map((item, idx) => {
                  const skillName = typeof item === 'string' ? item : (item.skill || item.name || 'Skill');
                  const count = typeof item === 'object' ? (item.count ?? item.demand_count ?? 0) : 0;
                  const barWidth = Math.max(15, Math.round((count / maxCount) * 100));

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{skillName}</span>
                        {count > 0 && (
                          <span className="text-[11px] text-content-muted font-bold">{count} postings</span>
                        )}
                      </div>
                      <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden border border-white/[0.04]">
                        <div
                          style={{ width: `${barWidth}%` }}
                          className="h-full bg-primary rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
