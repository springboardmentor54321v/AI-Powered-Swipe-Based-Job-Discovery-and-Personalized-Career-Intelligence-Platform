/**
 * Real Job & Swipe Service Client (Milestone 2 - Day 4)
 * Directly interacts with Intern 2/3 Job & Swipe API endpoints:
 * - GET  /api/v1/jobs (supports query filters)
 * - GET  /api/v1/jobs/search (live search with query parameters)
 * - GET  /api/v1/jobs/:id
 * - POST /api/v1/swipes { job_id, direction }
 * - GET  /api/v1/swipes/history
 */

import api from './api.js';

export const realJobService = {
  /**
   * Helper to build URLSearchParams from filter criteria
   */
  _buildQueryParams(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All' && value !== 'Any') {
        if (key === 'remote' || key === 'is_remote') {
          if (value === 'Remote' || value === true || value === 'true') {
            queryParams.append('remote', 'true');
            queryParams.append('is_remote', 'true');
          } else if (value === 'On-site' || value === false || value === 'false') {
            queryParams.append('remote', 'false');
            queryParams.append('is_remote', 'false');
          }
        } else if (key === 'company_type' || key === 'type') {
          queryParams.append('company_type', String(value));
        } else if (key === 'salary_min' || key === 'salary') {
          queryParams.append('salary_min', String(value));
        } else if (key === 'search' || key === 'q' || key === 'keyword') {
          queryParams.append('search', String(value));
          queryParams.append('q', String(value));
          queryParams.append('keyword', String(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return queryParams.toString();
  },

  /**
   * Fetch job listings from live backend with query filters
   * @param {Object} [filters]
   */
  async listJobs(filters = {}) {
    const queryString = this._buildQueryParams(filters);
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    return api.get(endpoint);
  },

  /**
   * Search jobs from live GET /api/v1/jobs/search or fallback to filtered GET /api/v1/jobs
   * @param {Object} [filters]
   */
  async searchJobs(filters = {}) {
    const queryString = this._buildQueryParams(filters);
    const searchEndpoint = queryString ? `/jobs/search?${queryString}` : '/jobs/search';
    
    try {
      return await api.get(searchEndpoint);
    } catch {
      // If /jobs/search is not yet exposed by backend, fallback to standard /jobs with query params
      const fallbackEndpoint = queryString ? `/jobs?${queryString}` : '/jobs';
      return api.get(fallbackEndpoint);
    }
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
   * @param {{ job_id: string|number, direction: 'right' | 'left', action?: string }} payload
   */
  async recordSwipe(payload) {
    const numericJobId = Number(payload.job_id);
    const direction = payload.direction || (payload.action === 'skip' ? 'left' : 'right');
    const action = payload.action || (direction === 'right' ? 'apply' : 'skip');

    const body = {
      job_id: isNaN(numericJobId) ? payload.job_id : numericJobId,
      direction: direction,
      action: action,
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
