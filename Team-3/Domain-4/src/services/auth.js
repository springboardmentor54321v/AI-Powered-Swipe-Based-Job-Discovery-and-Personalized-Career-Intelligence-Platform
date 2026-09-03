/**
 * SwipeX Authentication Service
 * 
 * Central authentication gateway that orchestrates session management
 * and delegates to either Real API or Local Mock adapter based on configuration.
 */

import realAuthService from './realAuthService.js';
import mockAuthService from './mockAuthService.js';

const SESSION_STORAGE_KEY = 'swipex_auth_session';

// Check if development mock mode is enabled (defaulting to true if unspecified in dev)
const isMockMode = typeof import.meta !== 'undefined' 
  ? (import.meta.env?.VITE_USE_AUTH_MOCK === 'true' || import.meta.env?.VITE_USE_AUTH_MOCK === true || import.meta.env?.VITE_USE_AUTH_MOCK === undefined)
  : true;

// Active adapter (mock vs real API)
const adapter = isMockMode ? mockAuthService : realAuthService;

// Subscribers for reactive auth state changes
const listeners = new Set();

function notifyListeners(session) {
  listeners.forEach((listener) => {
    try {
      listener(session);
    } catch (e) {
      console.error('Error in auth subscriber listener:', e);
    }
  });
}

export const authService = {
  /**
   * Check if running in development mock mode
   */
  isMockMode() {
    return isMockMode;
  },

  /**
   * Get active session from storage
   * @returns {{ access_token?: string, refresh_token?: string, role?: string, user?: Object } | null}
   */
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Save session data to local storage
   */
  setSession(sessionData) {
    try {
      if (sessionData) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      notifyListeners(sessionData);
    } catch (e) {
      console.warn('Unable to persist auth session to localStorage', e);
    }
  },

  /**
   * Clear session data
   */
  clearSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      notifyListeners(null);
    } catch (e) {
      // ignore
    }
  },

  /**
   * Check if user currently has an active session
   */
  isAuthenticated() {
    const session = this.getSession();
    return Boolean(session && session.access_token);
  },

  /**
   * Get current auth token
   */
  getToken() {
    const session = this.getSession();
    return session?.access_token || null;
  },

  /**
   * Subscribe to authentication state changes
   * @param {(session: Object | null) => void} listener
   * @returns {() => void} Unsubscribe function
   */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Authenticate user with credentials
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await adapter.login(credentials);
    
    // Structure initial session object
    const sessionData = {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      role: response.role || 'job_seeker',
      user: response.user || {
        user_id: response.user_id || 1,
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role: response.role || 'job_seeker',
      },
    };

    this.setSession(sessionData);

    // Fetch live profile details if real auth is active
    if (!isMockMode && response.access_token) {
      try {
        const me = await adapter.getCurrentUser();
        if (me) {
          sessionData.user = {
            ...sessionData.user,
            ...me,
            user_id: me.user_id || me.id || sessionData.user.user_id,
            name: me.name || sessionData.user.name,
            role: me.role || sessionData.role,
          };
          sessionData.role = me.role || sessionData.role;
          this.setSession(sessionData);
        }
      } catch (e) {
        // Fallback silently if /me fails
      }
    }

    return response;
  },

  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string, role: string }} data
   */
  async register(data) {
    return adapter.register(data);
  },

  /**
   * Initiate Google OAuth
   */
  async googleOAuth() {
    return adapter.googleOAuth();
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return adapter.getCurrentUser();
  },

  /**
   * Update active user role (useful for testing & development)
   * @param {string} newRole - 'job_seeker' | 'recruiter' | 'admin'
   */
  setRole(newRole) {
    const current = this.getSession() || {};
    const updated = {
      ...current,
      role: newRole,
      user: {
        ...(current.user || {}),
        role: newRole,
      },
    };
    this.setSession(updated);
    return updated;
  },

  /**
   * End current session
   */
  logout() {
    this.clearSession();
  },
};

export default authService;
