// import React, { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { 
//   Bookmark, Heart, Building2, MapPin, Sparkles, 
//   RefreshCw, Briefcase, Clock, Trash2, ArrowUpRight 
// } from 'lucide-react';
// import { SavedJobService, SwipeService } from '../services/api';

// export default function Dashboard() {
//   const [savedJobs, setSavedJobs] = useState([]);
//   const [swipeHistory, setSwipeHistory] = useState([]);
//   const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'history'
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     setLoading(true);
//     try {
//       const savedRes = await SavedJobService.getSavedJobs();
//       const savedList = savedRes?.results || savedRes || [];

//       const historyRes = await SwipeService.getSwipeHistory();
//       const historyList = historyRes?.results || historyRes || [];

//       setSavedJobs(savedList.length > 0 ? savedList : FALLBACK_SAVED);
//       setSwipeHistory(historyList.length > 0 ? historyList : FALLBACK_HISTORY);
//     } catch (err) {
//       console.warn("Backend offline, loading fallback dashboard records:", err);
//       setSavedJobs(FALLBACK_SAVED);
//       setSwipeHistory(FALLBACK_HISTORY);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveSaved = async (jobId, e) => {
//     e.stopPropagation();
//     setSavedJobs(prev => prev.filter(j => (j.job_id || j.id) !== jobId));
//     try {
//       await SavedJobService.removeSavedJob(jobId);
//     } catch (err) {
//       console.warn("Remove saved job notice:", err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
//       {/* Top Shared Candidate Navbar */}
//       <Navbar />

//       <div className="flex flex-1">
//         {/* Left Shared Candidate Sidebar */}
//         <Sidebar />

//         {/* Main Workspace */}
//         <main className="flex-1 p-8 max-w-6xl space-y-8">
//           {/* Page Header */}
//           <div>
//             <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
//               Candidate <span className="text-orange-500">Dashboard</span>
//             </h1>
//             <p className="text-xs text-zinc-500 font-medium mt-1">
//               Manage bookmarked positions, application history, and candidate activity
//             </p>
//           </div>

//           {/* Quick Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs flex items-center gap-4">
//               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center font-bold">
//                 <Bookmark className="w-6 h-6" />
//               </div>
//               <div>
//                 <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">Bookmarked Jobs</p>
//                 <p className="text-2xl font-black text-zinc-950">{savedJobs.length}</p>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs flex items-center gap-4">
//               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center font-bold">
//                 <Heart className="w-6 h-6 fill-orange-500" />
//               </div>
//               <div>
//                 <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">Applications Sent</p>
//                 <p className="text-2xl font-black text-zinc-950">
//                   {swipeHistory.filter(h => h.action_type === 'like' || h.action_type === 'apply').length || 3}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs flex items-center gap-4">
//               <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center font-bold">
//                 <Sparkles className="w-6 h-6 fill-orange-500" />
//               </div>
//               <div>
//                 <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">Match Index</p>
//                 <p className="text-2xl font-black text-orange-600">89.4% Average</p>
//               </div>
//             </div>
//           </div>

//           {/* Tab Selection */}
//           <div className="flex border-b border-orange-200/80 gap-8">
//             <button
//               onClick={() => setActiveTab('saved')}
//               className={`pb-3 text-xs font-black cursor-pointer transition flex items-center gap-2 border-b-2 ${
//                 activeTab === 'saved'
//                   ? 'border-orange-500 text-orange-600'
//                   : 'border-transparent text-zinc-400 hover:text-zinc-600'
//               }`}
//             >
//               <Bookmark className="w-4 h-4" />
//               <span>Saved Positions ({savedJobs.length})</span>
//             </button>

//             <button
//               onClick={() => setActiveTab('history')}
//               className={`pb-3 text-xs font-black cursor-pointer transition flex items-center gap-2 border-b-2 ${
//                 activeTab === 'history'
//                   ? 'border-orange-500 text-orange-600'
//                   : 'border-transparent text-zinc-400 hover:text-zinc-600'
//               }`}
//             >
//               <Clock className="w-4 h-4" />
//               <span>Swipe Activity ({swipeHistory.length})</span>
//             </button>
//           </div>

//           {/* Tab Body */}
//           {loading ? (
//             <div className="text-center py-20 space-y-3">
//               <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
//               <p className="text-xs font-bold text-zinc-400">Loading candidate metrics...</p>
//             </div>
//           ) : activeTab === 'saved' ? (
//             savedJobs.length === 0 ? (
//               <div className="bg-white p-12 rounded-3xl border border-orange-200/80 text-center space-y-3 shadow-xs">
//                 <Bookmark className="w-8 h-8 text-orange-300 mx-auto" />
//                 <h3 className="text-sm font-black text-zinc-800">No bookmarked jobs yet</h3>
//                 <p className="text-xs text-zinc-400 font-medium">Save opportunities from your AI Swipe Feed or Job Search tab.</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {savedJobs.map((job) => {
//                   const id = job.job_id || job.id;
//                   return (
//                     <div key={id} className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs space-y-4 flex flex-col justify-between hover:border-orange-300 transition">
//                       <div className="space-y-3">
//                         <div className="flex justify-between items-start">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center font-bold">
//                               <Building2 className="w-5 h-5" />
//                             </div>
//                             <div>
//                               <h4 className="text-xs font-bold text-zinc-400">{job.company_name || job.company || "Employer"}</h4>
//                               <h3 className="text-base font-black text-zinc-950">{job.title}</h3>
//                             </div>
//                           </div>

