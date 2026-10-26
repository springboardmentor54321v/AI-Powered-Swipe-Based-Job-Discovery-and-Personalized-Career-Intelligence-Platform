// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Zap, ArrowRight, Sparkles, Search, FileText, CheckCircle2, 
//   Building2, Users, Target, ShieldCheck, ChevronDown, Star, TrendingUp, Layers
// } from 'lucide-react';

// export default function Landing() {
//   const navigate = useNavigate();
//   const [openFaq, setOpenFaq] = useState(null);

//   const toggleFaq = (index) => {
//     setOpenFaq(openFaq === index ? null : index);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white scroll-smooth">
      
//       {/* 1. Header Navigation */}
//       <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-xs">
//         <div className="flex items-center gap-8">
//           <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
//             <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-600/20">
//               <Zap className="w-5 h-5 text-white fill-white" />
//             </div>
//             <span className="text-2xl font-black tracking-tight text-slate-900">
//               Swipe<span className="text-purple-600">X</span>
//             </span>
//           </div>

//           <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
//             <a href="#features" className="hover:text-purple-600 transition">Features</a>
//             <a href="#how-it-works" className="hover:text-purple-600 transition">How It Works</a>
//             <a href="#roles" className="hover:text-purple-600 transition">For Candidates & Recruiters</a>
//             <a href="#faq" className="hover:text-purple-600 transition">FAQ</a>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/login')}
//             className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-purple-600 transition"
//           >
//             Sign In
//           </button>
//           <button
//             onClick={() => navigate('/register')}
//             className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
//           >
//             Get Started <ArrowRight className="w-3.5 h-3.5" />
//           </button>
//         </div>
//       </nav>

//       {/* 2. Hero Section */}
//       <section className="relative px-6 pt-20 pb-16 flex flex-col items-center text-center overflow-hidden">
//         <div className="max-w-4xl space-y-6 z-10">
//           <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold">
//             <Sparkles className="w-4 h-4 text-purple-600" />
//             <span>Next-Gen AI Career Discovery Platform</span>
//           </div>

//           <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
//             Stop Applying Blindly. <br />
//             <span className="text-purple-600">Swipe Right on Your Next Career Step.</span>
//           </h1>

//           <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
//             Replace tedious job forms with instant AI skill matching, real-time ATS optimization, and gesture-based job discovery.
//           </p>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
//             <button
//               onClick={() => navigate('/register')}
//               className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2"
//             >
//               Start Discovery Free <ArrowRight className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => navigate('/login')}
//               className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-2xl shadow-xs transition"
//             >
//               Hire Candidates (Recruiter Portal)
//             </button>
//           </div>
//         </div>

//         {/* Hero Card Visual */}
//         <div className="w-full max-w-md mt-12 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-left">
//           <div className="flex justify-between items-center mb-3">
//             <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full flex items-center gap-1">
//               <Sparkles className="w-3 h-3 text-purple-600" /> 98% AI Match Score
//             </span>
//             <span className="text-xs text-slate-400 font-semibold">Active Hiring</span>
//           </div>

//           <h3 className="text-xl font-extrabold text-slate-900">Lead AI Software Engineer</h3>
//           <p className="text-xs text-slate-500 font-semibold mb-4">TechCorp Global • Remote / Hybrid</p>

