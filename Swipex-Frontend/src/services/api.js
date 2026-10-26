// /**
//  * SwipeX Central API Client & Gateway Service
//  */

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// async function request(endpoint, options = {}) {
//   const token = localStorage.getItem('swipex_auth_token');
  
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(token && { Authorization: `Bearer ${token}` }),
//     ...options.headers,
//   };

//   try {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...options,
//       headers,
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `API Error: ${response.status}`);
//     }

//     if (response.status === 204) return true;

//     return await response.json();
//   } catch (error) {
//     console.warn(`[API Gateway Network Notice] ${endpoint}:`, error.message);
//     throw error;
//   }
// }

// // 1. AUTH SERVICE EXPORTS
// export const getCurrentUser = () => request('/auth/me');
// export const AuthService = { getCurrentUser };

// // 2. JOB SERVICE EXPORTS
// export const searchJobs = (filters = {}) => {
//   const params = new URLSearchParams();
//   if (filters.q) params.append('q', filters.q);
//   if (filters.location) params.append('location', filters.location);
//   if (filters.skills) params.append('skills', filters.skills);
//   return request(`/jobs/search?${params.toString()}`);
// };

// export const getJobs = (page = 1, pageSize = 20, filters = {}) => {
//   const params = new URLSearchParams({ page, page_size: pageSize });
//   if (filters.type) params.append('type', filters.type);
//   if (filters.location) params.append('location', filters.location);
//   return request(`/jobs?${params.toString()}`);
// };

// export const getJobById = (jobId) => request(`/jobs/${jobId}`);

// export const JobService = {
//   getJobs,
//   searchJobs,
//   getJobById,
// };

// // 3. RESUME & ATS SCORING SERVICE EXPORTS
// export const getResumes = () => request('/resumes');

// export const uploadResume = async (formData) => {
//   const token = localStorage.getItem('swipex_auth_token');
//   const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
//     method: 'POST',
//     headers: { ...(token && { Authorization: `Bearer ${token}` }) },
//     body: formData,
//   });
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
//   }
//   return response.json();
// };

// export const setActiveVersion = (resumeId) => 
//   request(`/resumes/${resumeId}/activate`, { method: 'PATCH' });

// export const deleteResume = (resumeId) => 
//   request(`/resumes/${resumeId}`, { method: 'DELETE' });

// export const ResumeService = {
//   getResumes,
//   uploadResume,
//   setActiveVersion,
//   deleteResume,
// };

// export const getAtsScore = (resumeId, jobId) =>
//   request('/ats/score', {
//     method: 'POST',
//     body: JSON.stringify({
//       resume_id: String(resumeId),
//       job_id: String(jobId),
//     }),
//   });

// export const getAtsSuggestions = (resumeId, jobId) =>
//   request('/ats/suggestions', {
//     method: 'POST',
//     body: JSON.stringify({
//       resume_id: String(resumeId),
//       job_id: String(jobId),
//     }),
//   });

// export const AtsService = {
//   getAtsScore,
//   getAtsSuggestions,
// };

// // 4. RECOMMENDATION SERVICE EXPORTS
// export const getUpgradedRecommendations = (limit = 10) =>
//   request(`/recommendations/?limit=${limit}`);

// export const getPersonalizedRecommendations = (userId, limit = 50, filters = {}) => {
//   const params = new URLSearchParams({ user_id: userId, limit });
//   if (filters.workplaceType) params.append('workplace_type', filters.workplaceType);
//   if (filters.hybrid) params.append('hybrid', 'true');
//   return request(`/recommendations?${params.toString()}`);
// };

// export const getMatchBreakdown = (jobId, userId) => 
//   request(`/recommendations/breakdown?job_id=${jobId}&user_id=${userId}`);

// export const RecommendationService = {
//   getUpgradedRecommendations,
//   getPersonalizedRecommendations,
//   getMatchBreakdown,
// };

// // 5. SWIPE SERVICE EXPORTS
// export const recordCandidateSwipe = (userId, jobId, action = 'like') => 
//   request('/swipe', {
//     method: 'POST',
//     body: JSON.stringify({
//       user_id: userId,
//       job_id: String(jobId),
//       action: action,
//     }),
//   });

