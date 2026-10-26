// import React from 'react';
// import { MapPin, Briefcase, IndianRupee, Sparkles, Building } from 'lucide-react';

// const JobCard = ({ job }) => {
//   return (
//     <div className="w-full max-w-sm h-[520px] bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between select-none relative overflow-hidden pointer-events-none">
//       {/* Top Banner Badges */}
//       <div className="flex flex-wrap gap-2 mb-3">
//         {job.fresher_friendly && (
//           <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
//             <Sparkles className="w-3 h-3" /> Fresher Friendly
//           </span>
//         )}
//         {job.low_competition && (
//           <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
//             🔥 Low Competition ({job.applicant_count || 0} applicants)
//           </span>
//         )}
//       </div>

//       {/* Main Details */}
//       <div>
//         <div className="flex items-center gap-4 mb-4">
//           {job.logo_url ? (
//             <img src={job.logo_url} alt={job.company_name} className="w-14 h-14 rounded-2xl object-cover border" />
//           ) : (
//             <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl border border-indigo-100">
//               <Building className="w-7 h-7" />
//             </div>
//           )}
//           <div>
//             <h3 className="font-bold text-xl text-gray-900 leading-tight">{job.title}</h3>
//             <p className="text-gray-500 font-medium text-sm">{job.company_name}</p>
//           </div>
//         </div>

//         {/* Info Grid */}
//         <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-medium text-gray-600">
//           <div className="flex items-center gap-1.5 bg-gray-50 p-2.5 rounded-xl">
//             <MapPin className="w-4 h-4 text-gray-400" />
//             <span className="truncate">{job.location || 'Remote'}</span>
//           </div>
//           <div className="flex items-center gap-1.5 bg-gray-50 p-2.5 rounded-xl">
//             <Briefcase className="w-4 h-4 text-gray-400" />
//             <span className="capitalize">{job.job_type || 'Full Time'}</span>
//           </div>
//           <div className="col-span-2 flex items-center gap-1.5 bg-indigo-50/50 text-indigo-900 p-2.5 rounded-xl font-semibold">
//             <IndianRupee className="w-4 h-4 text-indigo-600" />
//             <span>₹{job.salary_min} - ₹{job.salary_max} PA</span>
//           </div>
//         </div>

//         {/* Description */}
//         <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
//           {job.description}
//         </p>
//       </div>

//       {/* Required Skills Chips */}
//       <div className="mt-auto">
//         <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Skills</p>
//         <div className="flex flex-wrap gap-1.5">
//           {job.skills_required?.map((skill, idx) => (
//             <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium">
//               {skill}
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobCard;

// import React from 'react';
// import { MapPin, Briefcase, IndianRupee, Sparkles, Building, Flame, FileText } from 'lucide-react';

// const JobCard = ({ job }) => {
//   if (!job) return null;

//   return (
//     <div className="w-full max-w-md h-[580px] bg-zinc-950 text-white rounded-3xl shadow-2xl shadow-orange-950/30 border border-orange-500/30 p-7 flex flex-col justify-between select-none relative overflow-hidden transition-all duration-300">
      
//       {/* RADIANT ORANGE GLOW ACCENTS */}
//       <div className="absolute -top-24 -right-24 w-52 h-52 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

//       {/* TOP SECTION */}
//       <div className="relative z-10 space-y-4">
        
//         {/* Top Badges */}
//         <div className="flex flex-wrap gap-2">
//           {job.fresher_friendly && (
//             <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
//               <Sparkles className="w-3 h-3 text-emerald-400" /> Fresher Friendly
//             </span>
//           )}
//           {job.low_competition && (
//             <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
//               <Flame className="w-3 h-3 text-amber-400" /> Low Competition ({job.applicant_count || 0})
//             </span>
//           )}
//         </div>

