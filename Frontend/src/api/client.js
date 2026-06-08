/**
 * Centralized API client for ClawxCost dashboard
 * Handles all HTTP requests with consistent error handling and response format
 */

const API_BASE_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .trim()
  .replace(/^['"]|['"]$/g, '');

function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Make API request with centralized error handling
 * @param {string} endpoint - API endpoint (e.g., '/analytics/cost-summary')
 * @param {object} options - Fetch options (method, body, headers, etc)
 * @returns {Promise<{success: boolean, data: any, statusCode: number, message?: string}>}
 */
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {};
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const defaults = {
    method: 'GET',
    headers: defaultHeaders,
  };

  const config = {
    ...defaults,
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { success: response.ok, data: null };

    // API returns standardized format
    if (data.success) {
      return {
        success: true,
        data: data.data,
        statusCode: data.statusCode || 200,
      };
    } else {
      return {
        success: false,
        statusCode: data.statusCode || response.status,
        message: data.message || 'An error occurred',
      };
    }
  } catch (error) {
    // Network error or JSON parse error
    return {
      success: false,
      statusCode: 500,
      message: error.message || 'Network error occurred',
    };
  }
}

/**
 * GET request helper
 */
export function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * POST multipart/form-data helper
 */
export function apiPostForm(endpoint, formData) {
  return apiCall(endpoint, {
    method: 'POST',
    body: formData,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPostForm,
  apiPatch,
  apiPut,
  apiDelete,
};
