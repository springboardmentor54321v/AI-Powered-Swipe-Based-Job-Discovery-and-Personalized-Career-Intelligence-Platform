// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Sparkles, Search, Building2, FileText, BarChart3, Bookmark, User, Bell
// } from 'lucide-react';

// export const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const menuItems = [
//     { label: 'AI Swipe Feed', path: '/discovery', icon: Sparkles },
//     { label: 'Search Jobs', path: '/job-search', icon: Search },
//     { label: 'Companies', path: '/companies', icon: Building2 },
//     { label: 'Resume Upload', path: '/resume-upload', icon: FileText },
//     { label: 'ATS Ranker', path: '/ats-ranker', icon: BarChart3 },
//     { label: 'Dashboard', path: '/dashboard', icon: Bookmark },
//     { label: 'Notifications', path: '/notifications', icon: Bell },
//     { label: 'Profile', path: '/profile', icon: User },
//   ];

//   return (
//     <aside className="w-64 bg-white border-r border-slate-200 p-5 hidden lg:flex flex-col justify-between font-sans min-h-[calc(100vh-4rem)]">
//       <div className="space-y-6">
//         <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3">
//           Candidate Workspace
//         </div>

//         <nav className="space-y-1">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path;

//             return (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
//                   isActive
//                     ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-2xs'
//                     : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
//                 }`}
//               >
//                 <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>
//       </div>

//       <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl text-center space-y-1">
//         <p className="text-xs font-black text-purple-900">SwipeX AI Engine</p>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Sparkles, 
//   Search, 
//   Building2, 
//   FileText, 
//   BarChart3, 
//   Bookmark, 
//   Bell, 
//   User, 
//   Settings 
// } from 'lucide-react';

// export const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Retrieve authenticated candidate info from existing LocalStorage session keys
//   const userEmail = localStorage.getItem('swipex_user_email') || localStorage.getItem('user_email');
//   const userName = localStorage.getItem('swipex_user_name') || localStorage.getItem('user_name');
  
//   // Format user display name if available, otherwise fall back to "Candidate"
//   const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Candidate');

//   // Main navigation items ordered strictly according to requirements
//   const menuItems = [
//     { label: 'Discover', path: '/discovery', icon: Sparkles },
//     { label: 'Search Jobs', path: '/job-search', icon: Search },
//     { label: 'Companies', path: '/companies', icon: Building2 },
//     { label: 'Resume Upload', path: '/resume-upload', icon: FileText },
//     { label: 'ATS Ranker', path: '/ats-ranker', icon: BarChart3 },
//     { label: 'Dashboard', path: '/dashboard', icon: Bookmark },
//     { label: 'Notifications', path: '/notifications', icon: Bell },
//     { label: 'Profile', path: '/profile', icon: User },
//   ];

//   const isSettingsActive = location.pathname === '/settings';

//   return (
//     <aside className="w-60 bg-white border-r border-orange-100 flex flex-col justify-between font-sans min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] sticky top-16 shrink-0 selection:bg-orange-500 selection:text-white overflow-hidden">
      
//       {/* SCROLLABLE TOP & MIDDLE CONTAINER */}
//       <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        
//         {/* SECTION A: TOP - CANDIDATE PORTAL PROFILE */}
//         <div className="space-y-3">
//           <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
//             CANDIDATE PORTAL
//           </div>
          
//           <div 
//             onClick={() => navigate('/profile')}
//             className="flex items-center gap-3 p-2 rounded-2xl bg-orange-50/60 border border-orange-100 hover:bg-orange-100/80 transition-colors cursor-pointer"
//           >
//             {/* Candidate Avatar */}
//             <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-orange-500/20 shrink-0">
//               <User className="w-5 h-5 text-white" />
//             </div>

//             {/* Candidate Name & Role Subtitle */}
//             <div className="flex flex-col min-w-0">
//               <span className="text-xs font-extrabold text-zinc-900 truncate capitalize">
//                 {displayName}
//               </span>
//               <span className="text-[10px] font-bold text-orange-600">
//                 Job Seeker
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-orange-100/80 my-2" />

//         {/* SECTION B: MIDDLE - MAIN NAVIGATION */}
//         <nav className="space-y-1">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             // Matches exact route or fallback discovery route
//             const isActive = location.pathname === item.path || 
//               (item.path === '/discovery' && location.pathname === '/swipe-discovery');

