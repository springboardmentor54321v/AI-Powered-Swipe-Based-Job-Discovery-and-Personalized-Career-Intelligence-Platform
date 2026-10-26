// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Zap, Sparkles, Home, Bell, User } from 'lucide-react';

// export const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const navItems = [
//     { label: 'Home', path: '/', icon: Home },
//     { label: 'Discover', path: '/discovery', icon: Sparkles },
//   ];

//   return (
//     <header className="bg-white border-b border-slate-200 sticky top-0 z-50 font-sans w-full">
//       <div className="w-full px-8 h-16 flex items-center justify-between">
        
//         {/* LEFT SECTION: Pinned to far left */}
//         <div className="flex items-center">
//           <div 
//             onClick={() => navigate('/discovery')} 
//             className="flex items-center gap-2.5 cursor-pointer select-none"
//           >
//             <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black shadow-sm">
//               <Zap className="w-5 h-5 fill-white" />
//             </div>
//             <span className="text-xl font-black text-slate-900 tracking-tight">
//               Swipe<span className="text-purple-600">X</span>
//             </span>
//           </div>
//         </div>

//         {/* CENTER SECTION: Exactly centered */}
//         <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path;

//             return (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
//                   isActive
//                     ? 'bg-purple-50 text-purple-700'
//                     : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
//                 }`}
//               >
//                 <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//         {/* RIGHT SECTION: Pinned to far right */}
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => navigate('/notifications')}
//             className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer relative border border-slate-200"
//             title="Notifications"
//           >
//             <Bell className="w-4 h-4" />
//             <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full" />
//           </button>

//           <button 
//             onClick={() => navigate('/profile')}
//             className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer border border-slate-200"
//             title="Profile Settings"
//           >
//             <User className="w-4 h-4" />
//           </button>
//         </div>

//       </div>
//     </header>
//   );
// };

// export default Navbar;


// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Zap, Sparkles, Building2, FileSpreadsheet, Bell, User, Menu, X } from 'lucide-react';

// export const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Retrieve existing user session information from LocalStorage
//   const userEmail = localStorage.getItem('swipex_user_email') || localStorage.getItem('user_email');
//   const userName = localStorage.getItem('swipex_user_name') || localStorage.getItem('user_name');
  
//   // Format fallback display name if fullName exists, otherwise leave empty
//   const displayName = userName ? userName : (userEmail ? userEmail.split('@')[0] : null);

//   // Central candidate navigation links
//   const navItems = [
//     { label: 'Discover', path: '/discovery', icon: Sparkles },
//     { label: 'Companies', path: '/companies', icon: Building2 },
//     { label: 'ATS Dashboard', path: '/ats-ranker', icon: FileSpreadsheet },
//   ];

//   return (
//     <header className="bg-white border-b border-orange-100 sticky top-0 z-50 font-sans w-full shadow-xs">
//       {/* Container with w-full, px-6, and justify-between pushes Left to far-left and Right to far-right */}
//       <div className="w-full px-6 h-16 flex items-center justify-between relative">
        
//         {/* EXTREME LEFT SECTION: SwipeX Branding */}
//         <div className="flex items-center shrink-0">
//           <div 
//             onClick={() => navigate('/discovery')} 
//             className="flex items-center gap-2.5 cursor-pointer select-none group"
//           >
//             <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
//               <Zap className="w-5 h-5 fill-white text-white" />
//             </div>
//             <span className="text-xl font-black text-zinc-900 tracking-tight">
//               Swipe<span className="text-orange-500">X</span>
//             </span>
//           </div>
//         </div>

//         {/* CENTER SECTION: Page Navigation (Desktop - Absolutely Centered) */}
//         <nav className="hidden md:flex items-center gap-1.5 bg-orange-50/50 p-1 rounded-2xl border border-orange-100/60 absolute left-1/2 -translate-x-1/2">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             // Matches exact path or fallback route
//             const isActive = location.pathname === item.path || 
//               (item.path === '/discovery' && location.pathname === '/swipe-discovery');

