import React, { useState, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Banknote, 
  Clock, 
  X, 
  Check, 
  Users, 
  Briefcase, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';
import Chip from './common/Chip';
import Button from './common/Button';

export default function JobCard({ 
  job, 
  onSwipe, 
  onUndo,
  canUndo = false,
  onDragProgress,
  isBackground = false,
  dragProgress = 0,
  disabled = false,
  isRecommendation = false,
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(null); // 'left' | 'right' | null
  const startXRef = useRef(0);

  if (!job) return null;

  // Background stacked card styling with real-time scale/elevation
  if (isBackground) {
    const absProgress = Math.min(Math.abs(dragProgress), 1);
    const scale = 0.95 + absProgress * 0.05;
    const translateY = 12 - absProgress * 12;
    const opacity = 0.8 + absProgress * 0.2;

    return (
      <div 
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'transform 0.18s ease-out, opacity 0.18s ease-out',
        }}
        className="surface-card p-5 sm:p-6 space-y-5 select-none pointer-events-none absolute inset-0 shadow-lg border border-white/[0.08] rounded-3xl bg-[#12131a]"
      >
        <CardContent job={job} isRecommendation={isRecommendation} />
      </div>
    );
  }

  // Active top card pointer / gesture handlers (Strictly horizontal)
  const handlePointerDown = (e) => {
    if (disabled || animatingOut) return;
    // Don't trigger drag if clicking an anchor or button
    if (e.target.closest('a') || e.target.closest('button')) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    setIsDragging(true);
    startXRef.current = e.clientX;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging || disabled) return;
    const deltaX = e.clientX - startXRef.current;
    setDragX(deltaX);
    if (onDragProgress) {
      onDragProgress(deltaX / 90);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const threshold = 90;
    if (dragX > threshold) {
      triggerSwipe('right');
    } else if (dragX < -threshold) {
      triggerSwipe('left');
    } else {
      setDragX(0);
      if (onDragProgress) onDragProgress(0);
    }
  };

  const triggerSwipe = (direction) => {
    if (disabled || animatingOut) return;
    setAnimatingOut(direction);
    if (onDragProgress) onDragProgress(direction === 'right' ? 1 : -1);

    setTimeout(() => {
      if (onSwipe) onSwipe(direction, job);
      setDragX(0);
      setAnimatingOut(null);
      if (onDragProgress) onDragProgress(0);
    }, 260);
  };

  // Natural tilt angle based strictly on horizontal movement
  const rotation = (dragX / 16) * 1.1;

  // Real-time Tinder stamp opacities
  const rightOpacity = Math.min(Math.max((dragX - 15) / 60, 0), 1);
  const leftOpacity = Math.min(Math.max((-dragX - 15) / 60, 0), 1);

  const cardStyle = animatingOut === 'left'
    ? {
        transform: 'translate3d(-150vw, 0, 0) rotate(-28deg)',
        opacity: 0,
        transition: 'transform 0.26s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.26s ease-out',
      }
    : animatingOut === 'right'
    ? {
        transform: 'translate3d(150vw, 0, 0) rotate(28deg)',
        opacity: 0,
        transition: 'transform 0.26s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.26s ease-out',
      }
    : isDragging
    ? {
        transform: `translate3d(${dragX}px, 0, 0) rotate(${rotation}deg)`,
        cursor: 'grabbing',
      }
    : {
        transform: 'translate3d(0, 0, 0) rotate(0deg)',
        transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.15)',
      };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={cardStyle}
      className={`surface-card p-5 sm:p-6 space-y-5 select-none touch-pan-y relative cursor-grab active:cursor-grabbing shadow-2xl z-10 transition-shadow border border-white/[0.12] rounded-3xl bg-[#12131a] overflow-hidden ${
        disabled ? 'pointer-events-none opacity-90' : ''
      }`}
    >
      {/* Right Drag Aura (Green Glow along Right Side) */}
      <div 
        style={{ opacity: rightOpacity }} 
        className="absolute inset-0 rounded-3xl bg-gradient-to-l from-emerald-500/25 via-emerald-500/5 to-transparent pointer-events-none border-2 border-emerald-500/60 z-20 transition-opacity duration-75" 
      />

      {/* Left Drag Aura (Red Glow along Left Side) */}
      <div 
        style={{ opacity: leftOpacity }} 
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/25 via-red-500/5 to-transparent pointer-events-none border-2 border-red-500/60 z-20 transition-opacity duration-75" 
      />

      {/* Tinder-Style Green "APPLY" Stamp (Top-Left) */}
      <div 
        style={{ opacity: rightOpacity }}
        className="absolute top-6 left-6 z-30 pointer-events-none -rotate-12 border-[3.5px] border-emerald-400 bg-emerald-950/90 text-emerald-400 px-3.5 py-1 rounded-xl font-black text-xl sm:text-2xl tracking-widest uppercase shadow-[0_0_25px_rgba(52,211,153,0.5)] backdrop-blur-sm transition-opacity duration-75 flex items-center gap-1.5"
      >
        <Check className="w-6 h-6 stroke-[3.5]" />
        <span>APPLY</span>
      </div>

      {/* Tinder-Style Red "PASS" Stamp (Top-Right) */}
      <div 
        style={{ opacity: leftOpacity }}
        className="absolute top-6 right-6 z-30 pointer-events-none rotate-12 border-[3.5px] border-red-500 bg-red-950/90 text-red-400 px-3.5 py-1 rounded-xl font-black text-xl sm:text-2xl tracking-widest uppercase shadow-[0_0_25px_rgba(239,68,68,0.5)] backdrop-blur-sm transition-opacity duration-75 flex items-center gap-1.5"
      >
        <X className="w-6 h-6 stroke-[3.5]" />
        <span>PASS</span>
      </div>

      <CardContent job={job} isRecommendation={isRecommendation} />

      {/* Accessible Action Buttons Bar (Skip, Undo, Apply) */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2.5">
        <Button
          type="button"
          variant="tonal"
          size="md"
          disabled={disabled || Boolean(animatingOut)}
          onClick={(e) => {
            e.stopPropagation();
            triggerSwipe('left');
          }}
          icon={X}
          className="flex-1 min-h-[46px] text-red-300 hover:bg-red-950/50 hover:text-red-200 border border-red-900/40 rounded-2xl"
          aria-label={`Skip job: ${job.title} at ${job.company}`}
        >
          Skip
        </Button>

        {canUndo && (
          <Button
            type="button"
            variant="tonal"
            size="md"
            disabled={disabled || Boolean(animatingOut)}
            onClick={(e) => {
              e.stopPropagation();
              if (onUndo) onUndo();
            }}
            icon={RotateCcw}
            className="px-4 min-h-[46px] text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 border border-amber-800/40 rounded-2xl"
            title="Undo last swipe"
            aria-label="Undo last swipe"
          >
            Undo
          </Button>
        )}

        <Button
          type="button"
          variant="filled"
          size="md"
          disabled={disabled || Boolean(animatingOut)}
          onClick={(e) => {
            e.stopPropagation();
            triggerSwipe('right');
          }}
          icon={Check}
          className="flex-1 min-h-[46px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-950/40"
          aria-label={`Apply or save job: ${job.title} at ${job.company}`}
        >
          Apply / Save
        </Button>
      </div>
    </div>
  );
}

