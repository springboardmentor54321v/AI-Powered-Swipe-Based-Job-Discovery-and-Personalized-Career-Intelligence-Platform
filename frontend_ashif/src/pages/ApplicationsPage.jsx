import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  Search,
  ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ApplicationCard } from "../components/ApplicationCard";

export function ApplicationsPage() {
  const { applications } = useApp();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate statistics dynamically
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "Applied").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    rejected: applications.filter((a) => a.status === "Rejected").length
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      selectedStatus === "All" || app.status.toLowerCase() === selectedStatus.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      app.title.toLowerCase().includes(q) ||
      app.company.toLowerCase().includes(q) ||
      app.location.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Applications
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Track interview calls, recruiter responses, and submission statuses in one dashboard
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Applied */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "Applied" ? "All" : "Applied")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedStatus === "Applied"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedStatus === "Applied" ? "text-slate-300" : "text-slate-400"
              }`}
            >
              Applied
            </span>
            <Clock
              className={`w-4 h-4 ${
                selectedStatus === "Applied" ? "text-emerald-400" : "text-blue-600"
              }`}
            />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold">{stats.applied}</p>
          <p
            className={`text-[11px] mt-1 ${
              selectedStatus === "Applied" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            In initial review
          </p>
        </button>

        {/* Shortlisted */}
        <button
          type="button"
          onClick={() =>
            setSelectedStatus(selectedStatus === "Shortlisted" ? "All" : "Shortlisted")
          }
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedStatus === "Shortlisted"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-emerald-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedStatus === "Shortlisted" ? "text-emerald-100" : "text-slate-400"
              }`}
            >
              Shortlisted
            </span>
            <CheckCircle2
              className={`w-4 h-4 ${
                selectedStatus === "Shortlisted" ? "text-emerald-200" : "text-emerald-600"
              }`}
            />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold">{stats.shortlisted}</p>
          <p
            className={`text-[11px] mt-1 ${
              selectedStatus === "Shortlisted" ? "text-emerald-100" : "text-slate-500"
            }`}
          >
            Profile accepted
          </p>
        </button>

        {/* Interview */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "Interview" ? "All" : "Interview")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedStatus === "Interview"
              ? "bg-purple-700 text-white border-purple-700 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-purple-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedStatus === "Interview" ? "text-purple-100" : "text-slate-400"
              }`}
            >
              Interview
            </span>
            <UserCheck
              className={`w-4 h-4 ${
                selectedStatus === "Interview" ? "text-purple-200" : "text-purple-600"
              }`}
            />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold">{stats.interview}</p>
          <p
            className={`text-[11px] mt-1 ${
              selectedStatus === "Interview" ? "text-purple-100" : "text-slate-500"
            }`}
          >
            Active rounds
          </p>
        </button>

        {/* Rejected / Closed */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === "Rejected" ? "All" : "Rejected")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedStatus === "Rejected"
              ? "bg-slate-800 text-white border-slate-800 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedStatus === "Rejected" ? "text-slate-300" : "text-slate-400"
              }`}
            >
              Archived
            </span>
            <XCircle
              className={`w-4 h-4 ${
                selectedStatus === "Rejected" ? "text-rose-300" : "text-slate-400"
              }`}
            />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold">{stats.rejected}</p>
          <p
            className={`text-[11px] mt-1 ${
              selectedStatus === "Rejected" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Closed / Completed
          </p>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search submitted applications..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar">
          {["All", "Applied", "Shortlisted", "Interview", "Rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatus === status
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            No applications found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            {selectedStatus !== "All"
              ? `No active applications in the '${selectedStatus}' stage.`
              : "Explore jobs and apply to start tracking your applications here."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <span>Explore Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
