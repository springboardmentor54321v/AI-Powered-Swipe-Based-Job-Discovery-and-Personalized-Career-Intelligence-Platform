import axios from "axios";

const RESUME_API_URL =
  import.meta.env.VITE_RESUME_API_BASE_URL ||
  "http://127.0.0.1:5003/api/v1/resumes";

const resumeApi = axios.create({
  baseURL: RESUME_API_URL,
});

resumeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "swipex_access_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);


export const resumeService = {

  analyzeResume: async (file) => {

    const formData =
      new FormData();

    formData.append(
      "resume",
      file
    );

    const response =
      await resumeApi.post(
        "/analyze",
        formData
      );

    return response.data;
  },


  getResume: async () => {

    const response =
      await resumeApi.get("/");

    return response.data;
  },


  getAnalysis: async () => {

    const response =
      await resumeApi.get(
        "/analysis"
      );

    return response.data;
  },


  getAtsResult: async (
    resumeId
  ) => {

    const response =
      await resumeApi.get(
        `/${resumeId}/ats`
      );

    return response.data;
  },

};


export default resumeService;


// import axios from "axios";

// const RESUME_API_URL =
//   import.meta.env.VITE_RESUME_API_BASE_URL ||
//   "http://127.0.0.1:5003/api/v1/resumes";

// const resumeApi = axios.create({
//   baseURL: RESUME_API_URL,
// });

// resumeApi.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem(
//       "swipex_access_token"
//     );

//     if (token) {
//       config.headers.Authorization =
//         `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export const resumeService = {
//   // ============================================================
//   // UPLOAD + ANALYZE RESUME
//   // ============================================================

//   analyzeResume: async (file) => {
//     if (!file) {
//       throw new Error("Please select a resume");
//     }

//     const formData = new FormData();

//     formData.append("resume", file);

//     const response = await resumeApi.post(
//       "/analyze",
//       formData
//     );

//     return response.data;
//   },

//   // ============================================================
//   // GET USER'S RESUMES
//   // ============================================================

//   getResume: async () => {
//     const response =
//       await resumeApi.get("/");

//     return response.data;
//   },

//   // ============================================================
//   // GET CURRENT USER'S LATEST ANALYSIS
//   // ============================================================

//   getAnalysis: async () => {
//     const response =
//       await resumeApi.get("/analysis");

//     return response.data;
//   },

//   // ============================================================
//   // GET ATS RESULT FOR SPECIFIC RESUME
//   // ============================================================

//   getAtsResult: async (resumeId) => {
//     const response =
//       await resumeApi.get(
//         `/${resumeId}/ats`
//       );

//     return response.data;
//   },
// };

// export default resumeService;