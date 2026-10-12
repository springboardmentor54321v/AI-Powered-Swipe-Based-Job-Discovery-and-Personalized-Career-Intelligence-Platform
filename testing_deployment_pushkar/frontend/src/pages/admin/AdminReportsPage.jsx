import React from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  PieChart,
  Target
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function AdminReportsPage() {
  const { ADMIN_PLATFORM_STATS, ADMIN_ACTIVITY_CHART } = useApp();

  const topSkills = [
    { name: "React.js / Next.js", demand: "88%", count: 1420 },
    { name: "TypeScript", demand: "82%", count: 1280 },
    { name: "Python / AI / ML", demand: "76%", count: 1140 },
    { name: "Node.js / Express", demand: "69%", count: 960 },
    { name: "PostgreSQL / Redis", demand: "61%", count: 830 },
    { name: "Docker / Kubernetes", demand: "54%", count: 710 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Growth & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-level metrics on talent acquisition velocity, swipe deck conversion, and market skill demand.
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 dark:bg-zinc-800/90 rounded-2xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Swipe-to-Apply Conversion</span>
            <span className="text-brand-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+3.2%</span>
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-white">24.8%</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Candidates who swipe right and submit a completed application
          </p>
        </div>

        <div className="bg-slate-900/90 dark:bg-zinc-800/90 rounded-2xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Time to Interview</span>
            <span className="text-purple-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2.4 Days</span>
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-white">58 Hrs</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Fastest turnaround in modern tech recruitment
          </p>
        </div>

        <div className="bg-slate-900/90 dark:bg-zinc-800/90 rounded-2xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ATS Screening Accuracy</span>
            <span className="text-blue-400 font-bold flex items-center gap-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calibrated</span>
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-white">93.4%</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Recruiter interview conversion for 80%+ matched profiles
          </p>
        </div>
      </div>

      {/* Skills Demand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-slate-900/90 dark:bg-zinc-800/90 rounded-3xl border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Most In-Demand Skills on SwipeX</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Requisition Index</span>
          </div>

          <div className="space-y-4">
            {topSkills.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{s.name}</span>
                  <span className="text-purple-400 font-bold">{s.count} Requisitions ({s.demand})</span>
                </div>
                <div className="w-full bg-slate-800 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                    style={{ width: s.demand }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Talent Distribution Demographics */}
        <div className="lg:col-span-5 bg-slate-900/90 dark:bg-zinc-800/90 rounded-3xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" />
            <span>Talent Experience Breakdown</span>
          </h2>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-slate-800/60 dark:bg-zinc-700/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Entry & Freshers (0–1 yr)</p>
                <p className="text-[10px] text-slate-400">Campus grads & bootcamp alumni</p>
              </div>
              <span className="text-xs font-extrabold text-purple-400">28%</span>
            </div>

            <div className="p-3.5 bg-slate-800/60 dark:bg-zinc-700/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Mid-Level Engineers (1–4 yrs)</p>
                <p className="text-[10px] text-slate-400">Full-stack & backend specialists</p>
              </div>
              <span className="text-xs font-extrabold text-blue-400">44%</span>
            </div>

            <div className="p-3.5 bg-slate-800/60 dark:bg-zinc-700/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Senior & Staff Leads (5+ yrs)</p>
                <p className="text-[10px] text-slate-400">Architects & engineering managers</p>
              </div>
              <span className="text-xs font-extrabold text-brand-400">28%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReportsPage;
