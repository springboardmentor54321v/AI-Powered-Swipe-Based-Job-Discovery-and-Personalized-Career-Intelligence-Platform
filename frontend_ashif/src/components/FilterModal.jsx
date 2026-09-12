import React, { useState, useEffect } from "react";
import { X, Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";

const SKILL_OPTIONS = [
  "All",
  "React.js",
  "Python",
  "Machine Learning",
  "SQL",
  "JavaScript",
  "AWS",
  "Docker",
  "FastAPI",
  "Tailwind CSS",
  "Node.js",
  "Java"
];

const LOCATION_OPTIONS = [
  "All",
  "Bangalore, India",
  "Hyderabad, India",
  "Pune, India",
  "Mumbai, India",
  "Gurgaon, India",
  "Remote"
];

export function FilterModal() {
  const {
    isFilterModalOpen,
    setIsFilterModalOpen,
    filters,
    setFilters,
    resetFilters,
    addToast
  } = useApp();

  const [localFilters, setLocalFilters] = useState(filters);

  // Sync when modal opens
  useEffect(() => {
    if (isFilterModalOpen) {
      setLocalFilters(filters);
    }
  }, [isFilterModalOpen, filters]);

  if (!isFilterModalOpen) return null;

  const handleApply = () => {
    setFilters(localFilters);
    setIsFilterModalOpen(false);
    addToast("Job search filters applied", "success");
  };

  const handleClear = () => {
    resetFilters();
    setIsFilterModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="filter-modal-title" className="text-base font-bold text-slate-900">
                Filter Job Opportunities
              </h2>
              <p className="text-xs text-slate-500">Refine by company type, work model & skills</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5 no-scrollbar">
          {/* Company Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Company Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["All", "MNC", "Startup", "Newly Founded"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLocalFilters((prev) => ({ ...prev, companyType: type }))}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    localFilters.companyType === type
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Employment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["All", "Full Time", "Internship"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLocalFilters((prev) => ({ ...prev, jobType: type }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    localFilters.jobType === type
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Workplace Preferences
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-medium text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.isRemote}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, isRemote: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Remote Friendly</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-medium text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.isFresherFriendly}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, isFresherFriendly: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Fresher Friendly</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-medium text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.isInternship}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, isInternship: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Internships Only</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-medium text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.isNewlyFounded}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, isNewlyFounded: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Newly Founded Companies</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Preferred Location
            </label>
            <select
              value={localFilters.location || "All"}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Competition Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Applicant Volume Filter
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["All", "Low", "Medium", "High"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLocalFilters((prev) => ({ ...prev, competition: lvl }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    localFilters.competition === lvl
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Skill */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Required Skill
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setLocalFilters((prev) => ({ ...prev, selectedSkill: skill }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    localFilters.selectedSkill === skill
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
