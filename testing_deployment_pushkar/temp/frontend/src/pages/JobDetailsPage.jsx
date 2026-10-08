import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Send,
  BriefcaseBusiness,
  Globe2,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

import { jobService } from "../services/jobService";
import { useApp } from "../context/AppContext";

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    setApplyModalJob,
  } = useApp();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD JOB
  // =========================================================

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Loading job:", id);

        const response = await jobService.getJob(id);

        console.log("GET /jobs/:id response:", response);

        if (!response?.success || !response?.job) {
          throw new Error(
            response?.message || "Job not found"
          );
        }

        setJob(response.job);

      } catch (err) {
        console.error("Failed to load job:", err);

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "The requested job could not be found."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm font-semibold text-slate-600">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR / NOT FOUND
  // =========================================================

  if (error || !job) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Job Not Found
          </h1>

          <p className="text-sm text-slate-500 mb-6">
            {error ||
              "The requested job posting could not be found or has expired."}
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // NORMALIZE BACKEND DATA
  // =========================================================

  const skills =
    typeof job.skills === "string"
      ? job.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : Array.isArray(job.skills)
      ? job.skills
      : [];

  const salary = job.salary || "Not specified";

  const employmentType =
    job.employment_type || "Not specified";

  const experienceLevel =
    job.experience_level || "Not specified";

  const workMode =
    job.work_mode || "Not specified";

  const qualifications =
    job.qualifications || "Not specified";

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!job?.id || saving) return;

    try {
      setSaving(true);

      if (isSaved) {
        await jobService.unsaveJob(job.id);
        setIsSaved(false);
      } else {
        await jobService.saveJob(job.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to update saved job:", err);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // APPLY
  // =========================================================

  const handleApply = () => {
    if (!job) return;

    if (setApplyModalJob) {
      setApplyModalJob(job);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="p-6 sm:p-8">

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

            {/* Company + title */}

            <div className="flex items-start gap-4">

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-1">
                  {job.company}
                </p>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4" />
                    {employmentType}
                  </span>

                </div>
              </div>
            </div>

            {/* Actions */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`
                  inline-flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  border
                  transition-all
                  ${
                    isSaved
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={isSaved ? "currentColor" : "none"}
                />

                {saving
                  ? "Saving..."
                  : isSaved
                  ? "Saved"
                  : "Save"}
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                Apply
              </button>

            </div>
          </div>

          {/* =================================================
              JOB META
          ================================================= */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">

            <MetaCard
              icon={IndianRupee}
              label="Salary / CTC"
              value={salary}
            />

            <MetaCard
              icon={BriefcaseBusiness}
              label="Experience"
              value={experienceLevel}
            />

            <MetaCard
              icon={Globe2}
              label="Work Mode"
              value={workMode}
            />

            <MetaCard
              icon={CalendarDays}
              label="Deadline"
              value={job.deadline || "Not specified"}
            />

          </div>

        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="border-t border-slate-100 p-6 sm:p-8">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

            {/* LEFT */}

            <div>

              {/* Description */}

              <section className="mb-8">

                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Job Description
                </h2>

                <div className="text-sm sm:text-base leading-7 text-slate-600 whitespace-pre-line">
                  {job.description}
                </div>

              </section>

              {/* Qualifications */}

              <section className="mb-8">

                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Qualifications
                </h2>

                <div className="text-sm sm:text-base leading-7 text-slate-600 whitespace-pre-line">
                  {qualifications}
                </div>

              </section>

              {/* Skills */}

              <section>

                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Required Skills
                </h2>

                <div className="flex flex-wrap gap-2">

                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      No skills specified
                    </span>
                  )}

                </div>

              </section>

            </div>

            {/* RIGHT */}

            <aside>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sticky top-24">

                <h3 className="font-bold text-slate-900 mb-4">
                  Job Summary
                </h3>

                <div className="space-y-4 text-sm">

                  <SummaryRow
                    icon={BriefcaseBusiness}
                    label="Employment"
                    value={employmentType}
                  />

                  <SummaryRow
                    icon={GraduationCap}
                    label="Experience"
                    value={experienceLevel}
                  />

                  <SummaryRow
                    icon={Globe2}
                    label="Work Mode"
                    value={workMode}
                  />

                  <SummaryRow
                    icon={MapPin}
                    label="Location"
                    value={job.location}
                  />

                  <SummaryRow
                    icon={IndianRupee}
                    label="Salary"
                    value={salary}
                  />

                </div>

                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Apply for this job
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </aside>

          </div>

        </div>

      </div>
    </div>
  );
}

// ===========================================================
// META CARD
// ===========================================================

function MetaCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">

      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon className="w-4 h-4" />

        <span className="text-[11px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-bold text-slate-900 break-words">
        {value}
      </p>

    </div>
  );
}

// ===========================================================
// SUMMARY ROW
// ===========================================================

function SummaryRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">
          {label}
        </p>

        <p className="font-semibold text-slate-800 break-words">
          {value}
        </p>
      </div>

    </div>
  );
}

export default JobDetailsPage;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import {
//   ArrowLeft,
//   Building,
//   MapPin,
//   IndianRupee,
//   Briefcase,
//   Clock,
//   Users,
//   TrendingDown,
//   CheckCircle2,
//   Bookmark,
//   Send,
//   Sparkles,
//   Award,
//   Gift,
//   ShieldCheck,
//   Share2
// } from "lucide-react";
// import { INITIAL_JOBS } from "../utils/mockData";
// import { useApp } from "../context/AppContext";
// import { JobBadge } from "../components/JobBadge";
// import { MatchScore } from "../components/MatchScore";

// export function JobDetailsPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const {
//     isJobSaved,
//     toggleSaveJob,
//     setApplyModalJob,
//     applications,
//     addToast
//   } = useApp();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const found = INITIAL_JOBS.find((j) => j.id === id);
//     if (found) {
//       setJob(found);
//     }
//     setLoading(false);
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 py-12 text-center">
//         <p className="text-slate-500">Loading job details...</p>
//       </div>
//     );
//   }

//   if (!job) {
//     return (
//       <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
//         <h2 className="text-xl font-bold text-slate-900">Job Not Found</h2>
//         <p className="text-sm text-slate-500">
//           The requested job posting could not be found or has expired.
//         </p>
//         <Link
//           to="/"
//           className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           <span>Back to Jobs</span>
//         </Link>
//       </div>
//     );
//   }

//   const isSaved = isJobSaved(job.id);
//   const isApplied = applications.some((a) => a.jobId === job.id);

//   const handleShare = () => {
//     navigator.clipboard?.writeText(window.location.href);
//     addToast("Job link copied to clipboard", "success");
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
//       {/* Top back navigation and share */}
//       <div className="flex items-center justify-between mb-6">
//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
//         >
//           <ArrowLeft className="w-4 h-4 text-slate-400" />
//           <span>Back</span>
//         </button>

//         <button
//           type="button"
//           onClick={handleShare}
//           className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
//           title="Share job"
//         >
//           <Share2 className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Main Job Hero Header Card */}
//       <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
//         <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
//           <div className="flex items-start gap-4">
//             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
//               {job.logo ? (
//                 <img
//                   src={job.logo}
//                   alt={job.company}
//                   className="w-full h-full object-cover rounded-xl"
//                 />
//               ) : (
//                 <Building className="w-8 h-8 text-slate-400" />
//               )}
//             </div>

//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
//                   {job.company}
//                 </span>
//                 <span className="w-1 h-1 rounded-full bg-slate-300" />
//                 <span className="text-xs font-semibold text-slate-500">{job.companyType}</span>
//               </div>
//               <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
//                 {job.title}
//               </h1>

//               <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600 font-medium">
//                 <span className="flex items-center gap-1.5">
//                   <MapPin className="w-4 h-4 text-slate-400" />
//                   {job.location}
//                 </span>
//                 <span className="flex items-center gap-1.5 font-bold text-emerald-700">
//                   <IndianRupee className="w-4 h-4" />
//                   <span>{job.salary}</span>
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                   <Briefcase className="w-4 h-4 text-slate-400" />
//                   {job.experience}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
//             <MatchScore score={job.matchPercentage} size="pill" />
//             <div className="flex items-center gap-2 text-xs text-slate-400">
//               <Clock className="w-3.5 h-3.5" />
//               <span>Posted {job.postedTime}</span>
//               <span>•</span>
//               <Users className="w-3.5 h-3.5" />
//               <span>{job.applicants} applicants</span>
//             </div>
//           </div>
//         </div>

//         {/* Badges */}
//         <div className="flex flex-wrap items-center gap-1.5 mt-6 pt-6 border-t border-slate-100">
//           <JobBadge type="fulltime" text={job.jobType} />
//           {job.isFresherFriendly && <JobBadge type="fresher" text="Fresher Friendly" />}
//           {job.isRemote && <JobBadge type="remote" text="Remote Available" />}
//           {job.isInternship && <JobBadge type="internship" text="Internship Program" />}
//           {job.isNewlyFounded && <JobBadge type="newly-founded" text="High-Growth Startup" />}
//           <JobBadge
//             type="low-competition"
//             text={`${job.competition} Competition`}
//             icon={TrendingDown}
//           />
//         </div>

//         {/* Primary Call to Actions */}
//         <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
//           <button
//             type="button"
//             onClick={() => setApplyModalJob(job)}
//             disabled={isApplied}
//             id="btn-job-details-apply"
//             className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-sm shadow-xs active:scale-98 transition-all"
//           >
//             <Send className="w-4 h-4" />
//             <span>{isApplied ? "Application Submitted" : "Apply for this Job"}</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => toggleSaveJob(job)}
//             id="btn-job-details-save"
//             className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm border active:scale-98 transition-all ${
//               isSaved
//                 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                 : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
//             }`}
//           >
//             <Bookmark
//               className={`w-4 h-4 ${isSaved ? "fill-emerald-600 text-emerald-600" : "text-slate-400"}`}
//             />
//             <span>{isSaved ? "Saved in Jobs" : "Save Job"}</span>
//           </button>
//         </div>
//       </div>

//       {/* Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Details (2 cols) */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* About the Role */}
//           <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3">
//             <h2 className="text-lg font-bold text-slate-900">Job Overview</h2>
//             <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
//           </div>

//           {/* Key Responsibilities */}
//           {job.responsibilities && job.responsibilities.length > 0 && (
//             <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
//               <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
//               <ul className="space-y-2.5">
//                 {job.responsibilities.map((resp, idx) => (
//                   <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
//                     <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
//                     <span>{resp}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Required Skills */}
//           {job.requiredSkills && (
//             <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
//               <h2 className="text-lg font-bold text-slate-900">Required Skills & Tech Stack</h2>
//               <div className="flex flex-wrap gap-2">
//                 {job.requiredSkills.map((sk) => (
//                   <span
//                     key={sk}
//                     className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold"
//                   >
//                     {sk}
//                   </span>
//                 ))}
//               </div>

//               {job.preferredSkills && (
//                 <div className="pt-3 border-t border-slate-100">
//                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
//                     Nice to Have
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {job.preferredSkills.map((sk) => (
//                       <span
//                         key={sk}
//                         className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium"
//                       >
//                         {sk}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Benefits & Perks */}
//           {job.benefits && (
//             <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
//               <div className="flex items-center gap-2">
//                 <Gift className="w-5 h-5 text-emerald-600" />
//                 <h2 className="text-lg font-bold text-slate-900">Benefits & Perks</h2>
//               </div>
//               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {job.benefits.map((benefit, idx) => (
//                   <li
//                     key={idx}
//                     className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2"
//                   >
//                     <Award className="w-4 h-4 text-emerald-600 shrink-0" />
//                     <span>{benefit}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Sidebar Info & Match Insights (1 col) */}
//         <div className="space-y-6">
//           {/* Match Insight Card */}
//           <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4 border border-slate-800">
//             <div className="flex items-center justify-between">
//               <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
//                 Match Analysis
//               </span>
//               <span className="text-sm font-bold text-emerald-400">
//                 {job.matchPercentage}% Compatibility
//               </span>
//             </div>
//             <p className="text-xs text-slate-300 leading-relaxed">
//               Your profile skills match closely with <strong>{job.skills.slice(0, 3).join(", ")}</strong>.
//             </p>
//             <Link
//               to="/resume-analysis"
//               className="inline-flex items-center justify-center w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
//             >
//               Analyze Resume for this Role
//             </Link>
//           </div>

//           {/* Company Snapshot */}
//           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
//             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
//               Company Snapshot
//             </h3>
//             <div className="space-y-3 text-xs text-slate-600">
//               <div className="flex justify-between py-1 border-b border-slate-100">
//                 <span className="text-slate-400">Company</span>
//                 <span className="font-semibold text-slate-800">{job.company}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-slate-100">
//                 <span className="text-slate-400">Type</span>
//                 <span className="font-semibold text-slate-800">{job.companyType}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-slate-100">
//                 <span className="text-slate-400">Location</span>
//                 <span className="font-semibold text-slate-800">{job.location}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-slate-100">
//                 <span className="text-slate-400">Competition</span>
//                 <span className="font-semibold text-emerald-700">{job.competition}</span>
//               </div>
//             </div>

//             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
//               <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
//               <span>Verified Employer on SwipeX</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default JobDetailsPage;