//                           <button 
//                             onClick={(e) => handleRemoveSaved(id, e)}
//                             className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border border-orange-100"
//                             title="Remove Bookmark"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>

//                         <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
//                           <MapPin className="w-3.5 h-3.5 text-orange-500" /> {job.location || 'Remote'}
//                         </div>
//                       </div>

//                       <div className="pt-3 border-t border-orange-100 flex items-center justify-between">
//                         <span className="text-[11px] font-black text-orange-700 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-full">
//                           Saved Position
//                         </span>

//                         <button 
//                           onClick={() => window.location.href = '/discovery'}
//                           className="text-xs font-black text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
//                         >
//                           <span>Apply Now</span>
//                           <ArrowUpRight className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )
//           ) : (
//             swipeHistory.length === 0 ? (
//               <div className="bg-white p-12 rounded-3xl border border-orange-200/80 text-center space-y-3 shadow-xs">
//                 <Clock className="w-8 h-8 text-orange-300 mx-auto" />
//                 <h3 className="text-sm font-black text-zinc-800">No swipe history recorded</h3>
//                 <p className="text-xs text-zinc-400 font-medium">Interact with the AI discovery deck to populate your history.</p>
//               </div>
//             ) : (
//               <div className="bg-white p-6 rounded-3xl border border-orange-200/80 shadow-xs space-y-3">
//                 {swipeHistory.map((item, idx) => (
//                   <div key={idx} className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center font-bold">
//                         <Briefcase className="w-5 h-5" />
//                       </div>
//                       <div>
//                         <h4 className="text-xs font-bold text-zinc-900">{item.title || "Software Engineering Role"}</h4>
//                         <p className="text-[10px] text-zinc-400 font-medium">{item.company_name || "Enterprise Partner"}</p>
//                       </div>
//                     </div>

//                     <span className={`text-xs font-black px-3 py-1 rounded-xl ${
//                       item.action_type === 'like' || item.action_type === 'apply'
//                         ? 'bg-orange-500 text-white shadow-xs'
//                         : item.action_type === 'save'
//                         ? 'bg-orange-50 text-orange-600 border border-orange-200/80'
//                         : 'bg-zinc-200 text-zinc-600'
//                     }`}>
//                       {item.action_type === 'like' ? 'Applied' : item.action_type === 'save' ? 'Saved' : 'Skipped'}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// const FALLBACK_SAVED = [
//   {
//     id: "job-101",
//     company_name: "SwipeX Tech",
//     title: "Senior Python Backend Engineer",
//     location: "Remote / Bengaluru"
//   },
//   {
//     id: "job-102",
//     company_name: "Razorpay",
//     title: "Frontend React Developer",
//     location: "Bengaluru, India"
//   }
// ];

