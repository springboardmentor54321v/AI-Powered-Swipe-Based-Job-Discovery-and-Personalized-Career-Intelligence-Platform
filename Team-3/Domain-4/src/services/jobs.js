/**
 * SwipeX Job & Swipe Service (Milestone 2 - Day 3 Live Integration)
 * 
 * Orchestrates live API communication with Intern 2's backend services:
 * - GET  /api/v1/jobs
 * - GET  /api/v1/jobs/:id
 * - POST /api/v1/swipes
 * - GET  /api/v1/swipes/history
 * 
 * Includes robust normalization and offline development fallback.
 */

import realJobService from './realJobService.js';
import mockJobService from './mockJobService.js';

// Respect explicit environment override; default to real API in M2 Day 3
const explicitMock = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USE_JOBS_MOCK : undefined;
const useMock = explicitMock === 'true' || explicitMock === true;

/**
 * Normalize job object from either live backend or mock dataset into standard format
 */
export function normalizeJob(raw) {
  if (!raw) return null;

  const id = raw.job_id || raw.id;
  const skills = Array.isArray(raw.skills) 
    ? raw.skills 
    : typeof raw.skills === 'string' && raw.skills.includes('|')
    ? raw.skills.split('|').map((s) => s.trim()).filter(Boolean)
    : typeof raw.skills === 'string' && raw.skills.includes(',')
    ? raw.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : raw.skills ? [raw.skills] : [];

  return {
    id: id,
    job_id: id,
    title: raw.title || 'Untitled Position',
    company: raw.company || 'Enterprise Employer',
    company_type: raw.company_type || raw.type || 'Company',
    type: raw.company_type || raw.type || 'Company',
    location: raw.location || 'Remote / Flexible',
    remote: raw.remote !== undefined ? raw.remote : Boolean(raw.is_remote),
    is_remote: raw.remote !== undefined ? raw.remote : Boolean(raw.is_remote),
    workplace_mode: raw.workplace_mode || (raw.remote ? 'Remote' : 'On-site'),
    salary_range: raw.salary_range || { min: raw.salary_min || null, max: raw.salary_max || null },
    salary: raw.salary || undefined,
    skills: skills,
    posted_at: raw.posted_at || 'Recently posted',
    experience_level: raw.experience_level || 'All Experience Levels',
    applicant_count: raw.applicant_count !== undefined ? raw.applicant_count : 0,
    competition_level: raw.competition_level || ((raw.applicant_count || 0) < 20 ? 'Low' : (raw.applicant_count || 0) < 50 ? 'Medium' : 'High'),
    description: raw.description || '',
    industry: raw.industry || '',
  };
}

export const jobService = {
  /**
   * Check if mock mode is forced
   */
  isMockMode() {
    return useMock;
  },

  /**
   * Fetch job listings from live GET /api/v1/jobs (with query filters)
   * @param {Object} [filters]
   */
  async listJobs(filters = {}) {
    if (useMock) {
      const data = await mockJobService.listJobs(filters);
      return (Array.isArray(data) ? data : []).map(normalizeJob);
    }

    try {
      const liveData = await realJobService.listJobs(filters);
      if (Array.isArray(liveData)) {
        return liveData.map(normalizeJob);
      }
      return [];
    } catch (err) {
      // If live backend is unreachable during dev, fall back to mock data
      console.warn('Live Job Service unreachable, using fallback dataset:', err.message);
      const fallbackData = await mockJobService.listJobs(filters);
      return (Array.isArray(fallbackData) ? fallbackData : []).map(normalizeJob);
    }
  },

  /**
   * Search jobs from live GET /api/v1/jobs/search (with query filters)
   * @param {Object} [filters]
   */
  async searchJobs(filters = {}) {
    if (useMock) {
      const data = await mockJobService.listJobs(filters);
      return (Array.isArray(data) ? data : []).map(normalizeJob);
    }

    try {
      const liveData = await realJobService.searchJobs(filters);
      if (Array.isArray(liveData)) {
        return liveData.map(normalizeJob);
      }
      return [];
    } catch (err) {
      console.warn('Live Job Search unreachable, using fallback search:', err.message);
      const fallbackData = await mockJobService.listJobs(filters);
      return (Array.isArray(fallbackData) ? fallbackData : []).map(normalizeJob);
    }
  },

  /**
   * Fetch details for a specific job from live GET /api/v1/jobs/:id
   * @param {string|number} jobId
   */
  async getJobDetail(jobId) {
    if (useMock) {
      const data = await mockJobService.getJobDetail(jobId);
      return normalizeJob(data);
    }

    try {
      const liveData = await realJobService.getJobDetail(jobId);
      return normalizeJob(liveData);
    } catch {
      const fallback = await mockJobService.getJobDetail(jobId);
      return normalizeJob(fallback);
    }
  },

  /**
   * Record a user swipe action via live POST /api/v1/swipes
   * @param {{ job_id: string|number, direction: 'right' | 'left' }} payload
   */
  async recordSwipe(payload) {
    if (useMock) {
      return mockJobService.recordSwipe(payload);
    }

    try {
      return await realJobService.recordSwipe(payload);
    } catch (err) {
      console.warn('Live Swipe API failed, recording locally:', err.message);
      return mockJobService.recordSwipe(payload);
    }
  },

  /**
   * Frontend-level undo for last swipe (frontend state restoration)
   */
  async undoSwipe() {
    return mockJobService.undoSwipe();
  },

  /**
   * Fetch user swipe history from live GET /api/v1/swipes/history
   */
  async getSwipeHistory() {
    if (useMock) {
      return mockJobService.getSwipeHistory();
    }

    try {
      const liveHistory = await realJobService.getSwipeHistory();
      if (Array.isArray(liveHistory)) return liveHistory;
      return [];
    } catch {
      return mockJobService.getSwipeHistory();
    }
  },
};

export default jobService;
