import axios from "axios";

const JOB_API_URL =
  import.meta.env.VITE_JOB_API_BASE_URL ||
  "http://127.0.0.1:5002/api/v1";


// ============================================================
// AXIOS INSTANCE
// ============================================================

const jobApi = axios.create({
  baseURL: JOB_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// JWT INTERCEPTOR
// ============================================================

jobApi.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "swipex_access_token"
      );

    if (token) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);


// ============================================================
// JOB SERVICE
// ============================================================

export const jobService = {


  // ==========================================================
  // DISCOVERY
  // ==========================================================

  getJobs: async (params = {}) => {

    const response =
      await jobApi.get(
        "/jobs/",
        {
          params,
        }
      );

    return response.data;
  },


  // ==========================================================
  // SINGLE JOB
  // ==========================================================

  getJob: async (jobId) => {

    const response =
      await jobApi.get(
        `/jobs/${jobId}`
      );

    return response.data;
  },


  // ==========================================================
  // RECRUITER JOBS
  // ==========================================================

  getRecruiterJobs: async () => {

    const response =
      await jobApi.get(
        "/jobs/my-jobs"
      );

    return response.data;
  },


  createJob: async (jobData) => {

    const response =
      await jobApi.post(
        "/jobs/",
        jobData
      );

    return response.data;
  },


  deleteJob: async (jobId) => {

    const response =
      await jobApi.delete(
        `/jobs/${jobId}`
      );

    return response.data;
  },


  // ==========================================================
  // SWIPES
  // ==========================================================

  /*
    LEFT  = SKIP
    RIGHT = APPLY

    RIGHT creates:

      swipes
          RIGHT

      applications
          Applied
  */

  swipeJob: async (
    jobId,
    action
  ) => {

    if (
      !["LEFT", "RIGHT"].includes(
        action
      )
    ) {

      throw new Error(
        "Action must be RIGHT or LEFT"
      );
    }

    const response =
      await jobApi.post(
        `/jobs/${jobId}/swipe`,
        {
          action,
        }
      );

    return response.data;
  },


  getSwipeHistory: async () => {

    const response =
      await jobApi.get(
        "/jobs/swipes"
      );

    return response.data;
  },


  // ==========================================================
  // SAVED JOBS
  // ==========================================================

  /*
    SAVE is completely separate.

    SAVE:
      saved_jobs

    Does NOT create:
      swipe
      application
  */

  saveJob: async (jobId) => {

    const response =
      await jobApi.post(
        `/jobs/${jobId}/save`
      );

    return response.data;
  },


  unsaveJob: async (jobId) => {

    const response =
      await jobApi.delete(
        `/jobs/${jobId}/save`
      );

    return response.data;
  },


  getSavedJobs: async () => {

    const response =
      await jobApi.get(
        "/jobs/saved"
      );

    return response.data;
  },


  // ==========================================================
  // APPLICATIONS
  // ==========================================================

  applyJob: async (
    jobId,
    data = {}
  ) => {

    const response =
      await jobApi.post(
        `/jobs/${jobId}/apply`,
        data
      );

    return response.data;
  },


  getApplications: async () => {

    const response =
      await jobApi.get(
        "/jobs/applications"
      );

    return response.data;
  },


  // ==========================================================
  // RECRUITER APPLICANTS
  // ==========================================================

  getApplicants: async () => {

    const response =
      await jobApi.get(
        "/jobs/applicants"
      );

    return response.data;
  },


  getJobApplicants: async (
    jobId
  ) => {

    const response =
      await jobApi.get(
        `/jobs/${jobId}/applicants`
      );

    return response.data;
  },


  updateApplicationStatus: async (
    applicationId,
    status
  ) => {

    const response =
      await jobApi.patch(
        `/jobs/applications/${applicationId}`,
        {
          status,
        }
      );

    return response.data;
  },
  // ==========================================================
// COMPANIES
// ==========================================================

getCompanies: async (params = {}) => {
  const response = await jobApi.get(
    "/companies/",
    {
      params,
    }
  );

  return response.data;
},

getCompany: async (companyId) => {
  const response = await jobApi.get(
    `/companies/${companyId}`
  );

  return response.data;
},

};


export default jobService;