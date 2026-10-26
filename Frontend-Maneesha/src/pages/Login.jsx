// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Zap, ArrowRight, Mail, Lock, User, Building2, ShieldCheck, Sparkles, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
// import { AuthService } from '../services/api';

// export default function Login() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('candidate'); // 'candidate' | 'recruiter' | 'admin'
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage(null);

//     try {
//       // 1. Send authentication request to live backend database
//       const res = await AuthService.login(email, password);
      
//       const token = res?.access_token || res?.token;
//       const user = res?.user;

//       if (!token) {
//         throw new Error("Invalid response from authentication server.");
//       }

//       // 2. Save REAL JWT Token and user info returned by backend database
//       localStorage.setItem('swipex_token', token);
//       localStorage.setItem('swipex_role', user?.role || role);
//       localStorage.setItem('swipex_user_email', user?.email || email);
//       if (user?.id) localStorage.setItem('swipex_user_id', user.id);

//       // 3. Route to user workspace based on verified role
//       const userRole = user?.role || role;
//       if (userRole === 'candidate') navigate('/discovery');
//       else if (userRole === 'recruiter') navigate('/recruiter-dashboard');
//       else if (userRole === 'admin') navigate('/admin-dashboard');

//     } catch (err) {
//       console.error("Authentication failed:", err);
//       // Display exact error message from backend or network
//       const message = err?.response?.data?.detail 
//         || err?.response?.data?.message 
//         || "Invalid email or password. Please check your credentials or register first.";
//       setErrorMessage(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative h-screen w-full flex items-center justify-center font-sans text-white selection:bg-purple-500 selection:text-white overflow-hidden px-6 sm:px-12">
      
//       {/* 1. Full Screen Violet Background */}
//       <img 
//         src="https://wallpapers.com/images/hd/violet-background-61jy6ewdwsuhozak.jpg" 
//         alt="Violet Background" 
//         className="absolute inset-0 w-full h-full object-cover scale-105"
//       />
//       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

//       {/* 2. Main Container */}
//       <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 max-h-[92vh]">
        
//         {/* LEFT SIDE: Transparent Glass Login Box */}
//         <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:border-white/30 space-y-4">
          
//           {/* Brand Header */}
//           <div className="text-center space-y-1">
//             <div 
//               onClick={() => navigate('/')}
//               className="w-10 h-10 rounded-xl bg-purple-600/90 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/40 cursor-pointer transform hover:scale-105 transition duration-200"
//             >
//               <Zap className="w-5 h-5 text-white fill-white" />
//             </div>
//             <h2 className="text-xl font-black tracking-tight text-white">Welcome Back to SwipeX</h2>
//             <p className="text-[11px] text-purple-200/80 font-medium">Sign in to access your intelligent workspace</p>
//           </div>

//           {/* Error Banner */}
//           {errorMessage && (
//             <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-200">
//               <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
//               <span>{errorMessage}</span>
//             </div>
//           )}

//           {/* Role Selector Tabs */}
//           <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl border border-white/10 text-xs font-bold">
//             <button
//               type="button"
//               onClick={() => setRole('candidate')}
//               className={`py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
//                 role === 'candidate' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-200/70 hover:text-white'
//               }`}
//             >
//               <User className="w-3 h-3" /> Candidate
//             </button>
            
//             <button
//               type="button"
//               onClick={() => setRole('recruiter')}
//               className={`py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
//                 role === 'recruiter' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-200/70 hover:text-white'
//               }`}
//             >
//               <Building2 className="w-3 h-3" /> Recruiter
//             </button>

//             <button
//               type="button"
//               onClick={() => setRole('admin')}
//               className={`py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
//                 role === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-200/70 hover:text-white'
//               }`}
//             >
//               <ShieldCheck className="w-3 h-3" /> Admin
//             </button>
//           </div>

