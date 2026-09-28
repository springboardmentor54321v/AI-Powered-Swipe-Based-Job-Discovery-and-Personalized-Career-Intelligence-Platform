import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Chip from '../common/Chip';
import Button from '../common/Button';

export default function ParsedSkillsPreview({
  skills = [],
  versionLabel,
  extractionStatus = 'completed',
  onNavigateToAts,
}) {
  const isPending = extractionStatus === 'pending';

  return (
    <div className="surface-card space-y-4 border border-outline-variant">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-content">
            Extracted Skills & Capabilities
          </h3>
          {versionLabel && (
            <span className="text-[11px] text-content-subtle font-normal truncate max-w-[200px]">
              ({versionLabel})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPending ? (
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full animate-pulse">
              Parsing skills in background...
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Extracted</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-content-muted leading-relaxed">
        {isPending
          ? 'Your resume was successfully uploaded and is currently being processed by the extraction pipeline. Parsing skills in background...'
          : 'These skills were parsed directly from your resume text and are used to compute your ATS compatibility score against live openings:'}
      </p>

      {skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {skills.map((item, idx) => {
            const skillName = typeof item === 'string' ? item : item.skill_name || item.name;
            const confidence = typeof item === 'object' && item.confidence ? Math.round(item.confidence) : null;
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-primary-container/40 text-primary-onContainer border border-primary/25"
              >
                <span>{skillName}</span>
                {confidence && (
                  <span className="text-[10px] text-primary/70 font-mono">
                    {confidence}%
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center text-xs text-content-subtle">
          {isPending ? 'Parsing skills in background...' : 'No skills detected in this version.'}
        </div>
      )}

      {onNavigateToAts && (
        <div className="pt-3 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-content-subtle">
            Ready to test against live job openings?
          </span>
          <Button
            type="button"
            variant="filled"
            size="sm"
            icon={ArrowRight}
            onClick={onNavigateToAts}
            className="w-full sm:w-auto"
          >
            Launch ATS Diagnostics
          </Button>
        </div>
      )}
    </div>
  );
}
