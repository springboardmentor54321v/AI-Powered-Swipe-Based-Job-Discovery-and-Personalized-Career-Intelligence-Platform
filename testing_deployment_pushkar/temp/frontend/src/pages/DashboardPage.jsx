import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  Award,
  Sparkles,
  ArrowUpRight,
  Target,
  BarChart3,
  Flame,
  ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MOCK_DASHBOARD_STATS } from "../utils/mockData";

export function DashboardPage() {
  const { user, resumeAnalysis } = useApp();

  const totalAppsCount = 12;
  const profileCompletionRate = user?.profileCompletion || 85;
  const atsScoreRate = resumeAnalysis?.atsScore || 82;
  const recommendedJobsCount = 24;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Career Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Overview of your applications, profile strength, resume ATS readiness, and market demand
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <span>Find Jobs</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Top 4 Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Applications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Applications
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{totalAppsCount}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>4 active in review</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Profile Completion */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile Strength
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              {profileCompletionRate}%
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-bold">
              <span>Profile verified</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average ATS Score */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resume ATS Score
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{atsScoreRate}%</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-700 font-bold">
              <span>Top 10% candidate pool</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Recommended Jobs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Job Matches
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              {recommendedJobsCount}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-teal-700 font-bold">
              <span>High fit opportunities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Weekly Discovery & Application Activity
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
          </div>

          {/* Activity Bars */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {MOCK_DASHBOARD_STATS.weeklyActivity.map((item, idx) => {
                const maxSwipes = 35;
                const swipeHeight = (item.swipes / maxSwipes) * 100;
                const appHeight = ((item.applied * 5) / maxSwipes) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-36">
                      {/* Swipes bar */}
                      <div
                        className="w-full max-w-[20px] bg-slate-200 group-hover:bg-slate-300 rounded-t-md transition-all relative"
                        style={{ height: `${swipeHeight}%` }}
                        title={`${item.swipes} Swipes`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 bg-slate-100 px-1 rounded shadow-2xs">
                          {item.swipes}
                        </span>
                      </div>
                      {/* Applied bar */}
                      <div
                        className="w-full max-w-[20px] bg-emerald-600 rounded-t-md transition-all relative"
                        style={{ height: `${appHeight}%` }}
                        title={`${item.applied} Applications`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-emerald-700 px-1 rounded">
                          {item.applied}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-200" />
              <span>Jobs Reviewed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span>Applications Sent</span>
            </div>
          </div>
        </div>

        {/* Hiring Trends Widget (1 col) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Trending Job Roles</h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Active
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_DASHBOARD_STATS.hiringTrends.map((trend, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{trend.role}</p>
                  <p className="text-[11px] text-slate-500">Demand: {trend.demand}</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  {trend.growth}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/recommendations"
            className="block text-center w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
          >
            View Recommended Jobs
          </Link>
        </div>
      </div>

      {/* Skill Gap Analysis Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">In-Demand Skills & Gap Analysis</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified from active recruiter job postings matching your developer profile
            </p>
          </div>

          <Link
            to="/resume-analysis"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Run ATS Resume Check →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_DASHBOARD_STATS.topSkillGaps.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{item.skill}</span>
                <span className="text-slate-400 text-[11px] font-medium">{item.frequency}</span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Current Match: <strong>{item.progress}%</strong> • Suggested: Add 1 project demonstrating this skill
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
