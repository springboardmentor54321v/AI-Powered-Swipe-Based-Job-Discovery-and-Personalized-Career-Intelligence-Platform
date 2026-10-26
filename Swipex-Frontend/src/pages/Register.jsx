// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Zap, ArrowRight, Mail, Lock, User, Building2, ShieldCheck, Code2, Sparkles, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
// import { AuthService } from '../services/api';

// export default function Register() {
//   const navigate = useNavigate();
//   const [role, setRole] = useState('candidate');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [skills, setSkills] = useState('React, Python, SQL');
//   const [company, setCompany] = useState('');
//   const [adminCode, setAdminCode] = useState('');
  
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage(null);

//     const payload = {
//       name: fullName,
//       email,
//       password,
//       role,
//       skills: role === 'candidate' ? skills : undefined,
//       company: role === 'recruiter' ? company : undefined,
//       adminCode: role === 'admin' ? adminCode : undefined,
//     };

//     try {
//       // 1. Send registration data to save in backend database
//       const res = await AuthService.register(payload);
//       const token = res?.access_token || res?.token;

//       if (!token) {
//         // If registration succeeds without immediate token, navigate to login
//         navigate('/login');
//         return;
//       }

//       // 2. Persist real registered user session
//       localStorage.setItem('swipex_token', token);
//       localStorage.setItem('swipex_role', role);
//       localStorage.setItem('swipex_user_email', email);

//       // 3. Route to workspace
//       if (role === 'candidate') navigate('/discovery');
//       else if (role === 'recruiter') navigate('/recruiter-dashboard');
//       else if (role === 'admin') navigate('/admin-dashboard');

//     } catch (err) {
//       console.error("Registration failed:", err);
//       const message = err?.response?.data?.detail 
//         || err?.response?.data?.message 
//         || "Registration failed. Email may already be registered or backend service is unreachable.";
//       setErrorMessage(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative h-screen w-full flex items-center justify-center font-sans text-white selection:bg-purple-500 selection:text-white overflow-hidden px-6 sm:px-12">
//       <img 
//         src="https://wallpapers.com/images/hd/violet-background-61jy6ewdwsuhozak.jpg" 
//         alt="Violet Background" 
//         className="absolute inset-0 w-full h-full object-cover scale-105"
//       />
//       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

//       <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 max-h-[92vh]">
//         <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          
//           <div className="text-center space-y-1">
//             <div 
//               onClick={() => navigate('/')}
//               className="w-10 h-10 rounded-xl bg-purple-600/90 flex items-center justify-center mx-auto cursor-pointer"
//             >
//               <Zap className="w-5 h-5 text-white fill-white" />
//             </div>
//             <h2 className="text-xl font-black text-white">Create SwipeX Account</h2>
//             <p className="text-[11px] text-purple-200/80">Join the intelligent career discovery network</p>
//           </div>

//           {errorMessage && (
//             <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-200">
//               <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
//               <span>{errorMessage}</span>
//             </div>
//           )}

//           <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl border border-white/10 text-xs font-bold">
//             <button
//               type="button"
//               onClick={() => setRole('candidate')}
//               className={`py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
//                 role === 'candidate' ? 'bg-purple-600 text-white' : 'text-purple-200/70 hover:text-white'
//               }`}
//             >
//               <User className="w-3 h-3" /> Candidate
//             </button>
//             <button
//               type="button"
//               onClick={() => setRole('recruiter')}
//               className={`py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
//                 role === 'recruiter' ? 'bg-purple-600 text-white' : 'text-purple-200/70 hover:text-white'
//               }`}
//             >
//               <Building2 className="w-3 h-3" /> Recruiter
//             </button>
//             <button
//               type="button"
//               onClick={() => setRole('admin')}
//               className={`py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
//                 role === 'admin' ? 'bg-purple-600 text-white' : 'text-purple-200/70 hover:text-white'
//               }`}
//             >
//               <ShieldCheck className="w-3 h-3" /> Admin
//             </button>
//           </div>

//           <form onSubmit={handleRegister} className="space-y-3">
//             <div>
//               <label className="block text-[11px] font-bold text-purple-200 mb-1">Full Name</label>
//               <div className="relative">
//                 <User className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                 <input 
//                   type="text" 
//                   required 
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   placeholder="Alex Morgan" 
//                   className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-[11px] font-bold text-purple-200 mb-1">Email Address</label>
//               <div className="relative">
//                 <Mail className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                 <input 
//                   type="email" 
//                   required 
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="alex@example.com" 
//                   className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-[11px] font-bold text-purple-200 mb-1">Password</label>
//               <div className="relative">
//                 <Lock className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                 <input 
//                   type="password" 
//                   required 
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••" 
//                   className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
//                 />
//               </div>
//             </div>

