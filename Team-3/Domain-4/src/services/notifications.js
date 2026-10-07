/**
 * SwipeX Notification Service (Milestone 4)
 *
 * Interacts with the backend Notification Service API.
 * Uses the existing centralized API client (api.js).
 */

import api, { ApiError } from './api';

export const notificationService = {
  /**
   * Fetch paginated notification history for the authenticated user.
   * @param {Object} [params] - Query options (page, limit)
   * @returns {Promise<{ items: Array, count: number }>}
   */
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      const queryString = queryParams.toString();
      const endpoint = `/notifications/${queryString ? `?${queryString}` : ''}`;

      const res = await api.get(endpoint);

      // Normalize DRF pagination or raw array
      if (Array.isArray(res)) {
        return { items: res, count: res.length };
      }
      if (res && Array.isArray(res.results)) {
        return { items: res.results, count: res.count ?? res.results.length };
      }
      if (res && Array.isArray(res.items)) {
        return { items: res.items, count: res.total ?? res.items.length };
      }
      return { items: [], count: 0 };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to load notifications', 0, null);
    }
  },

  /**
   * Get unread notification count.
   * @returns {Promise<number>}
   */
  async getUnreadCount() {
    try {
      const res = await api.get('/notifications/unread-count');
      return typeof res?.unread_count === 'number' ? res.unread_count : 0;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to fetch unread count', 0, null);
    }
  },

  /**
   * Mark a single notification as read.
   * @param {string} id - Notification UUID
   * @returns {Promise<{ id: string, read_at: string }>}
   */
  async markNotificationRead(id) {
    if (!id) throw new ApiError('Notification ID is required', 400, null);
    try {
      return await api.patch(`/notifications/${id}/read`, {});
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to mark notification as read', 0, null);
    }
  },
};

export default notificationService;