//         {/* Company Logo, Title & Name */}
//         <div className="flex items-center gap-4">
//           {job.logo_url ? (
//             <img 
//               src={job.logo_url} 
//               alt={job.company_name} 
//               className="w-14 h-14 rounded-2xl object-cover border border-orange-500/30 shadow-md shrink-0 bg-zinc-900" 
//             />
//           ) : (
//             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20 border border-orange-400/40 shrink-0">
//               <Building className="w-7 h-7 text-white" />
//             </div>
//           )}
//           <div className="min-w-0">
//             <h3 className="font-black text-xl text-white tracking-tight leading-tight truncate">
//               {job.title}
//             </h3>
//             <p className="text-orange-400 font-bold text-xs truncate mt-1">
//               {job.company_name}
//             </p>
//           </div>
//         </div>

//         {/* Info Grid */}
//         <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-zinc-300">
//           <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/90 p-2.5 rounded-xl">
//             <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
//             <span className="truncate">{job.location || 'Remote'}</span>
//           </div>

//           <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/90 p-2.5 rounded-xl">
//             <Briefcase className="w-4 h-4 text-orange-400 shrink-0" />
//             <span className="capitalize truncate">{job.job_type || 'Full Time'}</span>
//           </div>

//           {/* Salary Package */}
//           <div className="col-span-2 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2.5 rounded-xl font-black shadow-md shadow-orange-500/20">
//             <IndianRupee className="w-4 h-4 text-white shrink-0" />
//             <span className="text-xs tracking-wide">
//               ₹{job.salary_min ? job.salary_min.toLocaleString() : 'N/A'} - ₹{job.salary_max ? job.salary_max.toLocaleString() : 'N/A'} PA
//             </span>
//           </div>
//         </div>

//         {/* ROLE DESCRIPTION SECTION */}
//         <div className="bg-zinc-900/80 border border-zinc-800/80 p-3.5 rounded-2xl">
//           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1.5">
//             <FileText className="w-3.5 h-3.5" />
//             <span>Role Overview & Description</span>
//           </div>
//           <p className="text-zinc-300 text-xs font-medium line-clamp-4 leading-relaxed">
//             {job.description || "No description provided for this job opening."}
//           </p>
//         </div>

//       </div>

//       {/* BOTTOM SECTION: Required Skills */}
//       <div className="relative z-10 pt-3 border-t border-zinc-800/90 mt-auto">
//         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
//           Required Skills
//         </p>
//         <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
//           {job.skills_required && job.skills_required.length > 0 ? (
//             job.skills_required.map((skill, idx) => (
//               <span 
//                 key={idx} 
//                 className="bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[11px] px-2.5 py-1 rounded-lg font-extrabold"
//               >
//                 {skill}
//               </span>
//             ))
//           ) : (
//             <span className="text-xs text-zinc-500 font-medium italic">No specific skills listed</span>
//           )}
//         </div>
//       </div>

//     </div>
//   );
// };

// export default JobCard;

// import React from 'react';
// import { MapPin, Briefcase, IndianRupee, Sparkles, Building, Flame, FileText } from 'lucide-react';

// const JobCard = ({ job }) => {
//   if (!job) return null;

//   // AI Match Score calculation
//   const matchScore = Math.round(job.semantic_match_score || job.matchScore || 90);

//   return (
//     <div className="w-full max-w-md h-[590px] bg-gradient-to-br from-orange-600 via-orange-950 to-zinc-950 text-white rounded-3xl shadow-2xl shadow-orange-950/50 border border-orange-400/40 p-7 flex flex-col justify-between select-none relative overflow-hidden transition-all duration-300">
      
//       {/* RADIANT ORANGE GLOW ACCENTS */}
//       <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/30 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

//       {/* TOP SECTION */}
//       <div className="relative z-10 space-y-4">
        
//         {/* Top Badges Row including AI Match Score */}
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex flex-wrap gap-2">
//             {job.fresher_friendly && (
//               <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider backdrop-blur-xs">
//                 <Sparkles className="w-3 h-3 text-emerald-400" /> Fresher
//               </span>
//             )}
//             {job.low_competition && (
//               <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider backdrop-blur-xs">
//                 <Flame className="w-3 h-3 text-amber-400" /> Low Comp ({job.applicant_count || 0})
//               </span>
//             )}
//           </div>

