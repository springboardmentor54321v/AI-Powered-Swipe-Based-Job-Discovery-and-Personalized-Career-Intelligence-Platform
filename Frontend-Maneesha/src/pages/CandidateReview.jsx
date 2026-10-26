// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Building2, PlusCircle, CheckSquare, Zap, LogOut, 
//   Menu, X, Sparkles, CheckCircle2, AlertTriangle, 
//   FileText, ArrowLeft, Download, Mail, MapPin, UserCheck, UserX, Eye
// } from 'lucide-react';

// export default function CandidateReview() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [toastMessage, setToastMessage] = useState(null);

//   // Reads passed applicantId from AtsRanker / RecruiterDashboard or defaults to 101
//   const applicantId = location.state?.applicantId || 101;
//   const [candidateStatus, setCandidateStatus] = useState("Under Review");

//   // Mock candidate database mapped to passed IDs
//   const candidateDatabase = {
//     101: {
//       name: "Alex Morgan",
//       email: "alex@example.com",
//       location: "Bangalore, India",
//       roleApplied: "Senior React Architect",
//       atsScore: 96,
//       matchingSkills: ["React.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Node.js"],
//       missingSkills: ["GraphQL", "AWS Lambda"],
//       summary: "Senior Frontend Engineer with 5+ years of experience building high-scale React web applications. Spearheaded micro-frontend migrations and optimized core web vitals for 2M+ active users."
//     },
//     102: {
//       name: "Priya Sharma",
//       email: "priya.sharma@example.com",
//       location: "Remote",
//       roleApplied: "Senior React Architect",
//       atsScore: 88,
//       matchingSkills: ["React.js", "Redux", "Tailwind CSS"],
//       missingSkills: ["TypeScript", "FastAPI"],
//       summary: "Frontend Developer with 4 years of experience delivering responsive user portals and design systems in fast-paced startup environments."
//     },
//     103: {
//       name: "Rahul Verma",
//       email: "rahul.v@example.com",
//       location: "Hyderabad, India",
//       roleApplied: "Frontend Developer Intern",
//       atsScore: 92,
//       matchingSkills: ["JavaScript", "React.js", "CSS3", "Git"],
//       missingSkills: ["Docker"],
//       summary: "Computer Science undergraduate with strong foundation in core web tech, data structures, and hands-on React project work."
//     }
//   };

//   const candidate = candidateDatabase[applicantId] || candidateDatabase[101];

//   const showToast = (msg) => {
//     setToastMessage(msg);
//     setTimeout(() => setToastMessage(null), 2500);
//   };

//   const handleStatusChange = (newStatus) => {
//     setCandidateStatus(newStatus);
//     showToast(`Updated ${candidate.name}'s status to ${newStatus}`);
//   };

//   return (
//     <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex font-sans selection:bg-orange-500 selection:text-white">
      
//       {/* Toast Alert Notification */}
//       {toastMessage && (
//         <div className="fixed top-6 right-6 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
//           <CheckCircle2 className="w-4 h-4 text-emerald-400" />
//           {toastMessage}
//         </div>
//       )}

//       {/* 1. RECRUITER SIDEBAR */}
//       <aside className={`
//         fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-white p-5 flex flex-col justify-between transition-transform duration-300
//         ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
//       `}>
//         <div className="space-y-6">
//           <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
//             <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
//               <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
//                 <Zap className="w-5 h-5 text-white fill-white" />
//               </div>
//               <span className="text-xl font-black tracking-tight text-white">
//                 Swipe<span className="text-orange-500">X</span> <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Recruiter</span>
//               </span>
//             </div>
            
//             <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 text-zinc-400">
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <nav className="space-y-1.5 text-xs font-bold">
//             <button 
//               onClick={() => { navigate('/recruiter-dashboard'); setIsMobileMenuOpen(false); }}
//               className="w-full py-2.5 px-3 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl flex items-center gap-3 transition cursor-pointer"
//             >
//               <Building2 className="w-4 h-4" />
//               <span>Overview Dashboard</span>
//             </button>

