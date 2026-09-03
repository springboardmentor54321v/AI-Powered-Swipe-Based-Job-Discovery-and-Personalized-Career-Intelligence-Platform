import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import Button from '../components/common/Button';
import jobService from '../services/jobs';

export default function SwipeDiscoveryPage() {
  const [jobs, setJobs] = useState([]);
  const [jobIndex, setJobIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [swipeError, setSwipeError] = useState('');
  const [loadError, setLoadError] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [filters, setFilters] = useState({
    location: '',
    remote: 'Any',
    salary: 'Any',
    skills: '',
  });

  // Fetch jobs via Job Service
  const loadJobs = useCallback(async (currentSearch, currentType, currentFilters) => {
    setLoading(true);
    setLoadError('');
    setSwipeError('');

    try {
      const queryPayload = {
        type: currentType !== 'All' ? currentType : undefined,
        search: currentSearch.trim() || undefined,
        location: currentFilters.location?.trim() || undefined,
        remote: currentFilters.remote !== 'Any' ? currentFilters.remote : undefined,
        salary_min: currentFilters.salary !== 'Any' ? currentFilters.salary : undefined,
        skills: currentFilters.skills?.trim() || undefined,
      };

      const fetchedJobs = await jobService.listJobs(queryPayload);
      setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
      setJobIndex(0);
    } catch (err) {
      setLoadError('Unable to load job listings. Please check your connection and try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and filter change trigger
  useEffect(() => {
    loadJobs(searchQuery, selectedType, filters);
  }, [searchQuery, selectedType, filters, loadJobs]);

  const currentJob = jobs[jobIndex];
  const nextJob = jobs[jobIndex + 1];

  // Handle Swipe Action (Right = Apply/Save, Left = Skip)
  const handleSwipe = async (direction, job) => {
    if (swiping || !job) return;

    setSwiping(true);
    setSwipeError('');

    const targetJobId = job.id || job.job_id;

    try {
      // Advance to next card
      setJobIndex((prev) => prev + 1);

      // Submit swipe action via Job & Swipe Service
      await jobService.recordSwipe({
        job_id: String(targetJobId),
        direction: direction, // 'right' | 'left'
      });
    } catch (err) {
      // Non-blocking error handling
      setSwipeError("Couldn't save your choice. Please try again.");
    } finally {
      setSwiping(false);
    }
  };

  const handleResetDeck = () => {
    setJobIndex(0);
    setSwipeError('');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setFilters({
      location: '',
      remote: 'Any',
      salary: 'Any',
      skills: '',
    });
    setJobIndex(0);
    setSwipeError('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Enterprise Discovery Deck Guidance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-content-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-content">Live Discovery Deck</span>
          <span className="text-content-subtle">•</span>
          <span>Verified Enterprise Opportunities</span>
        </div>
        <div className="text-[11px] text-content-subtle flex items-center gap-2">
          <span className="hidden sm:inline">Use gesture controls or action buttons</span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-content-muted">← Pass | Apply →</span>
        </div>
      </div>

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
        <div className="surface-card min-h-[460px] flex flex-col items-center justify-center space-y-4 p-8 text-center animate-pulse">
          <div className="h-12 w-12 rounded-2xl bg-surface-elevated flex items-center justify-center text-primary">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <div className="space-y-2 max-w-xs">
            <div className="h-4 bg-surface-elevated rounded-xl w-3/4 mx-auto" />
            <div className="h-3 bg-surface-elevated/60 rounded-xl w-1/2 mx-auto" />
          </div>
          <p className="text-xs text-content-muted pt-2">Loading job opportunities...</p>
        </div>
      ) : loadError ? (
        /* Load Error State */
        <div className="surface-card p-10 text-center space-y-4">
          <div className="inline-flex h-14 w-14 rounded-3xl bg-red-950/40 border border-red-800/40 items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-content">Unable to load jobs</h2>
            <p className="text-xs text-content-muted max-w-sm mx-auto">{loadError}</p>
          </div>
          <Button
            variant="filled"
            size="md"
            icon={RotateCcw}
            onClick={() => loadJobs(searchQuery, selectedType, filters)}
          >
            Retry
          </Button>
        </div>
      ) : currentJob ? (
        /* Dual Card Deck Section with Real-Time Stacking Physics */
        <div className="relative min-h-[480px]">
          
          {/* Background Card (stacked directly underneath, smoothly elevating on drag) */}
          {nextJob && (
            <JobCard
              key={`next-${nextJob.id || nextJob.job_id}`}
              job={nextJob}
              isBackground={true}
              dragProgress={dragProgress}
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
            onDragProgress={setDragProgress}
            isBackground={false}
            disabled={swiping}
          />
        </div>
      ) : (
        /* Empty / Complete State */
        <div className="surface-card p-10 text-center space-y-4">
          <div className="inline-flex h-14 w-14 rounded-3xl bg-emerald-950/40 border border-emerald-800/40 items-center justify-center text-emerald-300 mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-content">
              {jobs.length === 0 
                ? "No jobs match your current filters"
                : "You've reviewed all available jobs in this stack"}
            </h2>
            <p className="text-xs text-content-muted max-w-sm mx-auto">
              {jobs.length === 0
                ? "Try clearing some filters or searching for different keywords to see more roles."
                : "Check back soon for new opportunities or reset the stack to review them again."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {jobs.length === 0 ? (
              <Button
                variant="filled"
                size="md"
                onClick={handleResetFilters}
              >
                Clear all filters
              </Button>
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

      {/* Deck Progress / Guidance */}
      {!loading && currentJob && (
        <div className="flex items-center justify-between text-xs text-content-subtle px-1">
          <span>Card {jobIndex + 1} of {jobs.length}</span>
          <span>Swipe card or use action buttons</span>
        </div>
      )}
    </div>
  );
}
