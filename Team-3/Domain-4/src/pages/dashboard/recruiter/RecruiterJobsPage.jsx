import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Search, Eye, PauseCircle, PlayCircle, MapPin, Building, Banknote } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';

export default function RecruiterJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    jobService.listJobs({})
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => {
        if ((j.id || j.job_id) === jobId) {
          const newStatus = j.status === 'Paused' ? 'Active' : 'Paused';
          return { ...j, status: newStatus };
        }
        return j;
      })
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const title = (job.title || '').toLowerCase();
    const company = (job.company || '').toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || company.includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">My Requisitions</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Manage your published job postings and candidate discovery visibility.
          </p>
        </div>

        <Button
          variant="filled"
          size="sm"
          icon={PlusCircle}
          onClick={() => navigate('/dashboard/recruiter/post-job')}
        >
          Post New Requisition
        </Button>
      </div>

      {/* Filter Row */}
      {jobs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requisitions by title or keywords..."
              className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
            />
          </div>

          <span className="text-xs text-content-subtle self-start sm:self-auto">
            {filteredJobs.length} Positions Listed
          </span>
        </div>
      )}

      {/* Jobs Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-content-subtle">
          Loading company requisitions...
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="surface-card p-0 overflow-hidden border-white/[0.08]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead className="bg-white/[0.03] border-b border-outline-variant text-content-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Requisition Title</th>
                  <th className="p-4">Workplace & Type</th>
                  <th className="p-4">Compensation</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredJobs.map((job) => {
                  const jobId = job.id || job.job_id;
                  const isPaused = job.status === 'Paused';

                  return (
                    <tr key={jobId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-content block text-sm truncate max-w-[200px] sm:max-w-xs">
                          {job.title}
                        </span>
                        <span className="text-[11px] text-content-muted block truncate max-w-[160px] sm:max-w-xs">
                          {job.company || 'Enterprise Partner'} • #{jobId}
                        </span>
                      </td>

                      <td className="p-4 text-content-muted">
                        <div className="space-y-0.5">
                          <span className="block font-medium text-content">{job.type || 'Full-time'}</span>
                          <span className="text-[11px] text-content-subtle truncate max-w-[120px] block">{job.location || 'Remote'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-content whitespace-nowrap">
                        {job.salary || 'Competitive'}
                      </td>

                      <td className="p-4">
                        {isPaused ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-amber-300 border border-amber-800/40 whitespace-nowrap">
                            Paused
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content-muted border border-outline-variant whitespace-nowrap">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <Button
                          variant="tonal"
                          size="sm"
                          icon={isPaused ? PlayCircle : PauseCircle}
                          onClick={() => handleToggleStatus(jobId)}
                          title={isPaused ? 'Resume position in deck' : 'Pause position'}
                        >
                          {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="surface-card p-12 text-center space-y-3 border-dashed">
          <Briefcase className="w-10 h-10 text-content-subtle mx-auto" />
          <h2 className="text-base font-bold text-content">No requisitions found</h2>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            You haven't posted any job openings yet. Create a new requisition to begin receiving candidate matches.
          </p>
          <div className="pt-2">
            <Button
              variant="filled"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate('/dashboard/recruiter/post-job')}
            >
              Post a Requisition
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