//             <button 
//               onClick={() => { navigate('/post-job'); setIsMobileMenuOpen(false); }}
//               className="w-full py-2.5 px-3 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl flex items-center gap-3 transition cursor-pointer"
//             >
//               <PlusCircle className="w-4 h-4" />
//               <span>Job Posting Wizard</span>
//             </button>

//             <button 
//               onClick={() => { navigate('/ats-ranker'); setIsMobileMenuOpen(false); }}
//               className="w-full py-2.5 px-3 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl flex items-center gap-3 transition cursor-pointer"
//             >
//               <CheckSquare className="w-4 h-4" />
//               <span>Applicant ATS Ranker</span>
//             </button>

//             <button 
//               onClick={() => { navigate('/candidate-review'); setIsMobileMenuOpen(false); }}
//               className="w-full py-2.5 px-3 bg-orange-500 text-white rounded-xl flex items-center gap-3 shadow-xs cursor-pointer"
//             >
//               <Eye className="w-4 h-4" />
//               <span>Candidate Review</span>
//             </button>
//           </nav>
//         </div>

//         <div className="pt-3 border-t border-zinc-800">
//           <button 
//             onClick={() => navigate('/login')}
//             className="w-full py-2.5 px-3 text-rose-400 hover:bg-rose-950/30 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer"
//           >
//             <LogOut className="w-3.5 h-3.5" /> Sign Out
//           </button>
//         </div>
//       </aside>

//       {/* Backdrop for Mobile Drawer */}
//       {isMobileMenuOpen && (
//         <div 
//           className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-40 lg:hidden" 
//           onClick={() => setIsMobileMenuOpen(false)} 
//         />
//       )}

//       {/* 2. MAIN WORKSPACE */}
//       <div className="flex-grow flex flex-col min-w-0">
        
//         {/* Header */}
//         <header className="w-full bg-white/90 backdrop-blur-md border-b border-orange-200/80 sticky top-0 z-30 px-6 py-3 flex justify-between items-center shadow-2xs">
//           <div className="flex items-center gap-3">
//             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-600 hover:bg-orange-50 rounded-xl transition">
//               <Menu className="w-5 h-5" />
//             </button>

//             {/* BACK BUTTON REDIRECTS TO ATS RANKER */}
//             <button 
//               onClick={() => navigate('/ats-ranker')} 
//               className="p-2 hover:bg-orange-50 rounded-xl text-zinc-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
//               title="Return to Ranker Table"
//             >
//               <ArrowLeft className="w-4 h-4 text-orange-500" /> Back to Applicants
//             </button>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-300 text-orange-700 font-bold text-xs flex items-center justify-center cursor-pointer">
//               HR
//             </div>
//           </div>
//         </header>

//         {/* Workspace Body */}
//         <main className="flex-grow p-6 max-w-5xl mx-auto w-full space-y-6">
          
//           {/* Candidate Profile Header Card */}
//           <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="space-y-1">
//               <div className="flex items-center gap-2">
//                 <h2 className="text-2xl font-black text-zinc-950">{candidate.name}</h2>
//                 <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
//                   <Sparkles className="w-3 h-3 fill-orange-500" /> {candidate.atsScore}% ATS Match Score
//                 </span>
//               </div>
//               <p className="text-xs text-zinc-500 font-medium">Applied for <span className="font-bold text-zinc-800">{candidate.roleApplied}</span></p>
              
//               <div className="flex flex-wrap gap-3 text-xs text-zinc-500 font-medium pt-1">
//                 <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-orange-500" /> {candidate.email}</span>
//                 <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-orange-500" /> {candidate.location}</span>
//               </div>
//             </div>