//           {/* AI MATCH SCORE BADGE */}
//           <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border border-orange-300/50 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black shadow-lg shadow-orange-500/30 shrink-0">
//             <Sparkles className="w-3.5 h-3.5 fill-white text-white" /> 
//             <span>{matchScore}% AI Match</span>
//           </div>
//         </div>

//         {/* Company Logo, Title & Name */}
//         <div className="flex items-center gap-4 pt-1">
//           {job.logo_url ? (
//             <img 
//               src={job.logo_url} 
//               alt={job.company_name} 
//               className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-400/50 shadow-md shrink-0 bg-zinc-900" 
//             />
//           ) : (
//             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/30 border border-orange-300/50 shrink-0">
//               <Building className="w-7 h-7 text-white" />
//             </div>
//           )}
//           <div className="min-w-0">
//             <h3 className="font-black text-xl text-white tracking-tight leading-tight truncate">
//               {job.title}
//             </h3>
//             <p className="text-orange-200 font-extrabold text-xs truncate mt-1">
//               {job.company_name}
//             </p>
//           </div>
//         </div>

//         {/* Info Grid */}
//         <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-zinc-100">
//           <div className="flex items-center gap-2 bg-zinc-950/60 border border-orange-400/20 backdrop-blur-xs p-2.5 rounded-xl">
//             <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
//             <span className="truncate">{job.location || 'Remote'}</span>
//           </div>

//           <div className="flex items-center gap-2 bg-zinc-950/60 border border-orange-400/20 backdrop-blur-xs p-2.5 rounded-xl">
//             <Briefcase className="w-4 h-4 text-orange-400 shrink-0" />
//             <span className="capitalize truncate">{job.job_type || 'Full Time'}</span>
//           </div>

//           {/* Salary Package */}
//           <div className="col-span-2 flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-2.5 rounded-xl font-black shadow-lg shadow-orange-950/40 border border-orange-300/30">
//             <IndianRupee className="w-4 h-4 text-white shrink-0" />
//             <span className="text-xs tracking-wide">
//               ₹{job.salary_min ? job.salary_min.toLocaleString() : 'N/A'} - ₹{job.salary_max ? job.salary_max.toLocaleString() : 'N/A'} PA
//             </span>
//           </div>
//         </div>

//         {/* ROLE DESCRIPTION SECTION */}
//         <div className="bg-zinc-950/70 border border-orange-400/30 p-3.5 rounded-2xl backdrop-blur-xs">
//           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-orange-300 mb-1.5">
//             <FileText className="w-3.5 h-3.5" />
//             <span>Role Overview & Description</span>
//           </div>
//           <p className="text-zinc-200 text-xs font-medium line-clamp-4 leading-relaxed">
//             {job.description || "No description specified for this position."}
//           </p>
//         </div>

//       </div>

//       {/* BOTTOM SECTION: Required Skills */}
//       <div className="relative z-10 pt-3 border-t border-orange-400/30 mt-auto">
//         <p className="text-[10px] font-black text-orange-200/80 uppercase tracking-widest mb-2">
//           Required Skills
//         </p>
//         <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden">
//           {job.skills_required && job.skills_required.length > 0 ? (
//             job.skills_required.map((skill, idx) => (
//               <span 
//                 key={idx} 
//                 className="bg-orange-500/20 border border-orange-300/40 text-white text-[11px] px-2.5 py-1 rounded-lg font-extrabold backdrop-blur-xs"
//               >
//                 {skill}
//               </span>
//             ))
//           ) : (
//             <span className="text-xs text-zinc-400 font-medium italic">No specific skills listed</span>
//           )}
//         </div>
//       </div>

//     </div>
//   );
// };

// export default JobCard;

