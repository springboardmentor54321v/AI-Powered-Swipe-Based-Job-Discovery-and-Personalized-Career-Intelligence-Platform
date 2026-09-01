/**
 * SwipeX Job & Swipe Service
 * 
 * Central job service orchestrator that delegates to either Real API
 * or Local Mock adapter based on environment configuration.
 */

import realJobService from './realJobService.js';
import mockJobService from './mockJobService.js';

// Check if development mock mode is enabled (defaulting to true if unspecified in dev)
const isMockMode = typeof import.meta !== 'undefined' 
  ? (import.meta.env?.VITE_USE_JOBS_MOCK === 'true' || import.meta.env?.VITE_USE_JOBS_MOCK === true || import.meta.env?.VITE_USE_JOBS_MOCK === undefined)
  : true;

const adapter = isMockMode ? mockJobService : realJobService;

export const jobService = {
  /**
   * Check if running in mock mode
   */
  isMockMode() {
    return isMockMode;
  },

  /**
   * Fetch job listings with optional query filters
   * @param {Object} [filters]
   */
  async listJobs(filters = {}) {
    return adapter.listJobs(filters);
  },

  /**
   * Fetch details for a specific job
   * @param {string} jobId
   */
  async getJobDetail(jobId) {
    return adapter.getJobDetail(jobId);
  },

  /**
   * Record a user swipe action (right = apply/save, left = skip)
   * @param {{ job_id: string, direction: 'right' | 'left' }} payload
   */
  async recordSwipe(payload) {
    return adapter.recordSwipe(payload);
  },

  /**
   * Fetch swipe interaction history
   */
  async getSwipeHistory() {
    return adapter.getSwipeHistory();
  },
};

export default jobService;
