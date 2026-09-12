import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";

export function SearchBar({ placeholder = "Search by job title, skills, or company...", onOpenFilters }) {
  const { searchQuery, setSearchQuery, setIsFilterModalOpen } = useApp();

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleFiltersClick = () => {
    if (onOpenFilters) {
      onOpenFilters();
    } else {
      setIsFilterModalOpen(true);
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-2xl mx-auto">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        id="main-job-search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search jobs, skills or companies"
        className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
      />

      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleFiltersClick}
          id="btn-trigger-filters"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
          aria-label="Open detailed filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
