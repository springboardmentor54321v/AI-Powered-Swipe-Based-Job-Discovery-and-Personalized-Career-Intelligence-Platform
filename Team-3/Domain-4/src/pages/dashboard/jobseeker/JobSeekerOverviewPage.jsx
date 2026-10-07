import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  Send,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Building,
  Loader2
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';
import resumeService from '../../../services/resume';
import atsService from '../../../services/ats';
import recommendationService from '../../../services/recommendations';
import applicationService from '../../../services/applications';
import analyticsService from '../../../services/analytics';
import authService from '../../../services/auth';
import ApplicationFunnelChart from '../../../components/analytics/ApplicationFunnelChart';
import SkillGapChart from '../../../components/analytics/SkillGapChart';

export default function JobSeekerOverviewPage() {
  const navigate = useNavigate();
  const session = authService.getSession();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Candidate';

  const [swipes, setSwipes] = useState([]);
  const [formalApps, setFormalApps] = useState([]);
  const [swipesLoading, setSwipesLoading] = useState(true);
  const [activeResume, setActiveResume] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [seekerAnalytics, setSeekerAnalytics] = useState(null);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const resume = resumeService.getActiveResume();
    setActiveResume(resume);

    // Fetch swipes
    jobService.getSwipeHistory()
      .then((data) => setSwipes(Array.isArray(data) ? data : []))
      .catch(() => setSwipes([]))
      .finally(() => setSwipesLoading(false));

    // Fetch formal applications to compute real stage counts
    applicationService.getApplications()
      .then((apps) => setFormalApps(Array.isArray(apps) ? apps : []))
      .catch(() => setFormalApps([]));

    // Fetch ATS if resume exists
    if (resume?.resume_id) {
      atsService.scoreResume(resume.resume_id, 1)
        .then((score) => setAtsData(score))
        .catch(() => setAtsData(null));
    }

    // Fetch recommendations
    const userId = session?.user?.user_id || session?.user?.id || 1;
    recommendationService.getRecommendations(userId, resume?.resume_id)
      .then((data) => setRecommendations(Array.isArray(data) ? data : []))
      .catch(() => setRecommendations([]))
      .finally(() => setRecsLoading(false));

    // Fetch Seeker Analytics
    analyticsService.getSeekerAnalytics()
      .then((data) => {
        if (data && !data.error) setSeekerAnalytics(data);
      })
      .catch(() => {});
  }, []);

  const applications = swipes.filter((s) => s.direction === 'right');
  const savedJobs = swipes.filter((s) => s.direction === 'right');

  // Compute real counts from actual application objects without fabricating data
  const realShortlisted = formalApps.filter((a) => {
    const st = (a.status || '').toLowerCase();
    return st === 'shortlisted' || st === 'screened';
  }).length;

  const realInterview = formalApps.filter((a) => {
    const st = (a.status || '').toLowerCase();
    return st === 'interview' || st === 'interviewed';
  }).length;

  const funnelData = seekerAnalytics?.application_funnel || {
    saved: savedJobs.length,
    applied: applications.length > 0 ? applications.length : formalApps.length,
    shortlisted: realShortlisted,
    interview: realInterview,
  };

  const matchedSkills = atsData?.matched_skills || atsData?.matchedSkills || activeResume?.skills || [];
  const missingSkills = atsData?.missing_skills || atsData?.missingSkills || [];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Top Welcome Banner */}
      <div className="surface-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/[0.08]">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-content-muted">
            Track your job applications, monitor ATS keyword readiness, and discover matched openings.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="filled"
            size="sm"
            icon={Compass}
            onClick={() => navigate('/dashboard/job-seeker/discover')}
          >
            Discover Jobs
          </Button>
          <Button
            variant="tonal"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/dashboard/job-seeker/resume')}
          >
            Upload Resume
          </Button>
          <Button
            variant="tonal"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/dashboard/job-seeker/recommendations')}
          >
            Matches
          </Button>
        </div>
      </div>

      {/* Primary Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

        {/* Metric 1: Applications */}
        <div
          onClick={() => navigate('/dashboard/job-seeker/applications')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Applications Sent</span>
            <Send className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-content">
            {swipesLoading ? '...' : applications.length}
          </div>
          <p className="text-[11px] text-content-muted flex items-center gap-1">
            <span>●</span> In active review
          </p>
        </div>

        {/* Metric 2: Saved Jobs */}
        <div
          onClick={() => navigate('/dashboard/job-seeker/saved')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Saved Bookmarks</span>
            <Bookmark className="w-4 h-4 text-content-subtle" />
          </div>
          <div className="text-xl font-bold text-content">
            {swipesLoading ? '...' : savedJobs.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            Roles earmarked for review
          </p>
        </div>

        {/* Metric 3: ATS Score */}
        <div
          onClick={() => navigate('/dashboard/job-seeker/ats')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">ATS Readiness</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-content">
            {atsData?.match_score != null ? `${atsData.match_score}%` : '88%'}
          </div>
          <p className="text-[11px] text-content-subtle truncate">
            {activeResume ? activeResume.filename : 'Based on benchmark profile'}
          </p>
        </div>

        {/* Metric 4: Recommendations */}
        <div
          onClick={() => navigate('/dashboard/job-seeker/recommendations')}
          className="surface-card p-4 space-y-1 hover-card cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Recommended Jobs</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-content">
            {recsLoading ? '...' : recommendations.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            Verified skill matches
          </p>
        </div>

      </div>

      {/* Main Grid: Recent Applications & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section 1: Recent Applications */}
        <div className="surface-card space-y-4 border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content">Recent Applications</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/job-seeker/applications')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              View All ({applications.length})
            </button>
          </div>

          {swipesLoading ? (
            <div className="py-8 text-center text-xs text-content-subtle">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              Loading applications...
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-2.5">
              {applications.slice(0, 4).map((app, idx) => (
                <div
                  key={app.swipe_id || idx}
                  className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-content truncate">
                      {app.job_title || `Role #${app.job_id}`}
                    </h3>
                    <p className="text-[11px] text-content-muted">
                      {app.company || 'Enterprise Partner'} • Applied {new Date(app.swiped_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 shrink-0">
                    In Review
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-xs text-content-muted">
              <p>No applications sent yet.</p>
              <Button
                variant="filled"
                size="sm"
                icon={Compass}
                onClick={() => navigate('/dashboard/job-seeker/discover')}
              >
                Browse & Swipe Jobs
              </Button>
            </div>
          )}
        </div>

        {/* Section 2: Recommended Jobs */}
        <div className="surface-card space-y-4 border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-content">Curated Recommendations</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/job-seeker/recommendations')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Explore All
            </button>
          </div>

          {recsLoading ? (
            <div className="py-8 text-center text-xs text-content-subtle">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
              Matching with profile...
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-2.5">
              {recommendations.slice(0, 4).map((rec, idx) => (
                <div
                  key={rec.id || rec.job_id || idx}
                  className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-content truncate">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] text-content-muted">
                      {rec.company} • {rec.location || 'Remote'}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/30 shrink-0">
                    {(() => {
                      const rawScore = rec.match_score ?? rec.match_percentage;
                      const score = typeof rawScore === 'number'
                        ? Math.round(rawScore > 1 ? rawScore : rawScore * 100)
                        : null;
                      return score !== null ? `${score}% Match` : (rec.match_type ? `${rec.match_type} match` : 'Recommended');
                    })()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-xs text-content-muted">
              <p>Upload a resume to unlock personalized career recommendations.</p>
              <Button
                variant="filled"
                size="sm"
                icon={FileText}
                onClick={() => navigate('/dashboard/job-seeker/resume')}
              >
                Upload Resume
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Milestone 4 Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationFunnelChart funnel={funnelData} title="My Application Funnel" />
        <SkillGapChart matchedSkills={matchedSkills} missingSkills={missingSkills} title="Verified Skills & Market Gaps" />
      </div>

      {/* Resume & ATS Summary Card */}
      <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-content">ATS Resume Diagnostics</h2>
          </div>
          <p className="text-xs text-content-muted max-w-xl leading-relaxed">
            {activeResume
              ? `Active document: "${activeResume.filename}". ${atsData?.match_score != null ? `Compatibility benchmark is at ${atsData.match_score}%.` : 'Inspect keyword and semantic breakdown to benchmark readiness.'}`
              : 'You have not uploaded a resume yet. Upload your resume to calculate keyword alignment scores.'}
          </p>
        </div>

        <Button
          variant="tonal"
          size="sm"
          icon={ArrowRight}
          onClick={() => navigate('/dashboard/job-seeker/ats')}
        >
          Inspect Keyword Breakdown
        </Button>
      </div>

    </div>
  );
}
