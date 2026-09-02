import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Building,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bookmark,
  MapPin,
  IndianRupee,
  Lightbulb,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { INITIAL_RECOMMENDATIONS, INITIAL_JOBS } from "../utils/mockData";
import { MatchScore } from "../components/MatchScore";
import { JobBadge } from "../components/JobBadge";

export function RecommendationsPage() {
  const {
    toggleSaveJob,
    isJobSaved,
    setApplyModalJob,
    applications = [],
  } = useApp();

  /**
   * Safely convert skills into an array.
   *
   * Supports:
   * - ["Java", "Spring Boot"]
   * - "Java, Spring Boot"
   * - undefined / null
   */
  const getSkills = (skills) => {
    if (!skills) return [];

    if (Array.isArray(skills)) {
      return skills.filter(Boolean);
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  /**
   * Safely check whether a recommendation has already
   * been applied for.
   */
  const isApplicationForJob = (jobId) => {
    return applications.some(
      (application) =>
        String(application?.jobId ?? application?.job_id ?? "") ===
        String(jobId)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Job Recommendations
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-slate-500">
          Personalized roles ranked by your skills, experience, and profile
          compatibility
        </p>
      </div>

      {/* Recommendations */}
      {INITIAL_RECOMMENDATIONS.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-1">
            No recommendations yet
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            Complete your profile and resume analysis to receive personalized
            job recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_RECOMMENDATIONS.map((rec) => {
            /**
             * Find the complete job object from mock jobs.
             *
             * The recommendation object may only contain
             * recommendation-specific information, so we merge
             * both objects.
             */
            const sourceJob = INITIAL_JOBS.find(
              (job) => String(job.id) === String(rec.jobId)
            );

            const fullJob = {
              ...(sourceJob || {}),
              ...rec,

              // Keep backend/frontend-compatible ID fields.
              id: rec.jobId ?? sourceJob?.id,

              // Recommendation data takes priority where available.
              title: rec.title ?? sourceJob?.title ?? "Untitled Job",
              company: rec.company ?? sourceJob?.company ?? "Unknown Company",
              location: rec.location ?? sourceJob?.location ?? "Location not specified",
              salary: rec.salary ?? sourceJob?.salary ?? "Not specified",

              skills:
                rec.skills ??
                sourceJob?.skills ??
                [],

              description:
                rec.description ??
                sourceJob?.description ??
                "No job description available.",
            };

            const matchingSkills = getSkills(rec.matchingSkills);
            const missingSkills = getSkills(rec.missingSkills);

            const isSaved = isJobSaved(fullJob.id);
            const isApplied = isApplicationForJob(fullJob.id);

            return (
              <div
                key={rec.id ?? rec.jobId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Job Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        {rec.logo ? (
                          <img
                            src={rec.logo}
                            alt={`${fullJob.company} logo`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider truncate">
                          {fullJob.company}
                        </span>

                        <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2">
                          {fullJob.title}
                        </h3>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <MatchScore
                        score={Number(rec.matchPercentage) || 0}
                        size="pill"
                      />
                    </div>
                  </div>

                  {/* Location / Salary / Job Type */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium mb-4">
                    {fullJob.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {fullJob.location}
                      </span>
                    )}

                    {fullJob.salary && (
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{fullJob.salary}</span>
                      </span>
                    )}

                    {rec.jobType && (
                      <JobBadge
                        type="fulltime"
                        text={rec.jobType}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* Why You Match */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Why you match this role:</span>
                    </div>

                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {rec.recommendationReason ||
                        "This role matches your profile based on the available recommendation data."}
                    </p>
                  </div>

                  {/* Skills Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {/* Matching Skills */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Matching Skills
                      </span>

                      {matchingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {matchingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-200"
                            >
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          No matching skills available.
                        </p>
                      )}
                    </div>

                    {/* Missing Skills */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Skills to Learn
                      </span>

                      {missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {missingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-md border border-amber-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          No additional skills identified.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                  {/* View Details */}
                  <Link
                    to={`/jobs/${fullJob.id}`}
                    className="flex-1 text-center py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  {/* Save */}
                  <button
                    type="button"
                    onClick={() => toggleSaveJob(fullJob)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSaved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                    title={isSaved ? "Saved" : "Save Job"}
                    aria-label={isSaved ? "Remove saved job" : "Save job"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isSaved
                          ? "fill-emerald-600 text-emerald-600"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Apply */}
                  <button
                    type="button"
                    onClick={() => setApplyModalJob(fullJob)}
                    disabled={isApplied}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 font-bold text-xs rounded-xl shadow-2xs transition-all ${
                      isApplied
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />

                    <span>{isApplied ? "Applied" : "Apply"}</span>
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

export default RecommendationsPage;