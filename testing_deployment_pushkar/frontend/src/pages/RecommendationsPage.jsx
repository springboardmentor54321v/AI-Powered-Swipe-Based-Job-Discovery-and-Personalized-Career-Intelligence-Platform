import React, { useEffect, useState } from "react";
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
  Radio,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useApp } from "../context/AppContext";

import { jobService } from "../services/jobService";
import { aiService } from "../services/aiService";

import { MatchScore } from "../components/MatchScore";
import { JobBadge } from "../components/JobBadge";

// ============================================================
// HELPER: turn any error shape into a safe, renderable string.
// FastAPI 422 validation errors return `detail` as an ARRAY of
// {type, loc, msg, input} objects, not a string — rendering that
// array directly in JSX throws "Objects are not valid as a React
// child". This normalizes every possible shape to plain text.
// ============================================================

function extractErrorMessage(err, fallback) {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || JSON.stringify(item))
      .join(" ");
  }

  if (typeof err?.response?.data?.message === "string") {
    return err.response.data.message;
  }

  if (typeof err?.message === "string") {
    return err.message;
  }

  return fallback;
}

export function RecommendationsPage() {

  const {
    user,
    setApplyModalJob,
    addToast,
  } = useApp();

  const [recommendations, setRecommendations] =
    useState([]);

  const [savedJobIds, setSavedJobIds] =
    useState(new Set());

  const [applicationJobIds, setApplicationJobIds] =
    useState(new Set());

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [isLiveConnected, setIsLiveConnected] =
    useState(false);

  const [savingJobId, setSavingJobId] =
    useState(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadRecommendations = async () => {

    setIsLoading(true);
    setError(null);

    // Backend requires user_id — without it the request 422s before
    // it even reaches the recommendation logic.
    const userId = user?.id ?? user?.user_id;

    if (!userId) {
      setIsLoading(false);
      setError(
        "You need to be logged in to see personalized recommendations."
      );
      return;
    }

    try {

      const [
        recommendationResponse,
        savedResponse,
        applicationResponse,
      ] = await Promise.allSettled([

        aiService.getRecommendations(userId),

        jobService.getSavedJobs(),

        jobService.getApplications(),

      ]);

      // ========================================================
      // RECOMMENDATIONS
      // ========================================================

      if (
        recommendationResponse.status === "rejected"
      ) {
        throw recommendationResponse.reason;
      }

      const recommendationData =
        recommendationResponse.value;

      console.log(
        "AI recommendations:",
        recommendationData
      );

      const recommendationList =
        recommendationData?.recommendations ||
        recommendationData?.data ||
        (Array.isArray(recommendationData) ? recommendationData : []);

      setRecommendations(
        Array.isArray(recommendationList)
          ? recommendationList
          : []
      );

      setIsLiveConnected(
        Boolean(
          recommendationData?.isLive ??
          recommendationData?.live ??
          true
        )
      );

      // ========================================================
      // SAVED JOBS
      // ========================================================

      if (
        savedResponse.status === "fulfilled"
      ) {

        const savedData =
          savedResponse.value;

        const savedJobs =
          savedData?.jobs ||
          savedData?.data ||
          [];

        const ids = new Set(
          Array.isArray(savedJobs)
            ? savedJobs.map(
                (item) =>
                  Number(
                    item.job_id ??
                    item.job?.id ??
                    item.id
                  )
              )
            : []
        );

        setSavedJobIds(ids);
      }

      // ========================================================
      // APPLICATIONS
      // ========================================================

      if (
        applicationResponse.status === "fulfilled"
      ) {

        const applicationData =
          applicationResponse.value;

        const applications =
          applicationData?.applications ||
          applicationData?.data ||
          [];

        const ids = new Set(
          Array.isArray(applications)
            ? applications.map(
                (item) =>
                  Number(
                    item.job_id ??
                    item.job?.id
                  )
              )
            : []
        );

        setApplicationJobIds(ids);
      }

    } catch (err) {

      console.error(
        "Failed to load recommendations:",
        err
      );

      setError(
        extractErrorMessage(err, "Unable to generate recommendations.")
      );

    } finally {

      setIsLoading(false);

    }
  };

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.user_id]);

  // ============================================================
  // SAVE / UNSAVE
  // ============================================================

  const handleSave = async (job) => {

    const jobId =
      Number(job.jobId ?? job.id);

    if (!jobId) {
      return;
    }

    const alreadySaved =
      savedJobIds.has(jobId);

    setSavingJobId(jobId);

    try {

      if (alreadySaved) {

        await jobService.unsaveJob(jobId);

        setSavedJobIds(
          (previous) => {

            const next =
              new Set(previous);

            next.delete(jobId);

            return next;
          }
        );

        addToast(
          "Job removed from saved jobs.",
          "success"
        );

      } else {

        await jobService.saveJob(jobId);

        setSavedJobIds(
          (previous) =>
            new Set([
              ...previous,
              jobId,
            ])
        );

        addToast(
          "Job saved successfully.",
          "success"
        );
      }

    } catch (err) {

      console.error(
        "Failed to save job:",
        err
      );

      addToast(
        extractErrorMessage(err, "Unable to update saved job."),
        "error"
      );

    } finally {

      setSavingJobId(null);

    }
  };

  // ============================================================
  // APPLY
  // ============================================================

  const handleApply = (job) => {

    const jobId =
      Number(job.jobId ?? job.id);

    if (!jobId) {
      return;
    }

    if (applicationJobIds.has(jobId)) {
      return;
    }

    /*
     * Keep Apply Modal here if your existing application
     * flow collects resume / cover letter.
     */

    setApplyModalJob({
      id: jobId,
      title: job.title,
      company: job.company,
      logo: job.logo,
      location: job.location,
      salary: job.salary,
      employment_type:
        job.employment_type ??
        job.jobType,
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-72 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl" />

                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-28" />
                    <div className="h-5 bg-slate-200 rounded w-40" />
                  </div>
                </div>

                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
            )
          )}

        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center max-w-md mx-auto">

          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Failed to load recommendations
          </h3>

          <p className="text-xs text-slate-500 mb-4">
            {error}
          </p>

          <button
            type="button"
            onClick={loadRecommendations}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (recommendations.length === 0) {

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">

          <div className="flex items-center gap-2">

            <div className="p-2 bg-emerald-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              AI Job Recommendations
            </h1>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">

          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-900 mb-1">
            No recommendations yet
          </h3>

          <p className="text-xs text-slate-500">
            Upload your resume or complete your profile
            to generate personalized job recommendations.
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">

      {/* HEADER */}

      <div className="mb-8">

        <div className="flex items-center gap-2 mb-1">

          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Job Recommendations
          </h1>

          {isLiveConnected && (
            <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

              <Radio className="w-3 h-3 animate-pulse" />

              Live AI Feed

            </span>
          )}

        </div>

        <p className="text-xs sm:text-sm text-slate-500">
          Personalized jobs based on your profile and resume skills.
        </p>

      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {recommendations.map((rec, index) => {

          const jobId =
            Number(
              rec.jobId ??
              rec.job_id ??
              rec.id
            );

          const matchPercentage =
            Number(
              rec.matchPercentage ??
              rec.match_percentage ??
              rec.match_score ??
              0
            );

          const matchingSkills =
            rec.matchingSkills ??
            rec.matching_skills ??
            [];

          const missingSkills =
            rec.missingSkills ??
            rec.missing_skills ??
            [];

          const jobType =
            rec.jobType ??
            rec.job_type ??
            rec.employment_type ??
            "Full Time";

          const isSaved =
            savedJobIds.has(jobId);

          const isApplied =
            applicationJobIds.has(jobId);

          const fullJob = {
            id: jobId,
            title: rec.title,
            company: rec.company,
            logo: rec.logo,
            location: rec.location,
            salary: rec.salary,
            employment_type: jobType,
          };

          return (

            <div
              key={`${jobId}-${index}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between"
            >

              {/* HEADER */}

              <div>

                <div className="flex items-start justify-between gap-4 mb-4">

                  <div className="flex items-center gap-3.5 min-w-0">

                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">

                      {rec.logo ? (
                        <img
                          src={rec.logo}
                          alt={rec.company}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-slate-400" />
                      )}

                    </div>

                    <div className="min-w-0">

                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        {rec.company}
                      </span>

                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {rec.title}
                      </h3>

                    </div>

                  </div>

                  <MatchScore
                    score={matchPercentage}
                    size="pill"
                  />

                </div>

                {/* DETAILS */}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium mb-4">

                  {rec.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {rec.location}
                    </span>
                  )}

                  {rec.salary && (
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {rec.salary}
                    </span>
                  )}

                  <JobBadge
                    type={
                      String(jobType)
                        .toLowerCase()
                        .includes("intern")
                        ? "internship"
                        : "fulltime"
                    }
                    text={jobType}
                    size="sm"
                  />

                </div>

                {/* WHY MATCH */}

                {rec.recommendationReason && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">

                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1.5">

                      <Lightbulb className="w-3.5 h-3.5" />

                      Why you match this role

                    </div>

                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {rec.recommendationReason}
                    </p>

                  </div>
                )}

                {/* SKILLS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">

                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mb-2">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      Matching Skills

                    </span>

                    <div className="flex flex-wrap gap-1">

                      {matchingSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-200"
                          >
                            ✓ {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">

                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1 mb-2">

                      <AlertTriangle className="w-3.5 h-3.5" />

                      Skills to Learn

                    </span>

                    <div className="flex flex-wrap gap-1">

                      {missingSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-md border border-amber-200"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">

                <Link
                  to={`/jobs/${jobId}`}
                  className="flex-1 text-center py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                >
                  View Details
                </Link>

                {/* SAVE */}

                <button
                  type="button"
                  onClick={() =>
                    handleSave(fullJob)
                  }
                  disabled={
                    savingJobId === jobId
                  }
                  className={`p-2.5 rounded-xl border transition-all ${
                    isSaved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                  title={
                    isSaved
                      ? "Remove from saved jobs"
                      : "Save job"
                  }
                >

                  {savingJobId === jobId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bookmark
                      className={`w-4 h-4 ${
                        isSaved
                          ? "fill-emerald-600 text-emerald-600"
                          : "text-slate-400"
                      }`}
                    />
                  )}

                </button>

                {/* APPLY */}

                <button
                  type="button"
                  onClick={() =>
                    handleApply(fullJob)
                  }
                  disabled={isApplied}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
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

    </div>
  );
}

export default RecommendationsPage;