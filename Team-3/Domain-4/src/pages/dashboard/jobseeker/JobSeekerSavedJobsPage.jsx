import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Compass, MapPin, Building, Banknote, Trash2, ArrowUpRight, Search } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';

export default function JobSeekerSavedJobsPage() {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    jobService.getSwipeHistory()
      .then((history) => {
        const rights = (Array.isArray(history) ? history : []).filter((h) => h.direction === 'right');
        setSavedJobs(rights);
      })
      .catch(() => setSavedJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = savedJobs.filter((job) => {
    const title = (job.job_title || `Role #${job.job_id}`).toLowerCase();
    const company = (job.company || '').toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">Saved Jobs</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Positions you have bookmarked during your swipe discovery sessions.
          </p>
        </div>

        <Button
          variant="filled"
          size="sm"
          icon={Compass}
          onClick={() => navigate('/dashboard/job-seeker/discover')}
        >
          Discover More Jobs
        </Button>
      </div>

      {/* Search Filter */}
      {savedJobs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter saved jobs by title or company..."
            className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-content-subtle">
          Loading saved jobs...
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job, idx) => (
            <div
              key={job.swipe_id || idx}
              className="surface-card p-5 space-y-3 hover-card flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content-muted border border-outline-variant whitespace-nowrap">
                    Saved Bookmark
                  </span>
                  <span className="text-[11px] text-content-subtle whitespace-nowrap">
                    {job.swiped_at ? new Date(job.swiped_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-content leading-tight truncate">
                  {job.job_title || `Opportunity #${job.job_id}`}
                </h3>

                <div className="flex items-center gap-2 text-xs text-content-muted">
                  <Building className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                  <span className="truncate max-w-[160px]">{job.company || 'Enterprise Partner'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant flex items-center justify-between gap-2">
                <span className="text-xs text-content-muted font-medium">
                  Application Logged
                </span>
                <Button
                  variant="tonal"
                  size="sm"
                  icon={ArrowUpRight}
                  onClick={() => navigate('/dashboard/job-seeker/applications')}
                >
                  Track Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface-card p-12 text-center space-y-3 border-dashed">
          <Bookmark className="w-10 h-10 text-content-subtle mx-auto" />
          <h2 className="text-base font-bold text-content">No saved jobs yet</h2>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            As you explore opportunities in the Discover Deck, swipe right or save roles to store them here for review.
          </p>
          <div className="pt-2">
            <Button
              variant="filled"
              size="sm"
              icon={Compass}
              onClick={() => navigate('/dashboard/job-seeker/discover')}
            >
              Go to Discover Deck
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
