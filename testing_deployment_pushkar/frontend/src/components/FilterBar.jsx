import React from "react";

import {
  Layers,
  Globe2,
  GraduationCap,
  Briefcase,
  UserCheck,
  Clock,
} from "lucide-react";

import { useApp } from "../context/AppContext";


// ============================================================
// FILTER PILLS
// ============================================================

export const FILTER_PILLS = [
  {
    id: "All",
    label: "All Roles",
    icon: Layers,
  },
  {
    id: "Remote",
    label: "Remote",
    icon: Globe2,
  },
  {
    id: "Internship",
    label: "Internships",
    icon: GraduationCap,
  },
  {
    id: "Full Time",
    label: "Full Time",
    icon: Briefcase,
  },
  {
    id: "Fresher Friendly",
    label: "Fresher",
    icon: UserCheck,
  },
  {
    id: "Recently Posted",
    label: "Recent",
    icon: Clock,
  },
];


// ============================================================
// FILTER BAR
// ============================================================

export function FilterBar() {
  const {
    activeFilterPill,
    setActiveFilterPill,
    setFilters,
  } = useApp();


  // ==========================================================
  // HANDLE FILTER
  // ==========================================================

  const handlePillClick = (pillId) => {

    setActiveFilterPill(pillId);


    // --------------------------------------------------------
    // ALL
    // --------------------------------------------------------

    if (pillId === "All") {

      setFilters((previous) => ({
        ...previous,

        location: "All",
        jobType: "All",
        workMode: "All",
        experienceLevel: "All",

        selectedSkill: "All",

        isRemote: false,
        isInternship: false,
        isFresherFriendly: false,
        recentlyPosted: false,
      }));

      return;
    }


    // --------------------------------------------------------
    // REMOTE
    // --------------------------------------------------------

    if (pillId === "Remote") {

      setFilters((previous) => ({
        ...previous,

        workMode: "Remote",
        isRemote: true,
      }));

      return;
    }


    // --------------------------------------------------------
    // INTERNSHIP
    // --------------------------------------------------------

    if (pillId === "Internship") {

      setFilters((previous) => ({
        ...previous,

        jobType: "Internship",
        isInternship: true,
      }));

      return;
    }


    // --------------------------------------------------------
    // FULL TIME
    // --------------------------------------------------------

    if (pillId === "Full Time") {

      setFilters((previous) => ({
        ...previous,

        jobType: "Full Time",
        isInternship: false,
      }));

      return;
    }


    // --------------------------------------------------------
    // FRESHER
    // --------------------------------------------------------

    if (pillId === "Fresher Friendly") {

      setFilters((previous) => ({
        ...previous,

        isFresherFriendly: true,

        experienceLevel:
          previous.experienceLevel === "All"
            ? "Fresher"
            : previous.experienceLevel,
      }));

      return;
    }


    // --------------------------------------------------------
    // RECENTLY POSTED
    // --------------------------------------------------------

    if (pillId === "Recently Posted") {

      setFilters((previous) => ({
        ...previous,

        recentlyPosted: true,
      }));

      return;
    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">

      <div className="flex items-center gap-2 min-w-max px-1">

        {FILTER_PILLS.map((pill) => {

          const Icon = pill.icon;

          const isActive =
            activeFilterPill === pill.id;


          return (
            <button
              key={pill.id}
              type="button"
              onClick={() =>
                handlePillClick(pill.id)
              }
              className={`
                flex
                items-center
                gap-1.5
                px-3
                sm:px-3.5
                py-1.5
                rounded-xl
                text-[11px]
                sm:text-xs
                font-semibold
                whitespace-nowrap
                transition-all
                border

                ${
                  isActive
                    ? `
                      bg-emerald-600
                      text-white
                      border-emerald-600
                      shadow-sm
                    `
                    : `
                      bg-white
                      text-slate-600
                      border-slate-200
                      hover:bg-slate-50
                      hover:text-slate-900
                    `
                }
              `}
            >

              <Icon
                className={`
                  w-3.5
                  h-3.5

                  ${
                    isActive
                      ? "text-emerald-100"
                      : "text-slate-500"
                  }
                `}
              />

              <span>
                {pill.label}
              </span>

            </button>
          );

        })}

      </div>

    </div>
  );
}


export default FilterBar;