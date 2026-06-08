/**
 * Input Validation Middleware
 * Provides payload validation and sanitization for critical authentication
 * and lead collection endpoints.
 */

import { ValidationError } from "../utils/errors.js";

// Helper regexes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // Min 8 chars, at least 1 letter and 1 number

/**
 * Validates the email address format.
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Middleware to validate early access lead signup payload.
 */
export const validateLeadSignup = (req, res, next) => {
  const { email } = req.body;

  if (!email || String(email).trim() === "") {
    return next(new ValidationError("Email address is required."));
  }

  if (!isValidEmail(email)) {
    return next(new ValidationError("Please provide a valid email address."));
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Middleware to validate email registration payload.
 */
export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || String(name).trim() === "") {
    return next(new ValidationError("Name is required."));
  }

  if (name.trim().length < 2 || name.trim().length > 50) {
    return next(new ValidationError("Name must be between 2 and 50 characters."));
  }

  if (!email || String(email).trim() === "") {
    return next(new ValidationError("Email is required."));
  }

  if (!isValidEmail(email)) {
    return next(new ValidationError("Please provide a valid email address."));
  }

  if (!password || String(password).trim() === "") {
    return next(new ValidationError("Password is required."));
  }

  if (!PASSWORD_REGEX.test(password)) {
    return next(new ValidationError("Password must be at least 8 characters long and contain both letters and numbers."));
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Middleware to validate email login payload.
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || String(email).trim() === "") {
    return next(new ValidationError("Email is required."));
  }

  if (!isValidEmail(email)) {
    return next(new ValidationError("Please provide a valid email address."));
  }

  if (!password || String(password).trim() === "") {
    return next(new ValidationError("Password is required."));
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

export default {
  validateLeadSignup,
  validateRegistration,
  validateLogin,
};