import React from 'react';
import { MapPin, Briefcase, IndianRupee, Sparkles, Building, Flame, FileText } from 'lucide-react';

const JobCard = ({ job }) => {
  if (!job) return null;

  const matchScore = Math.round(job.semantic_match_score || job.matchScore || 90);

  return (
    <div className="w-full max-w-lg h-[510px] bg-gradient-to-br from-orange-500 via-orange-600/95 to-zinc-950/90 text-white rounded-3xl shadow-2xl shadow-orange-950/30 border border-orange-300/40 p-6 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-xl transition-all duration-300">
      
      {/* RADIANT GLASS GLOW ACCENTS */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-700/30 rounded-full blur-3xl pointer-events-none" />

      {/* TOP SECTION */}
      <div className="relative z-10 space-y-3">
        
        {/* Top Badges & AI Match */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {job.fresher_friendly && (
              <span className="bg-emerald-500/25 text-emerald-200 border border-emerald-300/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-emerald-300" /> Fresher
              </span>
            )}
            {job.low_competition && (
              <span className="bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider backdrop-blur-md">
                <Flame className="w-3 h-3 text-amber-300" /> Low Comp ({job.applicant_count || 0})
              </span>
            )}
          </div>

          {/* AI MATCH SCORE BADGE */}
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white border border-white/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black shadow-md shadow-orange-950/20 shrink-0">
            <Sparkles className="w-3.5 h-3.5 fill-white" /> 
            <span>{matchScore}% AI Match</span>
          </div>
        </div>

        {/* Company Logo, Title & Name */}
        <div className="flex items-center gap-4 pt-1">
          {job.logo_url ? (
            <img 
              src={job.logo_url} 
              alt={job.company_name} 
              className="w-13 h-13 rounded-2xl object-cover border-2 border-white/40 shadow-md shrink-0 bg-zinc-900" 
            />
          ) : (
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-lg border border-white/40 shrink-0">
              <Building className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-black text-xl text-white tracking-tight leading-tight truncate">
              {job.title}
            </h3>
            <p className="text-orange-100 font-extrabold text-xs truncate mt-0.5">
              {job.company_name}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-zinc-100">
          <div className="flex items-center gap-2 bg-black/25 border border-white/15 backdrop-blur-md p-2 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">{job.location || 'Remote'}</span>
          </div>

          <div className="flex items-center gap-2 bg-black/25 border border-white/15 backdrop-blur-md p-2 rounded-xl">
            <Briefcase className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="capitalize truncate">{job.job_type || 'Full Time'}</span>
          </div>

          {/* Salary Package */}
          <div className="col-span-2 flex items-center gap-2 bg-zinc-950/80 text-white p-2.5 rounded-xl font-black shadow-md border border-orange-400/30">
            <IndianRupee className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-xs tracking-wide">
              ₹{job.salary_min ? job.salary_min.toLocaleString() : 'N/A'} - ₹{job.salary_max ? job.salary_max.toLocaleString() : 'N/A'} PA
            </span>
          </div>
        </div>

        {/* ROLE DESCRIPTION SECTION */}
        <div className="bg-black/20 border border-white/15 p-3 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-200 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Role Overview & Description</span>
          </div>
          <p className="text-orange-50 text-xs font-medium line-clamp-2 leading-relaxed">
            {job.description || "No description specified for this position."}
          </p>
        </div>

      </div>

      {/* BOTTOM SECTION: Required Skills */}
      <div className="relative z-10 pt-2 border-t border-white/20 mt-auto">
        <p className="text-[10px] font-black text-orange-100/80 uppercase tracking-widest mb-1.5">
          Required Skills
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden">
          {job.skills_required && job.skills_required.length > 0 ? (
            job.skills_required.map((skill, idx) => (
              <span 
                key={idx} 
                className="bg-black/30 border border-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-lg font-extrabold backdrop-blur-md"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-orange-200/60 font-medium italic">No specific skills listed</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default JobCard;