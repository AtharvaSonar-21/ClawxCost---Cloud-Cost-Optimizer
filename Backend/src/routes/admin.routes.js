import express from 'express';
import {
  setGeminiKey,
  getGeminiKeyStatus_ctrl,
  isKeyConfigured,
  toggleUserLock,
  toggleUserRole,
  resetUserPassword,
  getLeads,
  approveLead,
} from '../controllers/admin.controller.js';
import { getOverview } from '../controllers/admin-analytics.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

/**
 * POST /admin/config/gemini-key
 * Set Gemini API key (Admin only)
 * Headers: Authorization: Bearer <jwt>
 * Body: { apiKey: "your-gemini-api-key" }
 */
router.post('/config/gemini-key', authMiddleware, requireAdmin, setGeminiKey);

/**
 * GET /admin/config/gemini-key-status
 * Get Gemini API key status
 * Headers: Authorization: Bearer <jwt>
 * Returns: { configured: boolean, lastUpdated: date, ... }
 */
router.get(
  '/config/gemini-key-status',
  authMiddleware,
  requireAdmin,
  getGeminiKeyStatus_ctrl
);

/**
 * GET /admin/config/gemini-key-configured
 * Check if Gemini API key is configured (public)
 * Returns: { configured: boolean }
 */
router.get('/config/gemini-key-configured', isKeyConfigured);

/**
 * GET /admin/analytics/overview
 * Admin dashboard analytics across all users
 */
router.get('/analytics/overview', authMiddleware, requireAdmin, getOverview);

/**
 * PUT /admin/users/:userId/lock
 * Toggle lock/unlock user account (Admin only)
 */
router.put('/users/:userId/lock', authMiddleware, requireAdmin, toggleUserLock);

/**
 * PUT /admin/users/:userId/role
 * Change role mapping user account (Admin only)
 */
router.put('/users/:userId/role', authMiddleware, requireAdmin, toggleUserRole);

/**
 * PUT /admin/users/:userId/password-reset
 * Reset password mapping user account (Admin only)
 */
router.put('/users/:userId/password-reset', authMiddleware, requireAdmin, resetUserPassword);

/**
 * GET /admin/leads
 * Get all early access leads (Admin only)
 */
router.get('/leads', authMiddleware, requireAdmin, getLeads);

/**
 * PUT /admin/leads/:leadId/approve
 * Approve early access lead (Admin only)
 */
router.put('/leads/:leadId/approve', authMiddleware, requireAdmin, approveLead);

export default router;
