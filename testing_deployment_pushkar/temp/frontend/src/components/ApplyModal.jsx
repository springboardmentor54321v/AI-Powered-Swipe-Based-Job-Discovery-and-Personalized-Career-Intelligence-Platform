import React, { useState } from "react";
import { X, Send, FileText, CheckCircle2, Building, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export function ApplyModal() {
  const { applyModalJob, setApplyModalJob, user, applyToJob } = useApp();
  const [notes, setNotes] = useState("");
  const [portfolioLink, setPortfolioLink] = useState(user?.portfolio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!applyModalJob) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      applyToJob(applyModalJob, notes);
      setIsSubmitting(false);
      setApplyModalJob(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              {applyModalJob.logo ? (
                <img
                  src={applyModalJob.logo}
                  alt={applyModalJob.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <h2 id="apply-modal-title" className="text-base font-bold text-slate-900 line-clamp-1">
                Apply to {applyModalJob.company}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{applyModalJob.title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setApplyModalJob(null)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close apply modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Quick Summary Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">
                {applyModalJob.matchPercentage}% Profile Compatibility
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
              {applyModalJob.salary}
            </span>
          </div>

          {/* Applicant Profile Snapshot */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Applicant Profile
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">{user?.name || "Candidate"}</p>
                <p className="text-xs text-slate-500">{user?.email || "candidate@example.com"}</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Verified Candidate
              </span>
            </div>
          </div>

          {/* Attached Resume */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached Resume
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {user?.resumeName || "Candidate_Resume.pdf"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {user?.resumeSize || "1.4 MB"} • ATS Score: {user?.atsScore || 82}%
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ready
              </span>
            </div>
          </div>

          {/* Portfolio link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Portfolio / GitHub / LinkedIn URL
            </label>
            <input
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://github.com/yourhandle"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Note to Hiring Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Cover Note / Introduction
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefly highlight why you're a great fit for this role..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApplyModalJob(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-confirm-apply"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyModal;
