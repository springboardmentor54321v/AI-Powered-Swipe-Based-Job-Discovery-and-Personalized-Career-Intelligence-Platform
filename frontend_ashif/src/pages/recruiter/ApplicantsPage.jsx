import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Users,
  Eye,
  FileText,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function ApplicantsPage() {
  const { recruiterApplicants, updateApplicantStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statusColors = {
    Applied: "bg-slate-100 text-slate-700 border-slate-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
    Shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
    Interview: "bg-purple-50 text-purple-700 border-purple-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const filteredApplicants = recruiterApplicants.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedJobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" || app.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review ATS-matched candidates, filter by stage, and advance qualified profiles to interviews.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, role, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["All", "Applied", "Under Review", "Shortlisted", "Interview", "Rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applicants found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or switching to the "All" status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplicants.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Candidate Info */}
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <img
                  src={app.avatar}
                  alt={app.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 mt-0.5 sm:mt-0"
                />

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/recruiter/applicants/${app.id}`}
                      className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {app.name}
                    </Link>

                    {/* ATS Score Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.atsScore >= 85
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.atsScore >= 70
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{app.atsScore}% ATS Match</span>
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        statusColors[app.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium truncate">
                    Applying for: <span className="font-bold text-slate-900">{app.appliedJobTitle}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{app.email}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{app.phone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Applied {app.appliedDate}</span>
                    </span>
                  </div>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {app.skills?.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {app.skills?.length > 5 && (
                      <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                        +{app.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Selector & Review Action */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
                    Stage
                  </label>
                  <select
                    value={app.status}
                    onChange={(e) => updateApplicantStatus(app.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="pt-3.5 sm:pt-4">
                  <Link
                    to={`/recruiter/applicants/${app.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApplicantsPage;
