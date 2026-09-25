import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import Button from '../components/common/Button';
import ResumeDropzone from '../components/resume/ResumeDropzone';
import ResumeVersionList from '../components/resume/ResumeVersionList';
import ParsedSkillsPreview from '../components/resume/ParsedSkillsPreview';
import resumeService from '../services/resume';

export default function ResumeUploadPage() {
  const navigate = useNavigate();

  // Version history state from LIVE API
  const [versions, setVersions] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  // Active default version and currently inspected version
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [inspectedVersionId, setInspectedVersionId] = useState(null);

  // Upload UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Load resumes from live API
  const fetchResumeList = useCallback(async (preferSelectedId = null) => {
    setIsLoadingList(true);
    setListError('');

    try {
      const data = await resumeService.listResumes();
      const loadedVersions = Array.isArray(data?.versions) ? data.versions : [];
      setVersions(loadedVersions);

      if (loadedVersions.length > 0) {
        // Determine active/inspected ID
        const targetId = preferSelectedId || activeVersionId;
        const matched = loadedVersions.find((v) => v.version_id === targetId);
        const defaultActive = loadedVersions.find((v) => v.is_active) || loadedVersions[0];

        const chosenId = matched ? matched.version_id : defaultActive.version_id;
        setActiveVersionId(chosenId);
        setInspectedVersionId((prev) => (prev && loadedVersions.some((v) => v.version_id === prev) ? prev : chosenId));
      } else {
        setActiveVersionId(null);
        setInspectedVersionId(null);
        resumeService.setActiveResume(null);
      }
    } catch (err) {
      setListError(err.message || 'Unable to load resumes from the server. Please check your connection.');
      setVersions([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [activeVersionId]);

  useEffect(() => {
    fetchResumeList();
  }, [fetchResumeList]);

  // Find currently inspected version
  const inspectedVersion = versions.find((v) => v.version_id === inspectedVersionId) || versions[0];

  // Fetch detailed extracted skills when inspecting a version
  const handleViewSkills = async (ver) => {
    setInspectedVersionId(ver.version_id);
    if (!ver.extracted_skills || ver.extracted_skills.length === 0) {
      try {
        const detail = await resumeService.getVersionDetail(ver.resume_id, ver.version_id);
        if (detail && detail.extracted_skills?.length > 0) {
          setVersions((prev) =>
            prev.map((v) => (v.version_id === ver.version_id ? { ...v, ...detail } : v))
          );
        }
      } catch {
        // If version detail endpoint is unavailable or fails, keep current version in view
      }
    }
  };

  // Live upload handler
  const handleUploadNewVersion = async (file, customLabel) => {
    setIsUploading(true);
    setUploadError('');
    setUploadSuccessMessage('');

    try {
      const uploadedVersion = await resumeService.uploadResume(file, customLabel);

      // Refresh list from server to reflect the newly persisted version
      await fetchResumeList(uploadedVersion.version_id);

      setShowUploadZone(false);
      const versionNum = uploadedVersion.version_number ? `Version ${uploadedVersion.version_number}` : 'new version';
      setUploadSuccessMessage(`Successfully uploaded "${uploadedVersion.original_filename}" as ${versionNum}!`);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Local version selection for ATS evaluation
  const handleSelectForAts = (ver) => {
    navigate(`/dashboard/job-seeker/ats?version_id=${ver.version_id}`);
  };

  // Set local active/default version (frontend state & session synchronization)
  const handleMakeActive = (ver) => {
    setActiveVersionId(ver.version_id);
    resumeService.setActiveResume({
      resume_id: ver.resume_id,
      version_id: ver.version_id,
      version_number: ver.version_number,
      filename: ver.original_filename,
      parsed_skills: (ver.extracted_skills || []).map((s) => s.skill_name),
      uploaded_at: ver.uploaded_at,
      label: ver.label,
      extraction_status: ver.extraction_status,
    });
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        is_active: v.version_id === ver.version_id,
      }))
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>ATS Intelligence Studio • Milestone 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content">
            Resume & Version Management
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Upload multi-version resumes, inspect automated skill extraction, and benchmark your readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant={showUploadZone ? 'tonal' : 'filled'}
            size="sm"
            icon={Plus}
            onClick={() => {
              setShowUploadZone((prev) => !prev);
              setUploadError('');
              setUploadSuccessMessage('');
            }}
          >
            {showUploadZone ? 'Close Upload' : 'Upload New Version'}
          </Button>
          <Button
            type="button"
            variant="tonal"
            size="sm"
            icon={RotateCcw}
            loading={isLoadingList}
            onClick={() => fetchResumeList()}
            title="Refresh resume list from server"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Global List Error Banner */}
      {listError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start justify-between gap-3 text-xs text-red-300 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-200">Unable to load resume data</p>
              <p className="mt-0.5">{listError}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="tonal"
            size="sm"
            onClick={() => fetchResumeList()}
            className="shrink-0 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start justify-between gap-3 text-xs text-red-300 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-200">Upload failed: </span>
              <span>{uploadError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadError('')}
            className="text-red-400 hover:text-red-200 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {uploadSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccessMessage('')}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Zone (Expandable or Default if 0 versions) */}
      {(showUploadZone || (!isLoadingList && versions.length === 0)) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-content flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Upload Document (PDF or DOCX)</span>
            </h2>
            {versions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowUploadZone(false)}
                className="text-xs text-content-subtle hover:text-content"
              >
                Cancel
              </button>
            )}
          </div>
          <ResumeDropzone
            onUpload={handleUploadNewVersion}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoadingList ? (
        <div className="surface-card p-12 text-center space-y-3 border border-outline-variant">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <h3 className="text-sm font-bold text-content">Loading Resume & Version History...</h3>
          <p className="text-xs text-content-subtle max-w-sm mx-auto">
            Retrieving your stored documents and extracted competencies from the Resume Service.
          </p>
        </div>
      ) : (
        <>
          {/* Active Resume Showcase Banner */}
          {inspectedVersion && (
            <ParsedSkillsPreview
              skills={inspectedVersion.extracted_skills || []}
              versionLabel={`v${inspectedVersion.version_number} • ${inspectedVersion.original_filename}`}
              extractionStatus={inspectedVersion.extraction_status || 'completed'}
              onNavigateToAts={() => handleSelectForAts(inspectedVersion)}
            />
          )}

          {/* Version History List */}
          <ResumeVersionList
            versions={versions}
            activeVersionId={activeVersionId}
            selectedForAtsId={inspectedVersionId}
            onSelectForAts={handleSelectForAts}
            onMakeActive={handleMakeActive}
            onViewSkills={handleViewSkills}
            onAddNewClick={() => setShowUploadZone(true)}
          />
        </>
      )}

      {/* Security & System Info Strip */}
      <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-content-subtle">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Resumes are encrypted at rest and accessible strictly by your authenticated account.
          </span>
        </div>
        <span className="font-mono text-[10px] text-content-subtle">
          API Gateway: /api/v1/resumes/
        </span>
      </div>
    </div>
  );
}
