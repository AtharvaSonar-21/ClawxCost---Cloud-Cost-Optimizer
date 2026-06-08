import AdminConfig from '../models/AdminConfig.js';
import Logger from '../utils/logger.js';

function sanitizeEnvValue(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

/**
 * Set Gemini API key in AdminConfig
 */
export async function setGeminiApiKey(apiKey) {
  try {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error('Invalid API key format');
    }

    // Remove whitespace
    const cleanKey = apiKey.trim();

    // Find and update, or create if doesn't exist
    let config = await AdminConfig.findOne({ name: 'gemini_api_key' });

    if (config) {
      config.value = cleanKey;
      await config.save();
      Logger.info('ADMIN', 'Gemini API key updated', {});
    } else {
      config = await AdminConfig.create({
        name: 'gemini_api_key',
        value: cleanKey,
      });
      Logger.info('ADMIN', 'Gemini API key created', {});
    }

    return { success: true, message: 'API key saved' };
  } catch (error) {
    Logger.error('ADMIN', 'Failed to set Gemini API key', {}, error);
    throw error;
  }
}

/**
 * Check if Gemini API key is configured
 */
export async function isGeminiKeyConfigured() {
  try {
    const envGeminiKey = sanitizeEnvValue(process.env.GEMINI_API_KEY);
    if (envGeminiKey) {
      return true;
    }

    const config = await AdminConfig.findOne({ name: 'gemini_api_key' });
    return !!config && !!config.value;
  } catch (error) {
    Logger.error('ADMIN', 'Failed to check Gemini key', {}, error);
    return false;
  }
}

/**
 * Get Gemini API key status (without exposing the actual key)
 */
export async function getGeminiKeyStatus() {
  try {
    const envGeminiKey = sanitizeEnvValue(process.env.GEMINI_API_KEY);
    if (envGeminiKey) {
      return {
        configured: true,
        lastUpdated: null,
        keyLength: envGeminiKey.length,
        source: 'env',
      };
    }

    const config = await AdminConfig.findOne({ name: 'gemini_api_key' });

    if (!config || !config.value) {
      return {
        configured: false,
        lastUpdated: null,
      };
    }

    return {
      configured: true,
      lastUpdated: config.updatedAt,
      keyLength: config.value.length,
      source: 'database',
    };
  } catch (error) {
    Logger.error('ADMIN', 'Failed to get Gemini key status', {}, error);
    throw error;
  }
}

export default {
  setGeminiApiKey,
  isGeminiKeyConfigured,
  getGeminiKeyStatus,
};
