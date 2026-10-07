import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Compass, Search, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import Button from '../../../components/common/Button';
import applicationService from '../../../services/applications';
import jobService from '../../../services/jobs';
import ApplicationTrackingBoard from '../../../components/applications/ApplicationTrackingBoard';
import ApplicationStatusTimeline from '../../../components/applications/ApplicationStatusTimeline';

export default function JobSeekerApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Timeline Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch formal applications from Application Service
      let appList = [];
      try {
        appList = await applicationService.getApplications();
      } catch {
        appList = [];
      }

      // 2. Fetch right-swipes from Job & Swipe service as fallback / saved items
      let swipeList = [];
      try {
        const history = await jobService.getSwipeHistory();
        swipeList = (Array.isArray(history) ? history : [])
          .filter((h) => h.direction === 'right')
          .map((s) => ({
            id: s.id || `swipe_${s.job_id}`,
            job_id: s.job_id,
            job_title: s.job_title,
            company: s.company,
            status: 'applied',
            swiped_at: s.swiped_at,
            created_at: s.swiped_at,
          }));
      } catch {
        swipeList = [];
      }

      // Merge and deduplicate by job_id
      const mergedMap = new Map();
      swipeList.forEach((item) => mergedMap.set(String(item.job_id), item));
      appList.forEach((item) => mergedMap.set(String(item.job_id), item));

      setApplications(Array.from(mergedMap.values()));
    } catch (err) {
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTimeline = async (app) => {
    setSelectedApp(app);
    setTimelineLoading(true);
    try {
      const events = await applicationService.getApplicationHistory(app.id);
      setTimelineEvents(Array.isArray(events) ? events : []);
    } catch {
      setTimelineEvents([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const title = (app.job_title || `Role #${app.job_id}`).toLowerCase();
    const company = (app.company || '').toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Application Tracking Board</h1>
              <p className="text-xs text-content-muted mt-0.5">
                Track your active candidacies across Saved, Applied, Shortlisted, Interview, and Decision stages.
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

          <Button
            variant="filled"
            size="sm"
            icon={Compass}
            onClick={() => navigate('/dashboard/job-seeker/discover')}
          >
            Discover Roles
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {applications.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applied roles or companies..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-content-subtle">Aggregating application records...</p>
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
          <h3 className="text-sm font-bold text-white">No applications submitted yet</h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Swipe right on roles in the Discover portal to instantly submit or save opportunities to your tracking board.
          </p>
          <Button
            variant="filled"
            size="sm"
            icon={Compass}
            onClick={() => navigate('/dashboard/job-seeker/discover')}
            className="mx-auto"
          >
            Start Discovering
          </Button>
        </div>
      ) : (
        <ApplicationTrackingBoard
          applications={filtered}
          onViewTimeline={handleOpenTimeline}
        />
      )}

      {/* Timeline Modal */}
      {selectedApp && (
        <ApplicationStatusTimeline
          application={selectedApp}
          events={timelineEvents}
          loading={timelineLoading}
          onClose={() => setSelectedApp(null)}
        />
      )}

    </div>
  );
}
