/**
 * Real Job & Swipe Service Client
 * Directly interacts with Intern 2's Job & Swipe API endpoints.
 * 
 * Endpoints:
 * - GET  /api/v1/jobs (supports query filters)
 * - GET  /api/v1/jobs/:id
 * - POST /api/v1/swipes { job_id, direction }
 * - GET  /api/v1/swipes/history
 */

import api from './api.js';

export const realJobService = {
  /**
   * Fetch job listings from live backend with query filters
   * @param {Object} [filters]
   */
  async listJobs(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All' && value !== 'Any') {
        if (key === 'remote') {
          if (value === 'Remote' || value === true || value === 'true') {
            queryParams.append('remote', 'true');
          } else if (value === 'On-site' || value === false || value === 'false') {
            queryParams.append('remote', 'false');
          }
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    return api.get(endpoint);
  },

  /**
   * Fetch details for a specific job
   * @param {string|number} jobId
   */
  async getJobDetail(jobId) {
    return api.get(`/jobs/${jobId}`);
  },

  /**
   * Record a user swipe action (right = apply/save, left = skip)
   * @param {{ job_id: string|number, direction: 'right' | 'left' }} payload
   */
  async recordSwipe(payload) {
    const numericJobId = Number(payload.job_id);
    const body = {
      job_id: isNaN(numericJobId) ? payload.job_id : numericJobId,
      direction: payload.direction,
    };
    return api.post('/swipes', body);
  },

  /**
   * Fetch user swipe history
   */
  async getSwipeHistory() {
    return api.get('/swipes/history');
  },
};

export default realJobService;
