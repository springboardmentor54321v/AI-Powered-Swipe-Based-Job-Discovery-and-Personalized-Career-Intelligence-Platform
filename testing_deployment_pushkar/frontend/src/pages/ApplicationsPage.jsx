import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Briefcase,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  Search,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { jobService } from "../services/jobService";
import { ApplicationCard } from "../components/ApplicationCard";


// ============================================================
// HELPERS
// ============================================================

const normalizeApplication = (application) => {
  if (!application) {
    return null;
  }

  return {
    ...application,

    // Backend
    job_id:
      application.job_id ??
      application.jobId ??
      null,

    // Compatibility with existing ApplicationCard
    jobId:
      application.jobId ??
      application.job_id ??
      null,

    title:
      application.title ||
      application.job_title ||
      application.jobTitle ||
      "Untitled Job",

    company:
      application.company ||
      "Company",

    location:
      application.location ||
      "Location not specified",

    skills: Array.isArray(
      application.skills
    )
      ? application.skills
      : String(
          application.skills || ""
        )
          .split(",")
          .map((skill) =>
            skill.trim()
          )
          .filter(Boolean),

    salary:
      application.salary ||
      null,

    status:
      application.status ||
      "Applied",

    applied_at:
      application.applied_at ??
      application.appliedAt ??
      null,

    appliedAt:
      application.appliedAt ??
      application.applied_at ??
      null,
  };
};


const normalizeStatus = (status) => {
  return String(
    status || "Applied"
  )
    .trim()
    .toLowerCase();
};


// ============================================================
// PAGE
// ============================================================

