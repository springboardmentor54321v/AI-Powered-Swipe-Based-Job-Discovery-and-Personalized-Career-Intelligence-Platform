/**
 * SwipeX Alert Preferences Service (Milestone 4)
 *
 * Interacts with the backend Alert Preferences API.
 * Uses the existing centralized API client (api.js).
 */

import api, { ApiError } from './api';

export const alertPreferencesService = {
  /**
   * Fetch current alert preferences for the authenticated user.
   * @returns {Promise<Array>} List of preference objects
   */
  async getAlertPreferences() {
    try {
      const res = await api.get('/alert-preferences/');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.preferences)) return res.preferences;
      return [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load alert preferences', 0, null);
    }
  },

  /**
   * Update alert preferences.
   * @param {Array<Object>} preferences - Array of preference objects
   * @returns {Promise<Object>} Response status
   */
  async updateAlertPreferences(preferences) {
    if (!Array.isArray(preferences)) {
      throw new ApiError('Preferences must be an array', 400, null);
    }
    try {
      return await api.put('/alert-preferences/', { preferences });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to save alert preferences', 0, null);
    }
  },
};

export default alertPreferencesService;
