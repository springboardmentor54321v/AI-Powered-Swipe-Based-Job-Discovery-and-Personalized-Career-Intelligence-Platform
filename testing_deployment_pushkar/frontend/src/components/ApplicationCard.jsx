import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  MapPin,
  IndianRupee,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { MatchScore } from "./MatchScore";

export function ApplicationCard({ application }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Interview":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Applied":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
      id={`application-card-${application.id}`}
    >
      <div className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Company & Title */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
              {application.logo ? (
                <img
                  src={application.logo}
                  alt={application.company}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {application.company}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500">Applied on {application.appliedDate}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{application.title}</h3>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {application.location}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{application.salary}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Status & Match Score */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusBadge(
                application.status
              )}`}
            >
              {application.status}
            </span>
            <MatchScore score={application.matchPercentage} size="sm" showIcon={false} />
          </div>
        </div>

        {/* Notes preview if present */}
        {application.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2">
              <strong className="text-slate-800">Note: </strong>
              {application.notes}
            </p>
          </div>
        )}

        {/* Timeline breakdown drawer */}
        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Application Milestones
            </p>
            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {application.timeline?.map((step, idx) => (
                <div key={idx} className="relative flex items-center justify-between text-xs">
                  <div
                    className={`absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      step.done
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300 text-transparent"
                    }`}
                  >
                    {step.done && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span
                    className={`font-semibold ${
                      step.done ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step.step}
                  </span>
                  <span className="text-[11px] text-slate-500">{step.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>{isExpanded ? "Hide Status Timeline" : "View Application Timeline"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            to={`/jobs/${application.jobId}`}
            className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>View Job Posting</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ApplicationCard;
