import React, { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getPersonalizedJobs } from "../services/api";
import { MatchScore } from "../components/MatchScore";
import { JobBadge } from "../components/JobBadge";

export function RecommendationsPage() {
  const {
    toggleSaveJob,
    isJobSaved,
    setApplyModalJob,
    applications
  } = useApp();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPersonalizedJobs();
      if (res && res.data) {
        setRecommendations(res.data);
        setIsLiveConnected(Boolean(res.isLive));
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Unable to generate recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

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
          {isLiveConnected && (
            <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              Live AI Feed
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Personalized roles ranked by your skills, experience, and profile compatibility
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-5 bg-slate-200 rounded w-40" />
                  </div>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Failed to load recommendations</h3>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            type="button"
            onClick={loadRecommendations}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
          >
            Retry
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No recommendations yet</h3>
          <p className="text-xs text-slate-500 mb-4">
            Complete your profile or upload a resume to unlock tailored AI match recommendations.
          </p>
        </div>
      ) : (
        /* Recommendations Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const fullJob = {
              id: rec.jobId,
              title: rec.title,
              company: rec.company,
              logo: rec.logo,
              location: rec.location,
              salary: rec.salary,
              matchScore: rec.matchPercentage
            };

            const isSaved = isJobSaved(rec.jobId);
            const isApplied = applications.some((a) => a.jobId === rec.jobId);

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Header with Company Logo & Match Score */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
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
                      <div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                          {rec.company}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {rec.title}
                        </h3>
                      </div>
                    </div>

                    <MatchScore score={rec.matchPercentage} size="pill" />
                  </div>

                  {/* Location and Salary */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {rec.location}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{rec.salary}</span>
                    </span>
                    <JobBadge type="fulltime" text={rec.jobType} size="sm" />
                  </div>

                  {/* Why this job insight card */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Why you match this role:</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {rec.recommendationReason}
                    </p>
                  </div>

                  {/* Matched Skills vs Missing Skills Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {/* Matching */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Matching Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rec.matchingSkills &&
                          rec.matchingSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-200"
                            >
                              ✓ {s}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Missing */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Skills to Learn
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rec.missingSkills &&
                          rec.missingSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-md border border-amber-200"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                  <Link
                    to={`/jobs/${rec.jobId}`}
                    className="flex-1 text-center py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleSaveJob(fullJob)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSaved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                    title={isSaved ? "Saved" : "Save Job"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? "fill-emerald-600 text-emerald-600" : "text-slate-400"}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyModalJob(fullJob)}
                    disabled={isApplied}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-2xs transition-all"
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
