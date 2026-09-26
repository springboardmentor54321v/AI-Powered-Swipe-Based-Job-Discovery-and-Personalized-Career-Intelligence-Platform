import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Award, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Layers,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Building2
} from 'lucide-react';
import Button from '../../../components/common/Button';
import AtsScoreGauge from '../../../components/ats/AtsScoreGauge';
import SkillGapList from '../../../components/ats/SkillGapList';
import KeywordGapList from '../../../components/ats/KeywordGapList';
import SuggestionsPlaceholder from '../../../components/suggestions/SuggestionsPlaceholder';
import resumeService from '../../../services/resume';
import jobService from '../../../services/jobs';
import atsService from '../../../services/ats';
import suggestionsService from '../../../services/suggestions';

export default function JobSeekerAtsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resume versions loaded from live Resume Service
  const [resumeVersions, setResumeVersions] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  // Job catalog loaded from real M2 Job Service
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Selected parameters
  const queryVersionId = searchParams.get('version_id');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  // Analysis state: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [evaluation, setEvaluation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Live Suggestions state (POST /api/v1/suggestions/)
  const [suggestionsData, setSuggestionsData] = useState({ source: 'rule_based', suggestions: [] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  // 1. Fetch live resume versions on mount
  useEffect(() => {
    setIsLoadingResumes(true);
    resumeService.listResumes()
      .then((data) => {
        const loadedVersions = Array.isArray(data?.versions) ? data.versions : [];
        setResumeVersions(loadedVersions);

        if (loadedVersions.length > 0) {
          // Select query version if provided, otherwise active or first version
          if (queryVersionId && loadedVersions.some((v) => v.version_id === queryVersionId)) {
            setSelectedVersionId(queryVersionId);
          } else {
            const defaultActive = loadedVersions.find((v) => v.is_active) || loadedVersions[0];
            setSelectedVersionId(defaultActive.version_id);
          }
        }
      })
      .catch(() => {
        setResumeVersions([]);
      })
      .finally(() => {
        setIsLoadingResumes(false);
      });
  }, [queryVersionId]);

  // 2. Fetch live jobs on mount from jobService
  useEffect(() => {
    setIsLoadingJobs(true);
    jobService.listJobs({ limit: 20 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.jobs || [];
        setJobs(list);
        if (list.length > 0) {
          setSelectedJobId((prev) => prev || String(list[0].id || list[0].job_id));
        }
      })
      .catch(() => {
        setJobs([]);
      })
      .finally(() => {
        setIsLoadingJobs(false);
      });
  }, []);

  // Find currently selected objects
  const selectedVersion = resumeVersions.find((v) => v.version_id === selectedVersionId) || resumeVersions[0];
  const selectedJob = jobs.find((j) => String(j.id || j.job_id) === String(selectedJobId)) || jobs[0];

  // Fetch optimization suggestions from live endpoint: POST /api/v1/suggestions/
  const fetchSuggestions = useCallback(async (targetResumeId, targetJobId) => {
    if (!targetResumeId) return;
    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    try {
      const res = await suggestionsService.getSuggestions(targetResumeId, targetJobId);
      setSuggestionsData(res);
    } catch (err) {
      if (err.status === 403) {
        setSuggestionsError('Access denied: Optimization suggestions require an authenticated Job Seeker account.');
      } else if (err.status === 401) {
        setSuggestionsError('Session expired. Please log in again to generate suggestions.');
      } else if (err.status === 404) {
        setSuggestionsError('Suggestions service could not locate the specified resume or job requisition.');
      } else {
        setSuggestionsError(err.message || 'Unable to retrieve optimization suggestions from backend.');
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // 3. Execute live ATS scoring request: POST /api/v1/ats/score
  const handleAnalyzeAts = useCallback(async () => {
    if (!selectedVersion) {
      setErrorMessage('Please upload or select a resume version first.');
      setStatus('error');
      return;
    }
    if (!selectedJob) {
      setErrorMessage('Please select a target job requisition.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Use resume_id (or version_id as identifier) per M3 contract
    const targetResumeId = selectedVersion.resume_id || selectedVersion.version_id;
    const targetJobId = selectedJob.id || selectedJob.job_id;

    // Fetch live suggestions in parallel with ATS scoring
    fetchSuggestions(targetResumeId, targetJobId);

    try {
      const result = await atsService.scoreResume(targetResumeId, targetJobId);
      setEvaluation(result);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setEvaluation(null);

      // Distinguish error categories
      if (err.status === 403) {
        setErrorMessage('Access denied: ATS compatibility scoring requires an authenticated Job Seeker account.');
      } else if (err.status === 401) {
        setErrorMessage('Your session has expired. Please log in again to analyze ATS readiness.');
      } else if (err.status === 400) {
        setErrorMessage(err.message || 'Validation error: Invalid resume or job parameters supplied.');
      } else if (err.status === 404) {
        setErrorMessage(err.message || 'The selected resume or target job posting was not found on the server.');
      } else {
        setErrorMessage(err.message || 'ATS Scoring Service is currently unavailable. Please verify backend services are running.');
      }
    }
  }, [selectedVersion, selectedJob, fetchSuggestions]);

  // Automatically trigger analysis if navigated with a specific version_id query param
  useEffect(() => {
    if (queryVersionId && selectedVersion && selectedJob && status === 'idle') {
      handleAnalyzeAts();
    }
  }, [queryVersionId, selectedVersion, selectedJob, status, handleAnalyzeAts]);

  const isFormLoading = isLoadingResumes || isLoadingJobs;
  const hasNoResumes = !isLoadingResumes && resumeVersions.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Candidate Career Intelligence • Milestone 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content">
            ATS Compatibility Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Compare your resume capabilities against target requisitions with live keyword and semantic benchmarking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="filled"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/dashboard/job-seeker/resume')}
          >
            Manage Resumes
          </Button>
        </div>
      </div>

      {/* Target Selector Toolbar (Resume Version + Job Opening) */}
      <div className="surface-card p-4 sm:p-5 border border-outline-variant space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-content flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Evaluation Parameters</span>
          </div>
          <span className="text-[11px] font-mono text-content-subtle lowercase">
            POST /api/v1/ats/score
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Resume Version Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="ats-resume-selector" className="block text-xs font-medium text-content-muted">
              Select Resume Version {isLoadingResumes ? '(Loading...)' : `(${resumeVersions.length} available)`}
            </label>
            <div className="relative">
              <select
                id="ats-resume-selector"
                value={selectedVersionId}
                onChange={(e) => {
                  setSelectedVersionId(e.target.value);
                  if (status === 'success') setStatus('idle');
                }}
                disabled={isFormLoading || hasNoResumes || status === 'loading'}
                className="w-full bg-[#161720] border border-outline-variant focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-content appearance-none cursor-pointer pr-8 disabled:opacity-50"
              >
                {resumeVersions.length === 0 ? (
                  <option value="">No resumes found — please upload one</option>
                ) : (
                  resumeVersions.map((ver) => (
                    <option key={ver.version_id} value={ver.version_id}>
                      v{ver.version_number}: {ver.original_filename} {ver.is_active ? '(Active Default)' : ''}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-content-subtle text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Target Job Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="ats-job-selector" className="block text-xs font-medium text-content-muted">
              Select Target Job Requisition {isLoadingJobs ? '(Loading...)' : `(${jobs.length} openings)`}
            </label>
            <div className="relative">
              <select
                id="ats-job-selector"
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  if (status === 'success') setStatus('idle');
                }}
                disabled={isFormLoading || jobs.length === 0 || status === 'loading'}
                className="w-full bg-[#161720] border border-outline-variant focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-content appearance-none cursor-pointer pr-8 disabled:opacity-50"
              >
                {jobs.length === 0 ? (
                  <option value="">No jobs available</option>
                ) : (
                  jobs.map((job) => {
                    const jId = String(job.id || job.job_id);
                    return (
                      <option key={jId} value={jId}>
                        {job.title} — {job.company}
                      </option>
                    );
                  })
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-content-subtle text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Selected Job Metadata Summary */}
        {selectedJob && (
          <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-content-subtle flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-content-subtle" />
                <strong className="text-content font-medium">{selectedJob.company}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-content-subtle" />
                <span className="text-content-muted">{selectedJob.location || 'Remote'}</span>
              </span>
            </div>

            {selectedJob.salary && (
              <span>Target Compensation: <strong className="text-emerald-400 font-medium">{selectedJob.salary}</strong></span>
            )}
          </div>
        )}

        {/* Action Button Row */}
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="filled"
            size="md"
            icon={Sparkles}
            loading={status === 'loading'}
            disabled={isFormLoading || hasNoResumes || !selectedJobId || status === 'loading'}
            onClick={handleAnalyzeAts}
            className="w-full sm:w-auto font-semibold px-6"
          >
            {status === 'loading'
              ? 'Analyzing Compatibility...'
              : status === 'success'
              ? 'Re-analyze ATS Compatibility'
              : 'Analyze ATS Compatibility'}
          </Button>
        </div>
      </div>

      {/* Main Content Area based on Status */}
      {hasNoResumes ? (
        <div className="surface-card p-12 text-center space-y-3 border-dashed border-outline-variant">
          <FileText className="w-10 h-10 text-content-subtle mx-auto" />
          <h3 className="text-base font-bold text-content">No Resume Available</h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Upload your resume or select an existing version in the Resume Studio to evaluate your ATS compatibility score against live openings.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="filled"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/dashboard/job-seeker/resume')}
            >
              Upload Resume Now
            </Button>
          </div>
        </div>
      ) : status === 'loading' ? (
        <div className="surface-card p-12 text-center space-y-3 border border-outline-variant">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <h3 className="text-sm font-bold text-content">Analyzing resume compatibility...</h3>
          <p className="text-xs text-content-subtle max-w-sm mx-auto">
            Computing blended keyword match and semantic sentence embeddings against {selectedJob?.title || 'target opening'}.
          </p>
        </div>
      ) : status === 'error' ? (
        <div className="surface-card p-8 text-center space-y-3 border border-red-800/40 bg-red-950/20">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="text-sm font-bold text-red-200">Unable to Compute ATS Score</h3>
          <p className="text-xs text-red-300 max-w-md mx-auto">
            {errorMessage || 'A server or network error occurred while contacting the ATS Scoring Service.'}
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="tonal"
              size="sm"
              icon={RotateCcw}
              onClick={handleAnalyzeAts}
            >
              Retry ATS Analysis
            </Button>
          </div>
        </div>
      ) : status === 'idle' && !evaluation ? (
        <div className="surface-card p-10 text-center space-y-3 border border-outline-variant">
          <Sparkles className="w-8 h-8 text-primary mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-content">Ready for ATS Compatibility Analysis</h3>
          <p className="text-xs text-content-muted max-w-md mx-auto">
            Select a target job and resume version above, then click <strong>"Analyze ATS Compatibility"</strong> to calculate keyword density and semantic match indices.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="filled"
              size="sm"
              icon={Sparkles}
              onClick={handleAnalyzeAts}
            >
              Analyze ATS Compatibility
            </Button>
          </div>
        </div>
      ) : evaluation ? (
        <div className="space-y-6">
          {/* 1. Score Visualization Radial Gauge */}
          <AtsScoreGauge
            score={evaluation.match_score}
            keywordScore={evaluation.keyword_score}
            semanticScore={evaluation.semantic_similarity}
            engineVersion={evaluation.generated_by}
            targetThreshold={80}
          />

          {/* 2. Detected Skills vs Missing Skills */}
          <SkillGapList
            matchedSkills={evaluation.matched_skills || []}
            missingSkills={evaluation.missing_skills || []}
          />

          {/* 3. Missing Keywords Panel */}
          {evaluation.missing_keywords && evaluation.missing_keywords.length > 0 && (
            <KeywordGapList
              keywords={evaluation.missing_keywords}
            />
          )}

          {/* 4. Suggestions Section */}
          <SuggestionsPlaceholder
            suggestions={suggestionsData.suggestions.length > 0 ? suggestionsData.suggestions : (evaluation.suggestions || [])}
            source={suggestionsData.suggestions.length > 0 ? suggestionsData.source : (evaluation.generated_by?.includes('semantic') ? 'ai_generated' : 'rule_based')}
            isLoading={isLoadingSuggestions}
            error={suggestionsError}
            onRetry={() => {
              const targetResumeId = selectedVersion?.resume_id || selectedVersion?.version_id;
              const targetJobId = selectedJob?.id || selectedJob?.job_id;
              fetchSuggestions(targetResumeId, targetJobId);
            }}
          />

          {/* Methodology & Disclosure */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-content-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              Generated by backend scoring engine ({evaluation.generated_by}). The ATS compatibility score reflects keyword overlap and semantic sentence embeddings.
            </span>
            <button
              type="button"
              onClick={() => navigate('/dashboard/job-seeker/resume')}
              className="text-primary font-semibold hover:underline shrink-0 text-xs"
            >
              Upload Revised Document →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
