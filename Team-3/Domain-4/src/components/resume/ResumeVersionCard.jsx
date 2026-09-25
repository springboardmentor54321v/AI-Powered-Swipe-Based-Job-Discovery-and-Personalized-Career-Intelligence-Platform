import React from 'react';
import { FileText, CheckCircle2, Award, Clock, Hash, Check } from 'lucide-react';
import Button from '../common/Button';

export default function ResumeVersionCard({
  version,
  isActive = false,
  isSelectedForAts = false,
  onSelectForAts,
  onMakeActive,
  onViewSkills,
}) {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const isDocx = version.original_filename?.toLowerCase().endsWith('.docx');
  const skillCount = version.extracted_skills?.length || 0;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isActive
          ? 'bg-[#181922] border-primary/50 shadow-md ring-1 ring-primary/20'
          : isSelectedForAts
          ? 'bg-[#161720] border-emerald-500/40'
          : 'bg-[#15161d] border-outline-variant hover:border-[#3b3e4f]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Icon, Filename, Metadata */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isActive
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-surface-elevated text-content-muted border-outline-variant'
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-content truncate max-w-[200px] sm:max-w-xs">
                {version.original_filename}
              </span>

              {/* Version pill */}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-content border border-white/[0.08]">
                v{version.version_number}
              </span>

              {/* Active Badge */}
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Default Active</span>
                </span>
              )}

              {/* Selected for ATS badge */}
              {isSelectedForAts && !isActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary-container/40 border border-primary/30 px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3" />
                  <span>Selected for ATS</span>
                </span>
              )}
            </div>

            {/* Label */}
            {version.label && (
              <p className="text-xs text-primary font-medium truncate">
                {version.label}
              </p>
            )}

            {/* Meta attributes */}
            <div className="flex items-center gap-3 text-[11px] text-content-subtle flex-wrap pt-0.5">
              <span>{isDocx ? 'DOCX Document' : 'PDF Document'}</span>
              <span>•</span>
              <span>{formatFileSize(version.file_size_bytes)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(version.uploaded_at)}
              </span>
              <span>•</span>
              <span>{skillCount} Skills Detected</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
          {onViewSkills && (
            <Button
              type="button"
              variant="tonal"
              size="sm"
              onClick={() => onViewSkills(version)}
              className="text-xs"
            >
              Skills ({skillCount})
            </Button>
          )}

          {onSelectForAts && (
            <Button
              type="button"
              variant={isSelectedForAts ? 'filled' : 'outlined'}
              size="sm"
              icon={Award}
              onClick={() => onSelectForAts(version)}
              className={`text-xs ${isSelectedForAts ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}`}
            >
              {isSelectedForAts ? 'Scoring Active' : 'Use in ATS'}
            </Button>
          )}

          {!isActive && onMakeActive && (
            <Button
              type="button"
              variant="text"
              size="sm"
              icon={Check}
              onClick={() => onMakeActive(version)}
              className="text-xs text-content-muted hover:text-content"
              title="Set as candidate default resume"
            >
              Set Default
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
