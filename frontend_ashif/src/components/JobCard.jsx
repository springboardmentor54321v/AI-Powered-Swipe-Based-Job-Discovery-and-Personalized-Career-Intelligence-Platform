import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  IndianRupee,
  Briefcase,
  Clock,
  Bookmark,
  Send,
  X,
  Building,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { JobBadge } from "./JobBadge";
import { MatchScore } from "./MatchScore";

// Defined threshold constants for deliberate, natural swipe feel
export const SWIPE_THRESHOLD = 120;
export const VELOCITY_THRESHOLD = 380;

export function JobCard({
  job,
  isFront = true,
  stackIndex = 0,
  onSwipeLeft,
  onSwipeRight,
  onApply,
  isSaved = false
}) {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const cardRef = useRef(null);

  // Motion values for smooth horizontal drag and derived transformations
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-SWIPE_THRESHOLD * 2, 0, SWIPE_THRESHOLD * 2], [-14, 0, 14]);

  // Derived indicator opacities and scales (visual updates handled purely by Motion Values)
  const skipOpacity = useTransform(x, [-20, -SWIPE_THRESHOLD], [0, 1]);
  const skipScale = useTransform(x, [-20, -SWIPE_THRESHOLD], [0.85, 1.05]);

  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const likeScale = useTransform(x, [20, SWIPE_THRESHOLD], [0.85, 1.05]);

  // Programmatic Left Swipe Trigger (Used by Drag & Buttons & Keyboard)
  const triggerSwipeLeft = async () => {
    if (isExiting || !job) return;
    setIsExiting(true);

    const targetX = -Math.max(window.innerWidth * 0.9, 550);
    await animate(x, targetX, {
      duration: 0.26,
      ease: [0.32, 0.72, 0, 1]
    });

    onSwipeLeft?.(job);
  };

  // Programmatic Right Swipe Trigger (Used by Drag & Buttons & Keyboard)
  const triggerSwipeRight = async () => {
    if (isExiting || !job) return;
    setIsExiting(true);

    const targetX = Math.max(window.innerWidth * 0.9, 550);
    await animate(x, targetX, {
      duration: 0.26,
      ease: [0.32, 0.72, 0, 1]
    });

    onSwipeRight?.(job);
  };

  // Drag End Decision Logic
  const handleDragEnd = async (_event, info) => {
    if (isExiting || !isFront) return;

    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    // Check if user crossed horizontal distance threshold or threw with high velocity
    const isLeftSwipe =
      offsetX < -SWIPE_THRESHOLD || (offsetX < -40 && velocityX < -VELOCITY_THRESHOLD);
    const isRightSwipe =
      offsetX > SWIPE_THRESHOLD || (offsetX > 40 && velocityX > VELOCITY_THRESHOLD);

    if (isLeftSwipe) {
      setIsExiting(true);
      const targetX = -Math.max(window.innerWidth * 0.9, 550);
      await animate(x, targetX, {
        duration: 0.22,
        ease: [0.32, 0.72, 0, 1]
      });
      onSwipeLeft?.(job);
    } else if (isRightSwipe) {
      setIsExiting(true);
      const targetX = Math.max(window.innerWidth * 0.9, 550);
      await animate(x, targetX, {
        duration: 0.22,
        ease: [0.32, 0.72, 0, 1]
      });
      onSwipeRight?.(job);
    } else {
      // Return smoothly to origin
      animate(x, 0, {
        type: "spring",
        stiffness: 450,
        damping: 28,
        mass: 0.8
      });
    }
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    navigate(`/jobs/${job.id}`);
  };

  // Stack background cards (Layer 2 & 3 preview cards)
  if (!isFront) {
    const scale = stackIndex === 1 ? 0.96 : 0.92;
    const translateY = stackIndex === 1 ? 12 : 24;
    const opacity = stackIndex === 1 ? 0.9 : 0.7;
    const zIndex = stackIndex === 1 ? 20 : 10;

    return (
      <motion.div
        layout
        initial={{ scale, y: translateY, opacity }}
        animate={{ scale, y: translateY, opacity }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{ zIndex }}
        className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 pointer-events-none select-none flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                {job.logo ? (
                  <img
                    src={job.logo}
                    alt={job.company}
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                ) : (
                  <Building className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base line-clamp-1">{job.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">{job.company}</p>
              </div>
            </div>
            <MatchScore score={job.matchPercentage} size="pill" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 truncate">
              {job.location}
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-800 truncate">
              {job.salary}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>{job.jobType}</span>
          <span>{job.experience}</span>
        </div>
      </motion.div>
    );
  }

  // Front Interactive Draggable Motion Card
  return (
    <motion.div
      ref={cardRef}
      style={{
        x,
        rotate,
        zIndex: 30,
        touchAction: "pan-y"
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      layout
      transition={{ type: "spring", stiffness: 450, damping: 28 }}
      className="relative w-full h-full bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden cursor-grab active:cursor-grabbing select-none flex flex-col justify-between"
      id={`job-card-${job.id}`}
      tabIndex={0}
      role="region"
      aria-label={`${job.title} at ${job.company}`}
    >
      {/* Subtle Visual Swipe Feedback Overlays */}
      {/* RIGHT SWIPE INDICATOR (INTERESTED / SAVE) */}
      <motion.div
        style={{ opacity: likeOpacity, scale: likeScale }}
        className="absolute top-6 right-6 z-20 pointer-events-none transform rotate-12 bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs md:text-sm tracking-wider uppercase border-2 border-white shadow-md flex items-center gap-1.5"
      >
        <Sparkles className="w-4 h-4 text-emerald-200" />
        <span>Interested</span>
      </motion.div>

      {/* LEFT SWIPE INDICATOR (SKIP) */}
      <motion.div
        style={{ opacity: skipOpacity, scale: skipScale }}
        className="absolute top-6 left-6 z-20 pointer-events-none transform -rotate-12 bg-rose-500 text-white px-4 py-1.5 rounded-xl font-bold text-xs md:text-sm tracking-wider uppercase border-2 border-white shadow-md flex items-center gap-1.5"
      >
        <X className="w-4 h-4 text-rose-200" />
        <span>Skip</span>
      </motion.div>

      {/* Card Content Container */}
      <div className="p-6 md:p-7 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
        {/* Top Section */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
                {job.logo ? (
                  <img
                    src={job.logo}
                    alt={job.company}
                    draggable={false}
                    className="w-full h-full object-cover rounded-xl select-none pointer-events-none"
                  />
                ) : (
                  <Building className="w-7 h-7 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    {job.company}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-xs font-medium text-slate-500">{job.companyType}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                  {job.title}
                </h2>
              </div>
            </div>

            <MatchScore score={job.matchPercentage} size="pill" />
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Location</p>
                <p className="text-xs font-bold text-slate-800 truncate">{job.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100">
              <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold text-emerald-600">Salary / CTC</p>
                <p className="text-xs font-extrabold text-emerald-800 truncate">{job.salary}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
              <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Experience</p>
                <p className="text-xs font-bold text-slate-800 truncate">{job.experience}</p>
              </div>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <JobBadge type="fulltime" text={job.jobType} size="sm" />
            {job.isRemote && <JobBadge type="remote" text="Remote Friendly" size="sm" />}
            {job.isFresher && <JobBadge type="fresher" text="Fresher Eligible" size="sm" />}
            {job.applicantCount && job.applicantCount < 20 && (
              <JobBadge
                type="low-competition"
                text={`Low Competition (${job.applicantCount} applicants)`}
                size="sm"
              />
            )}
          </div>

          {/* Job Description Summary */}
          <div className="mb-4">
            <p className="text-xs md:text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Required Tech & Competencies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/80"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 6 && (
                  <span className="px-2 py-1 text-slate-400 text-xs font-medium">
                    +{job.skills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Key Highlights */}
          {job.highlights && job.highlights.length > 0 && (
            <div className="space-y-1.5 py-2 border-t border-slate-100">
              {job.highlights.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="pt-3 pb-1 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDetailsClick}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group py-1"
          >
            <span>View Full Role & Company Details</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {job.postedAgo || "Recently posted"}
          </span>
        </div>
      </div>

      {/* Accessible Action Footer Buttons */}
      <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
        {/* Skip Button */}
        <button
          type="button"
          onClick={triggerSwipeLeft}
          id="btn-card-skip"
          aria-label="Skip this job"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl font-bold text-xs md:text-sm shadow-2xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        >
          <X className="w-4 h-4 text-rose-500" />
          <span>Skip</span>
        </button>

        {/* Interested / Save Button */}
        <button
          type="button"
          onClick={triggerSwipeRight}
          id="btn-card-save"
          aria-label="Save and mark interested in this job"
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs md:text-sm shadow-2xs transition-all active:scale-95 border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            isSaved
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200 hover:border-emerald-200"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isSaved ? "fill-emerald-600 text-emerald-600" : "text-emerald-600"}`}
          />
          <span>{isSaved ? "Saved" : "Interested"}</span>
        </button>

        {/* Quick Apply Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(job);
          }}
          id="btn-card-apply"
          aria-label="Apply now to this job"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-2xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <Send className="w-4 h-4" />
          <span>Apply Now</span>
        </button>
      </div>
    </motion.div>
  );
}

export default JobCard;
