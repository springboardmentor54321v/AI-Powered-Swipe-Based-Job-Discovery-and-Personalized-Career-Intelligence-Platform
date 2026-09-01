/**
 * SwipeX Frontend Data & API Requirements Specification
 * Intern 4 — Frontend & User Experience
 * Milestone 1 • Day 1 Deliverable
 * 
 * This file formalizes the contract mappings between frontend wireframe screens
 * and the backend API endpoints owned by Intern 1, Intern 2, and Intern 3.
 * 
 * NOTE: These definitions establish data shapes only. Actual HTTP clients and 
 * API integration are scheduled for Day 2 (Client setup) and Day 3-5 (Service integration).
 */

export const API_CONTRACTS = {
  // Owned by Intern 1 (Team Lead / Backend & Identity Management)
  auth: {
    register: {
      method: "POST",
      endpoint: "/api/v1/auth/register",
      consumedBy: "RegisterWireframe",
      requestShape: {
        name: "string",
        email: "string",
        password: "string",
        role: "'job_seeker' | 'recruiter' | 'admin'"
      },
      responseShape: {
        status: 201,
        body: { user_id: "string" }
      }
    },
    login: {
      method: "POST",
      endpoint: "/api/v1/auth/login",
      consumedBy: "LoginWireframe",
      requestShape: {
        email: "string",
        password: "string"
      },
      responseShape: {
        status: 200,
        body: {
          access_token: "string (JWT)",
          refresh_token: "string (JWT)",
          role: "'job_seeker' | 'recruiter' | 'admin'"
        }
      }
    },
    googleOAuth: {
      method: "GET",
      endpoint: "/api/v1/auth/oauth/google",
      consumedBy: "LoginWireframe",
      responseShape: {
        status: 200,
        body: {
          access_token: "string (JWT)",
          role: "string"
        }
      }
    },
    refreshToken: {
      method: "POST",
      endpoint: "/api/v1/auth/refresh",
      consumedBy: "Auth Interceptor (Day 2-3)",
      requestShape: { refresh_token: "string" },
      responseShape: { status: 200, body: { access_token: "string" } }
    },
    getCurrentUser: {
      method: "GET",
      endpoint: "/api/v1/auth/me",
      consumedBy: "DashboardWireframe, ProfileWireframe, AppLayout",
      headers: { Authorization: "Bearer <access_token>" },
      responseShape: {
        status: 200,
        body: {
          user_id: "string",
          name: "string",
          role: "'job_seeker' | 'recruiter' | 'admin'"
        }
      }
    }
  },

  // Owned by Intern 2 (Job & Data Intelligence)
  jobs: {
    listJobs: {
      method: "GET",
      endpoint: "/api/v1/jobs",
      consumedBy: "SwipeDiscoveryWireframe",
      queryParams: {
        type: "string (e.g. 'MNC', 'Startup', 'Early-stage')",
        location: "string",
        remote: "string (e.g. 'Remote', 'Hybrid', 'Onsite')",
        salary_min: "number",
        salary_max: "number",
        skills: "string (comma-separated)"
      },
      responseShape: {
        status: 200,
        body: [
          {
            job_id: "string",
            title: "string",
            company: "string",
            type: "string",
            location: "string",
            salary_range: "string",
            skills: ["string"],
            posted_at: "string"
          }
        ]
      }
    },
    getJobDetail: {
      method: "GET",
      endpoint: "/api/v1/jobs/{job_id}",
      consumedBy: "Job Detail Modal (Day 4)",
      responseShape: {
        status: 200,
        body: {
          job_id: "string",
          title: "string",
          company: "string",
          type: "string",
          location: "string",
          salary_range: "string",
          skills: ["string"],
          posted_at: "string",
          description: "string"
        }
      }
    },
    recordSwipe: {
      method: "POST",
      endpoint: "/api/v1/swipes",
      consumedBy: "SwipeDiscoveryWireframe",
      requestShape: {
        job_id: "string",
        direction: "'right' (apply/save) | 'left' (skip)"
      },
      responseShape: {
        status: 201,
        body: { swipe_id: "string" }
      }
    },
    getSwipeHistory: {
      method: "GET",
      endpoint: "/api/v1/swipes/history",
      consumedBy: "DashboardWireframe",
      responseShape: {
        status: 200,
        body: [
          {
            job_id: "string",
            direction: "'right' | 'left'",
            swiped_at: "string (ISO timestamp)"
          }
        ]
      }
    }
  },

  // Owned by Intern 3 (AI/ML Career Intelligence)
  careerIntelligence: {
    uploadResume: {
      method: "POST",
      endpoint: "/api/v1/resume/upload",
      consumedBy: "ResumeUploadWireframe",
      contentType: "multipart/form-data",
      requestShape: "file (PDF/DOCX)",
      responseShape: {
        status: 201,
        body: {
          resume_id: "string",
          parsed_skills: ["string"]
        }
      }
    },
    getAtsScore: {
      method: "GET",
      endpoint: "/api/v1/resume/{resume_id}/ats-score",
      queryParams: { job_id: "string" },
      consumedBy: "DashboardWireframe",
      responseShape: {
        status: 200,
        body: {
          match_score: "number (0-100)",
          missing_keywords: ["string"],
          generated_by: "'heuristic-v0'"
        }
      }
    },
    getRecommendations: {
      method: "GET",
      endpoint: "/api/v1/recommendations",
      queryParams: { user_id: "string" },
      consumedBy: "DashboardWireframe",
      responseShape: {
        status: 200,
        body: [
          {
            job_id: "string",
            match_percentage: "number",
            generated_by: "'heuristic-v0'"
          }
        ]
      }
    }
  }
};
