import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  Send, 
  Sparkles, 
  ArrowRight,
  Award,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import authService from '../services/auth';
import jobService from '../services/jobs';
import resumeService from '../services/resume';
import recommendationService from '../services/recommendations';

export default function DashboardPage() {
  const navigate = useNavigate();

  // User session
  const [session, setSession] = useState(() => authService.getSession());
  const [activeTab, setActiveTab] = useState('saved');

  // Section 1: Saved & Applied Jobs
  const [swipes, setSwipes] = useState([]);
  const [swipesLoading, setSwipesLoading] = useState(true);
  const [swipesError, setSwipesError] = useState('');

  // Section 2: ATS Score
  const [activeResume, setActiveResume] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [atsLoading, setAtsLoading] = useState(true);
  const [atsError, setAtsError] = useState('');

  // Section 3: Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState('');

  // Load Swipe History (Saved / Applied jobs)
  const loadSwipeData = useCallback(async () => {
    setSwipesLoading(true);
    setSwipesError('');
    try {
      const history = await jobService.getSwipeHistory();
      setSwipes(Array.isArray(history) ? history : []);
    } catch (err) {
      setSwipesError('Unable to load swipe history.');
      setSwipes([]);
    } finally {
      setSwipesLoading(false);
    }
  }, []);

  // Load ATS Score
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
    } catch (err) {
      setAtsError('Unable to calculate ATS score.');
      setAtsData(null);
    } finally {
      setAtsLoading(false);
    }
  }, []);

  // Load Recommendations
  const loadRecommendations = useCallback(async (userId, resumeId) => {
    setRecsLoading(true);
    setRecsError('');
    try {
      const data = await recommendationService.getRecommendations(userId, resumeId);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      setRecsError('Unable to load recommendations.');
      setRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  }, []);

  // Initial Fetch on mount
  useEffect(() => {
    const currentSession = authService.getSession();
    setSession(currentSession);
    const resume = resumeService.getActiveResume();
    setActiveResume(resume);

    const userId = currentSession?.user?.user_id || currentSession?.user?.id || 1;
    const resumeId = resume?.resume_id;

    loadSwipeData();
    loadAtsScore(resume);
    loadRecommendations(userId, resumeId);
  }, [loadSwipeData, loadAtsScore, loadRecommendations]);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Job Seeker';
  const userRole = session?.role || session?.user?.role || 'Job Seeker';

  // Filter saved & applied from swipe history
  const savedSwipes = swipes.filter((s) => s.direction === 'right');
  const appliedSwipes = swipes.filter((s) => s.direction === 'right'); // In M1, right swipe serves as save/apply

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-content">Welcome back, {userName}</h1>
            <Chip variant="primary">{userRole.replace('_', ' ')}</Chip>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Track your saved roles, applications, resume score, and smart recommendations
          </p>
        </div>

        <Button
          variant="filled"
          size="md"
          icon={ArrowRight}
          onClick={() => navigate('/discover')}
        >
          Find jobs
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Saved / Applied Jobs Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="surface-card space-y-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
              <Button
                variant={activeTab === 'saved' ? 'tonal' : 'text'}
                size="sm"
                icon={Bookmark}
                onClick={() => setActiveTab('saved')}
                className={activeTab === 'saved' ? 'font-semibold text-content' : ''}
              >
                Saved jobs ({savedSwipes.length})
              </Button>

              <Button
                variant={activeTab === 'applied' ? 'tonal' : 'text'}
                size="sm"
                icon={Send}
                onClick={() => setActiveTab('applied')}
                className={activeTab === 'applied' ? 'font-semibold text-content' : ''}
              >
                Applied jobs ({appliedSwipes.length})
              </Button>
            </div>

            {/* Content with Loading / Error / Empty States */}
            {swipesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Loading your saved jobs...</span>
              </div>
            ) : swipesError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{swipesError}</span>
                </div>
                <Button variant="tonal" size="sm" onClick={loadSwipeData}>
                  Retry
                </Button>
              </div>
            ) : (activeTab === 'saved' ? savedSwipes : appliedSwipes).length > 0 ? (
              <div className="space-y-2.5">
                {(activeTab === 'saved' ? savedSwipes : appliedSwipes).map((item, idx) => (
                  <div
                    key={item.swipe_id || item.job_id || idx}
                    className="p-4 rounded-2xl bg-surface-elevated/50 border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-outline transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-content">
                        {item.job_title || item.title || `Job Opportunity #${item.job_id}`}
                      </h3>
                      <p className="text-xs text-content-muted">
                        {item.company || 'Tech Opportunity'} • Swiped right to {activeTab === 'saved' ? 'save' : 'apply'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip variant="primary">Active</Chip>
                      <Button
                        variant="tonal"
                        size="sm"
                        onClick={() => navigate('/discover')}
                      >
                        View in Discover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3 rounded-2xl bg-surface-elevated/30 border border-dashed border-outline-variant">
                <Bookmark className="w-8 h-8 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  {activeTab === 'saved'
                    ? "No saved jobs yet. Swipe right on jobs in Discover to save them here."
                    : "No applied jobs yet. Swipe right on jobs in Discover to apply."}
                </p>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => navigate('/discover')}
                >
                  Explore jobs
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: ATS Score & Recommendations */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* ATS Score Card */}
          <div className="surface-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-content font-semibold text-sm">
                <Award className="w-4 h-4 text-primary" />
                <span>ATS compatibility</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/resume')}
                className="text-xs text-primary hover:underline"
              >
                {activeResume ? 'Update' : 'Upload'}
              </button>
            </div>

            {atsLoading ? (
              <div className="p-6 rounded-2xl bg-surface-elevated/50 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Calculating compatibility...</span>
              </div>
            ) : atsError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 space-y-2">
                <p>{atsError}</p>
                <Button variant="tonal" size="sm" onClick={() => loadAtsScore(activeResume)}>
                  Retry
                </Button>
              </div>
            ) : activeResume && atsData ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface-elevated/60 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-content">{atsData.match_score}%</div>
                    <p className="text-[11px] text-content-muted mt-0.5">
                      Matched from {activeResume.filename || 'Resume'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                    {Math.round(atsData.match_score)}%
                  </div>
                </div>

                {atsData.missing_keywords && atsData.missing_keywords.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-medium text-content-muted">Missing keywords for top match:</p>
                    <div className="flex flex-wrap gap-1">
                      {atsData.missing_keywords.map((kw, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] bg-red-950/40 text-red-300 border border-red-800/30">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-content-subtle pt-1 border-t border-outline-variant">
                  <span>Model: {atsData.generated_by}</span>
                  <span className="text-emerald-400">Heuristic Stub Active</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center space-y-2">
                <FileText className="w-6 h-6 text-content-subtle mx-auto" />
                <p className="text-xs text-content-muted">
                  Upload your resume to calculate your heuristic ATS compatibility score.
                </p>
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => navigate('/resume')}
                >
                  Upload resume
                </Button>
              </div>
            )}
          </div>

          {/* Recommendations Card */}
          <div className="surface-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-content font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Job recommendations</span>
              </div>
              <span className="text-[10px] text-content-subtle bg-surface-elevated px-2 py-0.5 rounded-full">
                heuristic-v0
              </span>
            </div>

            {recsLoading ? (
              <div className="p-6 rounded-2xl bg-surface-elevated/50 flex flex-col items-center justify-center text-xs text-content-muted gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Loading recommendations...</span>
              </div>
            ) : recsError ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 space-y-2">
                <p>{recsError}</p>
                <Button variant="tonal" size="sm" onClick={() => loadRecommendations(session?.user?.user_id, activeResume?.resume_id)}>
                  Retry
                </Button>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div
                    key={rec.job_id || idx}
                    className="p-3 rounded-xl bg-surface-elevated/40 border border-outline-variant/60 flex items-center justify-between text-xs hover:border-outline transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-content">{rec.title}</div>
                      <div className="text-content-muted">{rec.company}</div>
                    </div>
                    <Chip variant="success">{rec.match_percentage}%</Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center text-xs text-content-subtle">
                No recommendations available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