//             return (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
//                   isActive
//                     ? 'bg-[#FFF0E5] text-orange-600 font-black shadow-xs border border-orange-200/50'
//                     : 'text-zinc-600 hover:text-zinc-950 hover:bg-orange-50/80'
//                 }`}
//               >
//                 <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
//                 <span className="truncate">{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//       </div>

//       {/* SECTION C: BOTTOM - SETTINGS (ANCHORED) */}
//       <div className="p-4 border-t border-orange-100 bg-white">
//         <button
//           onClick={() => navigate('/settings')}
//           className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
//             isSettingsActive
//               ? 'bg-[#FFF0E5] text-orange-600 font-black shadow-xs border border-orange-200/50'
//               : 'text-zinc-600 hover:text-zinc-950 hover:bg-orange-50/80'
//           }`}
//         >
//           <Settings className={`w-4 h-4 shrink-0 ${isSettingsActive ? 'text-orange-500' : 'text-zinc-400'}`} />
//           <span className="truncate">Settings</span>
//         </button>
//       </div>

//     </aside>
//   );
// };

// export default Sidebar;

// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Sparkles, 
//   Search, 
//   Building2, 
//   FileText, 
//   BarChart3, 
//   Bookmark, 
//   Bell, 
//   User, 
//   Settings 
// } from 'lucide-react';

// export const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Retrieve candidate info from existing LocalStorage session keys
//   const userEmail = localStorage.getItem('swipex_user_email') || localStorage.getItem('user_email');
//   const userName = localStorage.getItem('swipex_user_name') || localStorage.getItem('user_name');
  
//   // Format user display name if available, otherwise fall back to "Candidate"
//   const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Candidate');

//   // Navigation menu structure grouped under specific category headings
//   const menuGroups = [
//     {
//       heading: 'DISCOVER',
//       items: [
//         { label: 'Discover', path: '/discovery', icon: Sparkles },
//         { label: 'Search Jobs', path: '/job-search', icon: Search },
//       ],
//     },
//     {
//       heading: 'OPPORTUNITIES',
//       items: [
//         { label: 'Companies', path: '/companies', icon: Building2 },
//       ],
//     },
//     {
//       heading: 'CAREER TOOLS',
//       items: [
//         { label: 'Resume Upload', path: '/resume-upload', icon: FileText },
//         { label: 'ATS Ranker', path: '/ats-ranker', icon: BarChart3 },
//         { label: 'Dashboard', path: '/dashboard', icon: Bookmark },
//       ],
//     },
//     {
//       heading: 'YOUR ACCOUNT',
//       items: [
//         { label: 'Notifications', path: '/notifications', icon: Bell },
//         { label: 'Profile', path: '/profile', icon: User },
//         { label: 'Settings', path: '/settings', icon: Settings },
//       ],
//     },
//   ];

//   return (
//     <aside className="w-64 bg-white border-r border-orange-100 flex flex-col font-sans min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] sticky top-16 shrink-0 selection:bg-orange-500 selection:text-white overflow-hidden">
      
//       {/* SCROLLABLE SIDEBAR BODY */}
//       <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        
//         {/* SECTION A: TOP - CANDIDATE PORTAL HEADER & CENTERED PROFILE */}
//         <div className="space-y-4">
//           {/* Highlighted Top Banner */}
//           <div className="bg-orange-500 text-white text-[10px] font-black tracking-widest uppercase text-center py-1.5 px-3 rounded-lg shadow-sm">
//              CANDIDATE PORTAL
//           </div>
          
//           {/* Centered Large Avatar & Candidate Details */}
//           <div 
//             onClick={() => navigate('/profile')}
//             className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100/80 hover:bg-orange-100/80 transition-all cursor-pointer group"
//           >
//             {/* Larger Avatar Badge */}
//             <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform mb-2.5">
//               <User className="w-7 h-7 text-white" />
//             </div>

//             {/* Candidate Name & Subtitle */}
//             <span className="text-sm font-extrabold text-zinc-900 truncate max-w-full capitalize">
//               {displayName}
//             </span>
//             <span className="text-[11px] font-bold text-orange-600 mt-0.5">
//               Job Seeker
//             </span>
//           </div>
//         </div>

