import { verifyJWT } from '../services/auth.service.js';
import User from '../models/User.js';
import Logger from '../utils/logger.js';

/**
 * Middleware to verify JWT token and extract user
 * Attaches user object to req.user
 * Returns 401 if token is missing or invalid
 */
export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    try {
      const decoded = verifyJWT(token);
      const user = await User.findById(decoded.userId).lean();
      if (!user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'User not found for token',
          timestamp: new Date().toISOString(),
        });
      }

      if (user.isLocked) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'This account has been suspended by an administrator.',
          timestamp: new Date().toISOString(),
        });
      }

      req.user = {
        id: String(user._id),
        role: user.role,
        email: user.email,
      };
      next();
    } catch (error) {
      Logger.warn('AUTH', 'Token verification failed', { requestId: req.requestId }, error);
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: error.message || 'Invalid token',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    Logger.error('AUTH', 'Auth middleware error', { requestId: req.requestId }, error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Authentication error',
      timestamp: new Date().toISOString(),
    });
  }
}
