import React from 'react';
import { CheckCircle2, AlertTriangle, Check, AlertCircle } from 'lucide-react';
import Chip from '../common/Chip';

export default function SkillGapList({
  matchedSkills = [],
  missingSkills = [],
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Matched Skills Panel */}
      <div className="surface-card p-4 sm:p-5 space-y-3 border border-outline-variant">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-content">
              Matched Skills Detected ({matchedSkills.length})
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            Verified
          </span>
        </div>

        <p className="text-xs text-content-muted leading-relaxed">
          These technical competencies are present in both your selected resume and the target requisition:
        </p>

        {matchedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {matchedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-950/30 text-emerald-300 border border-emerald-800/40"
              >
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center text-xs text-content-subtle">
            No overlapping skills detected for this pair.
          </div>
        )}
      </div>

      {/* 2. Missing Skills Panel */}
      <div className="surface-card p-4 sm:p-5 space-y-3 border border-outline-variant">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-content">
              Missing Required Skills ({missingSkills.length})
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
            Action Recommended
          </span>
        </div>

        <p className="text-xs text-content-muted leading-relaxed">
          The job requires these capabilities, but our parser did not find them in your resume:
        </p>

        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-950/30 text-amber-300 border border-amber-800/40"
              >
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-elevated/40 border border-dashed border-emerald-900/40 text-center text-xs text-emerald-300">
            Great job! You have all required skills for this opening.
          </div>
        )}
      </div>
    </div>
  );
}
