/**
 * Request logging middleware for tracking all API requests
 * Generates unique request IDs for correlation and tracing
 */

import { Logger } from "../utils/logger.js";

/**
 * Express middleware that:
 * 1. Generates a unique request ID
 * 2. Logs incoming request details
 * 3. Logs outgoing response details (via response.on('finish'))
 * Attach requestId to req object for use in controllers
 */
export const requestLoggerMiddleware = (req, res, next) => {
  // Generate unique request ID for this request
  const requestId = Logger.generateRequestId();
  req.requestId = requestId;

  // Record start time for duration calculation
  const startTime = Date.now();

  // Log incoming request
  Logger.info("HTTP", `${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Capture response finish to log response details
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    Logger.info("HTTP", `${req.method} ${req.path} completed`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
};

export default requestLoggerMiddleware;
