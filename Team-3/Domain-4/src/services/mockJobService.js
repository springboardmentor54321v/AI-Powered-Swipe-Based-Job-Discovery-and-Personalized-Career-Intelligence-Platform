/**
 * Development-Only Mock Job & Swipe Service Adapter
 * 
 * Used for independent frontend testing and demonstration when Intern 2's
 * live Job/Swipe API is unavailable.
 * 
 * NOTE: This mock is strictly for local development and fallback.
 */

import { MOCK_JOBS } from '../data/mockJobs.js';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// Transient local swipe store for session demonstration
const localSwipeRecords = [];

export const mockJobService = {
  /**
   * Fetch and filter jobs from local development dataset
   */
  async listJobs(filters = {}) {
    await delay(300);

    const { type, location, remote, salary, skills, search } = filters;

    return MOCK_JOBS.filter((job) => {
      // Company Type
      if (type && type !== 'All' && job.type.toLowerCase() !== type.toLowerCase()) {
        return false;
      }

      // Keyword / Title / Company Search
      if (search && search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }

      // Location Filter
      if (location && location.trim()) {
        if (!job.location.toLowerCase().includes(location.toLowerCase().trim())) {
          return false;
        }
      }

      // Workplace Mode (Remote / Hybrid / On-site)
      if (remote && remote !== 'Any') {
        if (job.remote.toLowerCase() !== remote.toLowerCase()) {
          return false;
        }
      }

      // Skills Filter
      if (skills && skills.trim()) {
        const skillQuery = skills.toLowerCase().trim();
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(skillQuery));
        if (!matchesSkills) return false;
      }

      return true;
    });
  },

  /**
   * Fetch a single job detail
   */
  async getJobDetail(jobId) {
    await delay(200);
    return MOCK_JOBS.find((j) => j.id === jobId || j.job_id === jobId) || null;
  },

  /**
   * Record swipe action (right = apply/save, left = skip)
   * @param {{ job_id: string, direction: 'right' | 'left' }} payload
   */
  async recordSwipe(payload) {
    await delay(220);

    if (!payload?.job_id || !payload?.direction) {
      throw new Error('Invalid swipe payload: job_id and direction are required');
    }

    // Simulated error case for verification
    if (payload.job_id === 'error_test') {
      throw new Error('Swipe service network timeout');
    }

    const matchingJob = MOCK_JOBS.find((j) => String(j.id) === String(payload.job_id) || String(j.job_id) === String(payload.job_id));

    const record = {
      swipe_id: `swp_${Math.floor(10000 + Math.random() * 90000)}`,
      job_id: payload.job_id,
      direction: payload.direction,
      job_title: matchingJob?.title || `Job #${payload.job_id}`,
      company: matchingJob?.company || 'Innovative Tech',
      swiped_at: new Date().toISOString(),
    };

    localSwipeRecords.push(record);

    return record;
  },

  /**
   * Fetch swipe interaction history
   */
  async getSwipeHistory() {
    await delay(200);
    if (localSwipeRecords.length === 0) {
      // Default sample swipes for initial dashboard visualization in mock mode
      return [
        { swipe_id: 'swp_101', job_id: '1', direction: 'right', job_title: 'Senior Frontend Engineer', company: 'Google Cloud', swiped_at: new Date().toISOString() },
        { swipe_id: 'swp_102', job_id: '2', direction: 'right', job_title: 'AI Full Stack Developer', company: 'DeepScale AI', swiped_at: new Date().toISOString() },
      ];
    }
    return [...localSwipeRecords];
  },
};

export default mockJobService;
