import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatHistory from '../models/ChatHistory.js';
import AdminConfig from '../models/AdminConfig.js';
import Logger from '../utils/logger.js';

function sanitizeEnvValue(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function tryParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(rawText.slice(start, end + 1));
      } catch (nestedError) {
        return null;
      }
    }
    return null;
  }
}

function formatStructuredResponse(rawText) {
  const parsed = tryParseJson(rawText);
  if (!parsed) {
    return rawText;
  }

  const lines = [];

  if (parsed.summary) {
    lines.push('Summary:');
    lines.push(String(parsed.summary));
    lines.push('');
  }

  if (Array.isArray(parsed.keyFindings) && parsed.keyFindings.length > 0) {
    lines.push('Key Findings:');
    parsed.keyFindings.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push('');
  }

  if (Array.isArray(parsed.risks) && parsed.risks.length > 0) {
    lines.push('Risks:');
    parsed.risks.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push('');
  }

  if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
    lines.push('Recommendations:');
    parsed.recommendations.forEach((rec, index) => {
      if (typeof rec === 'string') {
        lines.push(`${index + 1}. ${rec}`);
      } else {
        lines.push(
          `${index + 1}. ${rec.action || 'Action'} (Impact: ${rec.impact || 'n/a'}, Priority: ${rec.priority || 'n/a'})`
        );
      }
    });
    lines.push('');
  }

  if (Array.isArray(parsed.nextSteps) && parsed.nextSteps.length > 0) {
    lines.push('Next Steps:');
    parsed.nextSteps.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push('');
  }

  if (parsed.providerDetected || parsed.billingPeriod) {
    lines.push(`Provider Detected: ${parsed.providerDetected || 'Unknown'}`);
    lines.push(`Billing Period: ${parsed.billingPeriod || 'Unknown'}`);
    lines.push('');
  }

  if (Array.isArray(parsed.topCostDrivers) && parsed.topCostDrivers.length > 0) {
    lines.push('Top Cost Drivers:');
    parsed.topCostDrivers.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push('');
  }

  if (Array.isArray(parsed.sevenDayPlan) && parsed.sevenDayPlan.length > 0) {
    lines.push('7-Day Action Plan:');
    parsed.sevenDayPlan.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push('');
  }

  return lines.join('\n').trim() || rawText;
}

function sanitizeAndLimitResponse(text, maxWords = 100) {
  const cleaned = String(text || '')
    .replace(/\*\*/g, '') // remove markdown bold markers
    .replace(/\r/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return cleaned;
  }

  return `${words.slice(0, maxWords).join(' ')}...`;
}

/**
 * Get Gemini API key from AdminConfig
 */
async function getGeminiApiKey() {
  try {
    const envGeminiKey = sanitizeEnvValue(process.env.GEMINI_API_KEY);
    if (envGeminiKey) {
      return envGeminiKey;
    }

    const config = await AdminConfig.findOne({ name: 'gemini_api_key' });
    if (!config || !config.value) {
      return null;
    }
    return config.value;
  } catch (error) {
    Logger.error('GEMINI', 'Failed to get API key', {}, error);
    return null;
  }
}

function getModelCandidates() {
  const configuredModel = sanitizeEnvValue(process.env.GEMINI_MODEL);
  return [
    configuredModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro',
  ].filter(Boolean);
}

async function generateGeminiResponse(genAI, parts, maxOutputTokens = 1024) {
  const modelCandidates = getModelCandidates();
  let response = null;
  let lastError = null;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const contents = Array.isArray(parts) && parts[0]?.role
        ? parts
        : [{ role: 'user', parts }];

      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens,
        },
      });
      response = result.response.text();
      if (response) {
        break;
      }
    } catch (error) {
      lastError = error;
      Logger.warn('GEMINI', `Model failed: ${modelName}`, {
        errorName: error?.name,
        errorMessage: error?.message,
      });

      // Fail-fast if the API key is clearly invalid
      const errText = String(error?.message || '').toLowerCase();
      if (
        errText.includes('api key not valid') ||
        errText.includes('api_key_invalid') ||
        errText.includes('invalid api key') ||
        errText.includes('key is invalid') ||
        errText.includes('api key invalid') ||
        errText.includes('api key expired') ||
        errText.includes('api key is invalid')
      ) {
        throw new Error('Invalid or expired Gemini API key. Please update your API key in the admin settings.');
      }
    }
  }

  if (!response) {
    throw lastError || new Error('No compatible Gemini model available for this API key.');
  }

  return response;
}

/**
 * Save chat message to history
 */
export async function saveChatMessage(userId, userMessage, assistantResponse) {
  try {
    // Find or create chat history for user
    let chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      chatHistory = new ChatHistory({ userId, messages: [] });
    }

    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Add assistant response
    chatHistory.messages.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date(),
    });

    await chatHistory.save();
    Logger.info('GEMINI', 'Chat message saved', { userId });

    return chatHistory;
  } catch (error) {
    Logger.error('GEMINI', 'Failed to save chat message', { userId }, error);
    throw error;
  }
}

/**
 * Get chat history for user
 */