function formatSalary(salaryRange, rawSalary) {
  if (salaryRange && typeof salaryRange === 'object') {
    const min = salaryRange.min ? (salaryRange.min >= 100000 ? `₹${(salaryRange.min / 100000).toFixed(0)}L` : `$${salaryRange.min.toLocaleString()}`) : null;
    const max = salaryRange.max ? (salaryRange.max >= 100000 ? `₹${(salaryRange.max / 100000).toFixed(0)} LPA` : `$${salaryRange.max.toLocaleString()}`) : null;
    if (min && max) return `${min} - ${max}`;
    if (min) return `From ${min}`;
    if (max) return `Up to ${max}`;
  }
  if (typeof salaryRange === 'string' && salaryRange.trim()) {
    return salaryRange;
  }
  if (typeof rawSalary === 'string' && rawSalary.trim()) {
    return rawSalary;
  }
  return 'Competitive';
}

function formatSkills(rawSkills) {
  if (Array.isArray(rawSkills)) {
    return rawSkills.filter(Boolean);
  }
  if (typeof rawSkills === 'string' && rawSkills.trim()) {
    if (rawSkills.includes('|')) {
      return rawSkills.split('|').map((s) => s.trim()).filter(Boolean);
    }
    return rawSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function CardContent({ job, isRecommendation = false }) {
  const companyType = job.company_type || job.type || 'Company';
  const remoteStatus = job.workplace_mode || (job.remote === true ? 'Remote' : job.remote === false ? 'On-site' : (job.remote || 'Hybrid'));
  const salary = formatSalary(job.salary_range || job.salaryRange, job.salary);
  const posted = job.posted_at || job.postedAt || 'Recently';
  const freshness = job.freshness || (posted.includes('hour') ? 'Fresh' : 'Recent');
  const skills = formatSkills(job.skills);
  const companyId = job.company_id || job.company?.toLowerCase().replace(/\s+/g, '-') || 1;
  const experience = job.experience_level || job.experience || 'All Experience Levels';
  const applicantCount = job.applicant_count !== undefined ? job.applicant_count : (job.applicants || 14);
  const competitionLevel = job.competition_level || (applicantCount < 20 ? 'Low' : applicantCount < 50 ? 'Medium' : 'High');
  const rawScore = job.match_percentage ?? job.match_score;
  const matchScore = typeof rawScore === 'number' ? Math.round(rawScore > 1 ? rawScore : rawScore * 100) : null;
  const hasMatchInfo = matchScore !== null || job.ats_score != null || job.semantic_similarity != null || (isRecommendation && Boolean(job.match_type));
  const reasonTags = Array.isArray(job.reason_tags) ? job.reason_tags : [];

  return (
    <div className="space-y-4">
      
      {/* Top Header Badge Strip */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
            companyType.toLowerCase() === 'newly founded'
              ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
              : companyType.toLowerCase() === 'startup'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
          }`}>
            {companyType}
          </span>
          <Chip>{remoteStatus}</Chip>
          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-white/[0.04] text-content-muted border border-white/[0.08]">
            {experience}
          </span>
        </div>

        {/* AI Match Metadata Badge (Secondary indicator, pointer-events-none to protect swipe capture) */}
        {hasMatchInfo && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-surface-elevated text-primary border border-primary/30 text-xs font-semibold pointer-events-none select-none">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              {matchScore !== null ? `${matchScore}% Match` : (job.match_type ? `${job.match_type.charAt(0).toUpperCase() + job.match_type.slice(1)} Match` : 'Recommended')}
              {job.match_type && matchScore !== null ? ` • ${job.match_type}` : ''}
              {job.ats_score != null && matchScore === null ? ` • ATS: ${job.ats_score}%` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Title & Clickable Company Link */}
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight break-words leading-snug">
          {job.title}
        </h2>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-content-muted">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-content">{job.company}</span>
          {job.industry && (
            <>
              <span className="text-content-subtle">•</span>
              <span className="text-content-subtle truncate">{job.industry}</span>
            </>
          )}
        </div>
      </div>

      {/* Recommendation Reason Tags Strip */}
      {reasonTags.length > 0 && (
        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
            <Sparkles className="w-3 h-3" />
            <span>AI Match Insights</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reasonTags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-content font-medium border border-white/[0.08]">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meta Grid (Location, Salary, Competition, Freshness) */}
      <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-white/[0.08] text-xs">
        <div className="flex items-center gap-2 text-content-muted min-w-0">
          <MapPin className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="truncate">{job.location || 'Remote / Flexible'}</span>
        </div>
        <div className="flex items-center gap-2 text-content-muted min-w-0">
          <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-emerald-400 truncate">{salary}</span>
        </div>
        <div className="flex items-center gap-2 text-content-muted min-w-0">
          <Users className="w-4 h-4 text-content-subtle shrink-0" />
          <div className="flex items-center gap-1.5 truncate">
            <span>{applicantCount} applicants</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              competitionLevel.toLowerCase() === 'low'
                ? 'text-emerald-400 bg-emerald-950/60'
                : competitionLevel.toLowerCase() === 'medium'
                ? 'text-amber-400 bg-amber-950/60'
                : 'text-rose-400 bg-rose-950/60'
            }`}>
              {competitionLevel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-content-muted min-w-0">
          <Clock className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="truncate">{posted}</span>
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-content-subtle uppercase tracking-wider">
            About the role
          </h3>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>
      )}

      {/* Skills Tags */}
      {skills.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-content-subtle uppercase tracking-wider">
            Required Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <Chip key={index}>{skill}</Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
