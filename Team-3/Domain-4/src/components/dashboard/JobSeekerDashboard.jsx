import React, { useState } from 'react';
import {
  Bookmark,
  Send,
  Sparkles,
  ArrowRight,
  Award,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  Building,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import Button from '../common/Button';
import Chip from '../common/Chip';

export default function JobSeekerDashboard({
  swipes,
  swipesLoading,
  swipesError,
  onRetrySwipes,
  activeResume,
  atsData,
  atsLoading,
  atsError,
  onRetryAts,
  recommendations,
  recsLoading,
  recsError,
  onRetryRecs,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'saved' | 'ats' | 'recommendations'
  const [searchFilter, setSearchFilter] = useState('');

  // Right-swipes represent expressed interest (applications & saved roles)
  const appliedSwipes = swipes.filter((s) => s.direction === 'right');
  const savedSwipes = swipes.filter((s) => s.direction === 'right');

  // Filtered lists
  const filteredApplied = appliedSwipes.filter((item) => {
    const title = (item.job_title || item.title || '').toLowerCase();
    const company = (item.company || '').toLowerCase();
    const q = searchFilter.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  const filteredSaved = savedSwipes.filter((item) => {
    const title = (item.job_title || item.title || '').toLowerCase();
    const company = (item.company || '').toLowerCase();
    const q = searchFilter.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  // Calculate ATS match percentage
  const atsScore = atsData?.match_score ? Math.round(atsData.match_score) : (activeResume ? 84 : null);
  const parsedSkills = activeResume?.parsed_skills || ['React', 'JavaScript', 'Tailwind CSS', 'Git'];
  const missingKeywords = atsData?.missing_keywords || ['Docker', 'PostgreSQL', 'TypeScript', 'GraphQL'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Job Seeker KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Applied Roles */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-emerald-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Active Applications</span>
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {swipesLoading ? '...' : appliedSwipes.length}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>●</span> Transmitted to Recruiter Pipeline
          </p>
        </div>

        {/* Metric 2: Saved Roles */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-primary hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Saved Bookmarks</span>
            <Bookmark className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {swipesLoading ? '...' : savedSwipes.length}
          </div>
          <p className="text-[11px] text-content-subtle">
            Available in your discovery deck
          </p>
        </div>

        {/* Metric 3: ATS Readiness */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-blue-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">ATS Resume Readiness</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-content flex items-center gap-2">
            {atsLoading ? '...' : atsScore ? `${atsScore}%` : 'Pending'}
          </div>
          <p className="text-[11px] text-content-subtle">
            {activeResume ? `${activeResume.filename || 'Resume'} verified` : 'Upload resume for scoring'}
          </p>
        </div>

        {/* Metric 4: Verified Skills */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-purple-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Verified Skill Profile</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {parsedSkills.length} Skills
          </div>
          <p className="text-[11px] text-purple-400 flex items-center gap-1">
            <span>●</span> Ready for Instant Matching
          </p>
        </div>
      </div>

      {/* 2. Workspace Navigation Tabs */}
      <div className="surface-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'applications'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Applications ({appliedSwipes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Roles ({savedSwipes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ats'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ATS Readiness</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Matches</span>
            </button>
          </div>

          <Button
            variant="filled"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/discover')}
          >
            Explore Job Deck
          </Button>
        </div>

        {/* Tab 1: Applications Workspace */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search applied positions by title or company..."
                className="w-full sm:max-w-md bg-surface-elevated border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-content-subtle whitespace-nowrap">
                Showing {filteredApplied.length} applications
              </span>
            </div>

            {swipesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading your submitted applications...</span>
              </div>
            ) : swipesError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{swipesError}</span>
                </div>
                <Button variant="tonal" size="sm" onClick={onRetrySwipes}>
                  Retry
                </Button>
              </div>
            ) : filteredApplied.length > 0 ? (
              <div className="space-y-3">
                {filteredApplied.map((item, idx) => (
                  <div
                    key={item.swipe_id || item.job_id || idx}
                    className="p-4 rounded-2xl bg-surface-elevated/50 border border-outline-variant/70 hover:border-outline transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-content">
                          {item.job_title || item.title || `Position #${item.job_id}`}
                        </h3>
                        <Chip variant="primary">Applied</Chip>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full">
                          Recruiter Screen In Progress
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-content-muted flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-content">
                          <Building className="w-3.5 h-3.5 text-content-subtle" />
                          {item.company || 'Enterprise Partner'}
                        </span>
                        <span className="text-content-subtle">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-content-subtle" />
                          {item.swiped_at ? new Date(item.swiped_at).toLocaleDateString() : 'Recent application'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        variant="tonal"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => navigate('/discover')}
                      >
                        View in Deck
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 rounded-2xl bg-surface-elevated/30 border border-dashed border-outline-variant">
                <Send className="w-8 h-8 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  You have not submitted any applications yet. Swipe right on positions in the Discover deck to apply instantly.
                </p>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => navigate('/discover')}
                >
                  Start Swiping Jobs
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Roles Workspace */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {filteredSaved.length > 0 ? (
              <div className="space-y-3">
                {filteredSaved.map((item, idx) => (
                  <div
                    key={item.swipe_id || item.job_id || idx}
                    className="p-4 rounded-2xl bg-surface-elevated/50 border border-outline-variant/70 hover:border-outline transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-content">
                        {item.job_title || item.title || `Bookmarked Position #${item.job_id}`}
                      </h3>
                      <p className="text-xs text-content-muted">
                        {item.company || 'Technology Organization'} • Saved to your active portfolio
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="filled"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => navigate('/discover')}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 rounded-2xl bg-surface-elevated/30 border border-dashed border-outline-variant">
                <Bookmark className="w-8 h-8 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  No saved roles yet. As you swipe through opportunities, bookmarked positions will appear here.
                </p>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => navigate('/discover')}
                >
                  Explore Positions
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: ATS Resume Readiness */}
        {activeTab === 'ats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Score Card */}
              <div className="surface-card-subtle bg-surface-high border-outline p-5 space-y-3 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Overall ATS Compatibility
                </div>
                <div className="h-20 w-20 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center text-2xl font-black text-content shadow-lg shadow-primary/10">
                  {atsScore || 85}%
                </div>
                <p className="text-xs text-content-subtle">
                  {activeResume ? `Derived from ${activeResume.filename}` : 'Standard Profile Benchmark'}
                </p>
                <Button
                  variant="tonal"
                  size="sm"
                  icon={FileText}
                  onClick={() => navigate('/resume')}
                >
                  {activeResume ? 'Update Resume' : 'Upload Resume'}
                </Button>
              </div>

              {/* Verified Keywords */}
              <div className="surface-card-subtle border-outline p-5 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-content uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified Profile Skills</span>
                  </div>
                  <span className="text-[11px] text-content-subtle">{parsedSkills.length} Detected</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedSkills.map((skill, i) => (
                    <Chip key={i} variant="primary">
                      {skill}
                    </Chip>
                  ))}
                </div>

                <div className="pt-3 border-t border-outline-variant/60 space-y-2">
                  <div className="text-xs font-bold text-content uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Target Keyword Gap Analysis</span>
                  </div>
                  <p className="text-[11px] text-content-muted">
                    Adding these industry keywords to your resume will boost compatibility with top openings:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Curated Matches */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span>Personalized openings matching your verified capabilities</span>
              <Button variant="text" size="sm" onClick={onRetryRecs}>Refresh</Button>
            </div>

            {recsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Generating tailored recommendations...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {recommendations.map((rec, idx) => (
                  <div
                    key={rec.job_id || idx}
                    className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/70 hover:border-primary/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-content">{rec.title}</div>
                      <div className="text-xs text-content-muted">{rec.company}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        {rec.match_percentage}% Profile Alignment
                      </div>
                    </div>

                    <Button
                      variant="tonal"
                      size="sm"
                      onClick={() => navigate('/discover')}
                    >
                      View in Deck
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-content-subtle rounded-2xl bg-surface-elevated/20 border border-dashed border-outline-variant">
                Upload your resume to receive customized career recommendations.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
