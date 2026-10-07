/**
 * SwipeX Application Tracking Service (Milestone 4)
 *
 * Interacts with the backend Application Service API.
 * Uses the existing centralized API client (api.js).
 */

import api, { ApiError } from './api';

export const applicationService = {
  /**
   * Fetch all applications for the authenticated applicant.
   * @returns {Promise<Array>} List of application records
   */
  async getApplications() {
    try {
      const res = await api.get('/applications/');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.results)) return res.results;
      if (res && Array.isArray(res.items)) return res.items;
      return [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load applications', 0, null);
    }
  },

  /**
   * Fetch status transition timeline history for an application.
   * @param {string} id - Application UUID
   * @returns {Promise<Array>} List of ApplicationStatusEvent records
   */
  async getApplicationHistory(id) {
    if (!id) throw new ApiError('Application ID is required', 400, null);
    try {
      const res = await api.get(`/applications/${id}/history`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.results)) return res.results;
      return [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load application history', 0, null);
    }
  },

  /**
   * Recruiter mutation: update application status (e.g., shortlisted, interview, rejected).
   * @param {string} id - Application UUID
   * @param {string} status - Target status
   * @param {Object} [metadata] - Additional payload metadata
   * @returns {Promise<Object>} Updated application record
   */
  async updateApplicationStatus(id, status, metadata = {}) {
    if (!id) throw new ApiError('Application ID is required', 400, null);
    if (!status) throw new ApiError('Status is required', 400, null);
    try {
      return await api.patch(`/applications/${id}/status`, {
        status,
        ...(metadata && Object.keys(metadata).length ? { metadata } : {})
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to update application status', 0, null);
    }
  },
};

export default applicationService;
