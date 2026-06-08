/**
 * Centralized logging utility for production-ready error handling and monitoring
 * Supports structured logging with correlation IDs for request tracing
 */

export class Logger {
  /**
   * Log info level message
   * @param {string} prefix - Module/component identifier (e.g., "ANALYTICS", "BILLING")
   * @param {string} message - Human-readable message
   * @param {object} meta - Additional metadata (requestId, userId, etc.)
   */
  static info(prefix, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${prefix}] ℹ️  ${message}`;
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : "";
    console.log(logMessage + metaString);
  }

  /**
   * Log warning level message
   * @param {string} prefix - Module/component identifier
   * @param {string} message - Human-readable message
   * @param {object} meta - Additional metadata
   */
  static warn(prefix, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${prefix}] ⚠️  ${message}`;
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : "";
    console.warn(logMessage + metaString);
  }

  /**
   * Log error level message with safe error handling
   * Sanitizes error messages to prevent exposure of internal details
   * @param {string} prefix - Module/component identifier
   * @param {string} message - User-safe error message (no internals)
   * @param {object} meta - Additional metadata (requestId for tracing)
   * @param {Error} errorObj - Original error object (for internal logging only)
   */
  static error(prefix, message, meta = {}, errorObj = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${prefix}] ❌ ${message}`;

    // Build metadata that will be logged (safe version)
    const safeMetadata = { ...meta };
    if (errorObj) {
      // Only include error name and stack in logs (not exposed to client)
      safeMetadata.errorName = errorObj.name;
      safeMetadata.errorType = errorObj.constructor.name || "Unknown";
    }

    const metaString =
      Object.keys(safeMetadata).length > 0 ? ` | ${JSON.stringify(safeMetadata)}` : "";
    console.error(logMessage + metaString);

    // In production, this would send to a logging service (e.g., Datadog, Sentry)
    // For now, we just ensure it's logged to console with safe details
  }

  /**
   * Generate a unique request ID for correlation tracking
   * Format: timestamp + random suffix for collision avoidance
   * @returns {string} Unique request identifier
   */
  static generateRequestId() {
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomSuffix}`;
  }
}

export default Logger;
