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
  isBackground = false,
  dragProgress = 0,
  disabled = false,
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(null); // 'left' | 'right' | null
  const startPosRef = useRef({ x: 0, y: 0 });

  if (!job) return null;

  // Background stacked card styling
  if (isBackground) {
    const scale = 0.96 + Math.min(Math.abs(dragProgress) * 0.04, 0.04);
    const translateY = 10 - Math.min(Math.abs(dragProgress) * 10, 10);
    const opacity = 0.85 + Math.min(Math.abs(dragProgress) * 0.15, 0.15);

    return (
      <div 
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'transform 0.22s ease-out, opacity 0.22s ease-out',
        }}
        className="surface-card space-y-6 select-none pointer-events-none absolute inset-0 shadow-lg"
      >
        <CardContent job={job} />
      </div>
    );
  }

  // Active top card pointer / gesture handlers
  const handlePointerDown = (e) => {
    if (disabled || animatingOut) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || disabled) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80;
    if (dragOffset.x > threshold) {
      triggerSwipe('right');
    } else if (dragOffset.x < -threshold) {
      triggerSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (direction) => {
    if (disabled || animatingOut) return;
    setAnimatingOut(direction);
    setTimeout(() => {
      if (onSwipe) onSwipe(direction, job);
      setDragOffset({ x: 0, y: 0 });
      setAnimatingOut(null);
    }, 220);
  };

  const rotation = dragOffset.x * 0.06;
  const swipeDirection = dragOffset.x > 30 ? 'right' : dragOffset.x < -30 ? 'left' : null;

  const cardStyle = animatingOut === 'left'
    ? { transform: 'translate3d(-140%, 0, 0) rotate(-20deg)', opacity: 0, transition: 'all 0.22s ease-out' }
    : animatingOut === 'right'
    ? { transform: 'translate3d(140%, 0, 0) rotate(20deg)', opacity: 0, transition: 'all 0.22s ease-out' }
    : isDragging
    ? { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.25}px, 0) rotate(${rotation}deg)`, cursor: 'grabbing' }
    : { transform: 'translate3d(0, 0, 0)', transition: 'transform 0.2s ease-out' };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={cardStyle}
      className={`surface-card space-y-6 select-none touch-none relative cursor-grab active:cursor-grabbing shadow-xl z-10 ${
        disabled ? 'pointer-events-none opacity-90' : ''
      }`}
    >
      {/* Visual Directional Badges */}
      {swipeDirection === 'right' && (
        <div className="absolute top-6 right-6 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-bold text-xs tracking-wider uppercase rotate-6 pointer-events-none z-20 shadow-sm animate-fadeIn">
          Apply / Save
        </div>
      )}

      {swipeDirection === 'left' && (
        <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-xl bg-red-500/20 border-2 border-red-400 text-red-300 font-bold text-xs tracking-wider uppercase -rotate-6 pointer-events-none z-20 shadow-sm animate-fadeIn">
          Skip
        </div>
      )}

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
          className="flex-1 text-red-300 hover:bg-red-950/40 hover:text-red-200 border border-red-900/30"
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
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-surface font-semibold"
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
    const min = salaryRange.min ? `$${salaryRange.min.toLocaleString()}` : null;
    const max = salaryRange.max ? `$${salaryRange.max.toLocaleString()}` : null;
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

        <h2 className="text-2xl font-bold text-content tracking-tight">
          {job.title}
        </h2>

        <div className="flex items-center gap-2 text-sm text-content-muted">
          <Building2 className="w-4 h-4 text-content-subtle" />
          <span className="font-medium text-content">{job.company}</span>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-outline-variant text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-content-muted">
          <MapPin className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="truncate">{job.location || 'Remote / Flexible'}</span>
        </div>
        <div className="flex items-center gap-2 text-content-muted">
          <Banknote className="w-4 h-4 text-content-subtle shrink-0" />
          <span className="font-semibold text-content truncate">{salary}</span>
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
