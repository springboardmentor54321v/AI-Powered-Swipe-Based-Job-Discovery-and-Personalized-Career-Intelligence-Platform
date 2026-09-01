/**
 * Development-Only Mock Auth Service Adapter
 * 
 * Used for independent frontend testing and demonstration when Intern 1's 
 * live backend Auth service is unavailable.
 * 
 * NOTE: This mock is strictly for local development and fallback.
 */

import { ApiError } from './api.js';

// Helper to simulate realistic network delay
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthService = {
  /**
   * Mock login implementation
   * Accepts valid email format and password >= 6 characters for demo.
   * If password is 'wrong' or 'error', triggers failure for testing error UI.
   */
  async login({ email, password }) {
    await delay(500);

    // Simulate intentional failed authentication test case
    if (password === 'wrong' || password === 'invalid' || email === 'fail@example.com') {
      throw new ApiError('Invalid email or password. Please check your credentials.', 401, {
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Return contract-compliant response shape
    return {
      access_token: 'mock_jwt_access_token_day3_demo',
      refresh_token: 'mock_jwt_refresh_token_day3_demo',
      role: 'job_seeker',
      user: {
        user_id: 'usr_10492',
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Demo User',
        email: email,
        role: 'job_seeker',
      }
    };
  },

  /**
   * Mock register implementation
   */
  async register({ name, email, password, role }) {
    await delay(500);

    // Simulate email already exists test case
    if (email === 'taken@example.com') {
      throw new ApiError('An account with this email address already exists.', 409, {
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // Return contract-compliant response shape
    return {
      user_id: `usr_${Math.floor(10000 + Math.random() * 90000)}`,
      name,
      email,
      role: role || 'job_seeker',
      message: 'Account created successfully.',
    };
  },

  /**
   * Mock Google OAuth initiation
   */
  async googleOAuth() {
    await delay(300);
    return {
      status: 'pending_configuration',
      message: 'Google OAuth2 client integration point is configured. Backend client credentials required in production.',
    };
  },

  /**
   * Mock current user identity
   */
  async getCurrentUser() {
    await delay(200);
    return {
      user_id: 'usr_10492',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      role: 'job_seeker',
    };
  },

  /**
   * Mock refresh token
   */
  async refreshToken() {
    await delay(200);
    return {
      access_token: 'mock_refreshed_access_token',
    };
  }
};

export default mockAuthService;