export async function getChatHistory(userId) {
  try {
    const chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      return { messages: [] };
    }

    return chatHistory;
  } catch (error) {
    Logger.error('GEMINI', 'Failed to get chat history', { userId }, error);
    throw error;
  }
}

/**
 * Send message to Gemini and get response
 */
export async function sendToGemini(userId, userMessage, userContext = {}) {
  try {
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please contact administrator.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build context string for the AI
    const contextString = formatContext(userContext);
    const systemPrompt = `You are an AI assistant helping users analyze their cloud costs. You have access to their billing data and will provide insights about cost optimization, anomalies, and recommendations.

User's Current Cost Context:
${contextString}

Return valid JSON only with this schema:
{
  "summary": "short summary",
  "keyFindings": ["..."],
  "risks": ["..."],
  "recommendations": [{"action":"...","impact":"...","priority":"high|medium|low"}],
  "nextSteps": ["..."]
}`;

    // Load recent chat history from DB to provide to Gemini
    const contents = [];
    try {
      const history = await ChatHistory.findOne({ userId });
      if (history && Array.isArray(history.messages)) {
        // Keep last 8 messages for context to stay within token boundaries
        const recentMessages = history.messages.slice(-8);
        recentMessages.forEach((msg) => {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        });
      }
    } catch (historyError) {
      Logger.warn('GEMINI', 'Failed to load chat history for context', { userId }, historyError);
    }

    // Add current user message with system prompt
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
    });

    const response = await generateGeminiResponse(
      genAI,
      contents,
      1024
    );

    Logger.info('GEMINI', 'Message processed', { userId });

    return sanitizeAndLimitResponse(formatStructuredResponse(response), 1000);
  } catch (error) {
    Logger.error('GEMINI', 'Failed to send message to Gemini', {}, error);
    throw error;
  }
}

/**
 * Analyze uploaded billing file (JSON/PDF/Image) with Gemini
 */
export async function analyzeBillingFile(file, provider = 'auto') {
  try {
    if (!file || !file.buffer) {
      throw new Error('No file provided.');
    }

    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please contact administrator.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const mimeType = file.mimetype || 'application/octet-stream';
    const normalizedProvider = String(provider || 'auto').toUpperCase();

    const analysisPrompt = `You are a cloud FinOps analyst.
Analyze this uploaded billing file and identify whether it belongs to AWS, GCP/GCS, or Azure.

Return valid JSON only with this schema:
{
  "providerDetected": "aws|gcp|azure|unknown",
  "billingPeriod": "YYYY-MM or textual period",
  "summary": "short summary",
  "topCostDrivers": ["..."],
  "keyFindings": ["..."],
  "risks": ["..."],
  "recommendations": [{"action":"...","impact":"...","priority":"high|medium|low"}],
  "sevenDayPlan": ["..."]
}

Provider hint from user: ${normalizedProvider}.`;

    let parts;
    if (mimeType === 'application/json' || file.originalname?.toLowerCase().endsWith('.json')) {
      let jsonText = file.buffer.toString('utf8');
      // Keep payload size manageable for prompt
      if (jsonText.length > 120000) {
        jsonText = `${jsonText.slice(0, 120000)}\n\n...TRUNCATED...`;
      }
      parts = [
        { text: analysisPrompt },
        { text: `Billing JSON content:\n${jsonText}` },
      ];
    } else {
      parts = [
        { text: analysisPrompt },
        {
          inlineData: {
            mimeType,
            data: file.buffer.toString('base64'),
          },
        },
      ];
    }

    const response = await generateGeminiResponse(genAI, parts, 1400);

    Logger.info('GEMINI', 'Billing file analyzed', {
      fileName: file.originalname,
      mimeType,
    });

    return sanitizeAndLimitResponse(formatStructuredResponse(response), 1000);
  } catch (error) {
    Logger.error('GEMINI', 'Failed to analyze billing file', {}, error);
    throw error;
  }
}

/**
 * Format user's cost context into readable string
 */
function formatContext(context) {
  if (!context || Object.keys(context).length === 0) {
    return 'No billing data available yet. Please upload some billing data to get started.';
  }

  let formatted = '';

  if (context.totalCost) {
    formatted += `Total Cost: $${context.totalCost.toFixed(2)}\n`;
  }

  if (context.costByProvider) {
    formatted += '\nCost by Provider:\n';
    Object.entries(context.costByProvider).forEach(([provider, cost]) => {
      formatted += `  - ${provider.toUpperCase()}: $${cost.toFixed(2)}\n`;
    });
  }

  if (context.costByServiceType) {
    formatted += '\nCost by Service Type:\n';
    Object.entries(context.costByServiceType).forEach(([service, cost]) => {
      formatted += `  - ${service}: $${cost.toFixed(2)}\n`;
    });
  }

  if (context.activeIncidents && context.activeIncidents > 0) {
    formatted += `\nActive Incidents: ${context.activeIncidents}\n`;
  }

  if (context.pendingRecommendations && context.pendingRecommendations > 0) {
    formatted += `Pending Recommendations: ${context.pendingRecommendations}\n`;
  }

  return formatted;
}

export default {
  saveChatMessage,
  getChatHistory,
  sendToGemini,
  analyzeBillingFile,
  getGeminiApiKey,
};
