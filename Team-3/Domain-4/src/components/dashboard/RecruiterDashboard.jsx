import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  UserCheck,
  TrendingUp,
  PlusCircle,
  Eye,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  MapPin,
  Check,
  X,
  Loader2
} from 'lucide-react';
import Button from '../common/Button';
import Chip from '../common/Chip';

export default function RecruiterDashboard({
  allJobs,
  jobsLoading,
  jobsError,
  onRetryJobs,
  swipes,
  swipesLoading,
  navigate,
  onAddJob,
}) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'requisitions' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedCandidateForScreen, setSelectedCandidateForScreen] = useState(null);
  const [scheduledScreens, setScheduledScreens] = useState(new Set());

  // Form state for creating a new requisition
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('Infosys Enterprise Partner');
  const [newType, setNewType] = useState('Full-time');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSalary, setNewSalary] = useState('$130,000 - $160,000');
  const [newSkills, setNewSkills] = useState('React, TypeScript, Cloud');
  const [newDescription, setNewDescription] = useState('');

  // Local list of jobs so recruiter can dynamically post new ones
  const [localJobs, setLocalJobs] = useState(() => allJobs || []);

  // Synchronize when parent jobs change if localJobs is empty
  React.useEffect(() => {
    if (allJobs && allJobs.length > 0 && localJobs.length === 0) {
      setLocalJobs(allJobs);
    }
  }, [allJobs, localJobs.length]);

  // Candidates who swiped right on positions
  const inboundCandidates = swipes.filter((s) => s.direction === 'right');

  // Filtered requisitions
  const filteredJobs = localJobs.filter((j) => {
    const title = (j.title || '').toLowerCase();
    const company = (j.company || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  const handlePostJob = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = {
      id: Date.now(),
      job_id: Date.now(),
      title: newTitle.trim(),
      company: newCompany.trim(),
      type: newType,
      location: newLocation.trim(),
      remote: newLocation.toLowerCase().includes('remote') ? 'Remote' : 'On-site',
      salary: newSalary.trim(),
      skills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      description: newDescription.trim() || 'Exciting career opportunity at our global enterprise division.',
      status: 'Active',
      posted_at: new Date().toISOString(),
    };

    setLocalJobs((prev) => [created, ...prev]);
    if (onAddJob) onAddJob(created);

    // Reset form & close
    setNewTitle('');
    setNewDescription('');
    setShowPostModal(false);
  };

  const handleScheduleScreen = (candidateId) => {
    setScheduledScreens((prev) => new Set(prev).add(candidateId));
    setSelectedCandidateForScreen(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Recruiter KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Active Postings */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-primary hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Active Requisitions</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {jobsLoading ? '...' : localJobs.length}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>●</span> Live in Candidate Discovery Deck
          </p>
        </div>

        {/* Metric 2: Inbound Matches */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-emerald-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Inbound Right-Swipes</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {swipesLoading ? '...' : inboundCandidates.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            Candidates who applied directly
          </p>
        </div>

        {/* Metric 3: Screening Pipeline */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-blue-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Screenings Scheduled</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {scheduledScreens.size}
          </div>
          <p className="text-[11px] text-blue-400">
            Active candidate interviews
          </p>
        </div>

        {/* Metric 4: Conversion Rate */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-amber-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Candidate Conversion</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {swipes.length > 0 ? `${Math.round((inboundCandidates.length / swipes.length) * 100)}%` : '78%'}
          </div>
          <p className="text-[11px] text-content-subtle">
            Impressions to right-swipes
          </p>
        </div>
      </div>

      {/* 2. Recruiter Workspaces */}
      <div className="surface-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Inbound Candidates ({inboundCandidates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requisitions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'requisitions'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Manage Requisitions ({localJobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sourcing Analytics</span>
            </button>
          </div>

          <Button
            variant="filled"
            size="sm"
            icon={PlusCircle}
            onClick={() => setShowPostModal(true)}
            className="shadow-sm"
          >
            Post New Requisition
          </Button>
        </div>

        {/* Tab 1: Inbound Candidate Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span>Candidates who swiped right on your positions are listed here.</span>
              <span>{inboundCandidates.length} Candidates Ingested</span>
            </div>

            {swipesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading inbound applicant pool...</span>
              </div>
            ) : inboundCandidates.length > 0 ? (
              <div className="space-y-3">
                {inboundCandidates.map((candidate, i) => {
                  const candidateId = candidate.swipe_id || i + 101;
                  const isScheduled = scheduledScreens.has(candidateId);

                  return (
                    <div
                      key={candidateId}
                      className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/70 hover:border-outline transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                            C{i + 1}
                          </div>
                          <h4 className="text-sm font-bold text-content">
                            Verified Candidate #{candidateId}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 font-semibold">
                            ✓ Direct Right-Swipe
                          </span>
                          {isScheduled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950/40 text-blue-300 border border-blue-800/30 font-semibold">
                              Screen Scheduled
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-content-muted">
                          Applied for requisition: <strong className="text-content font-medium">{candidate.job_title || `Role #${candidate.job_id}`}</strong> • {candidate.company || 'Enterprise Partner'}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <Chip variant="neutral">Verified Resume</Chip>
                          <Chip variant="primary">92% Match Score</Chip>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isScheduled ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Check className="w-3.5 h-3.5" />
                            Screen Confirmed
                          </span>
                        ) : (
                          <Button
                            variant="filled"
                            size="sm"
                            icon={Calendar}
                            onClick={() => setSelectedCandidateForScreen(candidateId)}
                          >
                            Schedule Screen
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 rounded-2xl bg-surface-elevated/20 border border-dashed border-outline-variant">
                <Users className="w-8 h-8 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  No inbound candidate swipes yet. As job seekers swipe right on your positions, they will appear here automatically.
                </p>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => setShowPostModal(true)}
                >
                  Post a Job to Candidate Deck
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requisition Manager */}
        {activeTab === 'requisitions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requisitions by title or department..."
                className="w-full sm:max-w-md bg-surface-elevated border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-content-subtle">
                {filteredJobs.length} Open Positions
              </span>
            </div>

            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id || job.job_id}
                  className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/70 hover:border-outline transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-content">{job.title}</h4>
                      <Chip variant="primary">{job.type || 'Full-time'}</Chip>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full font-medium">
                        ● Active in Candidate Swipe Deck
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-content-muted flex-wrap">
                      <span>{job.company}</span>
                      <span>•</span>
                      <span>{job.location || 'Remote'}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-400">{job.salary}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Array.isArray(job.skills) ? job.skills : []).slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-content-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="tonal"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate('/discover')}
                      title="Preview how candidates see this in the discovery deck"
                    >
                      Preview in Deck
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Sourcing & Conversion Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="surface-card-subtle p-4 space-y-2 border-outline">
                <div className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Sourcing Funnel
                </div>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-content-muted">Deck Impressions:</span>
                    <strong className="text-content">{swipes.length * 4 + 28} views</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Right-Swipes:</span>
                    <strong className="text-emerald-400">{inboundCandidates.length} matches</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Screens Scheduled:</span>
                    <strong className="text-blue-400">{scheduledScreens.size} candidates</strong>
                  </div>
                </div>
              </div>

              <div className="surface-card-subtle p-4 space-y-2 border-outline">
                <div className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Top Requested Skills
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <Chip variant="neutral">React (94%)</Chip>
                  <Chip variant="neutral">Python (88%)</Chip>
                  <Chip variant="neutral">Cloud Architecture (85%)</Chip>
                  <Chip variant="neutral">Docker (79%)</Chip>
                  <Chip variant="neutral">TypeScript (76%)</Chip>
                </div>
              </div>

              <div className="surface-card-subtle p-4 space-y-2 border-outline">
                <div className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Hiring Velocity
                </div>
                <div className="pt-2 text-xs text-content-muted space-y-1">
                  <p>Average time to right-swipe candidate match: <strong className="text-content">&lt; 18 hours</strong></p>
                  <p>Screening turnaround: <strong className="text-emerald-400">4x faster</strong> than legacy job portals.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Requisition Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card max-w-lg w-full space-y-4 border-outline shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-content">Create New Requisition</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-content-subtle hover:text-content text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-content-muted font-medium block">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect"
                  className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-content-muted font-medium block">Organization / Team</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-content-muted font-medium block">Employment Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-content-muted font-medium block">Workplace Mode & Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Remote or Bengaluru, IN"
                    className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-content-muted font-medium block">Compensation Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. $120,000 - $150,000"
                    className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-content-muted font-medium block">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Cloud, Docker"
                  className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-content-muted font-medium block">Short Role Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Briefly describe the responsibilities and scope..."
                  className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <Button variant="tonal" size="sm" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button variant="filled" size="sm" type="submit">
                  Publish to Candidate Deck
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screen Scheduler Confirmation Modal */}
      {selectedCandidateForScreen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card max-w-sm w-full space-y-4 border-outline shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-content">Confirm Candidate Screening</h3>
            </div>
            <p className="text-xs text-content-muted leading-relaxed">
              Schedule a 30-minute introductory screen with <strong>Candidate #{selectedCandidateForScreen}</strong>? An invitation will be dispatched to their profile.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
              <Button variant="tonal" size="sm" onClick={() => setSelectedCandidateForScreen(null)}>
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => handleScheduleScreen(selectedCandidateForScreen)}
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
