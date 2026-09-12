import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  MapPin,
  IndianRupee,
  Briefcase,
  Clock,
  Users,
  TrendingDown,
  CheckCircle2,
  Bookmark,
  Send,
  Sparkles,
  Award,
  Gift,
  ShieldCheck,
  Share2
} from "lucide-react";
import { INITIAL_JOBS } from "../utils/mockData";
import { useApp } from "../context/AppContext";
import { JobBadge } from "../components/JobBadge";
import { MatchScore } from "../components/MatchScore";

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isJobSaved,
    toggleSaveJob,
    setApplyModalJob,
    applications,
    addToast
  } = useApp();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = INITIAL_JOBS.find((j) => j.id === id);
    if (found) {
      setJob(found);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Job Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested job posting could not be found or has expired.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </Link>
      </div>
    );
  }

  const isSaved = isJobSaved(job.id);
  const isApplied = applications.some((a) => a.jobId === job.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast("Job link copied to clipboard", "success");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top back navigation and share */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          title="Share job"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Job Hero Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {job.company}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-slate-500">{job.companyType}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <IndianRupee className="w-4 h-4" />
                  <span>{job.salary}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.experience}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <MatchScore score={job.matchPercentage} size="pill" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Posted {job.postedTime}</span>
              <span>•</span>
              <Users className="w-3.5 h-3.5" />
              <span>{job.applicants} applicants</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-6 pt-6 border-t border-slate-100">
          <JobBadge type="fulltime" text={job.jobType} />
          {job.isFresherFriendly && <JobBadge type="fresher" text="Fresher Friendly" />}
          {job.isRemote && <JobBadge type="remote" text="Remote Available" />}
          {job.isInternship && <JobBadge type="internship" text="Internship Program" />}
          {job.isNewlyFounded && <JobBadge type="newly-founded" text="High-Growth Startup" />}
          <JobBadge
            type="low-competition"
            text={`${job.competition} Competition`}
            icon={TrendingDown}
          />
        </div>

        {/* Primary Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => setApplyModalJob(job)}
            disabled={isApplied}
            id="btn-job-details-apply"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-sm shadow-xs active:scale-98 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isApplied ? "Application Submitted" : "Apply for this Job"}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSaveJob(job)}
            id="btn-job-details-save"
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm border active:scale-98 transition-all ${
              isSaved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? "fill-emerald-600 text-emerald-600" : "text-slate-400"}`}
            />
            <span>{isSaved ? "Saved in Jobs" : "Save Job"}</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About the Role */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Job Overview</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          {job.requiredSkills && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Required Skills & Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {job.preferredSkills && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Nice to Have
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Benefits & Perks */}
          {job.benefits && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Benefits & Perks</h2>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar Info & Match Insights (1 col) */}
        <div className="space-y-6">
          {/* Match Insight Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Match Analysis
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {job.matchPercentage}% Compatibility
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your profile skills match closely with <strong>{job.skills.slice(0, 3).join(", ")}</strong>.
            </p>
            <Link
              to="/resume-analysis"
              className="inline-flex items-center justify-center w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Analyze Resume for this Role
            </Link>
          </div>

          {/* Company Snapshot */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Company Snapshot
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Company</span>
                <span className="font-semibold text-slate-800">{job.company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Type</span>
                <span className="font-semibold text-slate-800">{job.companyType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Location</span>
                <span className="font-semibold text-slate-800">{job.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Competition</span>
                <span className="font-semibold text-emerald-700">{job.competition}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Employer on SwipeX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailsPage;
