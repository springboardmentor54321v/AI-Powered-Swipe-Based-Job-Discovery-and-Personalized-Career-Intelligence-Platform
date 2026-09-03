import React, { useState } from 'react';
import { UserCheck, Search, Filter, Calendar, FileText, Check, Award, MapPin } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';

export default function RecruiterCandidatesPage() {
  const [search, setSearch] = useState('');
  const [shortlisted, setShortlisted] = useState(new Set());
  const [scheduled, setScheduled] = useState(new Set());

  // Verified candidate talent pool from inbound matches
  const candidatePool = [
    {
      id: 'CAN-101',
      targetRole: 'Senior Cloud Architect',
      matchScore: 94,
      experience: '5+ years',
      location: 'Remote / Bengaluru',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
      status: 'Inbound Match',
      summary: 'Experienced frontend and cloud systems architect with proven enterprise deployment expertise.',
    },
    {
      id: 'CAN-102',
      targetRole: 'Staff Frontend Engineer',
      matchScore: 91,
      experience: '4+ years',
      location: 'Remote',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Redux', 'Jest'],
      status: 'Inbound Match',
      summary: 'Specializes in performant web UI architectures, accessible component design systems, and state management.',
    },
    {
      id: 'CAN-103',
      targetRole: 'Full Stack Platform Engineer',
      matchScore: 89,
      experience: '3+ years',
      location: 'Bengaluru, IN',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React'],
      status: 'Inbound Match',
      summary: 'Full-lifecycle engineer passionate about high-throughput RESTful services, database indexing, and responsive UI.',
    },
    {
      id: 'CAN-104',
      targetRole: 'DevOps & Site Reliability Engineer',
      matchScore: 86,
      experience: '4+ years',
      location: 'Remote',
      skills: ['Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python'],
      status: 'Inbound Match',
      summary: 'Focused on resilient infrastructure as code, automated pipelines, and 99.99% cloud uptime governance.',
    },
  ];

  const handleToggleShortlist = (id) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSchedule = (id) => {
    setScheduled((prev) => new Set(prev).add(id));
  };

  const filtered = candidatePool.filter((c) => {
    const q = search.toLowerCase();
    const skillsMatch = c.skills.some((s) => s.toLowerCase().includes(q));
    const roleMatch = c.targetRole.toLowerCase().includes(q);
    const idMatch = c.id.toLowerCase().includes(q);
    return skillsMatch || roleMatch || idMatch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">Candidate Talent Pool</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Recruiter sourcing view for candidates who have swiped right and matched your open requisitions.
          </p>
        </div>

        <span className="text-xs font-medium px-3 py-1 rounded-full bg-surface-elevated text-content-muted border border-outline-variant self-start sm:self-auto">
          {candidatePool.length} Qualified Profiles
        </span>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by skill (e.g. React, AWS) or role..."
            className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <span className="text-xs text-content-subtle self-start sm:self-auto">
          {filtered.length} Candidates Matching
        </span>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((candidate) => {
          const isShortlisted = shortlisted.has(candidate.id);
          const isScheduled = scheduled.has(candidate.id);

          return (
            <div
              key={candidate.id}
              className="surface-card p-5 space-y-3.5 hover-card flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-semibold text-content">
                      {candidate.id}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary-container/30 text-primary-onContainer border border-primary/20 whitespace-nowrap">
                      {candidate.matchScore}% Match
                    </span>
                  </div>

                  <span className="text-xs text-content-subtle font-medium whitespace-nowrap">
                    {candidate.experience}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-content">
                    Target: {candidate.targetRole}
                  </h3>
                  <p className="text-xs text-content-muted mt-1 leading-relaxed line-clamp-2">
                    {candidate.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.skills.map((skill, idx) => (
                    <Chip key={idx} variant="primary">{skill}</Chip>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleShortlist(candidate.id)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-colors ${
                    isShortlisted
                      ? 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                      : 'bg-surface-elevated text-content-muted border-outline-variant hover:text-content'
                  }`}
                >
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>

                {isScheduled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium px-2.5 py-1 rounded-lg bg-surface-elevated border border-outline-variant whitespace-nowrap">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Scheduled
                  </span>
                ) : (
                  <Button
                    variant="filled"
                    size="sm"
                    icon={Calendar}
                    onClick={() => handleSchedule(candidate.id)}
                    className="whitespace-nowrap"
                  >
                    Schedule Screen
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
