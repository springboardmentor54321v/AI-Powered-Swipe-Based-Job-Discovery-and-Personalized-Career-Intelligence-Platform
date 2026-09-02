import React, { useEffect, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { RotateCcw, Sparkles, Inbox, FilterX, Keyboard } from "lucide-react";

import { useApp } from "../context/AppContext";
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

    setApplyModalJob,

    searchQuery,
    filters,

    isFilterModalOpen,
    applyModalJob,
    setIsFilterModalOpen,

    isJobSaved,
    toggleSaveJob,
    savedJobs,

    jobs,
    jobsLoading,
    applications,
  } = useApp();

  // ============================================================
  // ALREADY APPLIED JOB IDS
  // ============================================================

  const appliedJobIds = useMemo(() => {
    return new Set(
      (applications || [])
        .map((application) =>
          String(
            application.jobId ??
              application.job_id ??
              application.job?.id ??
              "",
          ),
        )
        .filter(Boolean),
    );
  }, [applications]);

  const savedJobIds = useMemo(() => {
    return new Set(
      (savedJobs || []).map((job) => String(job.id)).filter(Boolean),
    );
  }, [savedJobs]);

  // ============================================================
  // SWIPED JOB IDS
  // ============================================================

  const swipedJobIds = useMemo(() => {
    return new Set([
      ...(swipedState.skipped || []).map(String),
      ...(swipedState.liked || []).map(String),
    ]);
  }, [swipedState]);

  // ============================================================
  // FILTER JOBS
  // ============================================================

  const filteredJobs = useMemo(() => {
    let list = [...jobs];

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      list = list.filter((job) => {
        const title = String(job.title || "").toLowerCase();

        const company = String(job.company || "").toLowerCase();

        const location = String(job.location || "").toLowerCase();

        const skills = Array.isArray(job.skills)
          ? job.skills
          : String(job.skills || "")
              .split(",")
              .map((skill) => skill.trim());

        return (
          title.includes(q) ||
          company.includes(q) ||
          location.includes(q) ||
          skills.some((skill) => String(skill).toLowerCase().includes(q))
        );
      });
    }

    // ----------------------------------------------------------
    // COMPANY TYPE
    // ----------------------------------------------------------

    if (filters.companyType && filters.companyType !== "All") {
      list = list.filter((job) => job.companyType === filters.companyType);
    }

    // ----------------------------------------------------------
    // JOB TYPE
    // ----------------------------------------------------------

    if (filters.jobType && filters.jobType !== "All") {
      list = list.filter((job) => job.jobType === filters.jobType);
    }

    // ----------------------------------------------------------
    // REMOTE
    // ----------------------------------------------------------

    if (filters.isRemote) {
      list = list.filter((job) => job.isRemote);
    }

    // ----------------------------------------------------------
    // INTERNSHIP
    // ----------------------------------------------------------

    if (filters.isInternship) {
      list = list.filter((job) => job.isInternship);
    }

    // ----------------------------------------------------------
    // FRESHER FRIENDLY
    // ----------------------------------------------------------

    if (filters.isFresherFriendly) {
      list = list.filter((job) => job.isFresherFriendly);
    }

    // ----------------------------------------------------------
    // NEWLY FOUNDED
    // ----------------------------------------------------------

    if (filters.isNewlyFounded) {
      list = list.filter((job) => job.isNewlyFounded);
    }

    // ----------------------------------------------------------
    // LOCATION
    // ----------------------------------------------------------

    if (filters.location && filters.location !== "All") {
      list = list.filter((job) =>
        String(job.location || "")
          .toLowerCase()
          .includes(filters.location.toLowerCase()),
      );
    }

    // ----------------------------------------------------------
    // COMPETITION
    // ----------------------------------------------------------

    if (filters.competition && filters.competition !== "All") {
      list = list.filter(
        (job) =>
          String(job.competition || "").toLowerCase() ===
          filters.competition.toLowerCase(),
      );
    }

    // ----------------------------------------------------------
    // SKILL
    // ----------------------------------------------------------

    if (filters.selectedSkill && filters.selectedSkill !== "All") {
      list = list.filter((job) => {
        const skills = Array.isArray(job.skills)
          ? job.skills
          : String(job.skills || "")
              .split(",")
              .map((skill) => skill.trim());

        return skills.some(
          (skill) =>
            String(skill).toLowerCase() === filters.selectedSkill.toLowerCase(),
        );
      });
    }

    // ==========================================================
    // IMPORTANT:
    //
    // NEVER SHOW A JOB THAT:
    //
    // 1. Was already swiped
    // 2. Was already applied to
    //
    // Applications are checked DIRECTLY from backend-loaded
    // application state.
    // ==========================================================

    return list.filter((job) => {
      const jobId = String(job.id);

      const alreadySwiped = swipedJobIds.has(jobId);

      const alreadyApplied = appliedJobIds.has(jobId);

      const alreadySaved = savedJobIds.has(jobId);

      return !alreadySwiped && !alreadyApplied && !alreadySaved;
    });
  }, [jobs, searchQuery, filters, swipedJobIds, appliedJobIds, savedJobIds]);

  // ============================================================
  // ACTIVE STACK
  // ============================================================

  const activeStack = useMemo(() => filteredJobs.slice(0, 3), [filteredJobs]);

  const currentCard = activeStack[0] || null;

  // ============================================================
  // KEYBOARD ACCESSIBILITY
  // ============================================================

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

      if (!currentCard) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();

        const skipBtn = document.getElementById("btn-card-skip");

        if (skipBtn) {
          skipBtn.click();
        } else {
          handleSwipeLeft(currentCard);
        }
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();

        handleSwipeRight(currentCard);

        // const saveBtn = document.getElementById("btn-card-save");

        // if (saveBtn) {
        //   saveBtn.click();
        // } else {
        //   handleSwipeRight(currentCard);
        // }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentCard,
    handleSwipeLeft,
    handleSwipeRight,
    isFilterModalOpen,
    applyModalJob,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ======================================================
          MAIN SWIPE SECTION
      ====================================================== */}

      <div className="flex-1 max-w-3xl flex flex-col items-center">
        {/* HEADER */}

        <div className="text-center mb-5 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />

            <span>Intelligent Motion Swipe Discovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Your Next Role
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Swipe right to show interest, save interesting opportunities, and
            apply to roles that match your profile.
          </p>
        </div>

        {/* SEARCH */}

        <div className="w-full mb-3">
          <SearchBar />
        </div>

        {/* FILTERS */}

        <div className="w-full mb-6">
          <FilterBar />
        </div>

        {/* ====================================================
            SWIPE DECK
        ==================================================== */}

        <div className="relative w-full max-w-md h-[540px] sm:h-[580px] flex items-center justify-center my-auto">
          {jobsLoading ? (
            <div className="w-full h-full bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center">
              <div className="text-sm text-slate-500">Loading jobs...</div>
            </div>
          ) : activeStack.length > 0 ? (
            <div className="relative w-full h-full">
              <AnimatePresence mode="popLayout">
                {/* BACK CARD */}

                {activeStack.length > 2 && (
                  <JobCard
                    key={`stack-2-${activeStack[2].id}`}
                    job={activeStack[2]}
                    isFront={false}
                    stackIndex={2}
                  />
                )}

                {/* MIDDLE CARD */}

                {activeStack.length > 1 && (
                  <JobCard
                    key={`stack-1-${activeStack[1].id}`}
                    job={activeStack[1]}
                    isFront={false}
                    stackIndex={1}
                  />
                )}

                {/* FRONT CARD */}

                {activeStack.length > 0 && (
                  <JobCard
                    key={activeStack[0].id}
                    job={activeStack[0]}
                    isFront={true}
                    stackIndex={0}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onToggleSave={toggleSaveJob}
                    onApply={(job) => setApplyModalJob(job)}
                    isSaved={isJobSaved(activeStack[0].id)}
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ==================================================
               EMPTY STATE
            ================================================== */

            <div className="w-full h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1.5">
                You're all caught up!
              </h3>

              <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
                All roles matching your current search criteria have been
                reviewed. Adjust your filters to discover more opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
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

        {/* ====================================================
            COUNTER
        ==================================================== */}

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between w-full max-w-md gap-2 text-xs font-medium text-slate-500 px-2">
          <div className="flex items-center gap-2">
            <span>
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
              available
            </span>

            <span className="w-1 h-1 rounded-full bg-slate-300" />

            <button
              type="button"
              onClick={resetSwipes}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />

              <span>Reset</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Keyboard className="w-3 h-3" />

            <span>Use Left / Right arrow keys or drag</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />
    </div>
  );
}

export default DiscoverPage;
