import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Activity,
  UserCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function AdminDashboard() {
  const {
    adminUsers,
    adminRecruiters,
    adminJobs,
    adminApplications,
    ADMIN_PLATFORM_STATS,
    ADMIN_ACTIVITY_CHART
  } = useApp();

  const pendingRecruiterApprovals = adminRecruiters.filter(
    (r) => r.status === "Pending Verification"
  ).length;

  const flaggedJobs = adminJobs.filter((j) => j.status === "Pending Review").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-purple-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200 mb-3 border border-purple-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>SwipeX Super Admin Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Master Console
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Monitor ecosystem health, review recruiter verification credentials, moderate job requisitions, and inspect user activity metrics.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/admin/users"
              id="btn-admin-view-users"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Manage User Base ({adminUsers.length})</span>
            </Link>

            <Link
              to="/admin/recruiters"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Verify Employers ({pendingRecruiterApprovals} Pending)</span>
            </Link>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Registered Users</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{ADMIN_PLATFORM_STATS.totalUsers}</h3>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% monthly</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Recruiters & Orgs</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">
              {ADMIN_PLATFORM_STATS.totalRecruiters}
            </h3>
            <span className="text-[11px] font-medium text-blue-400 mt-0.5 block">
              {pendingRecruiterApprovals} waiting review
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Moderated Jobs</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{adminJobs.length}</h3>
            <span className="text-[11px] font-medium text-emerald-400 mt-0.5 block">
              {adminJobs.filter((j) => j.status === "Active").length} active now
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Applications</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">
              {ADMIN_PLATFORM_STATS.totalApplications}
            </h3>
            <span className="text-[11px] font-semibold text-amber-400 mt-0.5 block">
              2,840 this week
            </span>
          </div>
        </div>
      </div>

      {/* Activity Visualizer + System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Platform Activity Trends */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Weekly Platform Throughput</span>
              </h2>
              <p className="text-xs text-slate-400">Swipe discovery interactions vs. direct applications</p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Full analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Simple Visual Activity Bars */}
          <div className="space-y-3 pt-2">
            {ADMIN_ACTIVITY_CHART.map((item) => (
              <div key={item.day} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300 font-bold">{item.day}</span>
                  <span className="text-slate-400">
                    <span className="text-purple-400 font-semibold">{item.swipes} Swipes</span> •{" "}
                    <span className="text-emerald-400 font-semibold">{item.applications} Applies</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-purple-500 h-full rounded-l-full"
                    style={{ width: `${(item.swipes / 2500) * 100}%` }}
                    title={`Swipes: ${item.swipes}`}
                  />
                  <div
                    className="bg-emerald-400 h-full rounded-r-full"
                    style={{ width: `${(item.applications / 400) * 30}%` }}
                    title={`Applications: ${item.applications}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>User Discovery Swipes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Completed Job Applications</span>
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Critical Action Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Action Required</h2>
            <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/80 text-amber-300 rounded-full text-[10px] font-bold">
              {pendingRecruiterApprovals + flaggedJobs} Items
            </span>
          </div>

          <div className="space-y-3">
            {/* Pending Recruiter */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">Employer Approval</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-900">
                  Needs Review
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Cognitive Systems Inc. submitted verification credentials for 45 job slots.
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  to="/admin/recruiters"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Review Org
                </Link>
              </div>
            </div>

            {/* Moderation Alert */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">Job Moderation</span>
                </div>
                <span className="text-[10px] text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900">
                  Flagged
                </span>
              </div>
              <p className="text-xs text-slate-300">
                1 requisition requires salary accuracy and company email verification.
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  to="/admin/jobs"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
                >
                  Moderate Job
                </Link>
              </div>
            </div>

            {/* System Status Summary */}
            <div className="bg-purple-950/20 rounded-2xl border border-purple-900/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Swipe Engine Status: Optimal</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Client Motion drag physics operating with 60fps frame rate. In-memory swipe state caching active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