//           <div className="space-y-2 mb-6">
//             <div className="flex items-center gap-2 text-xs text-slate-700">
//               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched: React, Python, Dynamic Programming
//             </div>
//             <div className="flex items-center gap-2 text-xs text-slate-700">
//               <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified Salary: $110k - $140k / yr
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition">
//               Pass (Swipe Left)
//             </button>
//             <button className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition shadow-md shadow-purple-600/20">
//               Apply (Swipe Right)
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* 3. Platform Statistics Bar */}
//       <section className="bg-white border-y border-slate-200 py-10 px-6">
//         <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
//           <div>
//             <p className="text-3xl font-black text-slate-900">120k+</p>
//             <p className="text-xs text-slate-500 font-semibold mt-1">Matched Candidates</p>
//           </div>
//           <div>
//             <p className="text-3xl font-black text-purple-600">85%</p>
//             <p className="text-xs text-slate-500 font-semibold mt-1">Faster Hiring Cycle</p>
//           </div>
//           <div>
//             <p className="text-3xl font-black text-slate-900">500+</p>
//             <p className="text-xs text-slate-500 font-semibold mt-1">Active MNCs & Startups</p>
//           </div>
//           <div>
//             <p className="text-3xl font-black text-purple-600">94%</p>
//             <p className="text-xs text-slate-500 font-semibold mt-1">ATS Optimization Accuracy</p>
//           </div>
//         </div>
//       </section>

//       {/* 4. Core Features Section */}
//       <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
//         <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
//           <h2 className="text-3xl font-black text-slate-900">Engineered for Modern Hiring</h2>
//           <p className="text-slate-600 text-sm">Everything you need to streamline discovery and land high-converting interviews.</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
//             <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
//               <Zap className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-900">Gesture Swipe Discovery</h3>
//             <p className="text-slate-600 text-xs leading-relaxed">
//               Skip endless application forms. Swipe right to apply instantly with your verified AI profile or swipe left to move to the next role.
//             </p>
//           </div>

//           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
//             <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
//               <FileText className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-900">AI ATS Resume Score</h3>
//             <p className="text-slate-600 text-xs leading-relaxed">
//               Get real-time feedback on your resume structure, keyword gaps, and ATS compliance before applying to top companies.
//             </p>
//           </div>

//           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
//             <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
//               <Target className="w-6 h-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-900">Smart Job Filters</h3>
//             <p className="text-slate-600 text-xs leading-relaxed">
//               Filter roles dynamically by Top MNCs, Early-Stage Startups, Fresher-Friendly Roles, and Low Competition opportunities.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* 5. Dual Solutions (Candidates vs Recruiters) */}
//       <section id="roles" className="bg-white py-20 px-6 border-y border-slate-200">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
//           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
//             <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">For Job Seekers</span>
//             <h3 className="text-2xl font-black text-slate-900">Land Interviews 3x Faster</h3>
//             <ul className="space-y-3 text-xs text-slate-700 font-medium">
//               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> One-click application via Swipe Gesture</li>
//               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Real-time keyword gap analysis for every job</li>
//               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Visual Kanban board to track application states</li>
//             </ul>
//             <button onClick={() => navigate('/register')} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition">
//               Create Candidate Profile
//             </button>
//           </div>

//           <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
//             <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">For Recruiters</span>
//             <h3 className="text-2xl font-black text-slate-900">Automate Candidate Sourcing</h3>
//             <ul className="space-y-3 text-xs text-slate-700 font-medium">
//               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-900" /> Pre-screened candidates ranked by AI Skill Match</li>
//               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-900" /> Zero spam applications with verified candidate profiles</li>
//               <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-900" /> Direct pipeline management & interview scheduling</li>
//             </ul>
//             <button onClick={() => navigate('/login')} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition">
//               Access Recruiter Workspace
//             </button>
//           </div>

//         </div>
//       </section>

//       {/* 6. How It Works Section */}
//       <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
//         <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
//           <h2 className="text-3xl font-black text-slate-900">How SwipeX Works</h2>
//           <p className="text-slate-600 text-sm">Four simple steps from setup to job placement.</p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//           {[
//             { step: '01', title: 'Upload Resume', desc: 'Drag and drop your resume. Our AI extracts skills and projects automatically.' },
//             { step: '02', title: 'Get Match Score', desc: 'Receive instant ATS scoring and tailored keyword optimization tips.' },
//             { step: '03', title: 'Swipe & Apply', desc: 'Browse curated job cards. Swipe right to apply instantly without forms.' },
//             { step: '04', title: 'Track Progress', desc: 'Monitor application status on your personal candidate dashboard.' },
//           ].map((item, idx) => (
//             <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
//               <span className="text-2xl font-black text-purple-600">{item.step}</span>
//               <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
//               <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* 7. FAQ Accordion Section */}
//       <section id="faq" className="bg-white py-20 px-6 border-t border-slate-200">
//         <div className="max-w-4xl mx-auto space-y-8">
//           <div className="text-center space-y-2">
//             <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
//             <p className="text-slate-600 text-sm">Everything you need to know about SwipeX.</p>
//           </div>