//             return (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
//                   isActive
//                     ? 'bg-[#FFF0E5] text-orange-600 shadow-xs border border-orange-200/50'
//                     : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/80'
//                 }`}
//               >
//                 <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//         {/* EXTREME RIGHT SECTION: Notifications & Profile */}
//         <div className="flex items-center gap-3 shrink-0">
//           {/* Notification Button */}
//           <button 
//             onClick={() => navigate('/notifications')}
//             className="p-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-orange-50 transition-colors cursor-pointer relative border border-zinc-200/80"
//             title="Notifications"
//           >
//             <Bell className="w-4 h-4 text-zinc-700" />
//             <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
//           </button>

//           {/* Profile Area (Avatar + Name) */}
//           <div 
//             onClick={() => navigate('/profile')}
//             className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl bg-orange-50/60 hover:bg-orange-100/80 transition-colors cursor-pointer border border-orange-200/70"
//             title="Profile Settings"
//           >
//             <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
//               <User className="w-4 h-4" />
//             </div>
            
//             {/* Renders candidate name only when valid authenticated name exists */}
//             {displayName && (
//               <span className="hidden sm:inline text-xs font-extrabold text-zinc-800 capitalize">
//                 {displayName}
//               </span>
//             )}
//           </div>

//           {/* Mobile Menu Toggle */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-orange-50 transition-colors"
//           >
//             {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//           </button>
//         </div>

//       </div>

//       {/* MOBILE COLLAPSIBLE NAVIGATION */}
//       {mobileMenuOpen && (
//         <div className="md:hidden border-t border-orange-100 bg-white px-4 pt-2 pb-4 space-y-1">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path || 
//               (item.path === '/discovery' && location.pathname === '/swipe-discovery');

//             return (
//               <button
//                 key={item.path}
//                 onClick={() => {
//                   navigate(item.path);
//                   setMobileMenuOpen(false);
//                 }}
//                 className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
//                   isActive
//                     ? 'bg-[#FFF0E5] text-orange-600'
//                     : 'text-zinc-600 hover:text-zinc-900 hover:bg-orange-50'
//                 }`}
//               >
//                 <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </header>
//   );
// };

// export default Navbar;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Sparkles, Building2, FileSpreadsheet, Bell, User, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Retrieve existing user session information from LocalStorage
  const userEmail = localStorage.getItem('swipex_user_email') || localStorage.getItem('user_email');
  const userName = localStorage.getItem('swipex_user_name') || localStorage.getItem('user_name');
  
  // Format fallback display name if fullName exists, otherwise leave empty
  const displayName = userName ? userName : (userEmail ? userEmail.split('@')[0] : null);

  // Central candidate navigation links
  const navItems = [
    { label: 'Discover', path: '/discovery', icon: Sparkles },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'ATS Dashboard', path: '/ats-ranker', icon: FileSpreadsheet },
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50 font-sans w-full shadow-md text-white">
      {/* Container with w-full, px-6, and justify-between pushes Left to far-left and Right to far-right */}
      <div className="w-full px-6 h-16 flex items-center justify-between relative">
        
        {/* EXTREME LEFT SECTION: SwipeX Branding */}
        <div className="flex items-center shrink-0">
          <div 
            onClick={() => navigate('/discovery')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Swipe<span className="text-orange-500">X</span>
            </span>
          </div>
        </div>

        {/* CENTER SECTION: Page Navigation (Desktop - Absolutely Centered) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Matches exact path or fallback route
            const isActive = location.pathname === item.path || 
              (item.path === '/discovery' && location.pathname === '/swipe-discovery');

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* EXTREME RIGHT SECTION: Notifications & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Button */}
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer relative border border-zinc-800"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-zinc-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-zinc-950" />
          </button>

          {/* Profile Area (Avatar + Name) */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
            title="Profile Settings"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <User className="w-4 h-4 text-white" />
            </div>
            
            {/* Renders candidate name only when valid authenticated name exists */}
            {displayName && (
              <span className="hidden sm:inline text-xs font-extrabold text-zinc-200 capitalize">
                {displayName}
              </span>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE COLLAPSIBLE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/discovery' && location.pathname === '/swipe-discovery');

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;