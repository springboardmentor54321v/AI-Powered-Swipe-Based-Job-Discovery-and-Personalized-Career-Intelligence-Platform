import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  MapPin,
  Users,
  Briefcase,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Rocket,
  Globe2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getCompanies } from "../services/api";

const CATEGORY_TABS = [
  { id: "All", label: "All Companies", icon: Building2 },
  { id: "MNC", label: "MNCs & Global Giants", icon: Globe2 },
  { id: "Startup", label: "High-Growth Startups", icon: Rocket },
  { id: "Newly Founded", label: "Frontier / Newly Founded", icon: Sparkles }
];

export function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const loadCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCompanies();
      if (res && res.data) {
        setCompanies(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setError("Unable to load companies catalog. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((comp) => {
      const matchesCategory =
        activeCategory === "All" || comp.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        comp.name.toLowerCase().includes(q) ||
        comp.industry.toLowerCase().includes(q) ||
        comp.location.toLowerCase().includes(q) ||
        (comp.techStack && comp.techStack.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [companies, activeCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Hiring Companies & Startups
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Discover vetted engineering cultures, explore active hiring teams, and find tech companies aligned with your career goals.
        </p>
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, tech, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Failed to load companies</h3>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button
            type="button"
            onClick={loadCompanies}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
          >
            Retry
          </button>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No companies found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((comp) => {
            const badgeBg =
              comp.category === "Startup"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : comp.category === "Newly Founded"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between p-6 group"
              >
                <div>
                  {/* Top Bar with Logo, Name and Category */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        {comp.logo ? (
                          <img
                            src={comp.logo}
                            alt={comp.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                          {comp.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{comp.industry}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${badgeBg}`}
                    >
                      {comp.category}
                    </span>
                  </div>

                  {/* Location & Team Size */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {comp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {comp.employeeCount}
                    </span>
                    {comp.rating && (
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {comp.rating}
                      </span>
                    )}
                  </div>

                  {/* About Summary */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {comp.about}
                  </p>

                  {/* Tech Stack Preview */}
                  {comp.techStack && comp.techStack.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {comp.techStack.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] rounded-md font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {comp.techStack.length > 4 && (
                          <span className="px-1.5 py-0.5 text-slate-400 text-[11px] font-medium">
                            +{comp.techStack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{comp.openJobsCount || 1} Open Roles</span>
                  </span>

                  <Link
                    to={`/companies/${comp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CompaniesPage;