//         <div className="border-t border-orange-100/80" />

//         {/* SECTION B: GROUPED CATEGORY NAVIGATION */}
//         <div className="space-y-5">
//           {menuGroups.map((group) => (
//             <div key={group.heading} className="space-y-1.5">
//               {/* Category Heading */}
//               <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-2">
//                 {group.heading}
//               </div>

//               {/* Group Items */}
//               <nav className="space-y-0.5">
//                 {group.items.map((item) => {
//                   const Icon = item.icon;
//                   // Route match verification
//                   const isActive = location.pathname === item.path || 
//                     (item.path === '/discovery' && location.pathname === '/swipe-discovery');

//                   return (
//                     <button
//                       key={item.path}
//                       onClick={() => navigate(item.path)}
//                       className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
//                         isActive
//                           ? 'bg-[#FFF0E5] text-orange-600 font-black shadow-xs border border-orange-200/60'
//                           : 'text-zinc-600 hover:text-zinc-950 hover:bg-orange-50/80'
//                       }`}
//                     >
//                       <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
//                       <span className="truncate">{item.label}</span>
//                     </button>
//                   );
//                 })}
//               </nav>
//             </div>
//           ))}
//         </div>

//       </div>

//     </aside>
//   );
// };

// export default Sidebar;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Building2, 
  FileText, 
  BarChart3, 
  Bookmark, 
  Bell, 
  User, 
  Settings 
} from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve candidate info from existing LocalStorage session keys
  const userEmail = localStorage.getItem('swipex_user_email') || localStorage.getItem('user_email');
  const userName = localStorage.getItem('swipex_user_name') || localStorage.getItem('user_name');
  
  // Format user display name if available, otherwise fall back to "Candidate"
  const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Candidate');

  // Navigation menu structure grouped under specific category headings
  const menuGroups = [
    {
      heading: 'DISCOVER',
      items: [
        { label: 'Discover', path: '/discovery', icon: Sparkles },
        { label: 'Search Jobs', path: '/job-search', icon: Search },
      ],
    },
    {
      heading: 'OPPORTUNITIES',
      items: [
        { label: 'Companies', path: '/companies', icon: Building2 },
      ],
    },
    {
      heading: 'CAREER TOOLS',
      items: [
        { label: 'Resume Upload', path: '/resume-upload', icon: FileText },
        { label: 'ATS Ranker', path: '/ats-ranker', icon: BarChart3 },
        { label: 'Dashboard', path: '/dashboard', icon: Bookmark },
      ],
    },
    {
      heading: 'YOUR ACCOUNT',
      items: [
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-100 flex flex-col font-sans min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] sticky top-16 shrink-0 selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* SCROLLABLE SIDEBAR BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* SECTION A: TOP - CANDIDATE PORTAL HEADER & CENTERED PROFILE */}
        <div className="space-y-4">
          {/* Highlighted Top Banner */}
          <div className="bg-orange-500 text-white text-[10px] font-black tracking-widest uppercase text-center py-1.5 px-3 rounded-lg shadow-sm">
             CANDIDATE PORTAL
          </div>
          
          {/* Centered Large Avatar & Candidate Details */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all cursor-pointer group"
          >
            {/* Larger Avatar Badge */}
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform mb-2.5">
              <User className="w-7 h-7 text-white" />
            </div>

            {/* Candidate Name & Subtitle */}
            <span className="text-sm font-extrabold text-white truncate max-w-full capitalize">
              {displayName}
            </span>
            <span className="text-[11px] font-bold text-orange-400 mt-0.5">
              Job Seeker
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-800/80" />

        {/* SECTION B: GROUPED CATEGORY NAVIGATION */}
        <div className="space-y-5">
          {menuGroups.map((group) => (
            <div key={group.heading} className="space-y-1.5">
              {/* Category Heading */}
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-2">
                {group.heading}
              </div>

              {/* Group Items */}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  // Route match verification
                  const isActive = location.pathname === item.path || 
                    (item.path === '/discovery' && location.pathname === '/swipe-discovery');

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left ${
                        isActive
                          ? 'bg-orange-500 text-white font-black shadow-md shadow-orange-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;