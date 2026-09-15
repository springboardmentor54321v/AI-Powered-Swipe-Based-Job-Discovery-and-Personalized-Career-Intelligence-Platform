/**
 * Development-Only Mock Job & Swipe Service Adapter for Milestone 2
 * 
 * Supports all M2 search, filters, undo actions, and interaction history.
 */

import { MOCK_JOBS } from '../data/mockJobs.js';

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// Session swipe history
const localSwipeRecords = [
  { swipe_id: 'swp_101', job_id: 1, direction: 'right', job_title: 'Senior Full Stack Engineer', company: 'NovaTech Labs', swiped_at: new Date(Date.now() - 3600000).toISOString() },
  { swipe_id: 'swp_102', job_id: 2, direction: 'right', job_title: 'Frontend Architect', company: 'AeroStack Systems', swiped_at: new Date(Date.now() - 7200000).toISOString() },
];

export const mockJobService = {
  /**
   * Fetch and filter jobs from local development dataset supporting all M2 criteria
   */
  async listJobs(filters = {}) {
    await delay(120);

    const {
      type,
      company_type,
      location,
      remote,
      salary_min,
      skills,
      search,
      experience_level,
      fresher_friendly,
      low_competition,
      recently_posted,
    } = filters;

    return MOCK_JOBS.filter((job) => {
      // Company Type (MNC / Startup / Newly Founded)
      const targetType = company_type || type;
      if (targetType && targetType !== 'All') {
        const jType = (job.company_type || job.type || '').toLowerCase();
        const tType = targetType.toLowerCase();
        if (tType === 'mnc' && jType !== 'mnc') return false;
        if (tType === 'startup' && jType !== 'startup') return false;
        if (tType === 'newly founded' && jType !== 'newly founded') return false;
      }

      // Keyword / Title / Company Search
      if (search && search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkills = (job.skills || []).some((s) => s.toLowerCase().includes(query));
        const matchesDesc = (job.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc) return false;
      }

      // Location Filter
      if (location && location.trim()) {
        if (!job.location.toLowerCase().includes(location.toLowerCase().trim())) {
          return false;
        }
      }

      // Workplace Mode (Remote / Hybrid / On-site)
      if (remote && remote !== 'Any') {
        const rMode = (job.workplace_mode || (job.remote ? 'Remote' : 'On-site')).toLowerCase();
        if (rMode !== remote.toLowerCase()) {
          return false;
        }
      }

      // Salary minimum
      if (salary_min && salary_min !== 'Any') {
        const minVal = parseInt(salary_min, 10);
        if (!isNaN(minVal) && job.salary_min && job.salary_min < minVal) {
          return false;
        }
      }

      // Experience Level
      if (experience_level && experience_level !== 'All' && experience_level !== 'Any') {
        const exp = (job.experience_level || '').toLowerCase();
        const reqExp = experience_level.toLowerCase();
        if (reqExp.includes('fresher') || reqExp.includes('entry')) {
          if (!exp.includes('fresher') && !exp.includes('entry')) return false;
        } else if (reqExp.includes('mid')) {
          if (!exp.includes('mid')) return false;
        } else if (reqExp.includes('senior') || reqExp.includes('lead')) {
          if (!exp.includes('senior') && !exp.includes('lead')) return false;
        }
      }

      // Advanced M2 Chips
      if (fresher_friendly) {
        const exp = (job.experience_level || '').toLowerCase();
        if (!exp.includes('fresher') && !exp.includes('entry')) return false;
      }

      if (low_competition) {
        if ((job.applicant_count || 0) > 20 || (job.competition_level && job.competition_level.toLowerCase() !== 'low')) {
          return false;
        }
      }

      if (recently_posted) {
        const fresh = (job.freshness || '').toLowerCase();
        const posted = (job.posted_at || '').toLowerCase();
        if (!fresh.includes('fresh') && !posted.includes('hour') && !posted.includes('1 day')) {
          return false;
        }
      }

      // Skills Filter
      if (skills && skills.trim()) {
        const skillQuery = skills.toLowerCase().trim();
        const matchesSkills = (job.skills || []).some((s) => s.toLowerCase().includes(skillQuery));
        if (!matchesSkills) return false;
      }

      return true;
    });
  },

  /**
   * Fetch a single job detail
   */
  async getJobDetail(jobId) {
    await delay(100);
    return MOCK_JOBS.find((j) => String(j.id) === String(jobId) || String(j.job_id) === String(jobId)) || null;
  },

  /**
   * Record swipe action (right = apply/save, left = skip)
   * @param {{ job_id: string|number, direction: 'right' | 'left' }} payload
   */
  async recordSwipe(payload) {
    await delay(120);

    if (!payload?.job_id || !payload?.direction) {
      throw new Error('Invalid swipe payload: job_id and direction are required');
    }

    const matchingJob = MOCK_JOBS.find(
      (j) => String(j.id) === String(payload.job_id) || String(j.job_id) === String(payload.job_id)
    );

    const record = {
      swipe_id: `swp_${Math.floor(10000 + Math.random() * 90000)}`,
      job_id: Number(payload.job_id) || payload.job_id,
      direction: payload.direction,
      job_title: matchingJob?.title || `Job #${payload.job_id}`,
      company: matchingJob?.company || 'Enterprise Partner',
      swiped_at: new Date().toISOString(),
    };

    localSwipeRecords.unshift(record);

    return record;
  },

  /**
   * Undo the last recorded swipe action
   */
  async undoSwipe() {
    await delay(100);
    if (localSwipeRecords.length > 0) {
      return localSwipeRecords.shift();
    }
    return null;
  },

  /**
   * Fetch swipe interaction history
   */
  async getSwipeHistory() {
    await delay(100);
    return [...localSwipeRecords];
  },
};

export default mockJobService;
