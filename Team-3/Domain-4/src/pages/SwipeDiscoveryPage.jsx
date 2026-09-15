import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Compass, 
  SlidersHorizontal,
  Briefcase,
  Building2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import Button from '../components/common/Button';
import jobService from '../services/jobs';
import recommendationService from '../services/recommendations';
import authService from '../services/auth';

export default function SwipeDiscoveryPage() {
  const [jobs, setJobs] = useState([]);
  const [jobIndex, setJobIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [swipeError, setSwipeError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Discovery Feed Mode: 'recommended' (AI Personalized) vs 'all' (Global Exploration)
  const [feedMode, setFeedMode] = useState('recommended');

  // Local undo stack: stores { job, direction, originalIndex }
  const [swipeHistory, setSwipeHistory] = useState([]);

  // Filter state for Search, Category, Remote, Salary, Experience, Quick Tags
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [filters, setFilters] = useState({
    location: '',
    remote: 'Any',
    salary: 'Any',
    salary_min: 'Any',
    experience_level: 'All',
    skills: '',
    fresher_friendly: false,
    low_competition: false,
    recently_posted: false,
  });

  const session = authService.getSession();
  const userId = session?.user?.user_id || session?.user?.id || session?.user_id;
  const userRole = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();
  const isJobSeeker = userRole === 'job_seeker';

  // Fetch jobs via Personalized Recommendation Engine or Global Search Service
  const loadJobs = useCallback(async (mode, currentSearch, currentType, currentFilters) => {
    setLoading(true);
    setLoadError('');
    setSwipeError('');

    try {
      const queryPayload = {
        type: currentType !== 'All' ? currentType : undefined,
        company_type: currentType !== 'All' ? currentType : undefined,
        search: currentSearch.trim() || undefined,
        q: currentSearch.trim() || undefined,
        location: currentFilters.location?.trim() || undefined,
        remote: currentFilters.remote !== 'Any' ? currentFilters.remote : undefined,
        salary_min: currentFilters.salary_min !== 'Any' ? currentFilters.salary_min : undefined,
        experience_level: currentFilters.experience_level !== 'All' ? currentFilters.experience_level : undefined,
        skills: currentFilters.skills?.trim() || undefined,
        fresher_friendly: currentFilters.fresher_friendly || undefined,
        low_competition: currentFilters.low_competition || undefined,
        recently_posted: currentFilters.recently_posted || undefined,
      };

      if (mode === 'recommended') {
        // 1. Fetch AI Recommendations for authenticated user
        const recList = await recommendationService.getRecommendations(userId, null);
        
        // 2. Fetch base jobs to merge full metadata
        const baseJobs = await jobService.listJobs(queryPayload);

        // Map recommendations with full job fields
        const recMap = new Map();
        (Array.isArray(recList) ? recList : []).forEach((r) => {
          recMap.set(String(r.job_id || r.id), r);
        });

        // Enrich base jobs with recommendation match scores & reason tags
        let merged = (Array.isArray(baseJobs) ? baseJobs : []).map((job) => {
          const jobIdStr = String(job.id || job.job_id);
          const recInfo = recMap.get(jobIdStr);

          const matchScore = recInfo?.match_percentage || job.match_score || job.match_percentage || 88;
          const reasonTags = recInfo?.reason_tags || job.reason_tags || [
            `${matchScore}% Skill match`,
            job.company_type ? `${job.company_type} hiring` : 'Role fit'
          ];

          return {
            ...job,
            match_score: matchScore,
            match_percentage: matchScore,
            reason_tags: reasonTags,
            is_recommendation: true,
          };
        });

        // Sort queue by match score descending (highest match first)
        merged.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

        setJobs(merged);
      } else {
        // Global Exploration mode
        const fetchedJobs = (currentSearch.trim() || currentType !== 'All')
          ? await jobService.searchJobs(queryPayload)
          : await jobService.listJobs(queryPayload);

        setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
      }

      setJobIndex(0);
      setSwipeHistory([]);
    } catch {
      setLoadError('Unable to load job recommendations. Please check your connection and try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Trigger debounced load on mode, filter, or search change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs(feedMode, searchQuery, selectedType, filters);
    }, 200);

    return () => clearTimeout(timer);
  }, [feedMode, searchQuery, selectedType, filters, loadJobs]);

  const currentJob = jobs[jobIndex];
  const nextJob = jobs[jobIndex + 1];

  // Handle Swipe Action (Right = Apply/Save, Left = Skip)
  const handleSwipe = useCallback(async (direction, job) => {
    if (swiping || !job) return;

    setSwiping(true);
    setSwipeError('');

    const targetJobId = job.id || job.job_id;

    // Record in local undo history
    setSwipeHistory((prev) => [{ job, direction, index: jobIndex }, ...prev]);

    // Advance to next card immediately (optimistic UI update)
    setJobIndex((prev) => prev + 1);

    try {
      await jobService.recordSwipe({
        job_id: String(targetJobId),
        direction: direction, // 'right' | 'left'
      });

      if (direction === 'right') {
        showToast(`Saved & Applied to "${job.title}" at ${job.company}`);
      }
    } catch {
      setSwipeError("Couldn't record swipe action.");
    } finally {
      setSwiping(false);
    }
  }, [swiping, jobIndex]);

  // Handle Undo Last Swipe
  const handleUndo = useCallback(async () => {
    if (swipeHistory.length === 0 || swiping) return;

    const [lastAction, ...remainingHistory] = swipeHistory;
    setSwipeHistory(remainingHistory);

    // Rollback index cleanly
    if (jobIndex > 0) {
      setJobIndex((prev) => prev - 1);
    }

    try {
      await jobService.undoSwipe();
      showToast(`Restored "${lastAction.job.title}" to stack`);
    } catch {
      // Non-blocking
    }
  }, [swipeHistory, swiping, jobIndex]);

  // Keyboard Shortcuts (ArrowLeft = Skip, ArrowRight = Apply, Z/U = Undo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea/select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentJob && !swiping) {
        e.preventDefault();
        handleSwipe('left', currentJob);
      } else if (e.key === 'ArrowRight' && currentJob && !swiping) {
        e.preventDefault();
        handleSwipe('right', currentJob);
      } else if ((e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') && swipeHistory.length > 0 && !swiping) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentJob, swiping, swipeHistory, handleSwipe, handleUndo]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleResetDeck = () => {
    setJobIndex(0);
    setSwipeHistory([]);
    setSwipeError('');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setFilters({
      location: '',
      remote: 'Any',
      salary: 'Any',
      salary_min: 'Any',
      experience_level: 'All',
      skills: '',
      fresher_friendly: false,
      low_competition: false,
      recently_posted: false,
    });
    setJobIndex(0);
    setSwipeHistory([]);
    setSwipeError('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
      
      {/* Top Banner: Feed Mode Selector & Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-xs">
        
        {/* Mode Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/[0.06] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFeedMode('recommended')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              feedMode === 'recommended'
                ? 'bg-primary text-surface shadow-md'
                : 'text-content-muted hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommended Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              feedMode === 'all'
                ? 'bg-primary text-surface shadow-md'
                : 'text-content-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Opportunities</span>
          </button>
        </div>

        {/* Action shortcut links */}
        <div className="text-[11px] text-content-subtle flex items-center gap-2">
          <Link
            to="/dashboard/job-seeker/companies"
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Companies Directory</span>
          </Link>
          <span className="text-white/[0.1] hidden sm:inline">•</span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-content-muted hidden sm:inline">
            ← Pass | Apply →
          </span>
        </div>
      </div>

      {/* Recruiter / Admin RBAC Notice (If Non-Job Seeker views discovery) */}
      {!isJobSeeker && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-xs text-amber-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              You are viewing the Discovery Deck in <strong>{userRole.replace('_', ' ')} Preview Mode</strong>.
            </span>
          </div>
          <Link
            to={`/dashboard/${userRole}`}
            className="text-amber-300 underline font-semibold ml-2 hover:text-white"
          >
            Return to {userRole.replace('_', ' ')} workspace →
          </Link>
        </div>
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 flex items-center justify-between text-xs text-emerald-300 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Swipe Error Notice */}
      {swipeError && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-between text-xs text-red-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{swipeError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSwipeError('')}
            className="text-xs text-red-300 hover:text-red-100 underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Reusable FilterBar Component */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Loading Skeleton */}
      {loading ? (
        <div className="surface-card min-h-[480px] flex flex-col items-center justify-center space-y-4 p-8 text-center animate-pulse border border-white/[0.08] rounded-3xl bg-[#12131a]">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.05] flex items-center justify-center text-primary">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
          <div className="space-y-2 max-w-xs">
            <div className="h-4 bg-white/[0.08] rounded-xl w-3/4 mx-auto" />
            <div className="h-3 bg-white/[0.04] rounded-xl w-1/2 mx-auto" />
          </div>
          <p className="text-xs text-content-muted pt-2">
            {feedMode === 'recommended'
              ? 'Computing AI personalized match feed...'
              : 'Loading job opportunities...'}
          </p>
        </div>
      ) : loadError ? (
        /* Load Error State */
        <div className="surface-card p-10 text-center space-y-4 border border-white/[0.08] rounded-3xl bg-[#12131a]">
          <div className="inline-flex h-14 w-14 rounded-3xl bg-red-950/40 border border-red-800/40 items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Unable to load jobs</h2>
            <p className="text-xs text-content-muted max-w-sm mx-auto">{loadError}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="filled"
              size="md"
              icon={RotateCcw}
              onClick={() => loadJobs(feedMode, searchQuery, selectedType, filters)}
            >
              Retry
            </Button>
            {feedMode === 'recommended' && (
              <Button
                variant="outlined"
                size="md"
                onClick={() => setFeedMode('all')}
              >
                Switch to All Jobs
              </Button>
            )}
          </div>
        </div>
      ) : currentJob ? (
        /* Dual Card Deck Section with Real-Time Stacking Physics */
        <div className="relative min-h-[500px]">
          
          {/* Background Card (stacked directly underneath, smoothly elevating on drag) */}
          {nextJob && (
            <JobCard
              key={`next-${nextJob.id || nextJob.job_id}`}
              job={nextJob}
              isBackground={true}
              dragProgress={dragProgress}
              isRecommendation={feedMode === 'recommended' || nextJob.is_recommendation}
            />
          )}

          {/* Active Top Card (Strict horizontal Tinder-style swipe) */}
          <JobCard
            key={`top-${currentJob.id || currentJob.job_id}`}
            job={currentJob}
            onSwipe={(direction, job) => {
              setDragProgress(0);
              handleSwipe(direction, job);
            }}
            onUndo={handleUndo}
            canUndo={swipeHistory.length > 0}
            onDragProgress={setDragProgress}
            isBackground={false}
            disabled={swiping}
            isRecommendation={feedMode === 'recommended' || currentJob.is_recommendation}
          />
        </div>
      ) : (
        /* Empty / Complete State */
        <div className="surface-card p-10 text-center space-y-4 border border-white/[0.08] rounded-3xl bg-[#12131a]">
          <div className="inline-flex h-14 w-14 rounded-3xl bg-emerald-950/40 border border-emerald-800/40 items-center justify-center text-emerald-300 mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              {jobs.length === 0 
                ? "No jobs match your current criteria"
                : "You've reviewed all available jobs in this stack"}
            </h2>
            <p className="text-xs text-content-muted max-w-sm mx-auto">
              {jobs.length === 0
                ? "Try clearing some filter chips, switching feed mode, or searching for different keywords."
                : "Great job! You can undo your last swipe or reset the stack to review them again."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            {swipeHistory.length > 0 && (
              <Button
                variant="tonal"
                size="md"
                icon={RotateCcw}
                onClick={handleUndo}
                className="text-amber-300 border border-amber-800/40"
              >
                Undo Last Swipe
              </Button>
            )}
            {jobs.length === 0 ? (
              <>
                <Button
                  variant="filled"
                  size="md"
                  onClick={handleResetFilters}
                >
                  Clear all filters
                </Button>
                {feedMode === 'recommended' && (
                  <Button
                    variant="outlined"
                    size="md"
                    onClick={() => setFeedMode('all')}
                  >
                    Browse All Opportunities
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="filled"
                size="md"
                icon={RotateCcw}
                onClick={handleResetDeck}
              >
                Review again
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Deck Progress & Quick Undo Floating Strip */}
      {!loading && currentJob && (
        <div className="flex items-center justify-between text-xs text-content-subtle px-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-content">Card {jobIndex + 1} of {jobs.length}</span>
            {feedMode === 'recommended' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI Ranked</span>
              </span>
            )}
          </div>
          
          {swipeHistory.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last ({swipeHistory.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

