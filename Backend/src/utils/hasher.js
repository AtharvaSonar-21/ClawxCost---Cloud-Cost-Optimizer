import crypto from "crypto";

/**
 * Generate SHA256 hash of a string
 * @param {string} content - Content to hash
 * @returns {string} - Hex-encoded SHA256 hash
 */
export function hashContent(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Generate hash for a billing row (for duplicate detection)
 * @param {object} row - Billing row with provider, service, region, cost, usageHours, date
 * @returns {string} - Hex-encoded SHA256 hash
 */
export function hashBillingRow(row) {
  const { provider, service, region, cost, usageHours, date } = row;
  const rowString = `${provider.toLowerCase()}|${service.toLowerCase()}|${region.toLowerCase()}|${cost}|${usageHours}|${date}`;
  return hashContent(rowString);
}

/**
 * Generate hash for entire CSV file content (for idempotent uploads)
 * @param {Buffer} fileBuffer - CSV file buffer
 * @returns {string} - Hex-encoded SHA256 hash
 */
export function hashCSVFile(fileBuffer) {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}
