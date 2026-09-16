import axios from "axios";

const AI_API_URL =
  import.meta.env.VITE_AI_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

const aiApi = axios.create({
  baseURL: AI_API_URL,
  timeout: 30000,
});

aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("swipex_access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const aiService = {
  // ============================================================
  // RESUME
  // ============================================================

  uploadResume: async (file, userId) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await aiApi.post(
      "/resume/upload",
      formData,
      {
        params: userId ? { user_id: userId } : undefined,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  getResume: async () => {
    const response = await aiApi.get("/resume");

    return response.data;
  },

  // Job-agnostic heuristic resume analysis (no job_id required)
  getResumeAnalysis: async (resumeId) => {
    const response = await aiApi.get(`/resume/${resumeId}/analysis`);

    return response.data;
  },

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  getRecommendations: async (userId, resumeId) => {
    if (!userId) {
      throw new Error("getRecommendations requires a user_id.");
    }

    const response = await aiApi.get("/recommendations", {
      params: {
        user_id: userId,
        ...(resumeId ? { resume_id: resumeId } : {}),
      },
    });

    return response.data;
  },

  // ============================================================
  // ATS SCORE FOR A SPECIFIC JOB
  // ============================================================

  getJobAtsScore: async (resumeId, jobId) => {
    const response = await aiApi.get(
      `/resume/${resumeId}/ats-score`,
      {
        params: {
          job_id: jobId,
        },
      }
    );

    return response.data;
  },
};

export default aiService;

// import axios from "axios";

// const AI_API_URL =
//   import.meta.env.VITE_AI_API_BASE_URL ||
//   "http://127.0.0.1:8000/api/v1";

// const aiApi = axios.create({
//   baseURL: AI_API_URL,
//   timeout: 30000,
// });

// aiApi.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("swipex_access_token");

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export const aiService = {
//   // ============================================================
//   // RESUME
//   // ============================================================

//   uploadResume: async (file) => {
//     const formData = new FormData();

//     formData.append("file", file);

//     const response = await aiApi.post(
//       "/resume/upload",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     return response.data;
//   },

//   getResume: async () => {
//     const response = await aiApi.get("/resume");

//     return response.data;
//   },

//   // ============================================================
//   // RECOMMENDATIONS
//   // ============================================================

//   getRecommendations: async () => {
//     const response = await aiApi.get("/recommendations");

//     return response.data;
//   },

//   // ============================================================
//   // ATS SCORE FOR A SPECIFIC JOB
//   // ============================================================

//   getJobAtsScore: async (resumeId, jobId) => {
//     const response = await aiApi.get(
//       `/resume/${resumeId}/ats-score`,
//       {
//         params: {
//           job_id: jobId,
//         },
//       }
//     );

//     return response.data;
//   },

//   getResumeAnalysis: async (resumeId) => {
//   const response = await aiApi.get(`/resume/${resumeId}/analysis`);
//   return response.data;
// },
// };

// export default aiService;