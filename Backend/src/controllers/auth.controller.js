import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import {
  createOrUpdateUser,
  generateJWT,
  getUserById,
  registerWithEmailPassword,
  loginWithEmailPassword,
} from '../services/auth.service.js';
import Logger from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.js';

const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');

// Initialize Google OAuth client
let googleClient;
if (GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
}

/**
 * Handle Google OAuth login/signup
 * Expects: { token: "google_id_token" }
 * Returns: { jwt, user }
 */
export const loginWithGoogle = async (req, res) => {
  const requestId = req.requestId;

  try {
    const { token, mode = 'login', role = 'user' } = req.body;

    if (!token) {
      return res
        .status(400)
        .json(errorResponse('Missing Google token', 400, requestId));
    }

    if (!GOOGLE_CLIENT_ID) {
      Logger.error('AUTH', 'GOOGLE_CLIENT_ID not configured', { requestId });
      return res.status(500).json(
        errorResponse(
          'Google authentication not configured. Contact administrator.',
          500,
          requestId
        )
      );
    }

    // Verify Google token
    let googlePayload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch (error) {
      Logger.warn('AUTH', 'Invalid Google token', { requestId }, error);
      return res
        .status(401)
        .json(errorResponse('Invalid Google token', 401, requestId));
    }

    // Create or update user in database
    const user = await createOrUpdateUser(googlePayload, {
      authMode: mode,
      requestedRole: role,
    });

    // Generate JWT token
    const jwtToken = await generateJWT(user._id);

    Logger.info('AUTH', 'User logged in', { requestId, userId: user._id });

    res.status(200).json(
      successResponse({
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role || 'user',
        },
      })
    );
  } catch (error) {
    Logger.error('AUTH', 'Login failed', { requestId }, error);

    if (error.message === 'Account not found. Please sign up first.') {
      return res.status(404).json(errorResponse(error.message, 404, requestId));
    }

    if (error.message === 'Account already exists. Please login instead.') {
      return res.status(409).json(errorResponse(error.message, 409, requestId));
    }
    if (
      error.message === 'Admin access is not allowed for this email.' ||
      error.message === 'This account does not have admin privileges.'
    ) {
      return res.status(403).json(errorResponse(error.message, 403, requestId));
    }

    res
      .status(500)
      .json(errorResponse('Login failed. Please try again.', 500, requestId));
  }
};

/**
 * Register user with email/password
 * Expects: { name, email, password, role? }
 */
export const registerWithEmail = async (req, res) => {
  const requestId = req.requestId;

  try {
    const { name, email, password, role = 'user' } = req.body;
    const user = await registerWithEmailPassword({
      name,
      email,
      password,
      role,
    });
    const jwtToken = await generateJWT(user._id);

    res.status(201).json(
      successResponse({
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role || 'user',
        },
      }, 201)
    );
  } catch (error) {
    Logger.error('AUTH', 'Email/password registration failed', { requestId }, error);

    if (error.message === 'Account already exists. Please login instead.') {
      return res.status(409).json(errorResponse(error.message, 409, requestId));
    }
    if (error.message === 'Password must be at least 8 characters.') {
      return res.status(400).json(errorResponse(error.message, 400, requestId));
    }
    if (error.message === 'Name, email, and password are required.') {
      return res.status(400).json(errorResponse(error.message, 400, requestId));
    }
    if (error.message === 'Admin access is not allowed for this email.') {
      return res.status(403).json(errorResponse(error.message, 403, requestId));
    }

    return res
      .status(500)
      .json(errorResponse('Registration failed. Please try again.', 500, requestId));
  }
};

/**
 * Login user with email/password
 * Expects: { email, password }
 */
export const loginWithEmail = async (req, res) => {
  const requestId = req.requestId;

  try {
    const { email, password, role = 'user' } = req.body;
    const user = await loginWithEmailPassword({ email, password, role });
    const jwtToken = await generateJWT(user._id);

    res.status(200).json(
      successResponse({
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role || 'user',
        },
      })
    );
  } catch (error) {
    Logger.error('AUTH', 'Email/password login failed', { requestId }, error);

    if (error.message === 'Account not found. Please sign up first.') {
      return res.status(404).json(errorResponse(error.message, 404, requestId));
    }
    if (error.message === 'Invalid email or password.') {
      return res.status(401).json(errorResponse(error.message, 401, requestId));
    }
    if (error.message === 'This account uses Google login. Please continue with Google.') {
      return res.status(400).json(errorResponse(error.message, 400, requestId));
    }
    if (error.message === 'Email and password are required.') {
      return res.status(400).json(errorResponse(error.message, 400, requestId));
    }
    if (error.message === 'This account does not have admin privileges.') {
      return res.status(403).json(errorResponse(error.message, 403, requestId));
    }

    return res
      .status(500)
      .json(errorResponse('Login failed. Please try again.', 500, requestId));
  }
};

/**
 * Get current user profile
 * Requires: Bearer JWT token in Authorization header
 */