//             {role === 'candidate' && (
//               <div>
//                 <label className="block text-[11px] font-bold text-purple-200 mb-1">Primary Skills</label>
//                 <div className="relative">
//                   <Code2 className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                   <input 
//                     type="text" 
//                     value={skills}
//                     onChange={(e) => setSkills(e.target.value)}
//                     placeholder="React, Python, Java, SQL" 
//                     className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
//                   />
//                 </div>
//               </div>
//             )}

//             {role === 'recruiter' && (
//               <div>
//                 <label className="block text-[11px] font-bold text-purple-200 mb-1">Company Name</label>
//                 <div className="relative">
//                   <Building2 className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                   <input 
//                     type="text" 
//                     required
//                     value={company}
//                     onChange={(e) => setCompany(e.target.value)}
//                     placeholder="NexusTech Global" 
//                     className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
//                   />
//                 </div>
//               </div>
//             )}

//             {role === 'admin' && (
//               <div>
//                 <label className="block text-[11px] font-bold text-purple-200 mb-1">Admin Security Key</label>
//                 <div className="relative">
//                   <ShieldCheck className="w-3.5 h-3.5 text-purple-300/60 absolute left-3.5 top-3" />
//                   <input 
//                     type="text" 
//                     required
//                     value={adminCode}
//                     onChange={(e) => setAdminCode(e.target.value)}
//                     placeholder="SPX-ADMIN-KEY" 
//                     className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
//                   />
//                 </div>
//               </div>
//             )}

//             <button 
//               type="submit" 
//               disabled={loading}
//               className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
//             >
//               {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
//               <span>Create Account</span>
//             </button>
//           </form>

//           <p className="text-center text-[11px] text-purple-200/80">
//             Already registered?{' '}
//             <span onClick={() => navigate('/login')} className="text-white font-bold cursor-pointer hover:underline">
//               Sign In
//             </span>
//           </p>

//         </div>

//         <div className="hidden lg:flex flex-col justify-center max-w-lg space-y-6 pl-6">
//           <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 px-3.5 py-1 rounded-full text-xs font-bold w-fit">
//             <Sparkles className="w-3.5 h-3.5 text-purple-300" />
//             <span>AI Career Intelligence & Matching Engine</span>
//           </div>
//           <h1 className="text-3xl sm:text-4xl font-black text-white">
//             Build Your Profile. <br />
//             <span className="text-purple-300">Unlock Targeted Roles.</span>
//           </h1>
//         </div>

//       </div>
//     </div>
//   );
// }

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// const Register = () => {
//   const navigate = useNavigate();

//   // Role Selection State (Default: Candidate)
//   const [role, setRole] = useState('Candidate');

//   // Registration Form State
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeTerms: false
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
//     if (formData.password !== formData.confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
//     // YOUR EXISTING BACKEND REGISTER API LOGIC HERE
//     console.log('Registering user:', { ...formData, role });
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
//           {/* <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white mb-4">
//             <span>🚀 UNIFIED TALENT & RECRUITMENT NETWORK</span>
//           </div> */}
          
//           {/* <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
//             Launch Your Future. <br />
//             <span className="text-zinc-950">With One Single Swipe.</span>
//           </h1> */}

//           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
//   <span className="whitespace-nowrap">Launch Your Future.</span> <br />
//   <span className="text-zinc-950 whitespace-nowrap">With One Single Swipe.</span>
// </h1>

//           <p className="text-orange-50 text-xs sm:text-sm font-medium leading-relaxed mb-5">
//             Create your account to unlock AI-driven job recommendations, instant ATS profile match analysis, and direct recruitment access.
//           </p>

//           <div className="space-y-2 pt-1">
//             <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
//               <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
//               <span>Instant AI Skill & Resume Calibration</span>
//             </div>
//             <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
//               <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
//               <span>Direct Connectivity with Verified Employers</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT PANEL - FORM CONTAINER (Pure White Background) */}
//       <div className="lg:w-1/2 bg-white p-6 sm:p-10 lg:p-14 flex items-center justify-center min-h-screen">
        
//         {/* PEACH GLASS CARD FRAME */}
//         <div className="max-w-md w-full bg-orange-100/90 backdrop-blur-xl border border-orange-200/90 rounded-3xl p-8 shadow-2xl shadow-orange-950/10 relative">

//           {/* Center Logo/Icon Badge */}
//           <div className="flex justify-center mb-4">
//             <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/30">
//               🚀
//             </div>
//           </div>

//           {/* Heading */}
//           <div className="text-center mb-6">
//             <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
//               Create Your Profile
//             </h2>
//           </div>

