import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Send,
  UserCheck,
  Calendar,
  XCircle,
  Bookmark,
  ShieldAlert
} from 'lucide-react';
import { formatTimeAgo } from '../notifications/NotificationItem';

export function getStatusDetails(status) {
  const norm = (status || 'applied').toLowerCase();
  switch (norm) {
    case 'saved':
      return { label: 'Saved', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40', icon: Bookmark };
    case 'applied':
      return { label: 'Applied', color: 'text-blue-400 bg-blue-950/40 border-blue-800/40', icon: Send };
    case 'shortlisted':
      return { label: 'Shortlisted', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40', icon: CheckCircle2 };
    case 'interview':
    case 'interviewed':
      return { label: 'Interview', color: 'text-purple-400 bg-purple-950/40 border-purple-800/40', icon: Calendar };
    case 'rejected':
      return { label: 'Rejected', color: 'text-rose-400 bg-rose-950/40 border-rose-800/40', icon: XCircle };
    default:
      return { label: status || 'In Review', color: 'text-content-muted bg-white/[0.05] border-white/[0.1]', icon: Clock };
  }
}

export default function ApplicationStatusTimeline({ application, events = [], onClose }) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!application) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#12131a] border border-white/[0.1] shadow-2xl p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              Application Audit Log
            </span>
            <h2 className="text-lg font-bold text-white">
              {application.job_title || `Role #${application.job_id || ''}`}
            </h2>
            <p className="text-xs text-content-muted">
              {application.company || 'Direct Requisition'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-content-subtle hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline List */}
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Clock className="w-6 h-6 text-content-subtle mx-auto" />
              <p className="text-xs text-content-muted">
                Initial application transmitted. Awaiting employer status updates.
              </p>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/40 text-blue-400 border border-blue-800/30">
                Current Status: {application.status || 'Applied'}
              </div>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/[0.1]">
              {events.map((evt, idx) => {
                const details = getStatusDetails(evt.to_status);
                const Icon = details.icon;
                return (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#12131a] border border-white/[0.2] flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${details.color}`}>
                        {details.label}
                      </span>
                      <span className="text-[10px] text-content-subtle">
                        {evt.occurred_at ? new Date(evt.occurred_at).toLocaleString() : 'Recent'}
                      </span>
                    </div>

                    {evt.from_status && (
                      <p className="text-[11px] text-content-muted">
                        Transitioned from <span className="capitalize">{evt.from_status}</span>
                      </p>
                    )}

                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-content-subtle">
                        {JSON.stringify(evt.metadata)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
