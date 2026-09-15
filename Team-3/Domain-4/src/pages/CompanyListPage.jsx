import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Briefcase, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  X,
  Users,
  Star
} from 'lucide-react';
import Chip from '../components/common/Chip';
import Button from '../components/common/Button';
import companyService from '../services/companies';

export default function CompanyListPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const companyTypes = ['All', 'MNC', 'Startup', 'Newly Founded'];

  const loadCompanies = useCallback(async (search, type) => {
    setLoading(true);
    setError('');

    try {
      const filters = {
        search: search.trim() || undefined,
        company_type: type !== 'All' ? type : undefined,
      };
      const data = await companyService.listCompanies(filters);
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load companies. Please check your connection and try again.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCompanies(searchQuery, selectedType);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, loadCompanies]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
  };

  const getCompanyTypeBadge = (type) => {
    const lower = (type || '').toLowerCase();
    if (lower === 'mnc') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          MNC Enterprise
        </span>
      );
    }
    if (lower === 'startup') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          High-Growth Startup
        </span>
      );
    }
    if (lower.includes('new') || lower.includes('founded')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          Newly Founded
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.08] text-content-muted border border-white/[0.1]">
        {type || 'Company'}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-white/[0.02] to-transparent border border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Companies & Startups
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-content-muted max-w-xl">
            Explore leading MNC enterprises, high-growth startups, and newly founded tech innovators actively hiring on SwipeX.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/dashboard/job-seeker/discover"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/[0.1] text-content hover:bg-white/[0.08] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            <span>Swipe Discovery Deck</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="surface-card p-4 sm:p-5 space-y-3.5 border border-white/[0.08] rounded-3xl bg-[#12131a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-subtle">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, industry, headquarters, keywords..."
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl py-2 pl-10 pr-9 text-xs sm:text-sm text-content placeholder:text-content-subtle transition-colors focus:border-primary focus:bg-white/[0.06] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-subtle hover:text-content"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedType !== 'All') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl text-content-subtle hover:text-content hover:bg-white/[0.05] transition-colors text-xs flex items-center gap-1 border border-white/[0.06] self-end sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Company Type Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/[0.06]">
          <span className="text-[11px] font-semibold text-content-subtle mr-1">
            Category:
          </span>
          {companyTypes.map((type) => (
            <Chip
              key={type}
              selected={selectedType === type}
              onClick={() => setSelectedType(type)}
            >
              {type === 'All' ? 'All Organizations' : type}
            </Chip>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="surface-card p-5 space-y-3.5 rounded-3xl border border-white/[0.06] bg-[#12131a] animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06]" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-white/[0.08] rounded-md w-2/3" />
                  <div className="h-3 bg-white/[0.04] rounded-md w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-white/[0.04] rounded-md w-full" />
              <div className="h-3 bg-white/[0.04] rounded-md w-4/5" />
              <div className="h-8 bg-white/[0.06] rounded-xl w-full pt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="surface-card p-10 text-center space-y-4 border border-white/[0.08] rounded-3xl bg-[#12131a]">
          <div className="inline-flex h-14 w-14 rounded-3xl bg-red-950/40 border border-red-800/40 items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Unable to load companies</h2>
            <p className="text-xs text-content-muted max-w-sm mx-auto">{error}</p>
          </div>
          <Button
            variant="filled"
            size="md"
            onClick={() => loadCompanies(searchQuery, selectedType)}
          >
            Retry
          </Button>
        </div>
      ) : companies.length === 0 ? (
        /* Empty State */
        <div className="surface-card p-10 text-center space-y-4 border border-white/[0.08] rounded-3xl bg-[#12131a]">
          <div className="inline-flex h-14 w-14 rounded-3xl bg-white/[0.04] border border-white/[0.08] items-center justify-center text-content-muted mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">No companies found</h2>
            <p className="text-xs text-content-muted max-w-sm mx-auto">
              We couldn’t find any organizations matching your search criteria. Try modifying your keywords or clearing the category filter.
            </p>
          </div>
          <Button
            variant="filled"
            size="md"
            onClick={handleResetFilters}
          >
            Reset search
          </Button>
        </div>
      ) : (
        /* Company Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => {
            const companyId = company.id || company.company_id;
            return (
              <div
                key={companyId}
                className="surface-card p-5 rounded-3xl border border-white/[0.08] bg-[#12131a] hover:border-primary/40 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-blue-500/10 text-primary font-black text-sm flex items-center justify-center border border-primary/20 shrink-0">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
                          {company.name}
                        </h2>
                        <span className="text-[11px] text-content-muted block truncate">
                          {company.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {getCompanyTypeBadge(company.company_type)}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-content-subtle line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>
                </div>

                {/* Metadata info strip */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-content-muted">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                      <span className="truncate">{company.headquarters}</span>
                    </div>
                    {company.founded_year && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                        <span>Founded {company.founded_year}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Open Jobs link */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{company.open_jobs_count || 1} Open Roles</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/job-seeker/companies/${companyId}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] border border-white/[0.1] text-content hover:bg-primary hover:text-surface hover:border-primary transition-all flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && companies.length > 0 && (
        <div className="text-center text-xs text-content-subtle pt-2">
          Showing {companies.length} {selectedType !== 'All' ? selectedType : ''} companies actively hiring on SwipeX
        </div>
      )}

    </div>
  );
}
