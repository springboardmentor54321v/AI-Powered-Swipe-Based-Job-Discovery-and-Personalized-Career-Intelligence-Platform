/**
 * Real Auth Service Client
 * Directly interacts with Intern 1's Auth & Identity API endpoints.
 * 
 * Endpoints:
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - GET  /api/v1/auth/oauth/google
 * - GET  /api/v1/auth/me
 * - POST /api/v1/auth/refresh
 */

import api from './api.js';

export const realAuthService = {
  /**
   * Register a new user account
   * @param {{ name: string, email: string, password: string, role: string }} data
   */
  async register(data) {
    return api.post('/auth/register', data);
  },

  /**
   * Authenticate with email & password
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  /**
   * Fetch Google OAuth2 authentication URL or initiate flow
   */
  async googleOAuth() {
    return api.get('/auth/oauth/google');
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getCurrentUser() {
    return api.get('/auth/me');
  },

  /**
   * Refresh expired access token
   * @param {{ refresh_token: string }} data
   */
  async refreshToken(data) {
    return api.post('/auth/refresh', data);
  },
};

export default realAuthService;
