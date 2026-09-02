import React from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  Building2,
  Rocket,
  Globe2,
  GraduationCap,
  Briefcase,
  UserCheck,
  TrendingDown,
  Clock,
  Layers
} from "lucide-react";

export const FILTER_PILLS = [
  { id: "All", label: "All Roles", icon: Layers },
  { id: "MNC", label: "MNCs", icon: Building2 },
  { id: "Startup", label: "Startups", icon: Rocket },
  { id: "Newly Founded", label: "Newly Founded", icon: Sparkles },
  { id: "Remote", label: "Remote", icon: Globe2 },
  { id: "Internship", label: "Internships", icon: GraduationCap },
  { id: "Full Time", label: "Full Time", icon: Briefcase },
  { id: "Fresher Friendly", label: "Fresher Friendly", icon: UserCheck },
  { id: "Low Competition", label: "Low Competition", icon: TrendingDown },
  { id: "Recently Posted", label: "Recently Posted", icon: Clock }
];

export function FilterBar() {
  const { activeFilterPill, setActiveFilterPill, setFilters } = useApp();

  const handlePillClick = (pillId) => {
    setActiveFilterPill(pillId);
    
    // Sync to filters state
    if (pillId === "All") {
      setFilters((prev) => ({
        ...prev,
        companyType: "All",
        jobType: "All",
        isRemote: false,
        isInternship: false,
        isFresherFriendly: false,
        isNewlyFounded: false,
        competition: "All"
      }));
    } else if (pillId === "MNC") {
      setFilters((prev) => ({ ...prev, companyType: "MNC" }));
    } else if (pillId === "Startup") {
      setFilters((prev) => ({ ...prev, companyType: "Startup" }));
    } else if (pillId === "Newly Founded") {
      setFilters((prev) => ({ ...prev, isNewlyFounded: true, companyType: "Newly Founded" }));
    } else if (pillId === "Remote") {
      setFilters((prev) => ({ ...prev, isRemote: true }));
    } else if (pillId === "Internship") {
      setFilters((prev) => ({ ...prev, jobType: "Internship", isInternship: true }));
    } else if (pillId === "Full Time") {
      setFilters((prev) => ({ ...prev, jobType: "Full Time" }));
    } else if (pillId === "Fresher Friendly") {
      setFilters((prev) => ({ ...prev, isFresherFriendly: true }));
    } else if (pillId === "Low Competition") {
      setFilters((prev) => ({ ...prev, competition: "Low" }));
    } else if (pillId === "Recently Posted") {
      setActiveFilterPill(pillId);
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {FILTER_PILLS.map((pill) => {
          const Icon = pill.icon;
          const isActive = activeFilterPill === pill.id;

          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => handlePillClick(pill.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-100" : "text-slate-500"}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterBar;