//           {/* Transparent Input Form */}
//           <form onSubmit={handleLogin} className="space-y-3">
//             <div>
//               <label className="block text-[11px] font-bold text-purple-200 mb-1">Email Address</label>
//               <div className="relative">
//                 <Mail className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                 <input 
//                   type="email" 
//                   required 
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder={
//                     role === 'candidate' ? 'alex@example.com' :
//                     role === 'recruiter' ? 'hr@techcorp.com' : 'admin@swipex.io'
//                   } 
//                   className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder:text-purple-200/40 focus:outline-none focus:border-purple-400 focus:bg-black/40 transition"
//                 />
//               </div>
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-1">
//                 <label className="text-[11px] font-bold text-purple-200">Password</label>
//                 <a href="#" className="text-[10px] font-bold text-purple-300 hover:text-white transition">Forgot password?</a>
//               </div>
//               <div className="relative">
//                 <Lock className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                 <input 
//                   type="password" 
//                   required 
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••" 
//                   className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder:text-purple-200/40 focus:outline-none focus:border-purple-400 focus:bg-black/40 transition"
//                 />
//               </div>
//             </div>

//             <button 
//               type="submit" 
//               disabled={loading}
//               className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
//             >
//               {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
//               <span>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
//             </button>
//           </form>

//           {/* Divider & Google Button */}
//           <div className="relative flex py-0.5 items-center">
//             <div className="flex-grow border-t border-white/10"></div>
//             <span className="flex-shrink mx-3 text-[9px] text-purple-200/60 font-bold uppercase tracking-wider">Or</span>
//             <div className="flex-grow border-t border-white/10"></div>
//           </div>

//           <button 
//             type="button" 
//             className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
//           >
//             Continue with Google
//           </button>

//           {/* Navigation to Register */}
//           <p className="text-center text-[11px] text-purple-200/80">
//             Don't have an account?{' '}
//             <span onClick={() => navigate('/register')} className="text-white font-bold cursor-pointer hover:underline">
//               Create Profile
//             </span>
//           </p>

//         </div>

//         {/* RIGHT SIDE: Written Content */}
//         <div className="hidden lg:flex flex-col justify-center max-w-lg space-y-6 pl-6">
//           <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 px-3.5 py-1 rounded-full text-xs font-bold w-fit">
//             <Sparkles className="w-3.5 h-3.5 text-purple-300" />
//             <span>AI Career Intelligence & Matching Engine</span>
//           </div>

//           <div className="space-y-3">
//             <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white">
//               Swipe Right to Apply. <br />
//               <span className="text-purple-300">Match Smarter with AI.</span>
//             </h1>
//             <p className="text-purple-200/80 text-xs sm:text-sm leading-relaxed max-w-md">
//               SwipeX completely replaces tedious job search forms with real-time ATS match scoring, gesture discovery, and direct candidate-recruiter connections.
//             </p>
//           </div>

//           <div className="space-y-2.5">
//             <div className="flex items-center gap-2.5 text-xs text-purple-100 font-semibold">
//               <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
//               <span>Real-time ATS Keyword & Skill Gap Analysis</span>
//             </div>
//             <div className="flex items-center gap-2.5 text-xs text-purple-100 font-semibold">
//               <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
//               <span>Curated MNCs, Fast-Growing Startups & Low Competition Roles</span>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// const Login = () => {
//   const navigate = useNavigate();

//   // Role Selection State (Default: Candidate)
//   const [role, setRole] = useState('Candidate');

//   // Form State
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     rememberMe: false
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Logging in:', { ...formData, role });
//   };

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Zap, ArrowRight, Mail, Lock, User, Building2, ShieldCheck, Sparkles, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
// import { AuthService } from '../services/api';

// export default function Login() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('candidate'); // 'candidate' | 'recruiter' | 'admin'
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage(null);

//     try {
//       // 1. Send authentication request to live backend database
//       const res = await AuthService.login(email, password);
      
//       const token = res?.access_token || res?.token;
//       const user = res?.user;

//       if (!token) {
//         throw new Error("Invalid response from authentication server.");
//       }

//       // 2. Save REAL JWT Token and user info returned by backend database
//       localStorage.setItem('swipex_token', token);
//       localStorage.setItem('swipex_role', user?.role || role);
//       localStorage.setItem('swipex_user_email', user?.email || email);
//       if (user?.id) localStorage.setItem('swipex_user_id', user.id);

//       // 3. Route to user workspace based on verified role
//       const userRole = user?.role || role;
//       if (userRole === 'candidate') navigate('/discovery');
//       else if (userRole === 'recruiter') navigate('/recruiter-dashboard');
//       else if (userRole === 'admin') navigate('/admin-dashboard');

//     } catch (err) {
//       console.error("Authentication failed:", err);
//       // Display exact error message from backend or network
//       const message = err?.response?.data?.detail 
//         || err?.response?.data?.message 
//         || "Invalid email or password. Please check your credentials or register first.";
//       setErrorMessage(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-white text-zinc-900 font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-orange-500 selection:text-white">
      
//       {/* LEFT PANEL - BRANDING */}
//       <div className="lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[280px] lg:min-h-screen">
//         {/* Decorative Ambient Shapes */}
//         <div className="absolute -top-28 -left-28 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
//         <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

//         {/* Top Branding Header */}
//         <div className="flex items-center space-x-2.5 cursor-pointer z-10" onClick={() => navigate('/')}>
//           <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center font-black text-2xl text-orange-500 shadow-md">
//             S
//           </div>
//           <span className="text-2xl font-black text-white tracking-tight">
//             Swipe<span className="text-zinc-950">X</span>
//           </span>
//         </div>

//         {/* Center Hero Content */}
//         <div className="my-auto z-10 py-6 max-w-md">
//           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white mb-4">
//             <span>⚡ AI CAREER INTELLIGENCE ENGINE</span>
//           </div>
          
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-3 leading-tight">
//             Swipe Right to Apply. <br />
//             <span className="text-zinc-950">Match Smarter with AI.</span>
//           </h1>

//           <p className="text-orange-50 text-xs sm:text-sm font-medium leading-relaxed mb-5">
//             SwipeX completely replaces tedious job search forms with real-time ATS match scoring, gesture discovery, and direct candidate-recruiter connections.
//           </p>

//           <div className="space-y-2 pt-1">
//             <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
//               <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
//               <span>Real-time ATS Keyword & Skill Gap Analysis</span>
//             </div>
//             <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
//               <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
//               <span>Curated MNCs, Fast-Growing Startups & Low Competition Roles</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT PANEL - FORM CONTAINER (Pure White Background) */}
//       <div className="lg:w-1/2 bg-white p-6 sm:p-10 lg:p-14 flex items-center justify-center min-h-screen">
        
//         {/* PEACH GLASS CARD FRAME */}
//         {/* bg-[#FAF2EA]/85  */}
//         <div className="max-w-md w-full bg-orange-100/90 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-8 shadow-2xl shadow-orange-950/10 relative">  

//           {/* Center Logo/Icon Badge */}
//           <div className="flex justify-center mb-4">
//             <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/30">
//               ⚡
//             </div>
//           </div>

//           {/* Heading */}
//           <div className="text-center mb-6">
//             <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
//               Welcome Back to SwipeX
//             </h2>
//           </div>

//           {/* Role Switcher Tabs */}
//           <div className="grid grid-cols-3 gap-1 p-1 bg-orange-100/60 border border-orange-200/70 rounded-xl mb-6 text-xs font-bold">
//             <button
//               type="button"
//               onClick={() => setRole('Candidate')}
//               className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
//                 role === 'Candidate' || role === 'Job Seeker'
//                   ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//                   : 'text-zinc-600 hover:text-zinc-950'
//               }`}
//             >
//               👤 Candidate
//             </button>
//             <button
//               type="button"
//               onClick={() => setRole('Recruiter')}
//               className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
//                 role === 'Recruiter'
//                   ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//                   : 'text-zinc-600 hover:text-zinc-950'
//               }`}
//             >
//               🏢 Recruiter
//             </button>
//             <button
//               type="button"
//               onClick={() => setRole('Admin')}
//               className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
//                 role === 'Admin'
//                   ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//                   : 'text-zinc-600 hover:text-zinc-950'
//               }`}
//             >
//               🛡️ Admin
//             </button>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Email Input */}
//             <div>
//               <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
//               <div className="relative">
//                 <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">✉</span>
//                 <input
//                   type="email"
//                   name="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="alex@example.com"
//                   className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
//                 />
//               </div>
//             </div>

//             {/* Password Input */}
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <label className="text-xs font-bold text-zinc-700">Password</label>
//                 <Link to="/forgot-password" className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔒</span>
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••••••••••••"
//                   className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
//                 >
//                   {showPassword ? '🙈' : '👁'}
//                 </button>
//               </div>
//             </div>

//             {/* Remember Me Checkbox */}
//             <div className="flex items-center pt-0.5">
//               <label className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="rememberMe"
//                   checked={formData.rememberMe}
//                   onChange={handleChange}
//                   className="w-3.5 h-3.5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
//                 />
//                 <span className="text-[11px] font-bold text-zinc-600">Remember me</span>
//               </label>
//             </div>

//             {/* Submit Action Button */}
//             <button
//               type="submit"
//               className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 mt-2"
//             >
//               → Sign In as {role}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="relative my-5 text-center">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-orange-200/80"></div>
//             </div>
//             <span className="relative px-2.5 bg-[#FAF2EA] text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
//               OR
//             </span>
//           </div>

//           {/* Google Auth Button */}
//           <button
//             type="button"
//             className="w-full py-2.5 rounded-xl bg-white border border-orange-200/80 hover:bg-orange-50 text-zinc-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
//           >
//             Continue with Google
//           </button>

//           {/* Register Redirect Text */}
//           <p className="text-center text-xs text-zinc-600 mt-6 font-medium">
//             Don't have an account?{' '}
//             <Link to="/register" className="text-orange-600 font-extrabold hover:underline">
//               Create Profile
//             </Link>
//           </p>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, Mail, Lock, User, Building2, ShieldCheck, Sparkles, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('candidate'); // 'candidate' | 'recruiter' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Send authentication request to live backend database
      const res = await AuthService.login(email, password);
      
      const token = res?.access_token || res?.token;
      const user = res?.user;

      if (!token) {
        throw new Error("Invalid response from authentication server.");
      }

      // 2. Save REAL JWT Token and user info returned by backend database
      localStorage.setItem('swipex_token', token);
      localStorage.setItem('swipex_role', user?.role || role);
      localStorage.setItem('swipex_user_email', user?.email || email);
      if (user?.id) localStorage.setItem('swipex_user_id', user.id);

      // 3. Route to user workspace based on verified role
      const userRole = user?.role || role;
      if (userRole === 'candidate') navigate('/discovery');
      else if (userRole === 'recruiter') navigate('/recruiter-dashboard');
      else if (userRole === 'admin') navigate('/admin-dashboard');

    } catch (err) {
      console.error("Authentication failed:", err);
      // Display exact error message from backend or network
      const message = err?.response?.data?.detail 
        || err?.response?.data?.message 
        || "Invalid email or password. Please check your credentials or register first.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-orange-500 selection:text-white">
      
      {/* LEFT PANEL - BRANDING */}
      <div className="lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[280px] lg:min-h-screen">
        {/* Decorative Ambient Shapes */}
        <div className="absolute -top-28 -left-28 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Branding Header */}
        <div className="flex items-center space-x-2.5 cursor-pointer z-10" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center font-black text-2xl text-orange-500 shadow-md">
            S
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            Swipe<span className="text-zinc-950">X</span>
          </span>
        </div>

        {/* Center Hero Content */}
        <div className="my-auto z-10 py-6 max-w-md">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white mb-4">
            <span>⚡ AI CAREER INTELLIGENCE ENGINE</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-3 leading-tight">
            Swipe Right to Apply. <br />
            <span className="text-zinc-950">Match Smarter with AI.</span>
          </h1>

          <p className="text-orange-50 text-xs sm:text-sm font-medium leading-relaxed mb-5">
            SwipeX completely replaces tedious job search forms with real-time ATS match scoring, gesture discovery, and direct candidate-recruiter connections.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
              <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
              <span>Real-time ATS Keyword & Skill Gap Analysis</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
              <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
              <span>Curated MNCs, Fast-Growing Startups & Low Competition Roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM CONTAINER */}
      <div className="lg:w-1/2 bg-white p-6 sm:p-10 lg:p-14 flex items-center justify-center min-h-screen">
        
        {/* PEACH GLASS CARD FRAME */}
        <div className="max-w-md w-full bg-orange-100/90 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-8 shadow-2xl shadow-orange-950/10 relative">  

          {/* Center Logo/Icon Badge */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/30">
              ⚡
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
              Welcome Back to SwipeX
            </h2>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-orange-100/60 border border-orange-200/70 rounded-xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                role === 'candidate'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              👤 Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                role === 'recruiter'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              🏢 Recruiter
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                role === 'admin'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">✉</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-[11px] font-bold text-zinc-600">Remember me</span>
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>→ Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-orange-200/80"></div>
            </div>
            <span className="relative px-2.5 bg-[#FAF2EA] text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              OR
            </span>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            className="w-full py-2.5 rounded-xl bg-white border border-orange-200/80 hover:bg-orange-50 text-zinc-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Continue with Google
          </button>

          {/* Register Redirect Text */}
          <p className="text-center text-xs text-zinc-600 mt-6 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 font-extrabold hover:underline">
              Create Profile
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}