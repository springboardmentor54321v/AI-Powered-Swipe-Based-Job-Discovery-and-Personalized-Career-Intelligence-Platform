import React, { useState } from 'react';
import {
  Bookmark,
  Send,
  CheckCircle2,
  Calendar,
  XCircle,
  Clock,
  Building2,
  History,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getStatusDetails } from './ApplicationStatusTimeline';

const STAGES = [
  { key: 'saved', label: 'Saved', icon: Bookmark, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  { key: 'applied', label: 'Applied', icon: Send, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
  { key: 'shortlisted', label: 'Shortlisted', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
  { key: 'interview', label: 'Interview', icon: Calendar, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
];

export default function ApplicationTrackingBoard({ applications = [], onViewTimeline }) {
  const [activeMobileTab, setActiveMobileTab] = useState('applied');

  // Normalize application status into standard stage keys
  const getStageKey = (status) => {
    const s = (status || 'applied').toLowerCase();
    if (s === 'interviewed' || s === 'interview') return 'interview';
    if (s === 'shortlisted' || s === 'screened') return 'shortlisted';
    if (s === 'saved') return 'saved';
    if (s === 'rejected' || s === 'declined') return 'rejected';
    return 'applied';
  };

  const grouped = {
    saved: [],
    applied: [],
    shortlisted: [],
    interview: [],
    rejected: [],
  };

  applications.forEach((app) => {
    const key = getStageKey(app.status);
    if (grouped[key]) {
      grouped[key].push(app);
    } else {
      grouped.applied.push(app);
    }
  });

  return (
    <div className="space-y-6">

      {/* Mobile/Tablet Stage Tabs */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map((stg) => {
          const count = grouped[stg.key].length;
          const isActive = activeMobileTab === stg.key;
          const Icon = stg.icon;
          return (
            <button
              key={stg.key}
              type="button"
              onClick={() => setActiveMobileTab(stg.key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                isActive
                  ? 'bg-primary text-surface border-primary shadow-sm'
                  : 'bg-white/[0.03] text-content-muted border-white/[0.08] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{stg.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-surface text-primary' : 'bg-white/[0.08] text-white'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Kanban Board View */}
      <div className="hidden lg:grid grid-cols-5 gap-3.5 items-start">
        {STAGES.map((stg) => {
          const items = grouped[stg.key];
          const Icon = stg.icon;
          return (
            <div
              key={stg.key}
              className="surface-card rounded-3xl border border-white/[0.08] bg-[#0e0f15]/80 p-3.5 space-y-3 flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-content-subtle" />
                  <span className="text-xs font-bold text-white">{stg.label}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-content-muted border border-white/[0.06]">
                  {items.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[550px] pr-0.5">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-[11px] text-content-subtle border border-dashed border-white/[0.06] rounded-2xl">
                    No roles {stg.label.toLowerCase()}
                  </div>
                ) : (
                  items.map((app, idx) => (
                    <ApplicationCard
                      key={app.id || app.job_id || idx}
                      application={app}
                      onViewTimeline={onViewTimeline}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet Tabbed List View */}
      <div className="lg:hidden space-y-3">
        {grouped[activeMobileTab].length === 0 ? (
          <div className="py-16 text-center surface-card rounded-3xl border border-white/[0.08] p-8 text-xs text-content-muted">
            No applications currently in the{' '}
            <span className="font-bold text-white capitalize">{activeMobileTab}</span> stage.
          </div>
        ) : (
          grouped[activeMobileTab].map((app, idx) => (
            <ApplicationCard
              key={app.id || app.job_id || idx}
              application={app}
              onViewTimeline={onViewTimeline}
            />
          ))
        )}
      </div>

    </div>
  );
}

function ApplicationCard({ application, onViewTimeline }) {
  const details = getStatusDetails(application.status);
  const StatusIcon = details.icon;

  return (
    <div className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all space-y-2.5 relative group">
      <div>
        <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">
          {application.job_title || `Role #${application.job_id}`}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] text-content-muted mt-1 truncate">
          <Building2 className="w-3 h-3 text-primary shrink-0" />
          <span className="truncate">{application.company || 'Enterprise Requisition'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-content-subtle border-t border-white/[0.04] pt-2">
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {application.created_at || application.swiped_at
            ? new Date(application.created_at || application.swiped_at).toLocaleDateString()
            : 'Recent'}
        </span>

        {application.resume_score && (
          <span className="text-emerald-400 font-semibold">
            ATS {Math.round(application.resume_score)}%
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onViewTimeline && onViewTimeline(application)}
        className="w-full py-1.5 px-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[10px] font-semibold text-content-subtle hover:text-white border border-white/[0.04] transition-colors flex items-center justify-center gap-1"
      >
        <History className="w-3 h-3 text-primary" />
        <span>View History Timeline</span>
      </button>
    </div>
  );
}