//           <div className="space-y-4">
//             {[
//               { q: 'How does the AI Match Score work?', a: 'Our AI compares your resume skills, experience level, and project tech stack directly against real job descriptions to generate a percentage match score.' },
//               { q: 'Is SwipeX free for job seekers?', a: 'Yes! SwipeX is completely free for candidate profile creation, swipe discovery, ATS scoring, and job applications.' },
//               { q: 'How do recruiters receive my application?', a: 'When you swipe right, your verified AI profile and formatted resume are sent directly into the recruiter’s pipeline dashboard.' },
//             ].map((faq, idx) => (
//               <div key={idx} className="border border-slate-200 rounded-2xl p-5 bg-slate-50 cursor-pointer" onClick={() => toggleFaq(idx)}>
//                 <div className="flex justify-between items-center font-bold text-sm text-slate-900">
//                   <span>{faq.q}</span>
//                   <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
//                 </div>
//                 {openFaq === idx && (
//                   <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200 leading-relaxed">
//                     {faq.a}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 8. Call To Action Footer Banner */}
//       <section className="bg-purple-600 text-white py-16 px-6 text-center">
//         <div className="max-w-3xl mx-auto space-y-6">
//           <h2 className="text-3xl sm:text-4xl font-black">Ready to Swipe Your Way into Your Next Role?</h2>
//           <p className="text-purple-100 text-sm max-w-xl mx-auto">
//             Join thousands of developers, designers, and tech professionals discovering roles with AI precision.
//           </p>
//           <button
//             onClick={() => navigate('/register')}
//             className="px-8 py-4 bg-white text-purple-700 font-extrabold text-xs rounded-2xl shadow-xl hover:bg-slate-100 transition inline-flex items-center gap-2"
//           >
//             Create Your Free Account <ArrowRight className="w-4 h-4" />
//           </button>
//         </div>
//       </section>

//       {/* 9. Footer */}
//       <footer className="w-full bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-xs">
//         <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
//               <Zap className="w-4 h-4 text-white fill-white" />
//             </div>
//             <span className="text-lg font-black text-white">SwipeX</span>
//           </div>
//           <p>© 2026 SwipeX Platform. Built for Intelligent Career Discovery.</p>
//         </div>
//       </footer>

//     </div>
//   );
// }

// import React from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// const Landing = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-slate-50 text-zinc-900 font-sans selection:bg-orange-500 selection:text-white">
//       {/* Background Subtle Gradient Blobs */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
//         <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"></div>
//       </div>

//       {/* Top Header / Navigation Bar */}
//       <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200/80 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//           <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
//             <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center font-black text-2xl text-orange-500 shadow-md">
//               S
//             </div>
//             <span className="text-xl font-extrabold text-zinc-950 tracking-wide">
//               Swipe<span className="text-orange-500">X</span>
//             </span>
//           </div>

//           <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-600">
//             <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
//             <a href="#how-it-works" className="hover:text-orange-600 transition-colors">How It Works</a>
//             <a href="#roles" className="hover:text-orange-600 transition-colors">Portals</a>
//           </nav>

//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => navigate('/login')}
//               className="text-sm font-bold text-zinc-800 hover:text-orange-600 px-4 py-2 rounded-lg transition-colors"
//             >
//               Sign In
//             </button>
//             <button
//               onClick={() => navigate('/register')}
//               className="text-sm font-bold px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
//             >
//               Get Started
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative pt-16 pb-16 md:pt-24 md:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-600 mb-8 shadow-sm">
//           <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
//           <span>Next-Gen Career Intelligence Platform</span>
//         </div>