//           {/* Role Switcher Tabs (Candidate | Recruiter | Admin) */}
// <div className="grid grid-cols-3 gap-1 p-1 bg-orange-100/60 border border-orange-200/70 rounded-xl mb-6 text-xs font-bold">
//   <button
//     type="button"
//     onClick={() => setRole('Candidate')}
//     className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
//       role === 'Candidate' || role === 'Job Seeker'
//         ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//         : 'text-zinc-600 hover:text-zinc-950'
//     }`}
//   >
//     👤 Candidate
//   </button>
//   <button
//     type="button"
//     onClick={() => setRole('Recruiter')}
//     className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
//       role === 'Recruiter'
//         ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//         : 'text-zinc-600 hover:text-zinc-950'
//     }`}
//   >
//     🏢 Recruiter
//   </button>
//   <button
//     type="button"
//     onClick={() => setRole('Admin')}
//     className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
//       role === 'Admin'
//         ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
//         : 'text-zinc-600 hover:text-zinc-950'
//     }`}
//   >
//     🛡️ Admin
//   </button>
// </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-3.5">
//             {/* Full Name Input */}
//             <div>
//               <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
//               <div className="relative">
//                 <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">👤</span>
//                 <input
//                   type="text"
//                   name="fullName"
//                   required
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   placeholder="Alex Morgan"
//                   className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
//                 />
//               </div>
//             </div>

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

//             {/* Password & Confirm Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs font-bold text-zinc-700 block mb-1">Password</label>
//                 <div className="relative">
//                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔒</span>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     required
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="••••••••"
//                     className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-xs font-bold text-zinc-700 block mb-1">Confirm</label>
//                 <div className="relative">
//                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔒</span>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="confirmPassword"
//                     required
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     placeholder="••••••••"
//                     className="w-full pl-9 pr-7 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
//                   >
//                     {showPassword ? '🙈' : '👁'}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Terms Agreement Checkbox */}
//             <div className="flex items-center pt-1">
//               <label className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="agreeTerms"
//                   required
//                   checked={formData.agreeTerms}
//                   onChange={handleChange}
//                   className="w-3.5 h-3.5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
//                 />
//                 <span className="text-[11px] font-bold text-zinc-600">
//                   I agree to the Terms & Privacy Policy
//                 </span>
//               </label>
//             </div>

//             {/* Submit Action Button */}
//             <button
//               type="submit"
//               className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 mt-2"
//             >
//               → Register as {role}
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

//           {/* Login Redirect Text */}
//           <p className="text-center text-xs text-zinc-600 mt-6 font-medium">
//             Already have an account?{' '}
//             <Link to="/login" className="text-orange-600 font-extrabold hover:underline">
//               Sign In
//             </Link>
//           </p>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default Register;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ShieldCheck, 
  Code2, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { AuthService } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // Role Selection State ('candidate' | 'recruiter' | 'admin')
  const [role, setRole] = useState('candidate');

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [skills, setSkills] = useState('React, Python, SQL');
  const [company, setCompany] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Build backend payload matching your API contract
    const payload = {
      name: fullName,
      email,
      password,
      role,
      skills: role === 'candidate' ? skills : undefined,
      company: role === 'recruiter' ? company : undefined,
      adminCode: role === 'admin' ? adminCode : undefined,
    };

    try {
      // 1. Send registration data to backend
      const res = await AuthService.register(payload);
      const token = res?.access_token || res?.token;

      if (!token) {
        // Direct to login if immediate token isn't issued upon registration
        navigate('/login');
        return;
      }

      // 2. Persist token and session variables
      localStorage.setItem('swipex_token', token);
      localStorage.setItem('swipex_role', role);
      localStorage.setItem('swipex_user_email', email);

      // 3. Route to workspace based on verified role
      if (role === 'candidate') navigate('/discovery');
      else if (role === 'recruiter') navigate('/recruiter-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');

    } catch (err) {
      console.error("Registration failed:", err);
      const message = err?.response?.data?.detail 
        || err?.response?.data?.message 
        || "Registration failed. Email may already be registered or backend service is unreachable.";
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
            <span className="whitespace-nowrap">Launch Your Future.</span> <br />
            <span className="text-zinc-950 whitespace-nowrap">With One Single Swipe.</span>
          </h1>

          <p className="text-orange-50 text-xs sm:text-sm font-medium leading-relaxed mb-5">
            Create your account to unlock AI-driven job recommendations, instant ATS profile match analysis, and direct recruitment access.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
              <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
              <span>Instant AI Skill & Resume Calibration</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs font-bold text-white">
              <span className="w-4 h-4 rounded-full bg-zinc-950 text-orange-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
              <span>Direct Connectivity with Verified Employers</span>
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
              🚀
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
              Create Your Profile
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
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name Input */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Conditional Role-Based Inputs
            {role === 'candidate' && (
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Primary Skills</label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Python, Java, SQL"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>
            )} */}

            {role === 'recruiter' && (
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="NexusTech Global"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Admin Security Key</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="SPX-ADMIN-KEY"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Password & Confirm Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Confirm</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-7 py-2.5 rounded-xl bg-white border border-orange-200/80 text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-[11px] font-bold text-zinc-600">
                  I agree to the Terms & Privacy Policy
                </span>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-orange-200/80"></div>
            </div>
            <span className="relative px-2.5 bg-orange-100/90 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
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

          {/* Login Redirect Text */}
          <p className="text-center text-xs text-zinc-600 mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 font-extrabold hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}