export const getProfile = async (req, res) => {
  const requestId = req.requestId;

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(errorResponse('Unauthorized', 401, requestId));
    }

    const user = await getUserById(userId);

    res.status(200).json(
      successResponse({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role || 'user',
      })
    );
  } catch (error) {
    Logger.error('AUTH', 'Failed to get profile', { requestId }, error);
    res
      .status(500)
      .json(errorResponse('Failed to get profile', 500, requestId));
  }
};

/**
 * Logout endpoint (frontend clears token)
 * This is a placeholder - frontend handles token deletion
 */
export const logout = async (req, res) => {
  const requestId = req.requestId;
  Logger.info('AUTH', 'User logout', { requestId });
  res.status(200).json(successResponse({ message: 'Logged out successfully' }));
};

/**
 * Refresh token endpoint (for future use)
 */
export const refreshToken = async (req, res) => {
  const requestId = req.requestId;

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(errorResponse('Unauthorized', 401, requestId));
    }

    const newToken = await generateJWT(userId);

    res
      .status(200)
      .json(successResponse({ token: newToken }));
  } catch (error) {
    Logger.error('AUTH', 'Token refresh failed', { requestId }, error);
    res
      .status(500)
      .json(errorResponse('Token refresh failed', 500, requestId));
  }
};

/**
 * Update user profile
 * Expects: { name, phone, bio, picture }
 * Returns: { user }
 */
export const updateProfile = async (req, res) => {
  const requestId = req.requestId || Logger.generateRequestId();

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const { name, phone, bio, picture } = req.body;

    // Validation
    if (!name || String(name).trim().length < 2 || String(name).trim().length > 50) {
      return res.status(400).json(errorResponse('Name must be between 2 and 50 characters.', 400, requestId));
    }

    if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(String(phone).trim())) {
      return res.status(400).json(errorResponse('Invalid phone number format.', 400, requestId));
    }

    if (bio && String(bio).trim().length > 300) {
      return res.status(400).json(errorResponse('Bio must not exceed 300 characters.', 400, requestId));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404, requestId));
    }

    // Apply changes
    user.name = String(name).trim();
    user.phone = phone ? String(phone).trim() : null;
    user.bio = bio ? String(bio).trim() : null;
    if (picture !== undefined) {
      user.picture = picture;
    }

    await user.save();
    Logger.info('AUTH', 'Profile updated successfully', { userId });

    res.status(200).json(
      successResponse({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        bio: user.bio,
        role: user.role || 'user',
      })
    );
  } catch (error) {
    Logger.error('AUTH', 'Failed to update profile', { requestId }, error);
    res.status(500).json(errorResponse('Failed to update profile. Please try again.', 500, requestId));
  }
};

/**
 * Change user password
 * Expects: { currentPassword, newPassword }
 */
export const changePassword = async (req, res) => {
  const requestId = req.requestId || Logger.generateRequestId();

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const { currentPassword, newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 8) {
      return res.status(400).json(errorResponse('New password must be at least 8 characters long.', 400, requestId));
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404, requestId));
    }

    // Handle Google OAuth accounts with no passwordHash
    const hasPassword = !!user.passwordHash;

    if (hasPassword) {
      if (!currentPassword) {
        return res.status(400).json(errorResponse('Current password is required to change password.', 400, requestId));
      }
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json(errorResponse('Incorrect current password.', 401, requestId));
      }
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    Logger.info('AUTH', 'Password changed successfully', { userId });

    res.status(200).json(successResponse({ message: 'Password updated successfully' }));
  } catch (error) {
    Logger.error('AUTH', 'Failed to change password', { requestId }, error);
    res.status(500).json(errorResponse('Failed to change password. Please try again.', 500, requestId));
  }
};

/**
 * Handle Landing Page early access lead requests
 * POST /auth/early-access
 * Body: { email: "your@company.com" }
 */
export const requestEarlyAccess = async (req, res) => {
  const requestId = req.requestId || Logger.generateRequestId();

  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json(errorResponse('Please enter a valid company email address.', 400, requestId));
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    
    // Check if email already registered as lead
    const existingLead = await Lead.findOne({ email: trimmedEmail });
    if (existingLead) {
      return res.status(200).json(
        successResponse({
          message: 'You have already requested early access! We will email you details shortly.',
        })
      );
    }

    await Lead.create({ email: trimmedEmail });
    Logger.info('LEAD', `New early access lead signup: ${trimmedEmail}`, { requestId });

    res.status(201).json(
      successResponse({
        message: 'Success! Your early access request has been recorded. We will email you shortly.',
      }, 201)
    );
  } catch (error) {
    Logger.error('LEAD', 'Failed to save early access lead', { requestId }, error);
    res.status(500).json(errorResponse('Failed to record early access request. Please try again.', 500, requestId));
  }
};

export default {
  loginWithGoogle,
  registerWithEmail,
  loginWithEmail,
  getProfile,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  requestEarlyAccess,
};