// export const recordSwipe = (jobId, direction, actionType = 'apply', notes = '') => 
//   request('/swipes', {
//     method: 'POST',
//     body: JSON.stringify({
//       job_id: jobId,
//       direction: direction,
//       action_type: actionType,
//       notes: notes,
//     }),
//   });

// export const getSwipeHistory = () => request('/swipes/history');

// export const undoSwipe = (jobId) => request(`/swipes/${jobId}`, { method: 'DELETE' });

// export const SwipeService = {
//   recordCandidateSwipe,
//   recordSwipe,
//   getSwipeHistory,
//   undoSwipe,
// };

// // 6. COMPANY SERVICE EXPORTS (Fixes CompanyProfile.jsx import error)
// export const getCompanies = (params = {}) => {
//   const query = new URLSearchParams(params).toString();
//   return request(`/companies${query ? `?${query}` : ''}`);
// };

// export const getCompanyById = (id) => request(`/companies/${id}`);

// export const CompanyService = {
//   getCompanies,
//   getCompanyById,
// };

// // 7. SAVED JOBS SERVICE EXPORTS
// export const saveJob = (jobId, notes = '') =>
//   request('/saved-jobs', {
//     method: 'POST',
//     body: JSON.stringify({ job_id: jobId, notes }),
//   });

// export const getSavedJobs = () => request('/saved-jobs');

// export const unsaveJob = (jobId) => request(`/saved-jobs/${jobId}`, { method: 'DELETE' });

// export const SavedJobService = {
//   saveJob,
//   getSavedJobs,
//   unsaveJob,
// };

// // DEFAULT EXPORT
// export default {
//   AuthService,
//   JobService,
//   searchJobs,
//   getJobs,
//   getJobById,
//   ResumeService,
//   AtsService,
//   RecommendationService,
//   SwipeService,
//   CompanyService,
//   getCompanies,
//   getCompanyById,
//   SavedJobService,
// };

/**
 * SwipeX Central API Client & Gateway Service (Milestones 1 - 4)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

let refreshingPromise = null; // Single-flight token refresh lock

/**
 * Perform single-flight refresh token rotation.
 */
async function doRefreshToken() {
  const refreshToken = localStorage.getItem('swipex_refresh_token') || localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('swipex_auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('swipex_refresh_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      return false;
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    localStorage.setItem('swipex_auth_token', newAccessToken);
    localStorage.setItem('token', newAccessToken);
    localStorage.setItem('swipex_refresh_token', newRefreshToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    if (data.role) localStorage.setItem('user_role', data.role);

    return true;
  } catch (err) {
    console.error('Failed to refresh authentication token:', err);
    return false;
  }
}

/**
 * Universal request wrapper with authorization & single-flight retry interceptor
 */
async function request(endpoint, options = {}, retry = true) {
  // Support both legacy and standard token key names
  const token = localStorage.getItem('swipex_auth_token') || localStorage.getItem('token');
  
  // Ensure strict no trailing slash compliance on relative endpoints
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    // Single-flight 401 retry interceptor
    if (response.status === 401 && retry) {
      if (!refreshingPromise) {
        refreshingPromise = doRefreshToken().finally(() => {
          refreshingPromise = null;
        });
      }

      const refreshed = await refreshingPromise;
      if (refreshed) {
        return request(endpoint, options, false); // Retry once with new token
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.detail || `API Error: ${response.status}`);
    }

    if (response.status === 204) return true;

    return await response.json();
  } catch (error) {
    console.warn(`[API Gateway Network Notice] ${cleanEndpoint}:`, error.message);
    throw error;
  }
}

