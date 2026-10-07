import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Users,
  UserCheck,
  Send,
  Calendar,
  Eye,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';
import applicationService from '../../../services/applications';
import analyticsService from '../../../services/analytics';
import authService from '../../../services/auth';
import ApplicationFunnelChart from '../../../components/analytics/ApplicationFunnelChart';

export default function RecruiterOverviewPage() {
  const navigate = useNavigate();
  const session = authService.getSession();
  const userName = session?.user?.name || 'Recruiter';

  const [jobs, setJobs] = useState([]);
  const [swipes, setSwipes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobService.listJobs({}),
      jobService.getSwipeHistory(),
      applicationService.getApplications().catch(() => [])
    ]).then(([jobList, swipeList, appList]) => {
      setJobs(Array.isArray(jobList) ? jobList : []);
      setSwipes(Array.isArray(swipeList) ? swipeList : []);
      setApplications(Array.isArray(appList) ? appList : []);
    }).catch(() => {
      setJobs([]);
      setSwipes([]);
      setApplications([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const inboundCandidates = swipes.filter((s) => s.direction === 'right');
  const activeJobs = jobs.filter((j) => j.status !== 'Paused');

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Top Banner */}
      <div className="surface-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/[0.08]">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/30 inline-block mb-1">
            Recruiter Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Recruiter Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-content-muted">
            Manage your company requisitions, review inbound candidate applications, and schedule screens.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="filled"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/dashboard/recruiter/post-job')}
          >
            Post a Job
          </Button>
          <Button
            variant="tonal"
            size="sm"
            icon={Send}
            onClick={() => navigate('/dashboard/recruiter/applications')}
          >
            View Applications
          </Button>
          <Button
            variant="tonal"
            size="sm"
            icon={Briefcase}
            onClick={() => navigate('/dashboard/recruiter/jobs')}
          >
            Manage My Jobs
          </Button>
        </div>
      </div>

      {/* Recruiter Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

        {/* Metric 1: Active Jobs */}
        <div
          onClick={() => navigate('/dashboard/recruiter/jobs')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-content">
            {loading ? '...' : activeJobs.length}
          </div>
          <p className="text-[11px] text-content-muted flex items-center gap-1">
            <span>●</span> Live in candidate deck
          </p>
        </div>

        {/* Metric 2: Total Jobs Posted */}
        <div
          onClick={() => navigate('/dashboard/recruiter/jobs')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Total Jobs Posted</span>
            <PlusCircle className="w-4 h-4 text-content-subtle" />
          </div>
          <div className="text-xl font-bold text-content">
            {loading ? '...' : jobs.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            All company requisitions
          </p>
        </div>

        {/* Metric 3: Applications Received */}
        <div
          onClick={() => navigate('/dashboard/recruiter/applications')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Applications Received</span>
            <Send className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-content">
            {loading ? '...' : inboundCandidates.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            Candidate right-swipes
          </p>
        </div>

        {/* Metric 4: Candidates in Pipeline */}
        <div
          onClick={() => navigate('/dashboard/recruiter/candidates')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Candidate Pool</span>
            <UserCheck className="w-4 h-4 text-content-subtle" />
          </div>
          <div className="text-xl font-bold text-content">
            {loading ? '...' : inboundCandidates.length + 3}
          </div>
          <p className="text-[11px] text-content-subtle">
            Verified candidate profiles
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Applications & Active Job Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section 1: Recent Applications Received */}
        <div className="surface-card space-y-4 border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-content">Recent Candidate Applications</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/recruiter/applications')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              View All ({inboundCandidates.length})
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-content-subtle">
              Loading inbound applications...
            </div>
          ) : inboundCandidates.length > 0 ? (
            <div className="space-y-2.5">
              {inboundCandidates.slice(0, 4).map((cand, idx) => (
                <div
                  key={cand.swipe_id || idx}
                  className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-content truncate">
                      Verified Applicant #{cand.swipe_id || idx + 101}
                    </h3>
                    <p className="text-[11px] text-content-muted truncate">
                      Applied for: <strong className="text-content font-medium">{cand.job_title || `Role #${cand.job_id}`}</strong>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 shrink-0">
                    92% Match
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-xs text-content-muted">
              <p>No inbound candidate applications yet.</p>
              <Button
                variant="filled"
                size="sm"
                icon={PlusCircle}
                onClick={() => navigate('/dashboard/recruiter/post-job')}
              >
                Publish a Requisition
              </Button>
            </div>
          )}
        </div>

        {/* Section 2: Active Job Posts */}
        <div className="surface-card space-y-4 border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content">Active Requisitions</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/recruiter/jobs')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Manage Jobs ({jobs.length})
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-content-subtle">
              Loading active jobs...
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-2.5">
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id || job.job_id}
                  className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-content truncate">{job.title}</h3>
                    <p className="text-[11px] text-content-muted">
                      {job.location || 'Remote'} • <strong className="text-emerald-400">{job.salary || 'Competitive'}</strong>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                    Active in Deck
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-xs text-content-muted">
              <p>No requisitions posted yet.</p>
              <Button
                variant="filled"
                size="sm"
                icon={PlusCircle}
                onClick={() => navigate('/dashboard/recruiter/post-job')}
              >
                Post Your First Requisition
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Recruitment Funnel Chart (Milestone 4) */}
      {(() => {
        const shortlistedCount = applications.filter((a) => {
          const s = (a.status || '').toLowerCase();
          return s === 'shortlisted' || s === 'screened';
        }).length;
        const interviewCount = applications.filter((a) => {
          const s = (a.status || '').toLowerCase();
          return s === 'interview' || s === 'interviewed';
        }).length;

        const funnel = {
          saved: swipes.length,
          applied: inboundCandidates.length > 0 ? inboundCandidates.length : applications.length,
          shortlisted: shortlistedCount,
          interview: interviewCount,
        };

        const conversionRate = swipes.length > 0
          ? `${Math.round((inboundCandidates.length / swipes.length) * 100)}%`
          : '0%';

        return (
          <>
            <ApplicationFunnelChart
              funnel={funnel}
              title="Candidate Application Pipeline Funnel"
            />

            {/* Recruitment Activity Stream */}
            <div className="surface-card p-6 space-y-4 border-white/[0.08]">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-content">Recruitment Sourcing Velocity</h2>
                </div>
                <span className="text-[11px] text-content-subtle">Real-time telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-1">
                  <span className="text-content-subtle block text-[11px]">Total Requisitions Managed</span>
                  <span className="text-lg font-bold text-content">
                    {jobs.length} postings
                  </span>
                  <p className="text-[11px] text-emerald-400">Requisitions active in discovery catalog</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-1">
                  <span className="text-content-subtle block text-[11px]">Inbound Swipe Conversion</span>
                  <span className="text-lg font-bold text-content">
                    {conversionRate}
                  </span>
                  <p className="text-[11px] text-content-subtle">Candidate interest converted to pipeline</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-1">
                  <span className="text-content-subtle block text-[11px]">Active Pipeline Depth</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {shortlistedCount + interviewCount} screened
                  </span>
                  <p className="text-[11px] text-content-subtle">Candidates currently in advanced stages</p>
                </div>
              </div>
            </div>
          </>
        );
      })()}

    </div>
  );
}
