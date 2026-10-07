/**
 * SwipeX Analytics & Career Intelligence Service (Milestone 4)
 *
 * Interacts with the backend Analytics Service API.
 * Uses the existing centralized API client (api.js).
 */

import api, { ApiError } from './api';

export const analyticsService = {
  /**
   * Fetch candidate analytics: application funnel, resume performance, and skill gaps.
   * @returns {Promise<Object>} Seeker analytics payload
   */
  async getSeekerAnalytics() {
    try {
      const res = await api.get('/analytics/seeker/resume-performance');
      return res || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load candidate analytics', 0, null);
    }
  },

  /**
   * Fetch recruiter job funnel analytics.
   * @param {string|number} [jobId] - Optional job ID to filter funnel
   * @returns {Promise<Object>} Recruiter funnel payload
   */
  async getRecruiterAnalytics(jobId) {
    try {
      const query = jobId ? `?job_id=${encodeURIComponent(jobId)}` : '';
      const res = await api.get(`/analytics/recruiter/job-funnel${query}`);
      return res || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load recruiter funnel analytics', 0, null);
    }
  },

  /**
   * Fetch admin platform-wide hiring trends, in-demand skills, and activity metrics.
   * @returns {Promise<Object>} Admin trends payload
   */
  async getAdminAnalytics() {
    try {
      const res = await api.get('/analytics/admin/hiring-trends');
      return res || null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load admin platform trends', 0, null);
    }
  },
};

export default analyticsService;
