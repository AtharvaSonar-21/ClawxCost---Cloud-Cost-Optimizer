import express from 'express';
import multer from 'multer';
import { sendMessage, getHistory, analyzeFile } from '../controllers/ai-insights.controller.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/json',
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (
      allowedMimeTypes.includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith('.xlsx') ||
      file.originalname.toLowerCase().endsWith('.xls')
    ) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type. Allowed: JSON, PDF, Excel (XLSX/XLS), PNG, JPG, WEBP'));
  },
});

/**
 * POST /ai-insights/chat
 * Send message to Gemini AI
 * Headers: Authorization: Bearer <jwt>
 * Body: { message: "your question", context: {...} }
 * Returns: { message: "ai response" }
 */
router.post('/chat', sendMessage);

/**
 * GET /ai-insights/history
 * Get chat history for current user
 * Headers: Authorization: Bearer <jwt>
 * Returns: [ { role, content, timestamp }, ... ]
 */
router.get('/history', getHistory);
router.post('/analyze-file', upload.single('file'), analyzeFile);

export default router;
