import React from 'react';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SkillGapChart({ matchedSkills = [], missingSkills = [], title = "Skill-Gap Intelligence" }) {
  const hasData = matchedSkills.length > 0 || missingSkills.length > 0;

  return (
    <div className="surface-card p-6 rounded-3xl border border-white/[0.08] bg-[#12131a] space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-xs text-content-muted mt-0.5">
            Skills matched against your targeted job requisitions
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="py-12 text-center text-xs text-content-subtle border border-dashed border-white/[0.06] rounded-2xl">
          Upload a resume and swipe on jobs to calculate personalized skill gaps.
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Matched Skills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Candidate Strengths ({matchedSkills.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length === 0 ? (
                <span className="text-xs text-content-subtle">No verified skills yet.</span>
              ) : (
                matchedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                  >
                    ✓ {sk}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>In-Demand Skill Opportunities ({missingSkills.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length === 0 ? (
                <span className="text-xs text-content-subtle">Great job! No major skill gaps identified.</span>
              ) : (
                missingSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40"
                  >
                    + {sk}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
