import express from 'express';
import {
  loginWithGoogle,
  registerWithEmail,
  loginWithEmail,
  getProfile,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  requestEarlyAccess,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  validateLeadSignup,
  validateRegistration,
  validateLogin,
} from '../middleware/validator.middleware.js';

const router = express.Router();

/**
 * POST /auth/google
 * Public endpoint - Exchange Google ID token for JWT
 * Body: { token: "google_id_token" }
 * Returns: { jwt, user }
 */
router.post('/google', loginWithGoogle);
router.post('/register', validateRegistration, registerWithEmail);
router.post('/login', validateLogin, loginWithEmail);
router.post('/early-access', validateLeadSignup, requestEarlyAccess);

/**
 * GET /auth/profile
 * Protected endpoint - Get current logged-in user
 * Headers: Authorization: Bearer <jwt>
 * Returns: { user }
 */
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

/**
 * POST /auth/logout
 * Protected endpoint - Logout (frontend clears token)
 * Headers: Authorization: Bearer <jwt>
 */
router.post('/logout', authMiddleware, logout);

/**
 * POST /auth/refresh-token
 * Protected endpoint - Refresh JWT token
 * Headers: Authorization: Bearer <jwt>
 * Returns: { token: "new_jwt" }
 */
router.post('/refresh-token', authMiddleware, refreshToken);

export default router;