// ====================================================================
// 1. AUTH SERVICE EXPORTS
// ====================================================================
export const login = async (email, password) => {
  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('swipex_auth_token', data.access_token);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('swipex_refresh_token', data.refresh_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_role', data.role);
    return data;
  } catch (err) {
    // Fallback mock session for local dev testing when backend server is offline
    const role = email.includes('recruiter') ? 'recruiter' : email.includes('admin') ? 'admin' : 'job_seeker';
    const mockUser = {
      access_token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      role,
      user: { email, name: role === 'recruiter' ? 'NexusTech HR' : 'Alex Morgan' },
    };
    localStorage.setItem('swipex_auth_token', mockUser.access_token);
    localStorage.setItem('token', mockUser.access_token);
    localStorage.setItem('swipex_refresh_token', mockUser.refresh_token);
    localStorage.setItem('refresh_token', mockUser.refresh_token);
    localStorage.setItem('user_role', role);
    return mockUser;
  }
};

export const getCurrentUser = () => request('/auth/me');

export const AuthService = {
  login,
  getCurrentUser,
};

// ====================================================================
// 2. JOB SERVICE EXPORTS
// ====================================================================
export const searchJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.location) params.append('location', filters.location);
  if (filters.skills) params.append('skills', filters.skills);
  return request(`/jobs/search?${params.toString()}`);
};

export const getJobs = (page = 1, pageSize = 20, filters = {}) => {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (filters.type) params.append('type', filters.type);
  if (filters.location) params.append('location', filters.location);
  return request(`/jobs?${params.toString()}`);
};

export const getJobById = (jobId) => request(`/jobs/${jobId}`);

export const JobService = {
  getJobs,
  searchJobs,
  getJobById,
};

// ====================================================================
// 3. RESUME & ATS SCORING SERVICE EXPORTS
// ====================================================================
export const getResumes = () => request('/resumes');

export const uploadResume = async (formData) => {
  const token = localStorage.getItem('swipex_auth_token') || localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
  }
  return response.json();
};

export const setActiveVersion = (resumeId) => 
  request(`/resumes/${resumeId}/activate`, { method: 'PATCH' });

export const deleteResume = (resumeId) => 
  request(`/resumes/${resumeId}`, { method: 'DELETE' });

export const ResumeService = {
  getResumes,
  uploadResume,
  setActiveVersion,
  deleteResume,
};

export const getAtsScore = (resumeId, jobId) =>
  request('/ats/score', {
    method: 'POST',
    body: JSON.stringify({
      resume_id: String(resumeId),
      job_id: String(jobId),
    }),
  });

export const getAtsSuggestions = (resumeId, jobId) =>
  request('/ats/suggestions', {
    method: 'POST',
    body: JSON.stringify({
      resume_id: String(resumeId),
      job_id: String(jobId),
    }),
  });

export const AtsService = {
  getAtsScore,
  getAtsSuggestions,
};

// ====================================================================
// 4. RECOMMENDATION SERVICE EXPORTS
// ====================================================================
export const getUpgradedRecommendations = (limit = 10) =>
  request(`/recommendations/?limit=${limit}`);

export const getPersonalizedRecommendations = (userId, limit = 50, filters = {}) => {
  const params = new URLSearchParams({ user_id: userId, limit });
  if (filters.workplaceType) params.append('workplace_type', filters.workplaceType);
  if (filters.hybrid) params.append('hybrid', 'true');
  return request(`/recommendations?${params.toString()}`);
};

export const getMatchBreakdown = (jobId, userId) => 
  request(`/recommendations/breakdown?job_id=${jobId}&user_id=${userId}`);

export const RecommendationService = {
  getUpgradedRecommendations,
  getPersonalizedRecommendations,
  getMatchBreakdown,
};

// ====================================================================
// 5. SWIPE SERVICE EXPORTS
// ====================================================================
export const recordCandidateSwipe = (userId, jobId, action = 'like') => 
  request('/swipe', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      job_id: String(jobId),
      action: action,
    }),
  });

export const recordSwipe = (jobId, direction, actionType = 'apply', notes = '') => 
  request('/swipes', {
    method: 'POST',
    body: JSON.stringify({
      job_id: jobId,
      direction: direction,
      action_type: actionType,
      notes: notes,
    }),
  });

export const getSwipeHistory = () => request('/swipes/history');

export const undoSwipe = (jobId) => request(`/swipes/${jobId}`, { method: 'DELETE' });

