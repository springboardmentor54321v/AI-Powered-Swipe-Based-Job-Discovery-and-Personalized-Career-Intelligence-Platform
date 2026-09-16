import React from "react";
import { Bell, CheckCircle2, Users, Briefcase, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function RecruiterNotificationsPage() {
  const notifications = [
    {
      id: "rn-1",
      title: "New High ATS Match Candidate!",
      message: "Arjun Verma (94% ATS Match) applied for Senior Full Stack Engineer.",
      time: "10 mins ago",
      type: "match",
      link: "/recruiter/applicants"
    },
    {
      id: "rn-2",
      title: "Interview Confirmation",
      message: "Ananya Sharma accepted your technical round invite for tomorrow at 2:00 PM IST.",
      time: "2 hours ago",
      type: "interview",
      link: "/recruiter/applicants"
    },
    {
      id: "rn-3",
      title: "Job Requisition Published",
      message: "Your job 'Lead Backend Architect' is active and appearing on the discovery deck.",
      time: "1 day ago",
      type: "job",
      link: "/recruiter/manage-jobs"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Recruiter Notifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Stay updated on applicant activity, interview replies, and requisition milestones.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.map((n) => (
          <Link
            key={n.id}
            to={n.link}
            className="p-5 flex items-start gap-4 hover:bg-slate-50/80 transition-colors block"
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                n.type === "match"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : n.type === "interview"
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              {n.type === "match" ? (
                <Sparkles className="w-5 h-5" />
              ) : n.type === "interview" ? (
                <Clock className="w-5 h-5" />
              ) : (
                <Briefcase className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{n.title}</h3>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecruiterNotificationsPage;
