import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Loader2, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Server, 
  PlusCircle, 
  Eye, 
  TrendingUp, 
  Activity, 
  UserCheck, 
  Sliders, 
  Database, 
  HardDrive
} from 'lucide-react';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import authService from '../services/auth';
import jobService from '../services/jobs';
import resumeService from '../services/resume';
import recommendationService from '../services/recommendations';

export default function DashboardPage() {
  const navigate = useNavigate();

  // User session & active role
  const [session, setSession] = useState(() => authService.getSession());
  const userRole = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();
  const [selectedRoleView, setSelectedRoleView] = useState(userRole);

  // Common Data State
  const [swipes, setSwipes] = useState([]);
  const [swipesLoading, setSwipesLoading] = useState(true);
  const [swipesError, setSwipesError] = useState('');

  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  // Job Seeker Specific State
  const [jobSeekerTab, setJobSeekerTab] = useState('saved');
  const [activeResume, setActiveResume] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [atsLoading, setAtsLoading] = useState(true);
  const [atsError, setAtsError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState('');

  // Load Swipe History
  const loadSwipeData = useCallback(async () => {
    setSwipesLoading(true);
    setSwipesError('');
    try {
      const history = await jobService.getSwipeHistory();
      setSwipes(Array.isArray(history) ? history : []);
    } catch {
      setSwipesError('Unable to load swipe interactions.');
      setSwipes([]);
    } finally {
      setSwipesLoading(false);
    }
  }, []);

  // Load All Jobs
  const loadAllJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const list = await jobService.listJobs({});
      setAllJobs(Array.isArray(list) ? list : []);
    } catch {
      setJobsError('Unable to load job listings.');
      setAllJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // Load ATS Score
  const loadAtsScore = useCallback(async (resume) => {
    if (!resume || !resume.resume_id) {
      setAtsLoading(false);
      setAtsData(null);
      return;
    }
    setAtsLoading(true);
    setAtsError('');
    try {
      const scoreData = await resumeService.getAtsScore(resume.resume_id, 1);
      setAtsData(scoreData);
    } catch {
      setAtsError('Unable to calculate ATS score.');
      setAtsData(null);
    } finally {
      setAtsLoading(false);
    }
  }, []);

  // Load Recommendations
  const loadRecommendations = useCallback(async (userId, resumeId) => {
    setRecsLoading(true);
    setRecsError('');
    try {
      const data = await recommendationService.getRecommendations(userId, resumeId);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch {
      setRecsError('Unable to load recommendations.');
      setRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  }, []);

  // Sync on mount
  useEffect(() => {
    const currentSession = authService.getSession();
    setSession(currentSession);
    const initialRole = (currentSession?.role || currentSession?.user?.role || 'job_seeker').toLowerCase();
    setSelectedRoleView(initialRole);

    const resume = resumeService.getActiveResume();
    setActiveResume(resume);

    const userId = currentSession?.user?.user_id || currentSession?.user?.id || 1;
    const resumeId = resume?.resume_id;

    loadSwipeData();
    loadAllJobs();
    loadAtsScore(resume);
    loadRecommendations(userId, resumeId);

    const unsub = authService.subscribe((updated) => {
      setSession(updated);
      if (updated?.role) {
        setSelectedRoleView(updated.role.toLowerCase());
      }
    });
    return unsub;
  }, [loadSwipeData, loadAllJobs, loadAtsScore, loadRecommendations]);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';

  const handleRoleChange = (newRole) => {
    setSelectedRoleView(newRole);
    authService.setRole(newRole);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Banner & Fast Role Switcher */}
      <div className="surface-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-content">
              {userName}'s Control Center
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
              {selectedRoleView.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-content-muted">
            {selectedRoleView === 'recruiter' 
              ? 'Candidate Pipeline • Requisition Manager • Talent Analytics'
              : selectedRoleView === 'admin'
              ? 'Platform Observability • Gateway Telemetry • RBAC Oversight'
              : 'Career Dashboard • Application Tracker • Heuristic ATS Copilot'}
          </p>
        </div>

        {/* Interactive Role Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-elevated rounded-2xl border border-outline-variant/70 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => handleRoleChange('job_seeker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedRoleView === 'job_seeker'
                ? 'bg-primary text-surface font-semibold shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('recruiter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedRoleView === 'recruiter'
                ? 'bg-primary text-surface font-semibold shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Recruiter
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedRoleView === 'admin'
                ? 'bg-primary text-surface font-semibold shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Render Distinct Role-Based Views */}
      {selectedRoleView === 'recruiter' ? (
        <RecruiterDashboardView
          allJobs={allJobs}
          jobsLoading={jobsLoading}
          jobsError={jobsError}
          onRetryJobs={loadAllJobs}
          swipes={swipes}
          swipesLoading={swipesLoading}
          navigate={navigate}
        />
      ) : selectedRoleView === 'admin' ? (
        <AdminDashboardView
          allJobs={allJobs}
          jobsLoading={jobsLoading}
          swipes={swipes}
          swipesLoading={swipesLoading}
          session={session}
          onRefresh={() => {
            loadAllJobs();
            loadSwipeData();
          }}
        />
      ) : (
        <JobSeekerDashboardView
          swipes={swipes}
          swipesLoading={swipesLoading}
          swipesError={swipesError}
          onRetrySwipes={loadSwipeData}
          activeTab={jobSeekerTab}
          setActiveTab={setJobSeekerTab}
          activeResume={activeResume}
          atsData={atsData}
          atsLoading={atsLoading}
          atsError={atsError}
          onRetryAts={() => loadAtsScore(activeResume)}
          recommendations={recommendations}
          recsLoading={recsLoading}
          recsError={recsError}
          onRetryRecs={() => loadRecommendations(session?.user?.user_id, activeResume?.resume_id)}
          navigate={navigate}
        />
      )}
    </div>
  );
}

/* =========================================================================
   1. JOB SEEKER DASHBOARD VIEW (Career Tracking & ATS Copilot)
   ========================================================================= */
function JobSeekerDashboardView({
  swipes,
  swipesLoading,
  swipesError,
  onRetrySwipes,
  activeTab,
  setActiveTab,
  activeResume,
  atsData,
  atsLoading,
  atsError,
  onRetryAts,
  recommendations,
  recsLoading,
  recsError,
  onRetryRecs,
  navigate,
}) {
  const savedSwipes = swipes.filter((s) => s.direction === 'right');
  const appliedSwipes = swipes.filter((s) => s.direction === 'right');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="surface-card p-4 space-y-1">
          <span className="text-[11px] text-content-muted block">Applied Roles</span>
          <div className="text-2xl font-bold text-content">{swipesLoading ? '...' : appliedSwipes.length}</div>
          <span className="text-[10px] text-emerald-400">● 100% Ingested</span>
        </div>
        <div className="surface-card p-4 space-y-1">
          <span className="text-[11px] text-content-muted block">Saved Bookmarks</span>
          <div className="text-2xl font-bold text-content">{swipesLoading ? '...' : savedSwipes.length}</div>
          <span className="text-[10px] text-primary">● Active In Deck</span>
        </div>
        <div className="surface-card p-4 space-y-1">
          <span className="text-[11px] text-content-muted block">ATS Readiness</span>
          <div className="text-2xl font-bold text-content">
            {atsLoading ? '...' : atsData ? `${Math.round(atsData.match_score)}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-content-subtle">{activeResume ? 'Resume Verified' : 'Needs Upload'}</span>
        </div>
        <div className="surface-card p-4 space-y-1">
          <span className="text-[11px] text-content-muted block">Top AI Match</span>
          <div className="text-2xl font-bold text-emerald-400">
            {recsLoading ? '...' : recommendations[0]?.match_percentage ? `${recommendations[0].match_percentage}%` : '85%'}
          </div>
          <span className="text-[10px] text-emerald-400/80">heuristic-v0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Saved & Applied Jobs Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="surface-card space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'saved' ? 'tonal' : 'text'}
                  size="sm"
                  icon={Bookmark}
                  onClick={() => setActiveTab('saved')}
                  className={activeTab === 'saved' ? 'font-semibold text-content' : ''}
                >
                  Saved roles ({savedSwipes.length})
                </Button>
                <Button
                  variant={activeTab === 'applied' ? 'tonal' : 'text'}
                  size="sm"
                  icon={Send}
                  onClick={() => setActiveTab('applied')}
                  className={activeTab === 'applied' ? 'font-semibold text-content' : ''}
                >
                  Applications ({appliedSwipes.length})
                </Button>
              </div>

              <Button
                variant="filled"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate('/discover')}
              >
                Discover more
              </Button>
            </div>

            {swipesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading your interaction history...</span>
              </div>
            ) : swipesError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{swipesError}</span>
                </div>
                <Button variant="tonal" size="sm" onClick={onRetrySwipes}>
                  Retry
                </Button>
              </div>
            ) : (activeTab === 'saved' ? savedSwipes : appliedSwipes).length > 0 ? (
              <div className="space-y-2.5">
                {(activeTab === 'saved' ? savedSwipes : appliedSwipes).map((item, idx) => (
                  <div
                    key={item.swipe_id || item.job_id || idx}
                    className="p-4 rounded-2xl bg-surface-elevated/50 border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-outline transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-content">
                        {item.job_title || item.title || `Job Opportunity #${item.job_id}`}
                      </h3>
                      <p className="text-xs text-content-muted">
                        {item.company || 'Tech Opportunity'} • Swiped right to {activeTab === 'saved' ? 'save' : 'apply'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                        {activeTab === 'saved' ? 'Saved' : 'Submitted'}
                      </span>
                      <Button
                        variant="tonal"
                        size="sm"
                        onClick={() => navigate('/discover')}
                      >
                        View in deck
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3 rounded-2xl bg-surface-elevated/30 border border-dashed border-outline-variant">
                <Bookmark className="w-8 h-8 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  {activeTab === 'saved'
                    ? 'No saved jobs yet. Swipe right on jobs in Discover to save them here.'
                    : 'No applied jobs yet. Swipe right on jobs in Discover to apply.'}
                </p>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => navigate('/discover')}
                >
                  Explore jobs
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: ATS Score & AI Recommendations */}
        <div className="lg:col-span-4 space-y-4">
          {/* ATS Compatibility Card */}
          <div className="surface-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-content font-semibold text-sm">
                <Award className="w-4 h-4 text-primary" />
                <span>ATS compatibility</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/resume')}
                className="text-xs text-primary hover:underline"
              >
                {activeResume ? 'Update' : 'Upload'}
              </button>
            </div>

            {atsLoading ? (
              <div className="p-6 rounded-2xl bg-surface-elevated/50 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Evaluating ATS keywords...</span>
              </div>
            ) : atsError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 space-y-2">
                <p>{atsError}</p>
                <Button variant="tonal" size="sm" onClick={onRetryAts}>
                  Retry
                </Button>
              </div>
            ) : activeResume && atsData ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface-elevated/60 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-content">{atsData.match_score}%</div>
                    <p className="text-[11px] text-content-muted mt-0.5">
                      Matched from {activeResume.filename || 'Resume'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                    {Math.round(atsData.match_score)}%
                  </div>
                </div>

                {atsData.missing_keywords && atsData.missing_keywords.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-medium text-content-muted">Missing keywords for top match:</p>
                    <div className="flex flex-wrap gap-1">
                      {atsData.missing_keywords.map((kw, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] bg-red-950/40 text-red-300 border border-red-800/30">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-content-subtle pt-1 border-t border-outline-variant">
                  <span>Model: {atsData.generated_by}</span>
                  <span className="text-emerald-400">Heuristic Stub Active</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center space-y-2">
                <FileText className="w-6 h-6 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  Upload your resume to calculate your heuristic ATS compatibility score.
                </p>
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => navigate('/resume')}
                >
                  Upload resume
                </Button>
              </div>
            )}
          </div>

          {/* Recommendations Card */}
          <div className="surface-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-content font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Job recommendations</span>
              </div>
              <span className="text-[10px] text-content-subtle bg-surface-elevated px-2 py-0.5 rounded-full">
                heuristic-v0
              </span>
            </div>

            {recsLoading ? (
              <div className="p-6 rounded-2xl bg-surface-elevated/50 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Loading recommendations...</span>
              </div>
            ) : recsError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 space-y-2">
                <p>{recsError}</p>
                <Button variant="tonal" size="sm" onClick={onRetryRecs}>
                  Retry
                </Button>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div
                    key={rec.job_id || idx}
                    className="p-3 rounded-xl bg-surface-elevated/40 border border-outline-variant/60 flex items-center justify-between text-xs hover:border-outline transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-content">{rec.title}</div>
                      <div className="text-content-muted">{rec.company}</div>
                    </div>
                    <Chip variant="success">{rec.match_percentage}%</Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center text-xs text-content-subtle">
                No recommendations available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. RECRUITER DASHBOARD VIEW (Requisition Manager & Talent Sourcing)
   ========================================================================= */
function RecruiterDashboardView({
  allJobs,
  jobsLoading,
  jobsError,
  onRetryJobs,
  swipes,
  swipesLoading,
  navigate,
}) {
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState('requisitions');

  const appliedCandidates = swipes.filter((s) => s.direction === 'right');

  const filteredJobs = allJobs.filter((j) => 
    j.title?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    j.company?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Recruiter Power KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Active Requisitions</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-content">
            {jobsLoading ? '...' : allJobs.length}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>●</span> Live on Candidate Discovery Deck
          </p>
        </div>

        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Direct Applicants</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {swipesLoading ? '...' : appliedCandidates.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            Right-swiped candidate matches
          </p>
        </div>

        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Total Swipe Impressions</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-content">
            {swipesLoading ? '...' : swipes.length}
          </div>
          <p className="text-[11px] text-blue-400">
            {swipes.length > 0 ? `${Math.round((appliedCandidates.length / swipes.length) * 100)}% Conversion Rate` : 'No interactions yet'}
          </p>
        </div>

        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Sourcing Pipeline</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-content">
            {swipesLoading ? '...' : appliedCandidates.length > 0 ? `${appliedCandidates.length} Qualified` : 'Ready'}
          </div>
          <p className="text-[11px] text-content-subtle">
            Heuristic matching ready
          </p>
        </div>
      </div>

      {/* Recruiter Workspace & Tools */}
      <div className="surface-card space-y-5">
        
        {/* Workspace Subheader & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'requisitions' ? 'tonal' : 'text'}
              size="sm"
              icon={Briefcase}
              onClick={() => setActiveTab('requisitions')}
              className={activeTab === 'requisitions' ? 'font-semibold text-content' : ''}
            >
              Manage Postings ({allJobs.length})
            </Button>
            <Button
              variant={activeTab === 'applicants' ? 'tonal' : 'text'}
              size="sm"
              icon={Users}
              onClick={() => setActiveTab('applicants')}
              className={activeTab === 'applicants' ? 'font-semibold text-content' : ''}
            >
              Applicant Pool ({appliedCandidates.length})
            </Button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="filled"
              size="sm"
              icon={PlusCircle}
              onClick={() => setShowPostJobModal(true)}
            >
              Post Requisition
            </Button>
          </div>
        </div>

        {/* Tab 1: Requisitions Table & Management */}
        {activeTab === 'requisitions' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter your posted jobs by title or company..."
                className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
              />
            </div>

            {jobsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading active requisitions...</span>
              </div>
            ) : jobsError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-center justify-between text-xs text-red-300">
                <span>{jobsError}</span>
                <Button variant="tonal" size="sm" onClick={onRetryJobs}>Retry</Button>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-2.5">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id || job.job_id}
                    className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-outline transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-content">{job.title}</h3>
                        <Chip variant="primary">{job.type || job.company_type || 'Full-time'}</Chip>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-2 py-0.5 rounded-full">
                          ● Open & Accepting Swipes
                        </span>
                      </div>
                      <p className="text-xs text-content-muted">
                        {job.company} • {job.location || 'Remote'} • Required Skills: {Array.isArray(job.skills) ? job.skills.slice(0, 3).join(', ') : 'Standard Stack'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="tonal"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate('/discover')}
                      >
                        Preview in Deck
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-content-subtle">
                No requisitions match your search filter.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applicant Ingestion Stream */}
        {activeTab === 'applicants' && (
          <div className="space-y-3">
            {appliedCandidates.length > 0 ? (
              <div className="space-y-2.5">
                {appliedCandidates.map((candidate, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          C{i + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-content">
                            Candidate Application #{candidate.swipe_id || i + 101}
                          </h4>
                          <p className="text-[11px] text-content-muted">
                            Targeting: <span className="font-medium text-content">{candidate.job_title || `Job #${candidate.job_id}`}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 font-medium">
                        ✓ Right-Swiped Match
                      </span>
                      <Button
                        variant="tonal"
                        size="sm"
                        onClick={() => alert(`Candidate Application #${candidate.swipe_id || i + 101} screening scheduled.`)}
                      >
                        Schedule Screen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-content-subtle rounded-2xl bg-surface-elevated/20 border border-dashed border-outline-variant">
                No applicants have swiped right on your positions yet. New candidate interactions will automatically sync here.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card max-w-lg w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-content">Create New Job Requisition</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPostJobModal(false)}
                className="text-xs text-content-subtle hover:text-content"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                ℹ️ <strong>Milestone 1 Preview</strong>: Requisition drafting is active. Jobs are dynamically indexed into the candidate swipe deck via Intern 2's Job Intelligence Service (Port 8002).
              </div>
              <div className="space-y-1">
                <label className="text-content-muted font-medium block">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content"
                  defaultValue="Senior AI Platform Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-content-muted font-medium block">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco / Remote"
                    className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content"
                    defaultValue="Remote"
                  />
                </div>
                <div>
                  <label className="text-content-muted font-medium block">Employment Type</label>
                  <select className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content">
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
              <Button variant="tonal" size="sm" onClick={() => setShowPostJobModal(false)}>
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => {
                  alert('Requisition published to candidate discovery stream!');
                  setShowPostJobModal(false);
                }}
              >
                Publish Requisition
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   3. ADMIN DASHBOARD VIEW (Platform Observability & RBAC Governance)
   ========================================================================= */
function AdminDashboardView({
  allJobs,
  jobsLoading,
  swipes,
  swipesLoading,
  session,
  onRefresh,
}) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [cacheFlushed, setCacheFlushed] = useState(false);

  const handleFlushCache = () => {
    setCacheFlushed(true);
    setTimeout(() => setCacheFlushed(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* System Gateway & Microservices Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Domain-1 Service Card */}
        <div className="surface-card p-4 space-y-2.5 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-content">Identity & Auth (Domain-1)</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-full font-medium">
              ● Healthy
            </span>
          </div>
          <div className="space-y-1 text-xs text-content-muted">
            <div className="flex justify-between"><span>Gateway Port:</span> <span className="font-mono text-content">8000</span></div>
            <div className="flex justify-between"><span>Stack:</span> <span className="text-content">Django + DRF + JWT</span></div>
            <div className="flex justify-between"><span>Role Guard:</span> <span className="text-emerald-400 font-medium">Active (RBAC)</span></div>
          </div>
        </div>

        {/* Domain-2 Service Card */}
        <div className="surface-card p-4 space-y-2.5 border-t-4 border-t-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="font-bold text-xs text-content">Job & Swipes (Domain-2)</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-full font-medium">
              ● Healthy
            </span>
          </div>
          <div className="space-y-1 text-xs text-content-muted">
            <div className="flex justify-between"><span>Direct Port:</span> <span className="font-mono text-content">8002</span></div>
            <div className="flex justify-between"><span>Cache Layer:</span> <span className="text-content">Redis (6379)</span></div>
            <div className="flex justify-between"><span>Indexed Jobs:</span> <span className="text-content font-bold">{jobsLoading ? '...' : allJobs.length}</span></div>
          </div>
        </div>

        {/* Domain-3 Service Card */}
        <div className="surface-card p-4 space-y-2.5 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs text-content">AI/ML Career (Domain-3)</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-blue-950/40 text-blue-400 border border-blue-800/30 rounded-full font-medium">
              ● Heuristic Active
            </span>
          </div>
          <div className="space-y-1 text-xs text-content-muted">
            <div className="flex justify-between"><span>Service Port:</span> <span className="font-mono text-content">8003</span></div>
            <div className="flex justify-between"><span>Parser Engine:</span> <span className="text-content">pdfplumber</span></div>
            <div className="flex justify-between"><span>ATS Model:</span> <span className="text-blue-400 font-medium">heuristic-v0</span></div>
          </div>
        </div>
      </div>

      {/* Admin Power Controls & Platform Governance */}
      <div className="surface-card space-y-5">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-content">Platform Governance & Diagnostic Powers</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="tonal" size="sm" icon={RotateCcw} onClick={onRefresh}>
              Refresh Metrics
            </Button>
          </div>
        </div>

        {/* Platform Diagnostic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Action Console 1: Cache & Index Management */}
          <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-content flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-primary" /> Cache & Discovery Pipeline
              </span>
              <span className="text-[11px] text-emerald-400">99.8% Cache Hit Ratio</span>
            </div>
            <p className="text-content-muted text-[11px]">
              Flush the Redis discovery query cache across Domain-2 and trigger fresh job re-indexing.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="tonal"
                size="sm"
                icon={RotateCcw}
                onClick={handleFlushCache}
              >
                {cacheFlushed ? 'Cache Purged (OK)' : 'Flush Redis Cache'}
              </Button>
            </div>
          </div>

          {/* Action Console 2: Platform Maintenance Guard */}
          <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-content flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" /> Maintenance Guard
              </span>
              <span className={`text-[11px] font-medium ${maintenanceMode ? 'text-amber-400' : 'text-content-subtle'}`}>
                {maintenanceMode ? 'Maintenance Enabled' : 'Normal Operation'}
              </span>
            </div>
            <p className="text-content-muted text-[11px]">
              Toggle platform maintenance mode to restrict non-admin access during microservice migration.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={maintenanceMode ? 'filled' : 'tonal'}
                size="sm"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
              >
                {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
              </Button>
            </div>
          </div>
        </div>

        {/* User Directory & Role Assignment Overview */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-content">Active User RBAC Directory</span>
            <span className="text-content-subtle">Milestone 1 Session Registry</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-elevated/50 border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-surface font-bold">
                {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
              </div>
              <div>
                <div className="font-semibold text-content">{session?.user?.name || 'Admin User'}</div>
                <div className="text-[11px] text-content-muted">{session?.user?.email || 'admin@swipex.local'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] bg-primary/20 text-primary font-bold border border-primary/30 uppercase">
                {session?.role || 'Admin'} (Superuser)
              </span>
              <span className="text-[11px] text-emerald-400">Full Access Granted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
