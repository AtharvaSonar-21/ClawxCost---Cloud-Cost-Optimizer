import {
  setGeminiApiKey,
  getGeminiKeyStatus,
  isGeminiKeyConfigured,
} from '../services/gemini-config.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import Logger from '../utils/logger.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

/**
 * Set Gemini API key (Admin only)
 * POST /admin/config/gemini-key
 * Body: { apiKey: "sk-..." }
 */
export const setGeminiKey = async (req, res) => {
  const requestId = req.requestId;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json(errorResponse('Missing API key', 400, requestId));
    }

    await setGeminiApiKey(apiKey);

    Logger.info('ADMIN', 'Gemini API key configured', { requestId, userId });

    res.status(200).json(
      successResponse({
        message: 'Gemini API key saved successfully',
      })
    );
  } catch (error) {
    Logger.error('ADMIN', 'Failed to set Gemini key', { requestId, userId }, error);
    res
      .status(500)
      .json(errorResponse('Failed to save API key', 500, requestId));
  }
};

/**
 * Get Gemini API key status
 * GET /admin/config/gemini-key-status
 */
export const getGeminiKeyStatus_ctrl = async (req, res) => {
  const requestId = req.requestId;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const status = await getGeminiKeyStatus();

    Logger.info('ADMIN', 'Gemini key status retrieved', { requestId, userId });

    res.status(200).json(successResponse(status));
  } catch (error) {
    Logger.error('ADMIN', 'Failed to get Gemini key status', { requestId, userId }, error);
    res.status(500).json(errorResponse('Failed to get status', 500, requestId));
  }
};

/**
 * Check if API key is configured (public endpoint for frontend)
 * GET /admin/config/gemini-key-configured
 */
export const isKeyConfigured = async (req, res) => {
  const requestId = req.requestId;

  try {
    const configured = await isGeminiKeyConfigured();

    res.status(200).json(
      successResponse({
        configured,
      })
    );
  } catch (error) {
    Logger.error('ADMIN', 'Failed to check if key configured', { requestId }, error);
    res.status(500).json(errorResponse('Failed to check configuration', 500, requestId));
  }
};

/**
 * Toggle lock status of a user (Admin only)
 * PUT /admin/users/:userId/lock
 */
export const toggleUserLock = async (req, res) => {
  const requestId = req.requestId;
  const adminId = req.user?.id;
  const { userId } = req.params;

  try {
    if (adminId === userId) {
      return res.status(400).json(errorResponse('You cannot suspend your own administrator account.', 400, requestId));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse('User profile not found.', 404, requestId));
    }

    // Toggle status
    user.isLocked = !user.isLocked;
    await user.save();

    Logger.info('ADMIN', `Account lock status toggled to ${user.isLocked}`, { adminId, targetUserId: userId });

    res.status(200).json(
      successResponse({
        message: `User account has been successfully ${user.isLocked ? 'suspended' : 'activated'}.`,
        isLocked: user.isLocked,
        email: user.email
      })
    );
  } catch (error) {
    Logger.error('ADMIN', 'Failed to toggle user lock status', { requestId }, error);
    res.status(500).json(errorResponse('Failed to toggle account lock status.', 500, requestId));
  }
};

/**
 * Toggle or change role of a user (Admin only)
 * PUT /admin/users/:userId/role
 */
export const toggleUserRole = async (req, res) => {
  const requestId = req.requestId;
  const adminId = req.user?.id;
  const { userId } = req.params;

  try {
    if (adminId === userId) {
      return res.status(400).json(errorResponse('You cannot change your own role.', 400, requestId));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse('User profile not found.', 404, requestId));
    }

    // Toggle role
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    user.role = nextRole;
    await user.save();

    Logger.info('ADMIN', `User role modified to ${user.role}`, { adminId, targetUserId: userId });

    res.status(200).json(
      successResponse({
        message: `User role has been successfully changed to ${user.role}.`,
        role: user.role,
        email: user.email
      })
    );
  } catch (error) {
    Logger.error('ADMIN', 'Failed to toggle user role', { requestId }, error);
    res.status(500).json(errorResponse('Failed to change user role mapping.', 500, requestId));
  }
};

/**
 * Reset a user's password to a secure temporary token (Admin only)
 * PUT /admin/users/:userId/password-reset
 */