//             {/* Shortlist / Reject Pipeline Buttons */}
//             <div className="flex items-center gap-2 self-end sm:self-auto">
//               <button 
//                 onClick={() => handleStatusChange('Shortlisted')}
//                 className={`px-4 py-2 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer ${
//                   candidateStatus === 'Shortlisted' ? 'bg-emerald-700 text-white ring-2 ring-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
//                 }`}
//               >
//                 <UserCheck className="w-4 h-4" /> {candidateStatus === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
//               </button>
              
//               <button 
//                 onClick={() => handleStatusChange('Rejected')}
//                 className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
//                   candidateStatus === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
//                 }`}
//               >
//                 <UserX className="w-4 h-4" /> Reject
//               </button>
//             </div>
//           </div>

//           {/* Detailed Skill Breakdown */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
//             <div className="md:col-span-2 space-y-6">
              
//               {/* Executive Summary */}
//               <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-3">
//                 <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Executive Summary</h3>
//                 <p className="text-xs text-zinc-600 font-medium leading-relaxed">{candidate.summary}</p>
//               </div>

//               {/* AI Skill Overlap Analysis */}
//               <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
//                 <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider">AI Skill Overlap Analysis</h3>
                
//                 <div className="space-y-2">
//                   <p className="text-[10px] font-bold text-zinc-400 uppercase">Matched Required Skills</p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {candidate.matchingSkills.map((skill, index) => (
//                       <span key={index} className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-xl flex items-center gap-1">
//                         <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {skill}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="space-y-2 pt-2 border-t border-orange-100">
//                   <p className="text-[10px] font-bold text-zinc-400 uppercase">Missing Skill Gaps</p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {candidate.missingSkills.map((skill, index) => (
//                       <span key={index} className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-3 py-1 rounded-xl flex items-center gap-1">
//                         <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {skill}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//             </div>

//             {/* Resume Preview & Quick Actions Sidebar */}
//             <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-4 h-fit">
//               <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
//                 <FileText className="w-4 h-4 text-orange-500" /> Verified Resume
//               </h3>
              
//               <div className="p-4 bg-orange-50/40 border border-orange-200/80 rounded-2xl text-center space-y-2">
//                 <p className="text-xs font-bold text-zinc-950">{candidate.name.replace(" ", "_")}_Resume.pdf</p>
//                 <p className="text-[10px] text-zinc-400 font-medium">ATS Parsed PDF Document</p>
                
//                 <button className="w-full py-2 bg-white border border-orange-200 hover:border-orange-500 text-orange-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
//                   <Download className="w-3.5 h-3.5" /> Download PDF
//                 </button>
//               </div>

//               <div className="pt-2 border-t border-orange-100">
//                 <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Quick Navigation</p>
//                 <button 
//                   onClick={() => navigate('/ats-ranker')} 
//                   className="w-full py-2 px-3 bg-orange-50/60 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition text-left cursor-pointer border border-orange-200/80"
//                 >
//                   ← Back to ATS Ranker Table
//                 </button>
//               </div>
//             </div>

//           </div>

//         </main>
//       </div>

