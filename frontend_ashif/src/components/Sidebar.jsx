import React from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Briefcase,
  Sparkles,
  User,
  TrendingUp,
  Award,
  ChevronRight
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function Sidebar() {
  const { user, savedJobs, applications, resumeAnalysis } = useApp();

  return (
    <aside className="w-72 hidden xl:flex flex-col gap-5 shrink-0 py-6 pr-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold overflow-hidden shrink-0 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-emerald-700" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">{user?.name || "Candidate"}</h3>
            <p className="text-xs text-slate-500 truncate">{user?.role || "Software Developer"}</p>
          </div>
        </div>

        {/* Profile Completion Gauge */}
        <div className="space-y-1.5 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Profile Readiness</span>
            <span className="text-emerald-700 font-bold">{user?.profileCompletion || 85}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${user?.profileCompletion || 85}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <Link
            to="/saved"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group"
          >
            <p className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {savedJobs?.length || 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saved Jobs</p>
          </Link>

          <Link
            to="/applications"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group"
          >
            <p className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {applications?.length || 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Applications</p>
          </Link>
        </div>
      </div>

      {/* ATS Optimizer Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ATS Score
            </span>
          </div>
          <span className="text-xs font-bold bg-slate-800 px-2.5 py-0.5 rounded-lg text-emerald-400 border border-slate-700">
            {resumeAnalysis?.atsScore || 82}%
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Your resume matches <strong>Full Stack & Frontend Developer</strong> roles well. 2 quick keyword improvements available.
        </p>

        <Link
          to="/resume-analysis"
          className="flex items-center justify-between w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white transition-colors"
        >
          <span>Run Resume ATS Check</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Quick Shortcuts
        </p>

        <Link
          to="/recommendations"
          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Role Matches</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            4 New
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span>Career Analytics</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
