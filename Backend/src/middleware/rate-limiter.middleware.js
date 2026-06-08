import { rateLimit } from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable old headers
  handler: (req, res) => {
    res.status(429).json(errorResponse('Too many requests. Please slow down and try again later.', 429, req.requestId));
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(errorResponse('Too many authentication attempts. Please try again in 15 minutes.', 429, req.requestId));
  }
});

export default {
  apiRateLimiter,
  authRateLimiter
};
