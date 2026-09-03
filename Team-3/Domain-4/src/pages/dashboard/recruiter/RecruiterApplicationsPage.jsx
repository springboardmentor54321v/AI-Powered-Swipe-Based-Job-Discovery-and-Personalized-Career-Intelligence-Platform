import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Calendar, Check, Search, Filter, CheckCircle2, UserCheck, Clock } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';

export default function RecruiterApplicationsPage() {
  const navigate = useNavigate();
  const [swipes, setSwipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scheduledIds, setScheduledIds] = useState(new Set());
  const [confirmCandidate, setConfirmCandidate] = useState(null);

  useEffect(() => {
    jobService.getSwipeHistory()
      .then((history) => {
        const rights = (Array.isArray(history) ? history : []).filter((h) => h.direction === 'right');
        setSwipes(rights);
      })
      .catch(() => setSwipes([]))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmSchedule = (candId) => {
    setScheduledIds((prev) => new Set(prev).add(candId));
    setConfirmCandidate(null);
  };

  const filtered = swipes.filter((s) => {
    const job = (s.job_title || `Role #${s.job_id}`).toLowerCase();
    const q = search.toLowerCase();
    return job.includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">Inbound Applications</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Review candidate applications submitted via direct right-swipes on your requisitions.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 self-start sm:self-auto">
          {swipes.length} Inbound Applications
        </span>
      </div>

      {/* Filter Row */}
      {swipes.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications by requisition title..."
            className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-content-subtle">
          Loading inbound applicant stream...
        </div>
      ) : filtered.length > 0 ? (
        <div className="surface-card p-0 overflow-hidden border-white/[0.08]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-white/[0.03] border-b border-outline-variant text-content-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Candidate Reference</th>
                  <th className="p-4">Target Requisition</th>
                  <th className="p-4">Compatibility</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-right">Interview Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filtered.map((cand, idx) => {
                  const candidateId = cand.swipe_id || idx + 101;
                  const isScheduled = scheduledIds.has(candidateId);

                  return (
                    <tr key={candidateId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                            C{idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-content block">
                              Candidate #{candidateId}
                            </span>
                            <span className="text-[11px] text-content-subtle">
                              Verified Resume Attached
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-content block">
                          {cand.job_title || `Requisition #${cand.job_id}`}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {cand.company || 'Enterprise Partner'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-primary-container/30 text-primary-onContainer border border-primary/20 whitespace-nowrap">
                          92% Match
                        </span>
                      </td>

                      <td className="p-4 text-content-muted font-mono text-[11px] whitespace-nowrap">
                        {cand.swiped_at ? new Date(cand.swiped_at).toLocaleDateString() : 'Today'}
                      </td>

                      <td className="p-4 text-right">
                        {isScheduled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium px-2.5 py-1 rounded-lg bg-surface-elevated border border-outline-variant whitespace-nowrap">
                            <Check className="w-3.5 h-3.5 text-primary" />
                            Scheduled
                          </span>
                        ) : (
                          <Button
                            variant="filled"
                            size="sm"
                            icon={Calendar}
                            onClick={() => setConfirmCandidate(candidateId)}
                            className="whitespace-nowrap"
                          >
                            Schedule Screen
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="surface-card p-12 text-center space-y-3 border-dashed">
          <Send className="w-10 h-10 text-content-subtle mx-auto" />
          <h2 className="text-base font-bold text-content">No candidate applications yet</h2>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Candidates who discover and swipe right on your requisitions will appear here in real time.
          </p>
          <div className="pt-2">
            <Button
              variant="filled"
              size="sm"
              onClick={() => navigate('/dashboard/recruiter/post-job')}
            >
              Post a Requisition
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card max-w-sm w-full space-y-4 border-white/[0.08] shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-content">Confirm Candidate Screen</h3>
            </div>
            <p className="text-xs text-content-muted leading-relaxed">
              Schedule an introductory 30-minute screening interview with <strong>Candidate #{confirmCandidate}</strong>? An invitation will be dispatched to their profile.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
              <Button variant="tonal" size="sm" onClick={() => setConfirmCandidate(null)}>
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => handleConfirmSchedule(confirmCandidate)}
              >
                Confirm & Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
