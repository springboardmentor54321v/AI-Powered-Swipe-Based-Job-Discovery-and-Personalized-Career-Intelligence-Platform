import React from 'react';
import { Layers, FileText, Plus } from 'lucide-react';
import ResumeVersionCard from './ResumeVersionCard';
import Button from '../common/Button';

export default function ResumeVersionList({
  versions = [],
  activeVersionId,
  selectedForAtsId,
  onSelectForAts,
  onMakeActive,
  onViewSkills,
  onAddNewClick,
}) {
  if (!versions || versions.length === 0) {
    return (
      <div className="surface-card p-8 sm:p-12 text-center space-y-3 border-dashed border-outline-variant">
        <FileText className="w-10 h-10 text-content-subtle mx-auto" />
        <h3 className="text-base font-bold text-content">No Resume Versions Uploaded</h3>
        <p className="text-xs text-content-muted max-w-sm mx-auto">
          Upload your primary resume above to enable automated skill parsing, ATS benchmarking, and personalized job matching.
        </p>
        {onAddNewClick && (
          <div className="pt-2">
            <Button
              type="button"
              variant="filled"
              size="sm"
              icon={Plus}
              onClick={onAddNewClick}
            >
              Upload First Version
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-content uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Resume Versions ({versions.length})</span>
        </div>
        <span className="text-[11px] text-content-subtle">
          Latest uploads automatically set as default
        </span>
      </div>

      <div className="space-y-2.5">
        {versions.map((ver) => (
          <ResumeVersionCard
            key={ver.version_id}
            version={ver}
            isActive={ver.version_id === activeVersionId || ver.is_active}
            isSelectedForAts={ver.version_id === selectedForAtsId}
            onSelectForAts={onSelectForAts}
            onMakeActive={onMakeActive}
            onViewSkills={onViewSkills}
          />
        ))}
      </div>
    </div>
  );
}
