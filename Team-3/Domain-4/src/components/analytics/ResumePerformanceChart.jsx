import React from 'react';
import { FileText, Award, Eye, CheckCircle2 } from 'lucide-react';

export default function ResumePerformanceChart({ performance = [], title = "Resume Version Performance", filterBadge = null }) {
  const hasData = Array.isArray(performance) && performance.length > 0;

  return (
    <div className="surface-card p-6 rounded-3xl border border-white/[0.08] bg-[#12131a] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-xs text-content-muted mt-0.5">
            Conversion metrics by uploaded CV revision
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
          Upload and target multiple resume revisions to see performance comparisons.
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {performance.map((item, idx) => {
            const versionName = item.version_name || item.resume_version_id || `Revision #${idx + 1}`;
            const views = item.views ?? 0;
            const applies = item.applies ?? 0;
            const shortlists = item.shortlists ?? 0;
            const rawScore = item.avg_score ?? item.resume_score;
            const avgScore = typeof rawScore === 'number' ? Math.round(rawScore) : null;

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-white">{versionName}</span>
                  </div>
                  {avgScore !== null ? (
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-lg">
                      {avgScore}% ATS Score
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-content-subtle bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-lg">
                      ATS Score Pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-content-subtle block">Views</span>
                    <span className="text-xs font-bold text-white">{views}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-content-subtle block">Applies</span>
                    <span className="text-xs font-bold text-blue-400">{applies}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-content-subtle block">Shortlists</span>
                    <span className="text-xs font-bold text-purple-400">{shortlists}</span>
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
