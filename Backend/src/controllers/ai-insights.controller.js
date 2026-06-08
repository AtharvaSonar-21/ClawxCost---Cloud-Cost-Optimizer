import {
  sendToGemini,
  saveChatMessage,
  getChatHistory,
  analyzeBillingFile,
} from '../services/ai-insights.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import Logger from '../utils/logger.js';

/**
 * Send message to Gemini AI
 * POST /ai-insights/chat
 * Body: { message: "user message", context: {...} }
 */
export const sendMessage = async (req, res) => {
  const requestId = req.requestId;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const { message, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json(errorResponse('Missing or invalid message', 400, requestId));
    }

    // Send to Gemini
    const aiResponse = await sendToGemini(userId, message.trim(), context || {});

    // Save to chat history
    await saveChatMessage(userId, message.trim(), aiResponse);

    Logger.info('AI_INSIGHTS', 'Message processed', { requestId, userId });

    res.status(200).json(
      successResponse({
        message: aiResponse,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    Logger.error('AI_INSIGHTS', 'Failed to process message', { requestId, userId }, error);

    // Check if it's an API key error
    if (
      error.message.includes('API key not configured') ||
      error.message.includes('Invalid or expired Gemini API key')
    ) {
      return res.status(503).json(
        errorResponse(
          error.message.includes('configured')
            ? 'AI features are not yet configured. Please contact administrator.'
            : 'Your Gemini API key is invalid or expired. Please update it in the admin settings.',
          503,
          requestId
        )
      );
    }

    if (
      error.message.includes('models/') ||
      error.message.includes('No compatible Gemini model available')
    ) {
      return res.status(503).json(
        errorResponse(
          'Gemini model configuration is incompatible with the current API key. Update GEMINI_MODEL or API key.',
          503,
          requestId
        )
      );
    }

    res
      .status(500)
      .json(errorResponse('Failed to process message', 500, requestId));
  }
};

/**
 * Get chat history for current user
 * GET /ai-insights/history
 */
export const getHistory = async (req, res) => {
  const requestId = req.requestId;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const chatHistory = await getChatHistory(userId);

    Logger.info('AI_INSIGHTS', 'History retrieved', { requestId, userId });

    res.status(200).json(successResponse(chatHistory.messages || []));
  } catch (error) {
    Logger.error('AI_INSIGHTS', 'Failed to get history', { requestId, userId }, error);
    res.status(500).json(errorResponse('Failed to retrieve history', 500, requestId));
  }
};

/**
 * Analyze uploaded billing file with Gemini
 * POST /ai-insights/analyze-file
 * FormData: file=<json|pdf|image>, provider=<aws|gcp|azure|auto>
 */
export const analyzeFile = async (req, res) => {
  const requestId = req.requestId;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json(errorResponse('Missing file', 400, requestId));
    }

    const provider = req.body?.provider || 'auto';
    const analysis = await analyzeBillingFile(file, provider);

    await saveChatMessage(
      userId,
      `Uploaded billing file: ${file.originalname}`,
      analysis
    );

    return res.status(200).json(
      successResponse({
        message: analysis,
        fileName: file.originalname,
        mimeType: file.mimetype,
      })
    );
  } catch (error) {
    Logger.error('AI_INSIGHTS', 'Failed to analyze billing file', { requestId, userId }, error);

    if (
      error.message.includes('API key not configured') ||
      error.message.includes('Invalid or expired Gemini API key')
    ) {
      return res.status(503).json(
        errorResponse(
          error.message.includes('configured')
            ? 'AI features are not yet configured. Please contact administrator.'
            : 'Your Gemini API key is invalid or expired. Please update it in the admin settings.',
          503,
          requestId
        )
      );
    }

    if (
      error.message.includes('models/') ||
      error.message.includes('No compatible Gemini model available')
    ) {
      return res.status(503).json(
        errorResponse(
          'Gemini model configuration is incompatible with the current API key. Update GEMINI_MODEL or API key.',
          503,
          requestId
        )
      );
    }

    return res
      .status(500)
      .json(errorResponse('Failed to analyze uploaded file', 500, requestId));
  }
};

export default {
  sendMessage,
  getHistory,
  analyzeFile,
};