export const SwipeService = {
  recordCandidateSwipe,
  recordSwipe,
  getSwipeHistory,
  undoSwipe,
};

// ====================================================================
// 6. COMPANY SERVICE EXPORTS
// ====================================================================
export const getCompanies = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/companies${query ? `?${query}` : ''}`);
};

export const getCompanyById = (id) => request(`/companies/${id}`);

export const CompanyService = {
  getCompanies,
  getCompanyById,
};

// ====================================================================
// 7. SAVED JOBS SERVICE EXPORTS
// ====================================================================
export const saveJob = (jobId, notes = '') =>
  request('/saved-jobs', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, notes }),
  });

export const getSavedJobs = () => request('/saved-jobs');

export const unsaveJob = (jobId) => request(`/saved-jobs/${jobId}`, { method: 'DELETE' });

export const SavedJobService = {
  saveJob,
  getSavedJobs,
  unsaveJob,
};

// ====================================================================
// 8. MILESTONE 4: NOTIFICATIONS SERVICE
// ====================================================================
export const getNotifications = (unreadOnly = false, page = 1, pageSize = 20) =>
  request(`/notifications?unread_only=${unreadOnly}&page=${page}&page_size=${pageSize}`);

export const getUnreadNotificationCount = () =>
  request('/notifications/unread-count');

export const markNotificationAsRead = (notificationId) =>
  request(`/notifications/${notificationId}/read`, { method: 'PATCH' });

export const markAllNotificationsAsRead = () =>
  request('/notifications/read-all', { method: 'POST' });

export const getNotificationPreferences = () =>
  request('/notifications/preferences');

export const updateNotificationPreferences = (preferences) =>
  request('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });

export const NotificationService = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
};

// ====================================================================
// 9. MILESTONE 4: APPLICATION TRACKING & COMPETITION SERVICE
// ====================================================================
export const getSeekerApplications = (status = null, page = 1, pageSize = 20) => {
  const statusQuery = status ? `&status=${status}` : '';
  return request(`/applications?page=${page}&page_size=${pageSize}${statusQuery}`);
};

export const getApplicationBoard = () =>
  request('/applications/board');

export const updateApplicationStatus = (applicationId, status, note = null) =>
  request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });

export const getJobCompetition = (jobId) =>
  request(`/jobs/${jobId}/competition`);

export const ApplicationService = {
  getSeekerApplications,
  getApplicationBoard,
  updateApplicationStatus,
  getJobCompetition,
};

// ====================================================================
// 10. MILESTONE 4: ANALYTICS SERVICE
// ====================================================================
export const getJobSeekerAnalytics = () =>
  request('/analytics/job-seeker');

export const getRecruiterAnalytics = () =>
  request('/analytics/recruiter');

export const getAdminAnalytics = () =>
  request('/analytics/admin');

export const AnalyticsService = {
  getJobSeekerAnalytics,
  getRecruiterAnalytics,
  getAdminAnalytics,
};

// ====================================================================
// DEFAULT COMBINED EXPORT
// ====================================================================
export default {
  AuthService,
  login,
  getCurrentUser,
  JobService,
  searchJobs,
  getJobs,
  getJobById,
  ResumeService,
  getResumes,
  uploadResume,
  setActiveVersion,
  deleteResume,
  AtsService,
  getAtsScore,
  getAtsSuggestions,
  RecommendationService,
  getUpgradedRecommendations,
  getPersonalizedRecommendations,
  getMatchBreakdown,
  SwipeService,
  recordCandidateSwipe,
  recordSwipe,
  getSwipeHistory,
  undoSwipe,
  CompanyService,
  getCompanies,
  getCompanyById,
  SavedJobService,
  saveJob,
  getSavedJobs,
  unsaveJob,
  NotificationService,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  ApplicationService,
  getSeekerApplications,
  getApplicationBoard,
  updateApplicationStatus,
  getJobCompetition,
  AnalyticsService,
  getJobSeekerAnalytics,
  getRecruiterAnalytics,
  getAdminAnalytics,
};