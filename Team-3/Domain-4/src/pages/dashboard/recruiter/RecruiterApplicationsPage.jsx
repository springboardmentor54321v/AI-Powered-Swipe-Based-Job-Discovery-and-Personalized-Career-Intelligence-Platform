import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Search,
  CheckCircle2,
  Calendar,
  XCircle,
  Clock,
  Building2,
  Loader2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';
import applicationService from '../../../services/applications';
import { getStatusDetails } from '../../../components/applications/ApplicationStatusTimeline';

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Status Mutation Modal State
  const [targetAction, setTargetAction] = useState(null); // { app: Object, nextStatus: string }
  const [updating, setUpdating] = useState(false);
  const [mutationMessage, setMutationMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch from formal Application Service
      let appList = [];
      try {
        appList = await applicationService.getApplications();
      } catch {
        appList = [];
      }

      // 2. Fetch right swipes
      let swipeList = [];
      try {
        const history = await jobService.getSwipeHistory();
        swipeList = (Array.isArray(history) ? history : [])
          .filter((s) => s.direction === 'right')
          .map((s) => ({
            id: s.id || `swipe_${s.job_id}`,
            job_id: s.job_id,
            job_title: s.job_title,
            company: s.company,
            status: 'applied',
            applicant_name: `Candidate #${s.user_id || '9021'}`,
            created_at: s.swiped_at,
          }));
      } catch {
        swipeList = [];
      }

      const mergedMap = new Map();
      swipeList.forEach((item) => mergedMap.set(String(item.job_id), item));
      appList.forEach((item) => mergedMap.set(String(item.job_id), item));
      setApplications(Array.from(mergedMap.values()));
    } catch (err) {
      setError(err.message || 'Unable to load recruiter applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmStatusChange = async () => {
    if (!targetAction) return;
    setUpdating(true);
    setMutationMessage(null);
    try {
      await applicationService.updateApplicationStatus(
        targetAction.app.id,
        targetAction.nextStatus
      );
      // Update local state
      setApplications((prev) =>
        prev.map((a) =>
          a.id === targetAction.app.id ? { ...a, status: targetAction.nextStatus } : a
        )
      );
      setMutationMessage({
        type: 'success',
        text: `Application transitioned to ${targetAction.nextStatus.toUpperCase()}`
      });
      setTargetAction(null);
    } catch (err) {
      setMutationMessage({
        type: 'error',
        text: err.message || 'Failed to update candidate status on backend.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const filtered = applications.filter((app) => {
    const title = (app.job_title || `Role #${app.job_id}`).toLowerCase();
    const candidate = (app.applicant_name || '').toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || candidate.includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Inbound Candidate Submissions</h1>
              <p className="text-xs text-content-muted mt-0.5">
                Review candidate applications submitted to your requisitions and advance them through evaluation stages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="tonal"
            size="sm"
            icon={RotateCcw}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            {applications.length} Candidates
          </span>
        </div>
      </div>

      {mutationMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
          mutationMessage.type === 'success'
            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
            : 'bg-red-950/30 text-red-300 border-red-800/40'
        }`}>
          {mutationMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{mutationMessage.text}</span>
        </div>
      )}

      {/* Filter Row */}
      {applications.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates or job requisitions..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-content-subtle">Loading inbound candidate pipeline...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center space-y-3 bg-red-950/20 border border-red-800/30 rounded-3xl">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
          <p className="text-sm text-red-300 font-semibold">{error}</p>
          <Button variant="tonal" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-20 text-center surface-card rounded-3xl border border-white/[0.08] p-8 space-y-3">
          <Send className="w-8 h-8 text-content-subtle mx-auto" />
          <h3 className="text-sm font-bold text-white">No candidate applications yet</h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Candidates who right-swipe on your active job postings will appear here for shortlisting and interview scheduling.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => {
            const statusDetails = getStatusDetails(app.status);
            const currentStatus = (app.status || 'applied').toLowerCase();

            return (
              <div
                key={app.id || app.job_id}
                className="surface-card rounded-3xl border border-white/[0.08] p-5 space-y-4 bg-[#12131a] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${statusDetails.color}`}>
                      {statusDetails.label}
                    </span>
                    <span className="text-[10px] text-content-subtle">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {app.job_title || `Role #${app.job_id}`}
                    </h3>
                    <p className="text-xs text-content-muted mt-0.5">
                      {app.applicant_name || 'Applicant'}
                    </p>
                  </div>
                </div>

                {/* Recruiter Evaluation Actions */}
                <div className="space-y-2 border-t border-white/[0.06] pt-3">
                  <span className="text-[10px] font-bold text-content-subtle uppercase tracking-wider block">
                    Advance Stage
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={currentStatus === 'shortlisted'}
                      onClick={() => setTargetAction({ app, nextStatus: 'shortlisted' })}
                      className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      disabled={currentStatus === 'interview'}
                      onClick={() => setTargetAction({ app, nextStatus: 'interview' })}
                      className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Interview
                    </button>
                    <button
                      type="button"
                      disabled={currentStatus === 'rejected'}
                      onClick={() => setTargetAction({ app, nextStatus: 'rejected' })}
                      className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {targetAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#12131a] border border-white/[0.1] shadow-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white">
              Confirm Status Transition
            </h3>
            <p className="text-xs text-content-muted leading-relaxed">
              Are you sure you want to transition candidate application for{' '}
              <strong className="text-white">{targetAction.app.job_title}</strong> to{' '}
              <strong className="text-primary uppercase">{targetAction.nextStatus}</strong>?
              This will update candidate records and trigger an in-app audit event.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTargetAction(null)}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-surface shadow-md flex items-center gap-2"
              >
                {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
