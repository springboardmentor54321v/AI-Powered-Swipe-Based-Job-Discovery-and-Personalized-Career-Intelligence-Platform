import React from "react";
import { Bell, ShieldAlert, Building2, UserPlus, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminNotificationsPage() {
  const alerts = [
    {
      id: "an-1",
      title: "Employer Credential Verification",
      message: "Cognitive Systems Inc. submitted corporate documents for recruiter account verification.",
      time: "25 mins ago",
      type: "recruiter",
      link: "/admin/recruiters"
    },
    {
      id: "an-2",
      title: "Requisition Quality Flag",
      message: "Listing 'Staff Systems Architect' was flagged by an automated salary validation filter.",
      time: "3 hours ago",
      type: "flag",
      link: "/admin/jobs"
    },
    {
      id: "an-3",
      title: "Milestone: 10,000 Verified Swipes",
      message: "The platform exceeded 10,000 candidate swipe interactions in the current week.",
      time: "1 day ago",
      type: "milestone",
      link: "/admin/reports"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Alerts & Telemetry Feed
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-priority notifications across moderation events, verification queues, and platform health.
        </p>
      </div>

      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-sm divide-y divide-slate-800/80 overflow-hidden">
        {alerts.map((a) => (
          <Link
            key={a.id}
            to={a.link}
            className="p-5 flex items-start gap-4 hover:bg-slate-800/50 transition-colors block"
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                a.type === "recruiter"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : a.type === "flag"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              }`}
            >
              {a.type === "recruiter" ? (
                <Building2 className="w-5 h-5" />
              ) : a.type === "flag" ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white">{a.title}</h3>
                <span className="text-[11px] text-slate-500 font-medium shrink-0">{a.time}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.message}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminNotificationsPage;
