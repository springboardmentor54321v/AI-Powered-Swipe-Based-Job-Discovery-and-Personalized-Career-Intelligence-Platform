import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  FileText,
  Briefcase,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Award,
  Building,
  UserCheck
} from 'lucide-react';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import authService from '../services/auth';
import jobService from '../services/jobs';
import resumeService from '../services/resume';
import recommendationService from '../services/recommendations';

// Modular Role-Specific Dashboards
import JobSeekerDashboard from '../components/dashboard/JobSeekerDashboard';
import RecruiterDashboard from '../components/dashboard/RecruiterDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const navigate = useNavigate();

  // User session & active role
  const [session, setSession] = useState(() => authService.getSession());
  const userRole = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();
  const [selectedRoleView, setSelectedRoleView] = useState(userRole);

  // Shared Data State
  const [swipes, setSwipes] = useState([]);
  const [swipesLoading, setSwipesLoading] = useState(true);
  const [swipesError, setSwipesError] = useState('');

  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  // Job Seeker Specific State
  const [activeResume, setActiveResume] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [atsLoading, setAtsLoading] = useState(true);
  const [atsError, setAtsError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState('');

  // Load Swipe Interactions
  const loadSwipeData = useCallback(async () => {
    setSwipesLoading(true);
    setSwipesError('');
    try {
      const history = await jobService.getSwipeHistory();
      setSwipes(Array.isArray(history) ? history : []);
    } catch {
      setSwipesError('Unable to load swipe history.');
      setSwipes([]);
    } finally {
      setSwipesLoading(false);
    }
  }, []);

  // Load All Jobs
  const loadAllJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const list = await jobService.listJobs({});
      setAllJobs(Array.isArray(list) ? list : []);
    } catch {
      setJobsError('Unable to load job listings.');
      setAllJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // Load ATS Readiness Score
  const loadAtsScore = useCallback(async (resume) => {
    if (!resume || !resume.resume_id) {
      setAtsLoading(false);
      setAtsData(null);
      return;
    }
    setAtsLoading(true);
    setAtsError('');
    try {
      const scoreData = await resumeService.getAtsScore(resume.resume_id, 1);
      setAtsData(scoreData);
    } catch {
      setAtsError('Unable to calculate ATS score.');
      setAtsData(null);
    } finally {
      setAtsLoading(false);
    }
  }, []);

  // Load Curated Recommendations
  const loadRecommendations = useCallback(async (userId, resumeId) => {
    setRecsLoading(true);
    setRecsError('');
    try {
      const data = await recommendationService.getRecommendations(userId, resumeId);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch {
      setRecsError('Unable to load recommendations.');
      setRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  }, []);

  // Sync on Mount
  useEffect(() => {
    const currentSession = authService.getSession();
    setSession(currentSession);
    const initialRole = (currentSession?.role || currentSession?.user?.role || 'job_seeker').toLowerCase();
    setSelectedRoleView(initialRole);

    const resume = resumeService.getActiveResume();
    setActiveResume(resume);

    const userId = currentSession?.user?.user_id || currentSession?.user?.id || 1;
    const resumeId = resume?.resume_id;

    loadSwipeData();
    loadAllJobs();
    loadAtsScore(resume);
    loadRecommendations(userId, resumeId);

    const unsub = authService.subscribe((updated) => {
      setSession(updated);
      if (updated?.role) {
        setSelectedRoleView(updated.role.toLowerCase());
      }
    });
    return unsub;
  }, [loadSwipeData, loadAllJobs, loadAtsScore, loadRecommendations]);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';

  const handleRoleChange = (newRole) => {
    setSelectedRoleView(newRole);
    authService.setRole(newRole);
  };

  const handleAddJob = (createdJob) => {
    setAllJobs((prev) => [createdJob, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Header & Role Workspace Switcher */}
      <div className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/80 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">
              {userName}'s Workspace
            </h1>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
              {selectedRoleView === 'job_seeker' ? 'Candidate Portal' : selectedRoleView === 'recruiter' ? 'Recruiter Studio' : 'Platform Administration'}
            </span>
          </div>
          <p className="text-xs text-content-muted">
            {selectedRoleView === 'recruiter'
              ? 'Inbound Candidate Pool • Requisition Manager • Talent Pipeline Analytics'
              : selectedRoleView === 'admin'
              ? 'Platform Infrastructure • User & RBAC Directory • Security Audit Governance'
              : 'Career Applications Tracker • ATS Resume Readiness • Saved Opportunities'}
          </p>
        </div>

        {/* Role View Switcher for Instant Testing & Exploration */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-elevated rounded-2xl border border-outline-variant/80 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => handleRoleChange('job_seeker')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRoleView === 'job_seeker'
                ? 'bg-primary text-surface shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Candidate View
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('recruiter')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRoleView === 'recruiter'
                ? 'bg-primary text-surface shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Recruiter View
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRoleView === 'admin'
                ? 'bg-primary text-surface shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Admin View
          </button>
        </div>
      </div>

      {/* Render Dedicated Role Dashboards */}
      {selectedRoleView === 'recruiter' ? (
        <RecruiterDashboard
          allJobs={allJobs}
          jobsLoading={jobsLoading}
          jobsError={jobsError}
          onRetryJobs={loadAllJobs}
          swipes={swipes}
          swipesLoading={swipesLoading}
          navigate={navigate}
          onAddJob={handleAddJob}
        />
      ) : selectedRoleView === 'admin' ? (
        <AdminDashboard
          allJobs={allJobs}
          jobsLoading={jobsLoading}
          swipes={swipes}
          swipesLoading={swipesLoading}
          session={session}
          onRefresh={() => {
            loadAllJobs();
            loadSwipeData();
          }}
        />
      ) : (
        <JobSeekerDashboard
          swipes={swipes}
          swipesLoading={swipesLoading}
          swipesError={swipesError}
          onRetrySwipes={loadSwipeData}
          activeResume={activeResume}
          atsData={atsData}
          atsLoading={atsLoading}
          atsError={atsError}
          onRetryAts={() => loadAtsScore(activeResume)}
          recommendations={recommendations}
          recsLoading={recsLoading}
          recsError={recsError}
          onRetryRecs={() => loadRecommendations(session?.user?.user_id, activeResume?.resume_id)}
          navigate={navigate}
        />
      )}
    </div>
  );
}
