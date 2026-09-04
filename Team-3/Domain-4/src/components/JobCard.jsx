import React, { useState, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Banknote, 
  Clock, 
  X, 
  Check 
} from 'lucide-react';
import Chip from './common/Chip';
import Button from './common/Button';

export default function JobCard({ 
  job, 
  onSwipe, 
  onDragProgress,
  isBackground = false,
  dragProgress = 0,
  disabled = false,
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
        className="surface-card space-y-6 select-none pointer-events-none absolute inset-0 shadow-lg"
      >
        <CardContent job={job} />
      </div>
    );
  }

  // Active top card pointer / gesture handlers (Strictly horizontal like Tinder)
  const handlePointerDown = (e) => {
    if (disabled || animatingOut) return;
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
  const rightOpacity = Math.min(Math.max((dragX - 15) / 70, 0), 1);
  const leftOpacity = Math.min(Math.max((-dragX - 15) / 70, 0), 1);

  // Strictly horizontal positioning: Y displacement is strictly locked to 0
  const cardStyle = animatingOut === 'left'
    ? {
        transform: 'translate3d(-150vw, 0, 0) rotate(-30deg)',
        opacity: 0,
        transition: 'transform 0.26s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.26s ease-out',
      }
    : animatingOut === 'right'
    ? {
        transform: 'translate3d(150vw, 0, 0) rotate(30deg)',
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
      className={`surface-card space-y-6 select-none touch-none relative cursor-grab active:cursor-grabbing shadow-xl z-10 transition-shadow overflow-hidden ${
        disabled ? 'pointer-events-none opacity-90' : ''
      }`}
    >
      {/* Right Drag Aura (Green Glow along Right Side) */}
      <div 
        style={{ opacity: rightOpacity }} 
        className="absolute inset-0 rounded-2xl bg-gradient-to-l from-emerald-500/25 via-emerald-500/5 to-transparent pointer-events-none border-2 border-emerald-500/60 z-20 transition-opacity duration-75" 
      />

      {/* Left Drag Aura (Red Glow along Left Side) */}
      <div 
        style={{ opacity: leftOpacity }} 
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/25 via-red-500/5 to-transparent pointer-events-none border-2 border-red-500/60 z-20 transition-opacity duration-75" 
      />

      {/* Tinder-Style Green "APPLY" Stamp (Top-Left) */}
      <div 
        style={{ opacity: rightOpacity }}
        className="absolute top-6 left-6 z-30 pointer-events-none -rotate-12 border-[3.5px] border-emerald-400 bg-emerald-950/80 text-emerald-400 px-3.5 py-1 rounded-xl font-black text-xl sm:text-2xl tracking-widest uppercase shadow-[0_0_25px_rgba(52,211,153,0.4)] backdrop-blur-sm transition-opacity duration-75 flex items-center gap-1.5"
      >
        <Check className="w-6 h-6 stroke-[3.5]" />
        <span>APPLY</span>
      </div>

      {/* Tinder-Style Red "PASS" Stamp (Top-Right) */}
      <div 
        style={{ opacity: leftOpacity }}
        className="absolute top-6 right-6 z-30 pointer-events-none rotate-12 border-[3.5px] border-red-500 bg-red-950/80 text-red-400 px-3.5 py-1 rounded-xl font-black text-xl sm:text-2xl tracking-widest uppercase shadow-[0_0_25px_rgba(239,68,68,0.4)] backdrop-blur-sm transition-opacity duration-75 flex items-center gap-1.5"
      >
        <X className="w-6 h-6 stroke-[3.5]" />
        <span>PASS</span>
      </div>

      <CardContent job={job} />

      {/* Accessible Action Buttons */}
      <div className="pt-4 border-t border-outline-variant flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="tonal"
          size="lg"
          disabled={disabled || Boolean(animatingOut)}
          onClick={(e) => {
            e.stopPropagation();
            triggerSwipe('left');
          }}
          icon={X}
          className="flex-1 min-h-[44px] text-red-300 hover:bg-red-950/40 hover:text-red-200 border border-red-900/30"
          aria-label={`Skip job: ${job.title} at ${job.company}`}
        >
          Skip
        </Button>

        <Button
          type="button"
          variant="filled"
          size="lg"
          disabled={disabled || Boolean(animatingOut)}
          onClick={(e) => {
            e.stopPropagation();
            triggerSwipe('right');
          }}
          icon={Check}
          className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-surface font-semibold"
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
    // The Job API stores annual salaries in Indian Rupees.
    const min = salaryRange.min ? `₹${Number(salaryRange.min).toLocaleString('en-IN')}` : null;
    const max = salaryRange.max ? `₹${Number(salaryRange.max).toLocaleString('en-IN')}` : null;
    if (min && max) return `${min} - ${max} per year`;
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

function CardContent({ job }) {
  const companyType = job.company_type || job.type || job.companyType || 'Company';
  const remoteStatus = job.remote === true ? 'Remote' : job.remote === false ? 'On-site' : (job.remote || 'On-site');
  const salary = formatSalary(job.salary_range || job.salaryRange, job.salary);
  const posted = job.posted_at || job.postedAt || 'Recently';
  const skills = formatSkills(job.skills);

  return (
    <>
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Chip variant="primary">{companyType}</Chip>
          <Chip>{remoteStatus}</Chip>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight break-words">
          {job.title}
        </h2>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-content-muted">
          <Building2 className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="font-medium text-content truncate">{job.company}</span>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 py-3 border-y border-outline-variant text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-content-muted min-w-0">
          <MapPin className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="truncate">{job.location || 'Remote / Flexible'}</span>
        </div>
        <div className="flex items-center gap-2 text-content-muted min-w-0">
          <Banknote className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="font-semibold text-emerald-400 truncate">{salary}</span>
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-content-muted">
            About the role
          </h3>
          <p className="text-sm text-content-muted leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-content-muted">
            Required skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <Chip key={index}>{skill}</Chip>
            ))}
          </div>
        </div>
      )}

      {/* Posted info */}
      <div className="flex items-center gap-1.5 text-xs text-content-subtle pt-1">
        <Clock className="w-3.5 h-3.5" />
        <span>{posted}</span>
      </div>
    </>
  );
}
