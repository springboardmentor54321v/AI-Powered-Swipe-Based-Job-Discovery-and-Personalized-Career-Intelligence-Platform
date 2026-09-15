import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, Filter, Check } from 'lucide-react';
import Chip from './common/Chip';
import Button from './common/Button';

export default function FilterBar({
  searchQuery = '',
  onSearchChange,
  selectedType = 'All',
  onTypeChange,
  filters = {},
  onFilterChange,
  onResetFilters,
  className = '',
}) {
  const [filterOpen, setFilterOpen] = useState(false);

  const companyTypes = ['All', 'MNC', 'Startup', 'Newly Founded'];

  const handleInputChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const toggleChip = (field) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: !filters[field] });
    }
  };

  const hasActiveFilters = 
    selectedType !== 'All' || 
    Boolean(searchQuery) ||
    Boolean(filters.location) || 
    (filters.remote && filters.remote !== 'Any') || 
    (filters.salary && filters.salary !== 'Any') ||
    (filters.salary_min && filters.salary_min !== 'Any') ||
    (filters.experience_level && filters.experience_level !== 'All') ||
    Boolean(filters.skills) ||
    Boolean(filters.fresher_friendly) ||
    Boolean(filters.low_competition) ||
    Boolean(filters.recently_posted) ||
    Boolean(filters.remote_only);

  const activeFilterCount = [
    selectedType !== 'All',
    Boolean(searchQuery),
    Boolean(filters.location),
    filters.remote && filters.remote !== 'Any',
    (filters.salary && filters.salary !== 'Any') || (filters.salary_min && filters.salary_min !== 'Any'),
    filters.experience_level && filters.experience_level !== 'All',
    Boolean(filters.skills),
    Boolean(filters.fresher_friendly),
    Boolean(filters.low_competition),
    Boolean(filters.recently_posted),
    Boolean(filters.remote_only),
  ].filter(Boolean).length;

  return (
    <div className={`surface-card p-4 sm:p-5 space-y-3.5 border border-white/[0.08] rounded-3xl bg-[#12131a] ${className}`}>
      
      {/* Primary Search & Filter Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Search Input with Clear Button */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-subtle">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search roles, skills, companies, keywords..."
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl py-2 pl-10 pr-9 text-xs sm:text-sm text-content placeholder:text-content-subtle transition-colors focus:border-primary focus:bg-white/[0.06] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-subtle hover:text-content"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Reset Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant={filterOpen ? 'filled' : 'tonal'}
            size="sm"
            icon={SlidersHorizontal}
            onClick={() => setFilterOpen(!filterOpen)}
            className="rounded-xl relative"
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-white text-surface text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl text-content-subtle hover:text-content hover:bg-white/[0.05] transition-colors text-xs flex items-center gap-1 border border-white/[0.06]"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips Row (Company Types & M2 Advanced Tags) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/[0.06]">
        <span className="text-[11px] font-semibold text-content-subtle mr-1 hidden sm:inline">
          Category:
        </span>
        
        {/* Company Types */}
        {companyTypes.map((type) => (
          <Chip
            key={type}
            selected={selectedType === type}
            onClick={() => onTypeChange && onTypeChange(type)}
          >
            {type}
          </Chip>
        ))}

        <div className="h-4 w-[1px] bg-white/[0.1] mx-1 hidden sm:inline-block" />

        {/* M2 Advanced Feature Chips */}
        <button
          type="button"
          onClick={() => toggleChip('fresher_friendly')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
            filters.fresher_friendly
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-white/[0.03] text-content-muted border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {filters.fresher_friendly ? '✓ Fresher-friendly' : '+ Fresher-friendly'}
        </button>

        <button
          type="button"
          onClick={() => toggleChip('low_competition')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
            filters.low_competition
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
              : 'bg-white/[0.03] text-content-muted border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {filters.low_competition ? '✓ Low Competition' : '+ Low Competition'}
        </button>

        <button
          type="button"
          onClick={() => toggleChip('recently_posted')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
            filters.recently_posted
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
              : 'bg-white/[0.03] text-content-muted border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {filters.recently_posted ? '✓ Recently Posted' : '+ Recently Posted'}
        </button>
      </div>

      {/* Expanded Advanced Filters Drawer */}
      {filterOpen && (
        <div className="pt-3 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fadeIn">
          {/* Location */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Location / City</label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Bengaluru, Hyderabad"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-content placeholder:text-content-subtle focus:border-primary focus:outline-none"
            />
          </div>

          {/* Workplace Mode / Remote */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Workplace Mode</label>
            <select
              value={filters.remote || 'Any'}
              onChange={(e) => handleInputChange('remote', e.target.value)}
              className="w-full bg-[#161722] border border-white/[0.1] rounded-xl px-3 py-2 text-content focus:border-primary focus:outline-none"
            >
              <option value="Any">Any Workplace Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Experience Level */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Experience Level</label>
            <select
              value={filters.experience_level || 'All'}
              onChange={(e) => handleInputChange('experience_level', e.target.value)}
              className="w-full bg-[#161722] border border-white/[0.1] rounded-xl px-3 py-2 text-content focus:border-primary focus:outline-none"
            >
              <option value="All">All Experience Levels</option>
              <option value="Fresher / Entry">Fresher / Entry Level (0-2 yrs)</option>
              <option value="Mid Level">Mid Level (2-5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
              <option value="Lead / Architect">Lead / Architect (8+ yrs)</option>
            </select>
          </div>

          {/* Minimum Salary Range */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Minimum Salary</label>
            <select
              value={filters.salary_min || filters.salary || 'Any'}
              onChange={(e) => {
                handleInputChange('salary_min', e.target.value);
                handleInputChange('salary', e.target.value);
              }}
              className="w-full bg-[#161722] border border-white/[0.1] rounded-xl px-3 py-2 text-content focus:border-primary focus:outline-none"
            >
              <option value="Any">Any Salary</option>
              <option value="10">₹10+ LPA</option>
              <option value="18">₹18+ LPA</option>
              <option value="25">₹25+ LPA</option>
              <option value="35">₹35+ LPA</option>
            </select>
          </div>

          {/* Specific Skills Query */}
          <div className="sm:col-span-2 md:col-span-4 space-y-1 pt-1">
            <label className="text-content-muted font-medium">Skills keywords (comma-separated)</label>
            <input
              type="text"
              value={filters.skills || ''}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="e.g. React.js, Python, PostgreSQL, Docker, AWS"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-content placeholder:text-content-subtle focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
