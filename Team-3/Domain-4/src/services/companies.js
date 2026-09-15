/**
 * SwipeX Company Service (Milestone 2 - Day 4)
 * 
 * Orchestrates company listing and detail fetching:
 * - GET /api/v1/companies
 * - GET /api/v1/companies/:id
 * 
 * Provides robust field normalization and dev fallback.
 */

import realCompanyService from './realCompanyService.js';
import mockCompanyService from './mockCompanyService.js';
import { normalizeJob } from './jobs.js';

const explicitMock = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USE_COMPANIES_MOCK : undefined;
const useMock = explicitMock === 'true' || explicitMock === true;

/**
 * Normalize company object to uniform shape
 */
export function normalizeCompany(raw) {
  if (!raw) return null;

  const id = raw.id || raw.company_id;
  const rawJobs = Array.isArray(raw.jobs) ? raw.jobs : [];

  return {
    id: id,
    company_id: id,
    name: raw.name || raw.company_name || 'Enterprise Employer',
    company_type: raw.company_type || raw.type || 'Company',
    type: raw.company_type || raw.type || 'Company',
    industry: raw.industry || 'Technology & Engineering',
    headquarters: raw.headquarters || raw.hq || raw.location || 'India',
    founded_year: raw.founded_year || raw.founded || null,
    website: raw.website || null,
    description: raw.description || `${raw.name || 'This enterprise'} is actively hiring on the SwipeX career platform.`,
    employee_count: raw.employee_count || '100+',
    rating: raw.rating || 4.2,
    open_jobs_count: raw.open_jobs_count !== undefined ? raw.open_jobs_count : rawJobs.length,
    jobs: rawJobs.map(normalizeJob),
  };
}

export const companyService = {
  /**
   * Fetch company listings (supporting company_type and search filters)
   * @param {Object} [filters]
   */
  async listCompanies(filters = {}) {
    if (useMock) {
      const data = await mockCompanyService.listCompanies(filters);
      return (Array.isArray(data) ? data : []).map(normalizeCompany);
    }

    try {
      const liveData = await realCompanyService.listCompanies(filters);
      if (Array.isArray(liveData)) {
        return liveData.map(normalizeCompany);
      }
      return [];
    } catch (err) {
      console.warn('Live Company API unreachable, using fallback dataset:', err.message);
      const fallback = await mockCompanyService.listCompanies(filters);
      return (Array.isArray(fallback) ? fallback : []).map(normalizeCompany);
    }
  },

  /**
   * Fetch company details with open jobs by ID
   * @param {string|number} companyId
   */
  async getCompanyDetail(companyId) {
    if (useMock) {
      const data = await mockCompanyService.getCompanyDetail(companyId);
      return normalizeCompany(data);
    }

    try {
      const liveData = await realCompanyService.getCompanyDetail(companyId);
      return normalizeCompany(liveData);
    } catch (err) {
      console.warn(`Live Company Detail ${companyId} unreachable, using fallback:`, err.message);
      const fallback = await mockCompanyService.getCompanyDetail(companyId);
      return normalizeCompany(fallback);
    }
  },
};

export default companyService;
