import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  RotateCcw,
  Sparkles,
  Inbox,
  FilterX,
  Keyboard,
  Undo2,
  AlertCircle,
  Loader2,
  Radio
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getJobs } from "../services/api";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { JobCard } from "../components/JobCard";
import { Sidebar } from "../components/Sidebar";

export function DiscoverPage() {
  const {
    swipedState,
    handleSwipeLeft,
    handleSwipeRight,
    resetSwipes,
    undoLastSwipe,
    canUndo,
    setApplyModalJob,
    searchQuery,
    filters,
    isFilterModalOpen,
    applyModalJob,
    setIsFilterModalOpen,
    isJobSaved,
    addToast
  } = useApp();

  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fetch jobs from service layer (GET /jobs)
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getJobs();
      if (res && res.data) {
        setAllJobs(res.data);
        setIsLiveConnected(Boolean(res.isLive));
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Unable to load latest jobs. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter jobs based on active search, pills, and detailed modal filters
  const filteredJobs = useMemo(() => {
    let list = [...allJobs];

    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (job) =>
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.company && job.company.toLowerCase().includes(q)) ||
          (job.location && job.location.toLowerCase().includes(q)) ||
          (job.skills && job.skills.some((skill) => skill.toLowerCase().includes(q)))
      );
    }

    // Modal / Pill filters
    if (filters.companyType && filters.companyType !== "All") {
      list = list.filter((job) => job.companyType === filters.companyType);
    }

    if (filters.jobType && filters.jobType !== "All") {
      list = list.filter((job) => job.jobType === filters.jobType);
    }

    if (filters.isRemote) {
      list = list.filter((job) => job.isRemote);
    }

    if (filters.isInternship) {
      list = list.filter((job) => job.isInternship);
    }

    if (filters.isFresherFriendly) {
      list = list.filter((job) => job.isFresherFriendly);
    }

    if (filters.isNewlyFounded) {
      list = list.filter((job) => job.isNewlyFounded);
    }

    if (filters.location && filters.location !== "All") {
      list = list.filter((job) =>
        job.location && job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.competition && filters.competition !== "All") {
      list = list.filter(
        (job) => job.competition && job.competition.toLowerCase() === filters.competition.toLowerCase()
      );
    }

    if (filters.selectedSkill && filters.selectedSkill !== "All") {
      list = list.filter((job) =>
        job.skills && job.skills.some(
          (s) => s.toLowerCase() === filters.selectedSkill.toLowerCase()
        )
      );
    }

    // Exclude jobs already swiped
    const swipedIds = new Set([...swipedState.skipped, ...swipedState.liked]);
    return list.filter((job) => !swipedIds.has(job.id));
  }, [allJobs, searchQuery, filters, swipedState]);

  // Current active top card and next preview cards for stack effect
  const activeStack = useMemo(() => filteredJobs.slice(0, 3), [filteredJobs]);
  const currentCard = activeStack[0] || null;

  // Keyboard accessibility & Undo shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        isFilterModalOpen ||
        applyModalJob
      ) {
        return;
      }

      // Undo with 'u' or Ctrl+Z / Cmd+Z
      if ((e.key === "u" || e.key === "U") || ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z"))) {
        e.preventDefault();
        if (canUndo) {
          undoLastSwipe();
        } else {
          addToast("No recent swipes to undo", "info");
        }
        return;
      }

      if (!currentCard) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const skipBtn = document.getElementById("btn-card-skip");
        if (skipBtn) {
          skipBtn.click();
        } else {
          handleSwipeLeft(currentCard);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const saveBtn = document.getElementById("btn-card-save");
        if (saveBtn) {
          saveBtn.click();
        } else {
          handleSwipeRight(currentCard);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, handleSwipeLeft, handleSwipeRight, undoLastSwipe, canUndo, isFilterModalOpen, applyModalJob, addToast]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Main Swipe Section */}
      <div className="flex-1 max-w-3xl flex flex-col items-center">
        {/* Page Header */}
        <div className="text-center mb-5 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 mb-2">
            {isLiveConnected ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Live Feed Connected (GET /jobs)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Motion Swipe Discovery</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Your Next Role
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Swipe right to save interesting opportunities, swipe left to skip. Match scores are tailored to your profile.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full mb-3">
          <SearchBar />
        </div>

        {/* Quick Horizontal Filter Pills */}
        <div className="w-full mb-6">
          <FilterBar />
        </div>

        {/* Loading State Skeleton */}
        {isLoading ? (
          <div className="relative w-full max-w-md h-[540px] sm:h-[580px] bg-white rounded-3xl border border-slate-200 shadow-sm p-7 flex flex-col justify-between animate-pulse">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="h-5 w-36 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-7 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 my-4">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2 mt-6">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-5/6 bg-slate-100 rounded" />
                <div className="h-3 w-4/6 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading matching job opportunities...</span>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="relative w-full max-w-md h-[540px] sm:h-[580px] bg-white rounded-3xl border border-rose-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1.5">
              Unable to load jobs
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchJobs}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* Swipe Stage Deck */
          <div className="relative w-full max-w-md h-[540px] sm:h-[580px] flex items-center justify-center my-auto">
            {activeStack.length > 0 ? (
              <div className="relative w-full h-full">
                <AnimatePresence mode="popLayout">
                  {/* Render background preview cards in reverse order so front card is on top */}
                  {activeStack.length > 2 && (
                    <JobCard
                      key={`stack-2-${activeStack[2].id}`}
                      job={activeStack[2]}
                      isFront={false}
                      stackIndex={2}
                    />
                  )}

                  {activeStack.length > 1 && (
                    <JobCard
                      key={`stack-1-${activeStack[1].id}`}
                      job={activeStack[1]}
                      isFront={false}
                      stackIndex={1}
                    />
                  )}

                  {activeStack.length > 0 && (
                    <JobCard
                      key={activeStack[0].id}
                      job={activeStack[0]}
                      isFront={true}
                      stackIndex={0}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onApply={(job) => setApplyModalJob(job)}
                      isSaved={isJobSaved(activeStack[0].id)}
                    />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <div className="w-full h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                  You're all caught up!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
                  All roles matching your current search criteria have been reviewed. You can undo your last swipe, reset the deck, or adjust filters to discover more.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
                  {canUndo && (
                    <button
                      type="button"
                      onClick={undoLastSwipe}
                      id="btn-undo-empty"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl active:scale-95 transition-all"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>Undo Last Swipe</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={resetSwipes}
                    id="btn-refresh-jobs"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Deck</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    <FilterX className="w-4 h-4" />
                    <span>Adjust Filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Counter Info, Undo Button & Gesture Guide below card */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between w-full max-w-md gap-2 text-xs font-medium text-slate-500 px-2">
          <div className="flex items-center gap-3">
            <span>{filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} available</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            
            {/* Undo Last Swipe Button */}
            <button
              type="button"
              onClick={undoLastSwipe}
              disabled={!canUndo}
              id="btn-undo-swipe"
              title={canUndo ? "Undo last swipe (Key: U or Ctrl+Z)" : "No swipes to undo"}
              className={`flex items-center gap-1 font-semibold transition-all px-2 py-1 rounded-lg ${
                canUndo
                  ? "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                  : "text-slate-300 cursor-not-allowed"
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo Swipe</span>
            </button>

            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <button
              type="button"
              onClick={resetSwipes}
              className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Keyboard className="w-3 h-3" />
            <span>← / → swipe • 'U' to undo</span>
          </div>
        </div>
      </div>

      {/* Desktop Dashboard Sidebar */}
      <Sidebar />
    </div>
  );
}

export default DiscoverPage;