//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, CheckCircle2, XCircle, ArrowRight, ShieldCheck, 
  Sparkles, AlertCircle, FileText, BarChart3, RefreshCw, Send, CornerDownRight
} from 'lucide-react';
import { updateApplicationStatus, getAtsScore, getJobById } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function CandidateReview() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [loading, setLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Candidate application state
  const [application, setApplication] = useState({
    id: applicationId || '9c1d7a52-3e44-4b8e-9a0b-6f1e2d3c4b5a',
    user_id: 'a7e1c9d2-5b0a-4f7e-8f6a-0c1d2e3f4a5b',
    job_id: '5d6e8f10-1a2b-4c3d-9e4f-5a6b7c8d9e0f',
    resume_version_id: '7a8b9c0d-1234-5678-90ab-cdef12345678',
    status: 'applied',
    candidate_name: 'Alex Morgan',
    candidate_email: 'alex.morgan@example.com',
    applied_at: '2026-10-10T08:00:00Z',
  });

  // ATS Evaluation state
  const [atsScore, setAtsScore] = useState({
    overall_score: 88.5,
    skills_match: 92.0,
    experience_match: 85.0,
    missing_skills: ['Docker', 'Kubernetes', 'GraphQL'],
    matching_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'REST APIs', 'AWS']
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Status transition handler with backend error matrix catching
  const handleStatusChange = async (nextStatus) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Call backend status transition endpoint (PATCH /applications/{id}/status)
      await updateApplicationStatus(application.id, nextStatus, statusNote);

      setApplication((prev) => ({ ...prev, status: nextStatus }));
      showToast(`Candidate status updated to '${nextStatus}' successfully`);
      setStatusNote('');
    } catch (err) {
      console.error('Status transition error:', err);
      if (err?.error?.code === 'INVALID_STATUS_TRANSITION') {
        setErrorMessage(`Disallowed state change: Cannot transition from '${application.status}' to '${nextStatus}'`);
      } else if (err?.error?.code === 'FORBIDDEN') {
        setErrorMessage('You do not have permission to manage this job posting');
      } else {
        setErrorMessage(err?.error?.message || err?.message || 'Failed to update status');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          
          {/* Top Header Card */}
          <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                  Recruiter Governance Portal
                </span>
                <span className="text-[10px] font-bold text-zinc-400">ID: {application.id.slice(0, 8)}...</span>
              </div>
              <h1 className="text-2xl font-black text-zinc-950 mt-1">
                Candidate Review: <span className="text-orange-600">{application.candidate_name}</span>
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Applied on {new Date(application.applied_at).toLocaleDateString()} &bull; {application.candidate_email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider ${
                application.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                application.status === 'interview' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                application.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                Current Stage: {application.status}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: ATS Breakdown & Skills Gap */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ATS Score Card */}
              <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-5">
                <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" /> AI ATS Resume Alignment Evaluation
                </h2>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Overall ATS</p>
                    <p className="text-2xl font-black text-orange-600">{atsScore.overall_score}%</p>
                  </div>
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Skills Match</p>
                    <p className="text-2xl font-black text-emerald-600">{atsScore.skills_match}%</p>
                  </div>
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Experience</p>
                    <p className="text-2xl font-black text-zinc-900">{atsScore.experience_match}%</p>
                  </div>
                </div>

                {/* Matching Skills */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                    Verified Matching Skills ({atsScore.matching_skills.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {atsScore.matching_skills.map((skill) => (
                      <span key={skill} className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                    Identified Skill Gaps
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {atsScore.missing_skills.map((skill) => (
                      <span key={skill} className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-500" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Recruiter Action Controls */}
            <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs space-y-5 h-fit">
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" /> Pipeline Stage Governance
              </h2>

              {/* Status Note Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Evaluation Note (Optional)
                </label>
                <textarea
                  rows="3"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Strong technical background, schedule technical screening call..."
                  className="w-full p-3 bg-orange-50/30 border border-orange-200/80 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Action Buttons following backend transition rules */}
              <div className="space-y-2.5 pt-2 border-t border-orange-100">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Allowed Actions from '{application.status}'
                </p>

                {application.status === 'applied' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('shortlisted')}
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Shortlist Candidate
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={loading}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" /> Reject Application
                    </button>
                  </>
                )}

                {application.status === 'shortlisted' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('interview')}
                      disabled={loading}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Invite to Interview
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={loading}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" /> Reject Application
                    </button>
                  </>
                )}

                {application.status === 'interview' && (
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={loading}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" /> Reject Application
                  </button>
                )}

                {application.status === 'rejected' && (
                  <div className="p-3 bg-zinc-100 text-zinc-500 text-center text-xs font-bold rounded-xl border border-zinc-200">
                    Application Archived (No further transitions allowed)
                  </div>
                )}
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}