export function ApplicationsPage() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  // ==========================================================
  // LOAD APPLICATIONS
  // ==========================================================

  const loadApplications = useCallback(
    async (showLoader = true) => {

      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {

        const response =
          await jobService.getApplications();

        const backendApplications =
          response?.applications ||
          [];

        const normalizedApplications =
          Array.isArray(
            backendApplications
          )
            ? backendApplications
                .map(
                  normalizeApplication
                )
                .filter(Boolean)
            : [];

        setApplications(
          normalizedApplications
        );

      } catch (err) {

        console.error(
          "Failed to load applications:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load your applications. Please try again."
        );

        setApplications([]);

      } finally {

        setIsLoading(false);
        setIsRefreshing(false);

      }
    },
    []
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadApplications(true);
  }, [loadApplications]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {

    const getCount = (
      status
    ) =>
      applications.filter(
        (application) =>
          normalizeStatus(
            application.status
          ) ===
          normalizeStatus(
            status
          )
      ).length;

    return {
      total:
        applications.length,

      applied:
        getCount("Applied"),

      shortlisted:
        getCount(
          "Shortlisted"
        ),

      interview:
        getCount(
          "Interview"
        ),

      rejected:
        getCount("Rejected"),
    };

  }, [applications]);


  // ==========================================================
  // FILTER APPLICATIONS
  // ==========================================================

  const filteredApplications =
    useMemo(() => {

      const query =
        searchQuery
          .toLowerCase()
          .trim();

      return applications.filter(
        (application) => {

          // ----------------------------------------------
          // STATUS
          // ----------------------------------------------

          const matchesStatus =
            selectedStatus ===
              "All" ||
            normalizeStatus(
              application.status
            ) ===
              normalizeStatus(
                selectedStatus
              );


          // ----------------------------------------------
          // SEARCH
          // ----------------------------------------------

          const title =
            String(
              application.title ||
                ""
            ).toLowerCase();

          const company =
            String(
              application.company ||
                ""
            ).toLowerCase();

          const location =
            String(
              application.location ||
                ""
            ).toLowerCase();

          const matchesQuery =
            !query ||
            title.includes(query) ||
            company.includes(query) ||
            location.includes(query);


          return (
            matchesStatus &&
            matchesQuery
          );
        }
      );

    }, [
      applications,
      selectedStatus,
      searchQuery,
    ]);


  // ==========================================================
  // STATUS CARD HANDLER
  // ==========================================================

  const toggleStatus = (
    status
  ) => {

    setSelectedStatus(
      selectedStatus ===
        status
        ? "All"
        : status
    );

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {

    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-slate-50/60">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header Skeleton */}

          <div className="mb-8 space-y-3">

            <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse" />

            <div className="h-4 w-96 max-w-full bg-slate-200 rounded-lg animate-pulse" />

          </div>


          {/* Stats Skeleton */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  key={item}
                  className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse"
                />

              )
            )}

          </div>


          {/* Search Skeleton */}

          <div className="h-11 w-full sm:w-96 bg-slate-200 rounded-xl mb-6 animate-pulse" />


          {/* Application Skeleton */}

          <div className="space-y-4">

            {[1, 2, 3].map(
              (item) => (

                <div
                  key={item}
                  className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse"
                />

              )
            )}

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (
    error &&
    applications.length === 0
  ) {

    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-slate-50/60 flex items-center justify-center px-4">

        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-8 text-center max-w-md w-full">

          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">

            <AlertCircle className="w-7 h-7" />

          </div>


          <h2 className="text-lg font-bold text-slate-900">

            Unable to load applications

          </h2>


          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">

            {error}

          </p>


          <button
            type="button"
            onClick={() =>
              loadApplications(true)
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >

            <RefreshCw className="w-4 h-4" />

            Retry

          </button>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="min-h-[calc(100dvh-4rem)] bg-slate-50/60">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">

          <div>

            <div className="flex items-center gap-2 mb-1">

              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">

                <Briefcase className="w-5 h-5" />

              </div>


              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">

                Job Applications

              </h1>

            </div>


            <p className="text-xs sm:text-sm text-slate-500">

              Track your applications, recruiter responses, interviews, and hiring progress in one place.

            </p>

          </div>


          {/* Refresh */}

          <button
            type="button"
            onClick={() =>
              loadApplications(
                false
              )
            }
            disabled={
              isRefreshing
            }
            className="self-start flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >

            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh

          </button>

        </div>


        {/* ====================================================
            STATS
        ==================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">

          {/* APPLIED */}

          <button
            type="button"
            onClick={() =>
              toggleStatus(
                "Applied"
              )
            }
            className={`p-5 rounded-2xl border text-left transition-all ${
              selectedStatus ===
              "Applied"
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >

            <div className="flex items-center justify-between mb-2">

              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedStatus ===
                  "Applied"
                    ? "text-slate-300"
                    : "text-slate-400"
                }`}
              >
                Applied
              </span>


              <Clock
                className={`w-4 h-4 ${
                  selectedStatus ===
                  "Applied"
                    ? "text-emerald-400"
                    : "text-blue-600"
                }`}
              />

            </div>


            <p className="text-2xl sm:text-3xl font-extrabold">

              {stats.applied}

            </p>


            <p
              className={`text-[11px] mt-1 ${
                selectedStatus ===
                "Applied"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              In initial review
            </p>

          </button>


          {/* SHORTLISTED */}

          <button
            type="button"
            onClick={() =>
              toggleStatus(
                "Shortlisted"
              )
            }
            className={`p-5 rounded-2xl border text-left transition-all ${
              selectedStatus ===
              "Shortlisted"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
                : "bg-white text-slate-900 border-slate-200 hover:border-emerald-200 shadow-2xs"
            }`}
          >

            <div className="flex items-center justify-between mb-2">

              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedStatus ===
                  "Shortlisted"
                    ? "text-emerald-100"
                    : "text-slate-400"
                }`}
              >
                Shortlisted
              </span>


              <CheckCircle2
                className={`w-4 h-4 ${
                  selectedStatus ===
                  "Shortlisted"
                    ? "text-emerald-200"
                    : "text-emerald-600"
                }`}
              />

            </div>


            <p className="text-2xl sm:text-3xl font-extrabold">

              {stats.shortlisted}

            </p>


            <p
              className={`text-[11px] mt-1 ${
                selectedStatus ===
                "Shortlisted"
                  ? "text-emerald-100"
                  : "text-slate-500"
              }`}
            >
              Profile accepted
            </p>

          </button>


          {/* INTERVIEW */}

          <button
            type="button"
            onClick={() =>
              toggleStatus(
                "Interview"
              )
            }
            className={`p-5 rounded-2xl border text-left transition-all ${
              selectedStatus ===
              "Interview"
                ? "bg-purple-700 text-white border-purple-700 shadow-md"
                : "bg-white text-slate-900 border-slate-200 hover:border-purple-200 shadow-2xs"
            }`}
          >

            <div className="flex items-center justify-between mb-2">

              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedStatus ===
                  "Interview"
                    ? "text-purple-100"
                    : "text-slate-400"
                }`}
              >
                Interview
              </span>


              <UserCheck
                className={`w-4 h-4 ${
                  selectedStatus ===
                  "Interview"
                    ? "text-purple-200"
                    : "text-purple-600"
                }`}
              />

            </div>


            <p className="text-2xl sm:text-3xl font-extrabold">

              {stats.interview}

            </p>


            <p
              className={`text-[11px] mt-1 ${
                selectedStatus ===
                "Interview"
                  ? "text-purple-100"
                  : "text-slate-500"
              }`}
            >
              Active rounds
            </p>

          </button>


          {/* REJECTED */}

          <button
            type="button"
            onClick={() =>
              toggleStatus(
                "Rejected"
              )
            }
            className={`p-5 rounded-2xl border text-left transition-all ${
              selectedStatus ===
              "Rejected"
                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >

            <div className="flex items-center justify-between mb-2">

              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedStatus ===
                  "Rejected"
                    ? "text-slate-300"
                    : "text-slate-400"
                }`}
              >
                Archived
              </span>


              <XCircle
                className={`w-4 h-4 ${
                  selectedStatus ===
                  "Rejected"
                    ? "text-rose-300"
                    : "text-slate-400"
                }`}
              />

            </div>


            <p className="text-2xl sm:text-3xl font-extrabold">

              {stats.rejected}

            </p>


            <p
              className={`text-[11px] mt-1 ${
                selectedStatus ===
                "Rejected"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              Closed / Completed
            </p>

          </button>

        </div>


        {/* ====================================================
            SEARCH + STATUS FILTER
        ==================================================== */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">

          {/* SEARCH */}

          <div className="relative w-full sm:max-w-md">

            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


            <input
              type="text"
              value={
                searchQuery
              }
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

          </div>


          {/* STATUS FILTER */}

          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">

            {[
              "All",
              "Applied",
              "Shortlisted",
              "Interview",
              "Rejected",
            ].map(
              (status) => (

                <button
                  key={
                    status
                  }
                  type="button"
                  onClick={() =>
                    setSelectedStatus(
                      status
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedStatus ===
                    status
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >

                  {status}

                </button>

              )
            )}

          </div>

        </div>


        {/* ====================================================
            BACKGROUND ERROR
        ==================================================== */}

        {error &&
          applications.length >
            0 && (

            <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">

              <div className="flex items-center gap-2">

                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />

                <p className="text-xs text-rose-700">

                  {error}

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  loadApplications(
                    false
                  )
                }
                className="text-xs font-bold text-rose-700 hover:text-rose-900"
              >
                Retry
              </button>

            </div>

          )}


        {/* ====================================================
            APPLICATIONS
        ==================================================== */}

        {filteredApplications.length ===
        0 ? (

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-md mx-auto my-8">

            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">

              <Briefcase className="w-8 h-8" />

            </div>


            <h2 className="text-lg font-bold text-slate-900 mb-1">

              {applications.length ===
              0
                ? "No applications yet"
                : "No applications found"}

            </h2>


            <p className="text-xs text-slate-500 leading-relaxed mb-6">

              {applications.length ===
              0
                ? "Swipe right on a job or use Apply to submit an application. Your application status will appear here."
                : selectedStatus !==
                    "All"
                  ? `No applications in the '${selectedStatus}' stage match your search.`
                  : "No applications match your current search."}

            </p>


            {applications.length ===
            0 ? (

              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
              >

                <span>
                  Explore Jobs
                </span>

                <ArrowRight className="w-4 h-4" />

              </Link>

            ) : (

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus(
                    "All"
                  );
                  setSearchQuery(
                    ""
                  );
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >

                Clear Filters

              </button>

            )}

          </div>

        ) : (

          <div className="space-y-4">

            {filteredApplications.map(
              (application) => (

                <ApplicationCard
                  key={
                    application.id
                  }
                  application={
                    application
                  }
                />

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}


export default ApplicationsPage;