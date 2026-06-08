/**
 * Global error handling middleware
 * Catches unhandled errors and returns standardized error responses
 * Never exposes internal error details to the client
 */

import { Logger } from "../utils/logger.js";
import { errorResponse } from "../utils/response.js";
import { AppError } from "../utils/errors.js";

/**
 * Express error handling middleware (must have 4 parameters: err, req, res, next)
 * This catches any errors thrown by other middleware or routes
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  const requestId = req.requestId || "unknown";
  const statusCode = err.statusCode || 500;

  // Log the full error internally (with stack trace in development, sanitized in production)
  if (process.env.NODE_ENV === "production") {
    Logger.error("ERROR_HANDLER", `Error: ${err.message}`, { requestId, statusCode });
  } else {
    Logger.error("ERROR_HANDLER", "Unhandled error occurred", { requestId }, err);
  }

  // Return sanitized error response to client (never expose internal database errors or code details)
  const userFriendlyMessage = getSafeErrorMessage(err, statusCode);

  res.status(statusCode).json(errorResponse(userFriendlyMessage, statusCode, requestId));
};

/**
 * Return a user-safe error message based on error and status code
 * Never includes stack traces, file paths, or internal implementation details
 * @param {Error} error - The original error object
 * @param {number} statusCode - HTTP status code
 * @returns {string} User-safe error message
 */
function getSafeErrorMessage(error, statusCode) {
  // If it's a known operational error, we can safely expose its message
  if (error instanceof AppError || error.isOperational || statusCode < 500) {
    return error.message;
  }

  switch (statusCode) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict. This resource may already exist or is in an invalid state.";
    case 422:
      return "Invalid data provided. Please check the request body.";
    case 500:
      return "An internal server error occurred. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return "An error occurred. Please try again later.";
  }
}

export default errorHandlerMiddleware;
