/**
 * Standardized response format utility for all API endpoints
 * Ensures consistent response structure across the application
 */

/**
 * Create a successful response object
 * @param {*} data - Response payload (will be nested under 'data' key)
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {object} Standardized success response object
 */
export const successResponse = (data, statusCode = 200) => ({
  success: true,
  statusCode,
  data,
  timestamp: new Date().toISOString(),
});

/**
 * Create an error response object
 * Sanitizes error messages to prevent exposure of internal error details
 * @param {string} message - User-safe error message (no stack traces or internals)
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} requestId - Optional request ID for tracing
 * @returns {object} Standardized error response object
 */
export const errorResponse = (message, statusCode = 500, requestId = null) => {
  const response = {
    success: false,
    statusCode,
    message, // Should be user-friendly (e.g., "Failed to fetch data" not "Cannot read property 'x' of undefined")
    timestamp: new Date().toISOString(),
  };

  // Include request ID for tracing if provided
  if (requestId) {
    response.requestId = requestId;
  }

  return response;
};

export default {
  successResponse,
  errorResponse,
};
