import { createApiClient } from "./http";
import { normalizeJob } from "../utils/normalizers";

// ============================================================
// JOB SERVICE BASE URL
// ============================================================
//
// Job Service runs on port 5002.
//
// Auth Service  -> 5001
// Job Service   -> 5002
// Resume        -> 5003
//
// ============================================================

const JOB_URL =
  import.meta.env.VITE_JOB_API_BASE_URL ||
  "http://127.0.0.1:5002/api/v1";

// Create a dedicated Axios client for Job Service.
const jobApi = createApiClient(JOB_URL);

// ============================================================
// JOB SERVICE
// ============================================================

export const jobService = {
  // ==========================================================
  // GET ALL JOBS
  // ==========================================================

  getJobs: (params = {}) =>
    jobApi
      .get("/jobs/", { params })
      .then((response) => ({
        ...response.data,

        jobs: (response.data.jobs || []).map(
          normalizeJob
        ),
      })),

  // ==========================================================
  // GET SINGLE JOB
  // ==========================================================

  getJob: (jobId) =>
    jobApi
      .get(`/jobs/${jobId}`)
      .then((response) => ({
        ...response.data,

        job: response.data.job
          ? normalizeJob(response.data.job)
          : null,
      })),

  // ==========================================================
  // SWIPE JOB
  //
  // RIGHT = Interested
  // LEFT  = Skip
  // ==========================================================

  swipeJob: (jobId, action) => {
    if (
      !["RIGHT", "LEFT"].includes(action)
    ) {
      return Promise.reject(
        new Error(
          "Action must be RIGHT or LEFT"
        )
      );
    }

    return jobApi
      .post(`/jobs/${jobId}/swipe`, {
        action,
      })
      .then(
        (response) => response.data
      );
  },

  // ==========================================================
  // SWIPE HISTORY
  // ==========================================================

  getSwipeHistory: () =>
    jobApi
      .get("/jobs/swipes")
      .then(
        (response) => response.data
      ),

  // ==========================================================
  // SAVE JOB
  // ==========================================================

  saveJob: (jobId) =>
    jobApi
      .post(`/jobs/${jobId}/save`)
      .then(
        (response) => response.data
      ),

  // ==========================================================
  // REMOVE SAVED JOB
  // ==========================================================

  unsaveJob: (jobId) =>
    jobApi
      .delete(`/jobs/${jobId}/save`)
      .then(
        (response) => response.data
      ),

  // ==========================================================
  // GET SAVED JOBS
  //
  // Backend returns:
  //
  // {
  //   success: true,
  //   count: 2,
  //   saved_jobs: [...]
  // }
  //
  // The backend determines the user from JWT.
  // ==========================================================

  getSavedJobs: () =>
    jobApi
      .get("/jobs/saved")
      .then((response) => ({
        ...response.data,

        saved_jobs: (
          response.data.saved_jobs || []
        )
          .map((item) => ({
            ...item,

            job: item.job
              ? normalizeJob(item.job)
              : null,
          }))
          .filter(
            (item) => item.job
          ),
      })),

  // ==========================================================
  // APPLY TO JOB
  // ==========================================================

  applyJob: (
    jobId,
    resumeId = null
  ) =>
    jobApi
      .post(`/jobs/${jobId}/apply`, {
        resume_id: resumeId,
      })
      .then(
        (response) => response.data
      ),

  // ==========================================================
  // GET APPLICATIONS
  //
  // Backend filters by JWT user_id.
  // ==========================================================

  getApplications: () =>
  jobApi.get("/jobs/applications").then((response) => ({
    ...response.data,

    applications: (response.data.applications || []).map(
      (application) => {
        const job = application.job || {};

        return {
          ...application,

          // IDs
          jobId:
            application.jobId ??
            application.job_id,

          // Job details
          title:
            application.title ??
            job.title ??
            "Job Title Unavailable",

          company:
            application.company ??
            job.company ??
            "Company Unavailable",

          logo:
            application.logo ??
            job.logo ??
            null,

          location:
            application.location ??
            job.location ??
            "Location unavailable",

          salary:
            application.salary ??
            job.salary ??
            "Salary not specified",

          description:
            application.description ??
            job.description ??
            "",

          skills:
            application.skills ??
            job.skills ??
            "",

          // Application information
          status:
            application.status ??
            "Applied",

          appliedDate:
            application.appliedDate ??
            application.applied_at,

          lastUpdated:
            application.lastUpdated ??
            "Recently updated",

          matchPercentage:
            application.matchPercentage ??
            job.matchPercentage ??
            null,

          notes:
            application.notes ??
            "Applied via SwipeX One-Click Application.",

          // Keep the complete backend job too
          job,
        };
      }
    ),
  })),

  // ==========================================================
  // CREATE JOB
  // Recruiter only
  // ==========================================================

  createJob: (payload) =>
    jobApi
      .post("/jobs/", payload)
      .then(
        (response) => response.data
      ),

  // ==========================================================
  // DELETE JOB
  // Recruiter only
  // ==========================================================

  deleteJob: (jobId) =>
    jobApi
      .delete(`/jobs/${jobId}`)
      .then(
        (response) => response.data
      ),
};

export default jobService;