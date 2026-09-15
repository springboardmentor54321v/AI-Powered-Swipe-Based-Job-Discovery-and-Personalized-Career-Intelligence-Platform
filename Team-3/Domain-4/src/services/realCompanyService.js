/**
 * Real Company Service Client (Milestone 2 - Day 4)
 * Directly interacts with Intern 2/3 Company API endpoints:
 * - GET /api/v1/companies
 * - GET /api/v1/companies/:id
 */

import api from './api.js';

export const realCompanyService = {
  /**
   * Fetch company listings from live backend with query filters
   * @param {Object} [filters]
   */
  async listCompanies(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        if (key === 'company_type' || key === 'type') {
          queryParams.append('company_type', String(value));
        } else if (key === 'search' || key === 'q') {
          queryParams.append('search', String(value));
          queryParams.append('q', String(value));
        } else if (key === 'industry') {
          queryParams.append('industry', String(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/companies?${queryString}` : '/companies';
    return api.get(endpoint);
  },

  /**
   * Fetch details for a specific company by ID
   * @param {string|number} companyId
   */
  async getCompanyDetail(companyId) {
    return api.get(`/companies/${companyId}`);
  },
};

export default realCompanyService;
