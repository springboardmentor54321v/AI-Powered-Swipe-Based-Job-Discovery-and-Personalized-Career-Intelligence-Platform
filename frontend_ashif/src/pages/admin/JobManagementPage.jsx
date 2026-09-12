import React, { useState } from "react";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Power,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function JobManagementPage() {
  const { adminJobs, updateAdminJobStatus, deleteAdminJob } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);

  const filteredJobs = adminJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || job.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Job Requisition Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ensure listing quality, verify salary authenticity, and moderate job postings across SwipeX.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job title, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["All", "Active", "Pending Review", "Deactivated"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Position & Company</th>
                <th className="py-3.5 px-4">Location & Comp</th>
                <th className="py-3.5 px-4">Posted By</th>
                <th className="py-3.5 px-4">Applicants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div>
                      <p className="font-bold text-white text-sm">{job.title}</p>
                      <p className="text-[11px] text-purple-400 font-medium">{job.company}</p>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <p className="text-slate-300 font-medium">{job.location}</p>
                    <p className="text-[11px] text-slate-400">{job.salary}</p>
                  </td>

                  <td className="py-4 px-4 text-slate-400">
                    <p className="text-slate-300 font-medium">{job.recruiter}</p>
                    <p className="text-[11px] text-slate-500">{job.postedDate}</p>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700">
                      {job.applicants} Applies
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        job.status === "Active"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                          : job.status === "Pending Review"
                          ? "bg-amber-950/60 text-amber-300 border-amber-800"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      <span>{job.status}</span>
                    </span>
                  </td>

                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {job.status !== "Active" && (
                        <button
                          type="button"
                          onClick={() => updateAdminJobStatus(job.id, "Active")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          title="Approve & Publish"
                        >
                          Approve
                        </button>
                      )}

                      {job.status === "Active" && (
                        <button
                          type="button"
                          onClick={() => updateAdminJobStatus(job.id, "Deactivated")}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                          title="Deactivate Job"
                        >
                          Deactivate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmJob(job)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Job Confirmation */}
      {deleteConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-800 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Job Requisition?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Permanently delete <span className="font-bold text-white">{deleteConfirmJob.title}</span> at {deleteConfirmJob.company}?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmJob(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAdminJob(deleteConfirmJob.id);
                  setDeleteConfirmJob(null);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobManagementPage;