// const FALLBACK_HISTORY = [
//   { title: "Senior Python Backend Engineer", company_name: "SwipeX Tech", action_type: "like" },
//   { title: "Frontend React Developer", company_name: "Razorpay", action_type: "save" },
//   { title: "DevOps Engineer", company_name: "Swiggy", action_type: "skip" }
// ];

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, CheckCircle2, Clock, Users, ArrowUpRight, 
  Search, Filter, RefreshCw, AlertCircle, Sparkles, Building2,
  BarChart3, Layers, TrendingUp
} from 'lucide-react';
import { 
  getSeekerApplications, 
  getApplicationBoard, 
  getJobById, 
  getJobSeekerAnalytics 
} from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'analytics'
  const [loading, setLoading] = useState(true);

  // Kanban State
  const [boardData, setBoardData] = useState({
    saved: [],
    applied: [],
    shortlisted: [],
    interview: [],
    rejected: []
  });
  const [jobDetailsMap, setJobDetailsMap] = useState({});

  // Analytics State
  const [analytics, setAnalytics] = useState({
    application_funnel: { saved: 0, applied: 0, shortlisted: 0, interview: 0, rejected: 0 },
    swipes_by_direction: { right: 0, left: 0 },
    resume_performance: [],
    skill_gap: [],
    recommendation_insights: { avg_match_score: 0, top_reason_tags: [], right_swipe_rate: 0 },
  });

  // Fetch applications & hydrate job details
  const fetchApplicationsData = useCallback(async () => {
    try {
      setLoading(true);
      
      let board;
      try {
        const boardRes = await getApplicationBoard();
        if (boardRes && boardRes.columns) {
          board = boardRes.columns.reduce((acc, col) => {
            acc[col.status] = col.items || [];
            return acc;
          }, {});
        }
      } catch (err) {
        const listRes = await getSeekerApplications(null, 1, 100);
        const items = listRes?.items || [];
        board = {
          saved: items.filter(i => i.status === 'saved'),
          applied: items.filter(i => i.status === 'applied'),
          shortlisted: items.filter(i => i.status === 'shortlisted'),
          interview: items.filter(i => i.status === 'interview'),
          rejected: items.filter(i => i.status === 'rejected'),
        };
      }

      setBoardData(board || { saved: [], applied: [], shortlisted: [], interview: [], rejected: [] });

      const allItems = Object.values(board || {}).flat();
      const uniqueJobIds = [...new Set(allItems.map(item => item.job_id).filter(Boolean))];

      const jobMap = {};
      await Promise.all(
        uniqueJobIds.map(async (jobId) => {
          try {
            const job = await getJobById(jobId);
            if (job) jobMap[jobId] = job;
          } catch {
            jobMap[jobId] = { title: 'Software Engineer', company_name: 'Tech Partner' };
          }
        })
      );

      setJobDetailsMap(jobMap);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Analytics
  const fetchAnalyticsData = useCallback(async () => {
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
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'kanban') {
      fetchApplicationsData();
    } else {
      fetchAnalyticsData();
    }
  }, [activeTab, fetchApplicationsData, fetchAnalyticsData]);

  const columns = [
    { key: 'saved', label: 'Saved Roles', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
    { key: 'applied', label: 'Applied', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'interview', label: 'Interview', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { key: 'rejected', label: 'Archived / Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  const funnel = analytics.application_funnel;
  const totalApps = (funnel.saved || 0) + (funnel.applied || 0) + (funnel.shortlisted || 0) + (funnel.interview || 0) + (funnel.rejected || 0);

  return (
    <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Header Card with Tab Switcher */}
          <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-orange-500" /> Application Dashboard
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Manage your active job pipeline and review AI-driven career analytics.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-orange-50 p-1.5 rounded-2xl border border-orange-200/80">
              <button
                onClick={() => setActiveTab('kanban')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'kanban'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Layers className="w-4 h-4" /> Kanban Board
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Career Analytics
              </button>
            </div>
          </div>

          {/* TAB 1: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            loading ? (
              <div className="bg-white border border-orange-200/80 rounded-3xl p-12 text-center text-zinc-400 text-xs font-medium space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                <p>Loading application pipeline...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {columns.map((col) => {
                  const items = boardData[col.key] || [];

                  return (
                    <div key={col.key} className="bg-white/80 border border-orange-200/80 rounded-3xl p-4 shadow-2xs space-y-3 flex flex-col h-full min-h-[500px]">
                      <div className="flex justify-between items-center pb-2 border-b border-orange-100">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${col.color}`}>
                          {col.label}
                        </span>
                        <span className="text-xs font-black text-zinc-400">{items.length}</span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                          <div className="p-4 text-center text-[11px] text-zinc-400 font-medium border border-dashed border-orange-200/60 rounded-2xl">
                            No jobs in this stage
                          </div>
                        ) : (
                          items.map((app) => {
                            const job = jobDetailsMap[app.job_id] || {};

                            return (
                              <div
                                key={app.id}
                                className="p-3.5 bg-white border border-orange-200/80 rounded-2xl shadow-2xs space-y-2 hover:border-orange-400 transition cursor-pointer"
                                onClick={() => navigate('/discovery', { state: { jobId: app.job_id } })}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="text-xs font-black text-zinc-950 line-clamp-1">
                                    {job.title || 'Software Role'}
                                  </h4>
                                  {app.is_early_applicant && (
                                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" /> Early
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-orange-500" />
                                  {job.company_name || 'Hiring Company'}
                                </p>

                                <div className="pt-2 border-t border-orange-100 flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                                  <span>Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Saved'}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 2: CAREER ANALYTICS */}
          {activeTab === 'analytics' && (
            loading ? (
              <div className="bg-white border border-orange-200/80 rounded-3xl p-12 text-center text-zinc-400 text-xs font-medium space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                <p>Computing career intelligence metrics...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-orange-200/80 p-5 rounded-3xl shadow-2xs space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Applications</p>
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
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Shortlist Rate</p>
                    <p className="text-2xl font-black text-purple-600">
                      {totalApps > 0 ? Math.round((((funnel.shortlisted || 0) + (funnel.interview || 0)) / totalApps) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-orange-200/80 p-6 rounded-3xl shadow-2xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-orange-500" /> Conversion Funnel
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

                  <div className="bg-white border border-orange-200/80 p-6 rounded-3xl shadow-2xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" /> In-Demand Skill Gaps
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {analytics.skill_gap.length === 0 ? (
                        <p className="text-xs text-zinc-400 font-medium">No skill gaps detected!</p>
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
            )
          )}

        </main>
      </div>
    </div>
  );
}