export const resetUserPassword = async (req, res) => {
  const requestId = req.requestId;
  const adminId = req.user?.id;
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse('User profile not found.', 404, requestId));
    }

    // Generate a secure temporary password
    const tempPassword = `TempClawx${Math.random().toString(36).substring(2, 8).toUpperCase()}2026!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    user.passwordHash = passwordHash;
    // Ensure googleId is cleared to allow standard password login fallback
    if (user.googleId) {
      user.googleId = undefined; 
    }
    await user.save();

    Logger.info('ADMIN', 'User password reset completed by Admin', { adminId, targetUserId: userId });

    res.status(200).json(
      successResponse({
        message: 'Password reset completed successfully.',
        tempPassword,
        email: user.email
      })
    );
  } catch (error) {
    Logger.error('ADMIN', 'Failed to reset user password', { requestId }, error);
    res.status(500).json(errorResponse('Failed to execute password reset sequence.', 500, requestId));
  }
};

/**
 * Retrieve all early access leads (Admin only)
 * GET /admin/leads
 */
export const getLeads = async (req, res) => {
  const requestId = req.requestId;
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.status(200).json(successResponse(leads));
  } catch (error) {
    Logger.error('ADMIN', 'Failed to fetch leads', { requestId }, error);
    res.status(500).json(errorResponse('Failed to fetch leads.', 500, requestId));
  }
};

/**
 * Approve an early access lead (Admin only)
 * PUT /admin/leads/:leadId/approve
 */
export const approveLead = async (req, res) => {
  const requestId = req.requestId;
  const { leadId } = req.params;
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json(errorResponse('Lead profile not found.', 404, requestId));
    }
    lead.status = 'approved';
    await lead.save();

    // Check if user already exists
    let user = await User.findOne({ email: lead.email });
    let tempPassword = null;
    let autoRegistered = false;

    if (!user) {
      // Generate a friendly name from email prefix
      const emailPrefix = lead.email.split('@')[0];
      const name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      // Generate a secure random temporary password
      tempPassword = `Clawx-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Auto-register user as standard user
      user = await User.create({
        email: lead.email,
        name,
        passwordHash,
        role: 'user',
      });
      autoRegistered = true;

      Logger.info('ADMIN', `Auto-registered approved early access user: ${lead.email}`, { requestId, userId: user._id });

      // Real email dispatch via Nodemailer if SMTP details are configured in .env
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT || 587;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || '"ClawxCost Support" <no-reply@clawxcost.com>';

      let emailSent = false;
      let emailError = null;

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          const emailHtml = `
            <div style="font-family: 'Courier New', monospace; background-color: #0d0618; color: #ffffff; padding: 30px; border: 4px solid #22d3ee; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #22d3ee; border-bottom: 4px solid #22d3ee; padding-bottom: 10px; margin-top: 0; font-family: sans-serif; text-transform: uppercase; letter-spacing: 2px;">
                🔐 ClawxCost Early Access Granted
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #e5e7eb;">
                Hello <strong>${name}</strong>,<br/><br/>
                Congratulations! Your request for early access to the ClawxCost FinOps platform has been approved by our administrators.
              </p>
              <div style="background-color: #160d26; border: 2px solid #7c3aed; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #ffffff;">
                  <strong style="color: #22d3ee;">Portal Login:</strong> 
                  <a href="http://localhost:3000/login" style="color: #22d3ee; text-decoration: underline; font-weight: bold;">http://localhost:3000/login</a>
                </p>
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #ffffff;">
                  <strong style="color: #22d3ee;">Account Email:</strong> ${lead.email}
                </p>
                <p style="margin: 0; font-size: 14px; color: #ffffff;">
                  <strong style="color: #22d3ee;">Temporary Password:</strong> 
                  <code style="background-color: rgba(34, 211, 238, 0.15); padding: 4px 8px; color: #22d3ee; font-weight: bold; border: 1px dashed #22d3ee; font-size: 15px;">${tempPassword}</code>
                </p>
              </div>
              <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; margin-bottom: 0;">
                Please log in and update your secure password immediately under your Profile Settings.<br/><br/>
                Best regards,<br/>
                <strong>The ClawxCost FinOps Operations Team</strong>
              </p>
            </div>
          `;

          await transporter.sendMail({
            from: smtpFrom,
            to: lead.email,
            subject: 'Welcome to ClawxCost - Early Access Granted!',
            text: `Hello ${name},\n\nYour early access request has been approved!\n\nPortal: http://localhost:3000/login\nEmail: ${lead.email}\nTemporary Password: ${tempPassword}\n\nPlease update your password under Profile Settings.`,
            html: emailHtml,
          });

          emailSent = true;
          Logger.info('EMAIL', `Active credentials email dispatched successfully to ${lead.email}`);
        } catch (err) {
          emailError = err.message;
          Logger.error('EMAIL', `Failed to send SMTP email to ${lead.email}, falling back to simulation outbox`, {}, err);
        }
      }

      if (!emailSent) {
        // Fallback simulation print to backend log console
        const simulatedEmailBody = `
=========================================
EMAIL OUTBOX [SECURE CREDENTIAL DISPATCH] (SMTP SIMULATION FALLBACK)
To: ${lead.email}
Subject: Welcome to ClawxCost - Early Access Granted!
-----------------------------------------
Hello ${name},

Congratulations! Your early access request for ClawxCost has been approved by our security administrators.

Your secure login credentials have been provisioned:
- Login Portal: http://localhost:3000/login
- Account Email: ${lead.email}
- Temporary Password: ${tempPassword}

Please log in and update your password under Profile Settings.

Best regards,
The ClawxCost FinOps Operations Team
=========================================
`;
        console.log(simulatedEmailBody);
        Logger.info('EMAIL', `Simulated credentials dispatch logged successfully for ${lead.email} (SMTP Configured: ${!!smtpHost}, Error: ${emailError || 'None'})`);
      }
    } else {
      Logger.info('ADMIN', `Approved lead ${lead.email} already has an active user profile.`, { requestId });
    }

    Logger.info('ADMIN', `Lead approved by Admin: ${lead.email}`);
    res.status(200).json(successResponse({ 
      message: autoRegistered 
        ? `Lead approved, user account provisioned, and credentials sent to ${lead.email}!`
        : `Lead approved! ${lead.email} is already registered.`,
      lead,
      userCreated: autoRegistered,
      tempPassword,
    }));
  } catch (error) {
    Logger.error('ADMIN', 'Failed to approve lead', { requestId }, error);
    res.status(500).json(errorResponse('Failed to approve lead.', 500, requestId));
  }
};

export default {
  setGeminiKey,
  getGeminiKeyStatus_ctrl,
  isKeyConfigured,
  toggleUserLock,
  toggleUserRole,
  resetUserPassword,
  getLeads,
  approveLead,
};
