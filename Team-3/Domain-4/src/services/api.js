/**
 * SwipeX Base API Client
 * Configurable HTTP client with JSON serialization, error handling, auth headers, and environment configuration.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1';
const SESSION_STORAGE_KEY = 'swipex_auth_session';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get stored session data
 */
function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Extract error message from API response
 */
function extractErrorMessage(data, status, statusText) {
  if (!data) return `HTTP Error ${status}: ${statusText}`;
  if (typeof data === 'string') return data;
  if (data.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
    }
  }
  if (data.message) return data.message;

  // Django REST Framework commonly responds with a top-level error plus a
  // `details` object. Prefer the useful field-level reason over "Validation error".
  if (data.details && typeof data.details === 'object') {
    const detailMessages = Object.entries(data.details)
      .flatMap(([key, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages.map((message) => `${key}: ${typeof message === 'string' ? message : JSON.stringify(message)}`);
      })
      .join(' | ');
    if (detailMessages) return detailMessages;
  }

  if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);

  // DRF field errors object e.g. { email: ["Invalid email"], password: ["Too short"] }
  const fieldErrors = Object.entries(data)
    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
    .join(' | ');
  if (fieldErrors) return fieldErrors;

  return `HTTP Error ${status}: ${statusText}`;
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Core request helper wrapping native fetch
 */
async function request(endpoint, options = {}, isRetry = false) {
  const { headers = {}, body, ...customConfig } = options;

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const isFormData = body instanceof FormData;
  const session = getStoredSession();
  const token = session?.access_token || null;
  const userId = session?.user?.user_id || session?.user?.id || session?.user_id;

  const config = {
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'X-User-Id': String(userId) } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Parse response
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    // Handle 401 Token Refresh
    if (response.status === 401 && !isRetry && session?.refresh_token && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: session.refresh_token }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.access_token;
            if (newToken) {
              session.access_token = newToken;
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
              onRefreshed(newToken);
              isRefreshing = false;
              return request(endpoint, options, true);
            }
          }
        } catch {
          // Refresh failed
        }
        isRefreshing = false;
      } else {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newToken) => {
            if (newToken) {
              resolve(request(endpoint, options, true));
            } else {
              reject(new ApiError('Session expired. Please log in again.', 401, null));
            }
          });
        });
      }
    }

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data, response.status, response.statusText);
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network, timeout, or connection error
    throw new ApiError(error.message || 'Unable to connect to server. Please verify backend is running.', 0, null);
  }
}

export const api = {
  baseUrl: API_BASE_URL,
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData, options = {}) => request(endpoint, { ...options, method: 'POST', body: formData }),
};

export { ApiError };
export default api;
