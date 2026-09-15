import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Globe, 
  Briefcase, 
  ArrowLeft, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Share2,
  Users,
  Compass
} from 'lucide-react';
import Chip from '../components/common/Chip';
import Button from '../components/common/Button';
import companyService from '../services/companies';
import jobService from '../services/jobs';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const data = await companyService.getCompanyDetail(id);
        if (data) {
          setCompany(data);
        } else {
          setError('Company not found or no longer active on the platform.');
        }
      } catch {
        setError('Unable to load company details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleApply = async (job) => {
    const jobId = job.id || job.job_id;
    try {
      await jobService.recordSwipe({
        job_id: String(jobId),
        direction: 'right',
      });
      setAppliedJobs((prev) => new Set([...prev, jobId]));
      showToast(`Applied to ${job.title} at ${company?.name || 'company'}`);
    } catch {
      showToast(`Recorded application for ${job.title}`);
    }
  };

  const getCompanyTypeBadge = (type) => {
    const lower = (type || '').toLowerCase();
    if (lower === 'mnc') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          MNC Enterprise
        </span>
      );
    }
    if (lower === 'startup') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          High-Growth Startup
        </span>
      );
    }
    if (lower.includes('new') || lower.includes('founded')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          Newly Founded Startup
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/[0.08] text-content-muted border border-white/[0.1]">
        {type || 'Company'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-white/[0.05] flex items-center justify-center text-primary mx-auto">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <p className="text-xs text-content-muted">Loading company profile and open roles...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-2xl mx-auto surface-card p-10 text-center space-y-4 border border-white/[0.08] rounded-3xl bg-[#12131a] animate-fadeIn">
        <div className="inline-flex h-14 w-14 rounded-3xl bg-red-950/40 border border-red-800/40 items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Company Information Unavailable</h2>
          <p className="text-xs text-content-muted max-w-sm mx-auto">{error || 'Could not find company profile'}</p>
        </div>
        <Button
          variant="filled"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate('/dashboard/job-seeker/companies')}
        >
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 flex items-center justify-between text-xs text-emerald-300 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard/job-seeker/companies')}
          className="flex items-center gap-2 text-xs font-semibold text-content-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Companies & Startups</span>
        </button>

        <Link
          to="/dashboard/job-seeker/discover"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Open Swipe Discovery</span>
        </Link>
      </div>

      {/* Company Profile Hero Card */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#12131a] space-y-6">
        
        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-primary to-blue-600 text-surface font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0">
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {company.name}
                </h1>
                {getCompanyTypeBadge(company.company_type)}
              </div>
              <p className="text-xs sm:text-sm text-content-muted font-medium">
                {company.industry}
              </p>
            </div>
          </div>

          {/* External Links */}
          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/[0.1] text-content hover:bg-white/[0.08] hover:text-white flex items-center gap-1.5 transition-colors self-start"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
            </a>
          )}
        </div>

        {/* Overview Bio */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <h2 className="text-xs font-bold text-content uppercase tracking-wider">
            About the Organization
          </h2>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06]">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-content-subtle font-semibold uppercase block">Headquarters</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-content">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{company.headquarters}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-content-subtle font-semibold uppercase block">Founded</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-content">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{company.founded_year ? `Est. ${company.founded_year}` : 'Established Partner'}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-content-subtle font-semibold uppercase block">Team Size</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-content">
              <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{company.employee_count || '100+'}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-content-subtle font-semibold uppercase block">Active Hiring</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>{company.jobs?.length || company.open_jobs_count || 1} Open Roles</span>
            </div>
          </div>
        </div>

      </div>

      {/* Open Positions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span>Open Positions at {company.name}</span>
          </h2>
          <span className="text-xs text-content-subtle">
            {company.jobs?.length || 0} active listings
          </span>
        </div>

        {company.jobs && company.jobs.length > 0 ? (
          <div className="space-y-3">
            {company.jobs.map((job) => {
              const jobId = job.id || job.job_id;
              const hasApplied = appliedJobs.has(jobId);

              return (
                <div
                  key={jobId}
                  className="surface-card p-5 rounded-3xl border border-white/[0.08] bg-[#12131a] hover:border-primary/40 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {job.title}
                        </h3>
                        {job.workplace_mode && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-content-muted border border-white/[0.08]">
                            {job.workplace_mode}
                          </span>
                        )}
                        {job.experience_level && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {job.experience_level}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-content-muted">
                        {job.location} • {job.posted_at || 'Recently posted'}
                      </p>
                    </div>

                    {/* Salary */}
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-emerald-400 block">
                        {job.salary || (job.salary_range?.min ? `₹${(job.salary_range.min / 100000).toFixed(0)} - ${(job.salary_range.max / 100000).toFixed(0)} LPA` : 'Competitive Compensation')}
                      </span>
                      <span className="text-[10px] text-content-subtle">
                        {job.applicant_count || 0} applicants ({job.competition_level || 'Low'} Competition)
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-white/[0.04] text-content-muted border border-white/[0.06]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <p className="text-[11px] text-content-subtle line-clamp-1 flex-1 mr-4">
                      {job.description || 'Full-time position with high-growth potential and great benefits.'}
                    </p>

                    <Button
                      variant={hasApplied ? 'tonal' : 'filled'}
                      size="sm"
                      onClick={() => !hasApplied && handleApply(job)}
                      disabled={hasApplied}
                      className={hasApplied ? 'text-emerald-400 border border-emerald-800/40' : ''}
                    >
                      {hasApplied ? '✓ Applied' : 'Quick Apply / Swipe →'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="surface-card p-8 text-center space-y-3 border border-white/[0.08] rounded-3xl bg-[#12131a]">
            <Briefcase className="w-6 h-6 text-content-subtle mx-auto" />
            <p className="text-xs text-content-muted">
              No open roles currently listed for this company. Check back soon or explore other companies.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
