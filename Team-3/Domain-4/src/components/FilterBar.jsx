import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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

  const companyTypes = ['All', 'MNC', 'Startup'];

  const handleInputChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const hasActiveFilters = 
    selectedType !== 'All' || 
    Boolean(searchQuery) ||
    Boolean(filters.location) || 
    (filters.remote && filters.remote !== 'Any') || 
    (filters.salary && filters.salary !== 'Any');

  return (
    <div className={`surface-card p-4 sm:p-5 space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-subtle">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by title, role or keywords..."
            className="w-full bg-surface-elevated/70 border border-outline-variant rounded-2xl py-2 pl-10 pr-4 text-xs text-content placeholder:text-content-subtle transition-colors focus:border-primary"
          />
        </div>

        {/* Quick Filter Chips & Filters Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            {companyTypes.map((type) => (
              <Chip
                key={type}
                selected={selectedType === type}
                onClick={() => onTypeChange && onTypeChange(type)}
              >
                {type}
              </Chip>
            ))}
          </div>

          <Button
            variant={filterOpen ? 'filled' : 'tonal'}
            size="sm"
            icon={SlidersHorizontal}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filters
          </Button>

          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset filters"
              className="p-2 rounded-xl text-content-subtle hover:text-content hover:bg-surface-elevated transition-colors text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Advanced Filters Panel */}
      {filterOpen && (
        <div className="pt-3 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fadeIn">
          {/* Location */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Location</label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Bengaluru, Remote"
              className="w-full bg-surface-elevated/70 border border-outline-variant rounded-xl px-3 py-2 text-content placeholder:text-content-subtle focus:border-primary"
            />
          </div>

          {/* Workplace Mode / Remote */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Workplace mode</label>
            <select
              value={filters.remote || 'Any'}
              onChange={(e) => handleInputChange('remote', e.target.value)}
              className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:border-primary"
            >
              <option value="Any">Any mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Salary minimum</label>
            <select
              value={filters.salary || 'Any'}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              className="w-full bg-surface-elevated border border-outline-variant rounded-xl px-3 py-2 text-content focus:border-primary"
            >
              <option value="Any">Any salary</option>
              <option value="10">₹10+ LPA</option>
              <option value="20">₹20+ LPA</option>
              <option value="30">₹30+ LPA</option>
            </select>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="text-content-muted font-medium">Skills keyword</label>
            <input
              type="text"
              value={filters.skills || ''}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="e.g. React, Python"
              className="w-full bg-surface-elevated/70 border border-outline-variant rounded-xl px-3 py-2 text-content placeholder:text-content-subtle focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
