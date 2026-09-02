import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Bookmark,
  Building,
  MapPin,
  IndianRupee,
  Trash2,
  Send,
  ArrowRight,
} from "lucide-react";

import { useApp } from "../context/AppContext";

import { MatchScore } from "../components/MatchScore";
import { JobBadge } from "../components/JobBadge";

export function SavedJobsPage() {
  const {
    savedJobs,
    removeSavedJob,
    setApplyModalJob,
    applications,
  } = useApp();

  const [filterType, setFilterType] =
    useState("All");

  // ============================================================
  // NORMALIZE SKILLS
  //
  // Backend:
  // "Java, Spring Boot, SQL"
  //
  // Frontend:
  // ["Java", "Spring Boot", "SQL"]
  // ============================================================

  const getSkills = (job) => {
    if (!job?.skills) {
      return [];
    }

    if (Array.isArray(job.skills)) {
      return job.skills;
    }

    if (typeof job.skills === "string") {
      return job.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredSavedJobs = useMemo(() => {
    return savedJobs.filter((job) => {
      if (filterType === "All") {
        return true;
      }

      if (filterType === "Remote") {
        return Boolean(job.isRemote);
      }

      if (filterType === "Internship") {
        return Boolean(job.isInternship);
      }

      if (filterType === "Full Time") {
        return (
          job.jobType === "Full Time" ||
          job.jobType === "FULL_TIME" ||
          job.jobType === "Full-Time"
        );
      }

      return true;
    });
  }, [savedJobs, filterType]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">

              <Bookmark className="w-5 h-5 fill-emerald-600 text-emerald-600" />

            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saved Jobs
            </h1>

          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            {savedJobs.length}{" "}
            {savedJobs.length === 1
              ? "job"
              : "jobs"}{" "}
            saved to your list
          </p>

        </div>

        {/* ==================================================
            FILTER TABS
        =================================================== */}

        {savedJobs.length > 0 && (

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start sm:self-auto">

            {[
              "All",
              "Remote",
              "Full Time",
              "Internship",
            ].map((type) => (

              <button
                key={type}
                type="button"
                onClick={() =>
                  setFilterType(type)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === type
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {type}
              </button>

            ))}

          </div>

        )}

      </div>

      {/* ======================================================
          EMPTY STATE
      ======================================================= */}

      {filteredSavedJobs.length === 0 ? (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-md mx-auto my-8">

          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">

            <Bookmark className="w-8 h-8" />

          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {savedJobs.length === 0
              ? "No saved jobs yet"
              : "No jobs match this filter"}
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">

            {savedJobs.length === 0
              ? "Swipe right on jobs in the Discover feed or bookmark them to save them here for quick review."
              : "Try another filter to see your saved jobs."}

          </p>

          {savedJobs.length === 0 && (

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >

              <span>
                Explore Jobs
              </span>

              <ArrowRight className="w-4 h-4" />

            </Link>

          )}

        </div>

      ) : (

        /* ====================================================
           SAVED JOB GRID
        ===================================================== */

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredSavedJobs.map((job) => {

            const skills =
              getSkills(job);

            const isApplied =
              applications.some(
                (application) =>
                  application.jobId ===
                  job.id
              );

            return (

              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >

                {/* ==================================================
                    CARD CONTENT
                =================================================== */}

                <div>

                  {/* =================================================
                      CARD HEADER
                  ================================================== */}

                  <div className="flex items-start justify-between gap-3 mb-3.5">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">

                        {job.logo ? (

                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-full h-full object-cover rounded-lg"
                          />

                        ) : (

                          <Building className="w-6 h-6 text-slate-400" />

                        )}

                      </div>

                      <div className="min-w-0">

                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider line-clamp-1">
                          {job.company}
                        </span>

                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                          {job.title}
                        </h3>

                      </div>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeSavedJob(
                          job.id
                        )
                      }
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Remove from saved"
                      aria-label="Remove job from saved"
                    >

                      <Trash2 className="w-4 h-4" />

                    </button>

                  </div>

                  {/* =================================================
                      BADGES
                  ================================================== */}

                  <div className="flex flex-wrap items-center gap-1.5 mb-3">

                    {job.matchPercentage != null && (

                      <MatchScore
                        score={
                          job.matchPercentage
                        }
                        size="sm"
                      />

                    )}

                    {job.jobType && (

                      <JobBadge
                        type="fulltime"
                        text={
                          job.jobType
                        }
                        size="sm"
                      />

                    )}

                    {job.isRemote && (

                      <JobBadge
                        type="remote"
                        text="Remote"
                        size="sm"
                      />

                    )}

                    {job.isInternship && (

                      <JobBadge
                        type="internship"
                        text="Internship"
                        size="sm"
                      />

                    )}

                    {job.isFresherFriendly && (

                      <JobBadge
                        type="fresher"
                        text="Fresher Friendly"
                        size="sm"
                      />

                    )}

                  </div>

                  {/* =================================================
                      LOCATION
                  ================================================== */}

                  <div className="space-y-1.5 text-xs text-slate-600 my-3">

                    {job.location && (

                      <div className="flex items-center gap-1.5">

                        <MapPin className="w-3.5 h-3.5 text-slate-400" />

                        <span>
                          {job.location}
                        </span>

                      </div>

                    )}

                    {job.salary && (

                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">

                        <IndianRupee className="w-3.5 h-3.5" />

                        <span>
                          {job.salary}
                        </span>

                      </div>

                    )}

                  </div>

                  {/* =================================================
                      DESCRIPTION
                  ================================================== */}

                  {job.description && (

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                      {job.description}
                    </p>

                  )}

                  {/* =================================================
                      SKILLS
                  ================================================== */}

                  {skills.length > 0 && (

                    <div className="flex flex-wrap gap-1 mb-4">

                      {skills
                        .slice(0, 4)
                        .map(
                          (skill) => (

                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                            >
                              {skill}
                            </span>

                          )
                        )}

                      {skills.length > 4 && (

                        <span className="px-1.5 py-0.5 text-slate-400 text-[11px]">

                          +{skills.length - 4}{" "}
                          more

                        </span>

                      )}

                    </div>

                  )}

                </div>

                {/* ==================================================
                    CARD ACTIONS
                =================================================== */}

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">

                  {/* VIEW DETAILS */}

                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex-1 text-center py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  {/* APPLY */}

                  <button
                    type="button"
                    onClick={() =>
                      setApplyModalJob(
                        job
                      )
                    }
                    disabled={isApplied}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-2xs transition-all"
                  >

                    <Send className="w-3.5 h-3.5" />

                    <span>
                      {isApplied
                        ? "Applied"
                        : "Apply"}
                    </span>

                  </button>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default SavedJobsPage;