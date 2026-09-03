import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Compass, Search, Building, Calendar, CheckCircle2, Clock, Eye } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';

export default function JobSeekerApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    jobService.getSwipeHistory()
      .then((history) => {
        const rights = (Array.isArray(history) ? history : []).filter((h) => h.direction === 'right');
        setApplications(rights);
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter((app) => {
    const title = (app.job_title || `Role #${app.job_id}`).toLowerCase();
    const company = (app.company || '').toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">Applications Tracker</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Monitor the status of your transmitted applications and employer interview stages.
          </p>
        </div>

        <Button
          variant="filled"
          size="sm"
          icon={Compass}
          onClick={() => navigate('/dashboard/job-seeker/discover')}
        >
          Apply to More Roles
        </Button>
      </div>

      {/* Filter Row */}
      {applications.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by role title or company..."
              className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
            />
          </div>

          <span className="text-xs text-content-subtle self-start sm:self-auto">
            {filtered.length} Applications Active
          </span>
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-content-subtle">
          Loading application status...
        </div>
      ) : filtered.length > 0 ? (
        <div className="surface-card p-0 overflow-hidden border-white/[0.08]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead className="bg-white/[0.03] border-b border-outline-variant text-content-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Opportunity</th>
                  <th className="p-4">Employer</th>
                  <th className="p-4">Date Applied</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filtered.map((app, idx) => {
                  const isScheduled = idx === 0;
                  return (
                    <tr key={app.swipe_id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-content block text-sm truncate max-w-[200px] sm:max-w-xs">
                          {app.job_title || `Requisition #${app.job_id}`}
                        </span>
                        <span className="text-[11px] text-content-subtle">
                          Direct Swipe Match
                        </span>
                      </td>

                      <td className="p-4 text-content-muted">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-xs">{app.company || 'Enterprise Partner'}</span>
                        </div>
                      </td>

                      <td className="p-4 text-content-muted font-mono text-[11px] whitespace-nowrap">
                        {app.swiped_at ? new Date(app.swiped_at).toLocaleDateString() : 'Today'}
                      </td>

                      <td className="p-4">
                        {isScheduled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-primary-container/30 text-primary-onContainer border border-primary/20 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-primary" />
                            Screening
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content-muted border border-outline-variant whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Submitted
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          variant="tonal"
                          size="sm"
                          onClick={() => navigate('/dashboard/job-seeker/discover')}
                          className="whitespace-nowrap"
                        >
                          View Deck
                        </Button>
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
          <h2 className="text-base font-bold text-content">No applications transmitted yet</h2>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Swipe right on job postings in the Discover deck to automatically transmit your verified profile to employer hiring pipelines.
          </p>
          <div className="pt-2">
            <Button
              variant="filled"
              size="sm"
              icon={Compass}
              onClick={() => navigate('/dashboard/job-seeker/discover')}
            >
              Start Swiping Jobs
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