//         <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 mb-6 leading-tight">
//           Swipe Right to Launch Your <br className="hidden sm:inline" />
//           <span className="text-orange-500">
//             Tech Career
//           </span>
//         </h1>

//         <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 mb-10 leading-relaxed font-medium">
//           SwipeX eliminates endless application forms. Experience gesture-driven job discovery, instant skill matching, and direct employer connection.
//         </p>

//         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
//           <button
//             onClick={() => navigate('/register')}
//             className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:scale-[1.02] transition-all"
//           >
//             Explore Jobs Now
//           </button>
//           <button
//             onClick={() => navigate('/login')}
//             className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-white font-bold text-base shadow-md transition-all"
//           >
//             Employer Portal
//           </button>
//         </div>

//         {/* Swipe Card Preview Component (Light Container with Black/Orange Accents) */}
//         <div className="relative max-w-sm sm:max-w-md mx-auto pt-2">
//           <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl text-left transition-all hover:border-orange-500/40">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-orange-500 flex items-center justify-center font-black text-lg shadow-sm">
//                   SX
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-zinc-950 text-base">Full Stack Developer</h3>
//                   <p className="text-xs text-zinc-500 font-medium">SwipeX Tech Labs • Hyderabad / Remote</p>
//                 </div>
//               </div>
//               <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
//                 95% Match
//               </span>
//             </div>

//             <p className="text-xs text-zinc-600 mb-4 line-clamp-2 leading-relaxed">
//               Looking for a React and Django engineer to build scalable web applications and real-time candidate search systems.
//             </p>

//             <div className="flex flex-wrap gap-2 mb-6">
//               <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">React.js</span>
//               <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">Django</span>
//               <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">PostgreSQL</span>
//               <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200">₹12 - ₹18 LPA</span>
//             </div>

//             <div className="flex items-center justify-center space-x-8 pt-3 border-t border-zinc-100">
//               <button className="w-12 h-12 rounded-full border border-zinc-300 bg-zinc-100 text-zinc-500 hover:text-red-500 hover:border-red-300 flex items-center justify-center font-bold text-lg shadow-sm transition-transform hover:scale-110">
//                 ✕
//               </button>
//               <button className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/30 transition-transform hover:scale-110">
//                 ♥
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Feature Highlights Grid */}
//       <section id="features" className="py-20 bg-white border-y border-zinc-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="text-3xl font-extrabold text-zinc-950 mb-3">Engineered for Speed and Precision</h2>
//             <p className="text-zinc-600 text-sm font-medium">SwipeX streamlines hiring for both job seekers and recruiters.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-slate-50 border border-zinc-200 hover:border-orange-500/50 rounded-2xl p-7 transition-all shadow-sm">
//               <div className="w-12 h-12 rounded-xl bg-zinc-950 text-orange-500 flex items-center justify-center mb-5 font-black text-2xl shadow-md">
//                 👆
//               </div>
//               <h3 className="text-lg font-bold text-zinc-950 mb-2">Gesture Job Discovery</h3>
//               <p className="text-zinc-600 text-sm leading-relaxed">
//                 Swipe right to express interest in top engineering roles instantly without completing redundant forms.
//               </p>
//             </div>

//             <div className="bg-slate-50 border border-zinc-200 hover:border-orange-500/50 rounded-2xl p-7 transition-all shadow-sm">
//               <div className="w-12 h-12 rounded-xl bg-zinc-950 text-orange-500 flex items-center justify-center mb-5 font-black text-2xl shadow-md">
//                 🎯
//               </div>
//               <h3 className="text-lg font-bold text-zinc-950 mb-2">Smart Skill Scoring</h3>
//               <p className="text-zinc-600 text-sm leading-relaxed">
//                 Our dynamic algorithm ranks candidate skills against role requirements to deliver realistic match percentages.
//               </p>
//             </div>

