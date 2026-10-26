import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Sparkles, TrendingUp, CheckCircle2, 
  XCircle, Filter, PieChart, Layers, ArrowUpRight, RefreshCw 
} from 'lucide-react';
import { getJobSeekerAnalytics } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    application_funnel: { saved: 0, applied: 0, shortlisted: 0, interview: 0, rejected: 0 },
    swipes_by_direction: { right: 0, left: 0 },
    resume_performance: [],
    skill_gap: [],
    recommendation_insights: { avg_match_score: 0, top_reason_tags: [], right_swipe_rate: 0 },
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getJobSeekerAnalytics();
      if (data) {
        setAnalytics({
          application_funnel: data.application_funnel || { saved: 0, applied: 0, shortlisted: 0, interview: 0, rejected: 0 },
          swipes_by_direction: data.swipes_by_direction || { right: 0, left: 0 },
          resume_performance: data.resume_performance || [],
          skill_gap: data.skill_gap || [],
          recommendation_insights: data.recommendation_insights || { avg_match_score: 0, top_reason_tags: [], right_swipe_rate: 0 },
        });
      }
    } catch (err) {
      console.error('Failed to load seeker analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const funnel = analytics.application_funnel;
  const totalApps = (funnel.saved || 0) + (funnel.applied || 0) + (funnel.shortlisted || 0) + (funnel.interview || 0) + (funnel.rejected || 0);

  return (
    <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Header Card */}
          <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-500" /> Career & AI Analytics Dashboard
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Real-time insights on your application funnel conversion, ATS resume scores, and skill gaps.
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-orange-200/80 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-orange-500 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-orange-200/80 rounded-3xl p-12 text-center text-zinc-400 text-xs font-medium space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500" />
              <p>Computing career intelligence metrics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-orange-200/80 p-5 rounded-3xl shadow-2xs space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Pipeline Applications</p>
                  <p className="text-2xl font-black text-zinc-950">{totalApps}</p>
                </div>
                <div className="bg-white border border-orange-200/80 p-5 rounded-3xl shadow-2xs space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Avg AI Match Score</p>
                  <p className="text-2xl font-black text-orange-600">{analytics.recommendation_insights.avg_match_score}%</p>
                </div>
                <div className="bg-white border border-orange-200/80 p-5 rounded-3xl shadow-2xs space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Right Swipe Rate</p>
                  <p className="text-2xl font-black text-emerald-600">{analytics.recommendation_insights.right_swipe_rate}%</p>
                </div>
                <div className="bg-white border border-orange-200/80 p-5 rounded-3xl shadow-2xs space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Shortlist / Interview Rate</p>
                  <p className="text-2xl font-black text-purple-600">
                    {totalApps > 0 ? Math.round((((funnel.shortlisted || 0) + (funnel.interview || 0)) / totalApps) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* Main Grid Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Application Funnel Chart Card */}
                <div className="bg-white border border-orange-200/80 p-6 rounded-3xl shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-500" /> Application Conversion Funnel
                  </h3>

                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'Saved Roles', count: funnel.saved || 0, color: 'bg-zinc-400' },
                      { label: 'Applied', count: funnel.applied || 0, color: 'bg-orange-500' },
                      { label: 'Shortlisted', count: funnel.shortlisted || 0, color: 'bg-emerald-500' },
                      { label: 'Interview Scheduled', count: funnel.interview || 0, color: 'bg-purple-600' },
                      { label: 'Archived / Rejected', count: funnel.rejected || 0, color: 'bg-rose-400' },
                    ].map((item) => {
                      const pct = totalApps > 0 ? Math.round((item.count / totalApps) * 100) : 0;
                      return (
                        <div key={item.label} className="space-y-1 text-xs font-bold">
                          <div className="flex justify-between text-zinc-700">
                            <span>{item.label}</span>
                            <span>{item.count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-3 bg-orange-50 rounded-full overflow-hidden border border-orange-100">
                            <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skill Gap Analysis Card */}
                <div className="bg-white border border-orange-200/80 p-6 rounded-3xl shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" /> Top In-Demand Skill Gaps
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Skills frequently required by roles you applied to that are currently missing from your default resume:
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {analytics.skill_gap.length === 0 ? (
                      <p className="text-xs text-zinc-400 font-medium">No skill gaps detected! Your resume matches target roles well.</p>
                    ) : (
                      analytics.skill_gap.map((item) => (
                        <div key={item.skill} className="p-2.5 bg-orange-50/80 border border-orange-200/80 rounded-2xl flex items-center gap-2 text-xs font-bold text-zinc-900">
                          <span className="text-orange-600 capitalize">{item.skill}</span>
                          <span className="text-[10px] bg-orange-200/80 text-orange-800 px-1.5 py-0.5 rounded-md font-black">
                            {item.count} roles
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}