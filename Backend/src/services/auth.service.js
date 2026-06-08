import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Logger from '../utils/logger.js';

function sanitizeEnvValue(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const BCRYPT_ROUNDS = 10;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function getJwtSecret() {
  return sanitizeEnvValue(process.env.JWT_SECRET);
}

function assertJwtSecret() {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret || String(jwtSecret).trim().length < 32) {
    throw new Error('JWT secret is not configured correctly.');
  }
  return jwtSecret;
}

/**
 * Create and sign a JWT token
 */
export async function generateJWT(userId) {
  try {
    const jwtSecret = assertJwtSecret();
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: JWT_EXPIRY });
    return token;
  } catch (error) {
    Logger.error('AUTH', 'Failed to generate JWT', {}, error);
    throw error;
  }
}

function canAssignAdminRole(email) {
  const normalizedEmail = String(email || '').toLowerCase();
  if (normalizedEmail === 'admin@clawxcost.com') {
    return true;
  }
  if (ADMIN_EMAILS.length === 0) {
    return false;
  }

  return ADMIN_EMAILS.includes(normalizedEmail);
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token) {
  try {
    const jwtSecret = assertJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Create or update a user from Google OAuth data
 * Expects googlePayload with: email, name, picture, google_id
 */
export async function createOrUpdateUser(googlePayload, options = {}) {
  try {
    // Extract data from Google OAuth response
    // Google token contains: iss, nbf, aud, sub (ID), email, email_verified, at_hash, name, picture, iat, exp
    const { email, name, picture, sub: googleId } = googlePayload;
    const authMode = options.authMode === 'signup' ? 'signup' : 'login';
    const requestedRole = options.requestedRole === 'admin' ? 'admin' : 'user';
    const isAdminAllowed = canAssignAdminRole(email);
    const roleToAssign = requestedRole === 'admin' ? 'admin' : 'user';

    if (requestedRole === 'admin' && !isAdminAllowed) {
      throw new Error('Admin access is not allowed for this email.');
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      if (authMode === 'login') {
        throw new Error('Account not found. Please sign up first.');
      }

      // Create new user
      user = await User.create({
        email,
        name,
        picture: picture || null,
        googleId,
        role: roleToAssign,
      });
      Logger.info('AUTH', 'New user created', {
        userId: user._id,
        email,
        role: user.role,
      });
    } else {
      if (user.isLocked) {
        throw new Error('This account has been suspended by an administrator.');
      }

      if (authMode === 'signup') {
        throw new Error('Account already exists. Please login instead.');
      }

      if (requestedRole === 'admin' && user.role !== 'admin') {
        throw new Error('This account does not have admin privileges.');
      }

      // Update existing user with Google info
      if (picture && !user.picture) {
        user.picture = picture;
      }
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      await user.save();
      Logger.info('AUTH', 'User updated', { userId: user._id, email });
    }

    return user;
  } catch (error) {
    Logger.error('AUTH', 'Failed to create/update user', {}, error);
    throw error;
  }
}

/**
 * Register a user with email/password
 */
export async function registerWithEmailPassword(payload) {
  try {
    const email = String(payload.email || '').trim().toLowerCase();
    const name = String(payload.name || '').trim();
    const password = String(payload.password || '');
    const requestedRole = payload.role === 'admin' ? 'admin' : 'user';

    if (!email || !name || !password) {
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    const existingUser = await User.findOne({ email }).select('+passwordHash');
    if (existingUser) {
      throw new Error('Account already exists. Please login instead.');
    }

    const isAdminAllowed = canAssignAdminRole(email);
    const roleToAssign = requestedRole === 'admin' ? 'admin' : 'user';
    if (requestedRole === 'admin' && !isAdminAllowed) {
      throw new Error('Admin access is not allowed for this email.');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      email,
      name,
      passwordHash,
      role: roleToAssign,
    });

    Logger.info('AUTH', 'New email/password user created', {
      userId: user._id,
      email,
      role: user.role,
    });

    return user;
  } catch (error) {
    Logger.error('AUTH', 'Failed to register email/password user', {}, error);
    throw error;
  }
}

/**
 * Login a user with email/password
 */
export async function loginWithEmailPassword(payload) {
  try {
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const requestedRole = payload.role === 'admin' ? 'admin' : 'user';

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new Error('Account not found. Please sign up first.');
    }

    if (user.isLocked) {
      throw new Error('This account has been suspended by an administrator.');
    }

    if (!user.passwordHash) {
      throw new Error('This account uses Google login. Please continue with Google.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }

    if (requestedRole === 'admin' && user.role !== 'admin') {
      throw new Error('This account does not have admin privileges.');
    }

    return user;
  } catch (error) {
    Logger.error('AUTH', 'Failed to login with email/password', {}, error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    Logger.error('AUTH', 'Failed to get user', { userId }, error);
    throw error;
  }
}

export default {
  generateJWT,
  verifyJWT,
  createOrUpdateUser,
  registerWithEmailPassword,
  loginWithEmailPassword,
  getUserById,
};
