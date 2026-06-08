/**
 * Environment Variable Validator
 * Validates critical environment variables at application startup
 * to ensure fail-fast behavior.
 */

import Logger from "./logger.js";

/**
 * Validates that all required environment variables are present and secure.
 * Throws an error or logs and exits if critical variables are missing or insecure.
 */
export function validateEnv() {
  const missing = [];

  // Required variables
  const required = ["MONGO_URI", "JWT_SECRET"];
  
  required.forEach((key) => {
    if (!process.env[key] || String(process.env[key]).trim() === "") {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    Logger.error("ENV_VALIDATION", `CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    console.error(`\n❌ ERROR: Missing required environment variables: ${missing.join(", ")}\nPlease check your Backend/.env file.\n`);
    process.exit(1);
  }

  // Validate JWT Secret strength
  const jwtSecret = String(process.env.JWT_SECRET || "").trim().replace(/^['"]|['"]$/g, "");
  if (jwtSecret.length < 32) {
    Logger.warn("ENV_VALIDATION", "WARNING: JWT_SECRET is weak. For production, it must be at least 32 characters long.");
    console.warn("\n⚠️  WARNING: JWT_SECRET is too short (< 32 characters). Please use a stronger secret for production security.\n");
  }

  Logger.info("ENV_VALIDATION", "Environment variables validated successfully.");
}

export default validateEnv;