//             <div className="bg-slate-50 border border-zinc-200 hover:border-orange-500/50 rounded-2xl p-7 transition-all shadow-sm">
//               <div className="w-12 h-12 rounded-xl bg-zinc-950 text-orange-500 flex items-center justify-center mb-5 font-black text-2xl shadow-md">
//                 📌
//               </div>
//               <h3 className="text-lg font-bold text-zinc-950 mb-2">Application Tracking</h3>
//               <p className="text-zinc-600 text-sm leading-relaxed">
//                 Stay updated on every application with clear candidate status dashboards and real-time shortlist alerts.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Role Selection / Access Portals */}
//       <section id="roles" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           <div className="bg-white border border-zinc-200 hover:border-orange-500/50 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-md transition-all">
//             <div>
//               <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 mb-2 block">Candidate Portal</span>
//               <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mb-4">Searching for a new opportunity?</h3>
//               <p className="text-zinc-600 text-sm mb-8 leading-relaxed font-medium">
//                 Build your candidate profile, showcase your technical skills, and discover tailored job cards right away.
//               </p>
//             </div>
//             <div>
//               <button
//                 onClick={() => navigate('/register')}
//                 className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20"
//               >
//                 Join as Candidate →
//               </button>
//             </div>
//           </div>

//           <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg text-white transition-all">
//             <div>
//               <span className="text-xs font-extrabold uppercase tracking-wider text-orange-400 mb-2 block">Recruiter Portal</span>
//               <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Hiring top-tier software talent?</h3>
//               <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
//                 Post open job roles, evaluate candidate profiles, and organize shortlists with ease.
//               </p>
//             </div>
//             <div>
//               <button
//                 onClick={() => navigate('/register')}
//                 className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20"
//               >
//                 Post Openings →
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-zinc-200 bg-white py-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-bold text-orange-500 text-sm">
//               S
//             </div>
//             <span className="font-bold text-zinc-950">SwipeX Career Intelligence</span>
//           </div>

//           <p className="text-xs text-zinc-500 font-medium">
//             © {new Date().getFullYear()} SwipeX. All rights reserved.
//           </p>

