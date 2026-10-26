// import React from 'react';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import SwipeDeck from '../components/SwipeDeck';
// import { Sparkles, SlidersHorizontal } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function SwipeDiscovery() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
//       {/* Top Navbar */}
//       <Navbar />

//       <div className="flex flex-1">
//         {/* Left Sidebar */}
//         <Sidebar />

//         {/* Main Feed Content Area */}
//         <main className="flex-1 p-8 max-w-5xl flex flex-col items-center justify-between">
//           {/* Section Header */}
//           <div className="w-full max-w-md flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
//                 AI Career Match <Sparkles className="w-5 h-5 text-purple-600 fill-purple-600" />
//               </h1>
//               <p className="text-xs text-slate-500 font-medium">Swipe right to apply or left to skip</p>
//             </div>

//             {/* Quick Filter Navigation Button */}
//             <button 
//               onClick={() => navigate('/job-search')}
//               className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
//               title="Advanced Search & Filters"
//             >
//               <SlidersHorizontal className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Central Interactive Swipe Deck Container */}
//           <div className="w-full my-auto flex justify-center py-4">
//             <SwipeDeck />
//           </div>

//           {/* Helper Instructions Footer */}
//           <div className="w-full max-w-md text-center mt-4">
//             <p className="text-xs text-slate-400 font-medium">
//               Swipe <span className="text-purple-600 font-semibold">Right</span> to Apply • Swipe <span className="text-rose-500 font-semibold">Left</span> to Skip • <span className="text-amber-500 font-semibold">Up</span> to Save
//             </p>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SwipeDeck from '../components/SwipeDeck';
import { Sparkles, Search, ChevronDown, RotateCcw, X, Bookmark, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SwipeDiscovery() {
  const navigate = useNavigate();
  const [searchCategory, setSearchCategory] = useState('All Jobs');

  return (
    <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Shared Candidate Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Left Shared Candidate Sidebar */}
        <Sidebar />

        {/* Main Central Content Feed */}
        <main className="flex-1 p-6 md:p-8 flex flex-col items-center justify-between mx-auto w-full max-w-4xl">
          
          {/* SECTION HEADER & QUICK ACTIONS */}
          <div className="w-full max-w-md flex flex-col items-center text-center space-y-4 mb-2">
            
            {/* Main Centered Heading */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200/80 rounded-full text-orange-600 text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>AI Career Discovery</span>
              </div>
              <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center justify-center gap-2">
                Find Your <span className="text-orange-600 underline decoration-orange-300 underline-offset-4">Next Role</span>
              </h1>
              {/* <p className="text-xs text-zinc-500 font-bold mt-1">
                Swipe right to apply, left to skip, or up to save for later
              </p> */}
            </div>

            {/* CONTROL ROW: Undo Action (Left) + Search Dropdown (Center/Right) */}
            <div className="w-full flex items-center justify-between gap-3 pt-1">
              
              {/* Quick Undo Shortcut Trigger */}
              <button
                onClick={() => {
                  // Triggers undo if available inside window or deck state
                  const undoBtn = document.querySelector('[title*="Undo"]');
                  if (undoBtn) undoBtn.click();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-orange-200/80 rounded-2xl shadow-xs text-zinc-700 hover:text-orange-600 hover:bg-orange-50 transition-all text-xs font-bold cursor-pointer shrink-0"
                title="Undo Last Action"
              >
                <RotateCcw className="w-4 h-4 text-orange-500" />
                <span>Undo</span>
              </button>

              {/* Search Jobs Category Dropdown Bar */}
              <div className="relative flex-1 max-w-xs">
                <div 
                  onClick={() => navigate('/job-search')}
                  className="w-full bg-white border border-orange-200/80 rounded-2xl px-3.5 py-2 flex items-center justify-between cursor-pointer shadow-xs hover:border-orange-300 transition-all text-xs font-bold text-zinc-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Search className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="truncate">{searchCategory}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>
              </div>

            </div>

          </div>

          {/* CENTRAL INTERACTIVE SWIPE DECK CONTAINER */}
          <div className="w-full my-auto flex justify-center py-2">
            <SwipeDeck />
          </div>

          {/* HELPER INSTRUCTIONS FOOTER */}
          <div className="w-full max-w-md text-center mt-3">
            <div className="inline-flex items-center justify-center gap-4 px-4 py-2 bg-white/90 border border-orange-200/80 rounded-2xl shadow-xs text-xs font-bold text-zinc-600 backdrop-blur-xs">
              <span className="flex items-center gap-1 text-rose-500">
                <X className="w-3.5 h-3.5" /> Left (Skip)
              </span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1 text-amber-500">
                <Bookmark className="w-3.5 h-3.5" /> Up (Save)
              </span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Heart className="w-3.5 h-3.5 fill-emerald-600" /> Right (Apply)
              </span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

