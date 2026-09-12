import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Calendar,
  Star,
  Briefcase,
  ArrowLeft,
  Share2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Layers,
  HeartHandshake,
  DollarSign
} from "lucide-react";
import { getCompanyById, getJobs } from "../services/api";
import { useApp } from "../context/AppContext";

export function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setApplyModalJob, isJobSaved, toggleSaveJob, addToast } = useApp();

  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const compRes = await getCompanyById(id);
        if (compRes && compRes.data) {
          setCompany(compRes.data);

          // Find jobs belonging to this company
          const jobsRes = await getJobs();
          if (jobsRes && jobsRes.data) {
            const compName = compRes.data.name.toLowerCase();
            const matched = jobsRes.data.filter((j) =>
              j.company.toLowerCase().includes(compName)
            );
            setCompanyJobs(matched);
          }
        } else {
          setError("Company profile not found.");
        }
      } catch (err) {
        console.error("Error loading company details:", err);
        setError("Failed to load company details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast("Company link copied to clipboard!", "success");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-100 rounded-2xl" />
            <div className="h-40 bg-slate-100 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Company Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || "We couldn't locate this company profile."}</p>
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Companies Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </button>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs mb-8">
        {/* Banner with gradient accent */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-all"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Details Header */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-5">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 border-4 border-white shadow-md overflow-hidden shrink-0">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {company.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                    {company.category}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {company.industry} • Founded {company.foundedYear}
                </p>
              </div>
            </div>

            {/* External website link */}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all w-fit"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Visit Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Headquarters</p>
                <p className="font-semibold text-slate-900">{company.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Team Size</p>
                <p className="font-semibold text-slate-900">{company.employeeCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Culture Rating</p>
                <p className="font-semibold text-slate-900">{company.rating} / 5.0</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Open Positions</p>
                <p className="font-semibold text-emerald-700">
                  {companyJobs.length > 0 ? companyJobs.length : company.openJobsCount || 1} roles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is About & Tech; Right is Benefits & Open Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: About, Tech Stack, Perks */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Us */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>About {company.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {company.about}
            </p>
          </div>

          {/* Tech Stack */}
          {company.techStack && company.techStack.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Primary Engineering Stack</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Culture & Benefits */}
          {company.benefits && company.benefits.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Workplace Benefits & Perks</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Active Job Openings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Open Roles</span>
              </h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full">
                {companyJobs.length > 0 ? companyJobs.length : company.openJobsCount || 1}
              </span>
            </div>

            {companyJobs.length > 0 ? (
              <div className="space-y-3">
                {companyJobs.map((job) => {
                  const isSaved = isJobSaved(job.id);
                  return (
                    <div
                      key={job.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {job.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleSaveJob(job)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                          title={isSaved ? "Remove from saved" : "Save role"}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isSaved ? "fill-emerald-600 text-emerald-600" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2.5">
                        <span>{job.jobType || "Full-time"}</span>
                        <span>•</span>
                        <span>{job.salary || "Competitive"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                          {job.matchScore || 85}% Match
                        </span>

                        <button
                          type="button"
                          onClick={() => setApplyModalJob(job)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs"
                        >
                          Quick Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">No active positions posted at this exact moment.</p>
                <Link
                  to="/"
                  className="mt-3 inline-block text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Explore all discovery jobs →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailsPage;