//           <div className="flex space-x-6 text-xs font-semibold text-zinc-600">
//             <Link to="/login" className="hover:text-orange-600 transition-colors">Sign In</Link>
//             <Link to="/register" className="hover:text-orange-600 transition-colors">Register</Link>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Landing;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Interactive Demo Card State
  const [swiped, setSwiped] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleSwipe = (type) => {
    setActionType(type);
    setSwiped(true);
    setTimeout(() => {
      setSwiped(false);
      setActionType(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF2EA] text-zinc-900 font-sans selection:bg-[#FF6B00] selection:text-white">
      
      {/* 0. NAVIGATION (Styled like the reference image) */}
      <header className="sticky top-0 z-50 bg-[#FAF2EA]/95 backdrop-blur-sm border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl font-black text-zinc-950 tracking-tight ml-2">
              Swipe<span className="text-[#FF6B00]">X</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-10 text-sm font-bold text-zinc-800">
            <a href="#how-it-works" className="text-[#FF6B00] border-b-2 border-[#FF6B00] pb-1">Home</a>
            <a href="#how-it-works" className="hover:text-[#FF6B00] transition-colors">Find Jobs</a>
            <a href="#ai-intelligence" className="hover:text-[#FF6B00] transition-colors">Companies</a>
            <a href="#swipe-experience" className="hover:text-[#FF6B00] transition-colors">Candidates</a>
            <a href="#portals" className="hover:text-[#FF6B00] transition-colors">About us</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-zinc-900 hover:text-[#FF6B00] px-4 py-2 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white shadow-md transition-all hover:scale-[1.02]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION (Exact structure matching image) */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-left">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-950 mb-6 leading-[1.08]">
              Your <span className="text-[#FF6B00] relative">Dream job <span className="absolute -right-12 top-0 text-3xl hidden sm:inline">↪</span></span> <br />
              Is one click away
            </h1>

            <p className="text-base sm:text-lg text-zinc-700 mb-8 leading-relaxed max-w-xl font-medium">
              Empower your career journey with SwipeX. AI-powered job discovery that matches your skills, resume, and career goals with the right opportunities.
            </p>

            {/* Floating Search Pill Bar */}
            <div className="bg-white rounded-full p-2 pl-6 border border-orange-200/80 shadow-lg flex flex-col sm:flex-row items-center gap-3 max-w-xl mb-10">
              <div className="flex items-center gap-2 flex-1 w-full">
                <span className="text-zinc-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Job title or Keywords" 
                  className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none text-zinc-800"
                />
              </div>
              <div className="h-6 w-[1px] bg-zinc-200 hidden sm:block"></div>
              <div className="flex items-center gap-2 flex-1 w-full">
                <span className="text-zinc-400">📍</span>
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none text-zinc-800"
                />
              </div>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-all"
              >
                Search
              </button>
            </div>

            
          </div>

          {/* Right Hero Interactive Swipe Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xl relative transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-xl">Senior Python Developer</h3>
                  <p className="text-xs text-zinc-500 font-bold mt-1">Tech Corp • Remote</p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-black bg-orange-100 text-[#FF6B00] border border-orange-200">
                  96% MATCH
                </span>
              </div>

              <div className="space-y-2.5 my-6 bg-[#FAF2EA] p-4 rounded-2xl">
                <div className="flex items-center text-xs font-bold text-zinc-800">
                  <span className="text-emerald-600 font-black mr-2">✓</span> Python & Django
                </div>
                <div className="flex items-center text-xs font-bold text-zinc-800">
                  <span className="text-emerald-600 font-black mr-2">✓</span> FastAPI
                </div>
                <div className="flex items-center text-xs font-bold text-zinc-800">
                  <span className="text-emerald-600 font-black mr-2">✓</span> PostgreSQL
                </div>
              </div>

              <div className="flex items-center justify-around pt-4 border-t border-zinc-100">
                <div className="text-center">
                  <button 
                    onClick={() => handleSwipe('pass')}
                    className="w-14 h-14 rounded-full bg-zinc-100 hover:bg-rose-50 border border-zinc-200 text-zinc-600 hover:text-rose-600 flex items-center justify-center font-bold text-xl mb-1 mx-auto shadow-sm transition-colors"
                  >
                    ✕
                  </button>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pass</span>
                </div>
                <div className="text-center">
                  <button 
                    onClick={() => handleSwipe('apply')}
                    className="w-14 h-14 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white flex items-center justify-center font-bold text-xl mb-1 mx-auto shadow-lg shadow-orange-500/30 transition-transform hover:scale-105"
                  >
                    ⚡
                  </button>
                  <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">Apply</span>
                </div>
              </div>

              {swiped && (
                <div className="absolute inset-0 bg-white/95 rounded-3xl flex items-center justify-center font-black text-xl text-zinc-900 shadow-2xl">
                  {actionType === 'apply' ? '✓ Applied Successfully!' : '✕ Skipped Job'}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW SWIPEX WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-y border-orange-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] mb-2 block">Simple Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 mb-16">HOW SWIPEX WORKS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF2EA] border border-orange-200/60 rounded-3xl p-8 text-left shadow-sm relative">
              <span className="text-4xl font-black text-[#FF6B00]/20 absolute top-6 right-6">01</span>
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-2xl mb-6 font-bold shadow-md">
                📄
              </div>
              <h3 className="text-xl font-extrabold text-zinc-950 mb-2">Build Your Profile</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                Upload your resume and let SwipeX understand your skills and experience.
              </p>
            </div>

            <div className="bg-[#FAF2EA] border border-orange-200/60 rounded-3xl p-8 text-left shadow-sm relative">
              <span className="text-4xl font-black text-[#FF6B00]/20 absolute top-6 right-6">02</span>
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-2xl mb-6 font-bold shadow-md">
                ✨
              </div>
              <h3 className="text-xl font-extrabold text-zinc-950 mb-2">Get AI-Matched Jobs</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                SwipeX analyzes your profile and recommends relevant jobs.
              </p>
            </div>

            <div className="bg-[#FAF2EA] border border-orange-200/60 rounded-3xl p-8 text-left shadow-sm relative">
              <span className="text-4xl font-black text-[#FF6B00]/20 absolute top-6 right-6">03</span>
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-[#FF6B00] flex items-center justify-center text-2xl mb-6 font-bold shadow-md">
                👉
              </div>
              <h3 className="text-xl font-extrabold text-zinc-950 mb-2">Swipe & Apply</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                Swipe right on jobs you want and track your applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI & RESUME INTELLIGENCE */}
      <section id="ai-intelligence" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] mb-2 block">Career Engine</span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 mb-4">
            Not just job swiping. <span className="text-[#FF6B00]">Smart job matching.</span>
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-medium">
            Our intelligent resume parser directly benchmarks your profile against active employer requisitions.
          </p>
        </div>

        <div className="bg-zinc-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl w-full">
              <span className="text-xs text-[#FF6B00] font-extrabold block mb-1">INPUT</span>
              <h4 className="font-bold text-base">YOUR RESUME</h4>
            </div>
            <span className="text-[#FF6B00] font-bold text-xl md:rotate-0 rotate-90">↓</span>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl w-full">
              <span className="text-xs text-[#FF6B00] font-extrabold block mb-1">PROCESS</span>
              <h4 className="font-bold text-base">AI ANALYSIS</h4>
            </div>
            <span className="text-[#FF6B00] font-bold text-xl md:rotate-0 rotate-90">↓</span>
            <div className="flex-1 bg-[#FF6B00] text-white p-5 rounded-2xl w-full font-black">
              <span className="text-xs uppercase tracking-wider block mb-1 text-orange-100">METRIC</span>
              <h4 className="text-xl">ATS SCORE: 92%</h4>
            </div>
            <span className="text-[#FF6B00] font-bold text-xl md:rotate-0 rotate-90">↓</span>
            <div className="flex-1 bg-zinc-900 border border-orange-500/50 p-5 rounded-2xl w-full">
              <span className="text-xs text-[#FF6B00] font-extrabold block mb-1">OUTPUT</span>
              <h4 className="font-extrabold text-lg text-[#FF6B00]">96% JOB MATCH</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PORTAL SELECTION */}
      <section id="portals" className="py-20 bg-white border-t border-orange-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-zinc-950">One platform. Two sides of the opportunity.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#FAF2EA] border border-orange-200/60 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-3xl mb-4 block">👤</span>
                <h3 className="text-2xl font-extrabold text-zinc-950 mb-3">For Job Seekers</h3>
                <p className="text-zinc-600 text-sm leading-relaxed mb-8 font-medium">
                  Discover relevant jobs, understand your match, swipe to apply, and track your applications seamlessly.
                </p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="self-start px-8 py-3 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md"
              >
                Explore as a Job Seeker →
              </button>
            </div>

            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-10 flex flex-col justify-between text-white shadow-xl">
              <div>
                <span className="text-3xl mb-4 block">🏢</span>
                <h3 className="text-2xl font-extrabold text-white mb-3">For Recruiters</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  Find relevant candidates, review skills and match information, and manage hiring efficiently.
                </p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="self-start px-8 py-3 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md"
              >
                Explore Employer Portal →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-orange-200/60 bg-[#FAF2EA] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-zinc-950 text-lg">SwipeX Career Intelligence</span>
          </div>

          <p className="text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} SwipeX. All rights reserved.
          </p>

          <div className="flex space-x-6 text-xs font-semibold text-zinc-700">
            <Link to="/login" className="hover:text-[#FF6B00] transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-[#FF6B00] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;