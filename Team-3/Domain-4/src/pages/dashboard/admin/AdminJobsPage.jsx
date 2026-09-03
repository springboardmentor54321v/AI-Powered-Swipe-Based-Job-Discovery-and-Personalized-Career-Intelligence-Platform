import React, { useState, useEffect } from 'react';
import { Database, Search, Building, MapPin, CheckCircle2, RotateCcw } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import jobService from '../../../services/jobs';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCatalog = () => {
    setLoading(true);
    jobService.listJobs({})
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filtered = jobs.filter((job) => {
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
            <Database className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">Platform Job Catalog</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Global index of all partner postings served through the SwipeX discovery deck.
          </p>
        </div>

        <Button
          variant="tonal"
          size="sm"
          icon={RotateCcw}
          onClick={loadCatalog}
        >
          Refresh Index
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by title or employer..."
            className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <span className="text-xs text-content-subtle self-start sm:self-auto">
          {filtered.length} Indexed Requisitions
        </span>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-content-subtle">
          Loading catalog index...
        </div>
      ) : (
        <div className="surface-card p-0 overflow-hidden border-white/[0.08]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-white/[0.03] border-b border-outline-variant text-content-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Requisition</th>
                  <th className="p-4">Employer Organization</th>
                  <th className="p-4">Mode / Location</th>
                  <th className="p-4">Compensation</th>
                  <th className="p-4 text-right">Deck State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filtered.map((job) => {
                  const id = job.id || job.job_id;
                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-content block text-sm truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
                        <span className="text-[11px] text-content-subtle font-mono">Catalog ID #{id}</span>
                      </td>

                      <td className="p-4 text-content-muted">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-xs">{job.company || 'Enterprise Partner'}</span>
                        </div>
                      </td>

                      <td className="p-4 text-content-muted">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                          <span className="truncate max-w-[120px]">{job.location || 'Remote'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-content whitespace-nowrap">
                        {job.salary || 'Competitive'}
                      </td>

                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content-muted border border-outline-variant whitespace-nowrap">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
