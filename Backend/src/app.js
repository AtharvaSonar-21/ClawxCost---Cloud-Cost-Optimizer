import express from "express";
import cors from "cors";
import helmet from "helmet";
import requestLoggerMiddleware from "./middleware/request-logger.middleware.js";
import errorHandlerMiddleware from "./middleware/error-handler.middleware.js";
import authMiddleware from "./middleware/auth.middleware.js";
import { apiRateLimiter, authRateLimiter } from "./middleware/rate-limiter.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import aiInsightsRoutes from "./routes/ai-insights.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import trendsRoutes from "./routes/trends.routes.js";
import anomalyRoutes from "./routes/anomaly.routes.js";
import recommendationsRoutes from "./routes/recommendations.routes.js";
import budgetAlertRoutes from "./routes/budget-alert.routes.js";
import cloudRoutes from "./routes/cloud.routes.js";

const app = express();

// Set production-grade HTTP security headers
app.use(helmet());
app.disable("x-powered-by"); // Hide backend engine information


const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://localhost:5173,' +
  'http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003,http://127.0.0.1:3004,http://127.0.0.1:3005,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(apiRateLimiter); // Apply general API rate limiter globally
app.use(requestLoggerMiddleware); // Add request logging and ID correlation
app.use(express.json());

// Public routes (no authentication required)
app.use("/auth", authRateLimiter, authRoutes); // Apply strict auth rate limiter
app.use("/admin", adminRoutes); // Public endpoint to check if Gemini is configured

// Protected routes (authentication required)
app.use("/ai-insights", authMiddleware, aiInsightsRoutes);
app.use("/billing", authMiddleware, billingRoutes);
app.use("/analytics", authMiddleware, analyticsRoutes);
app.use("/trends", authMiddleware, trendsRoutes);
app.use("/incidents", authMiddleware, anomalyRoutes);
app.use("/recommendations", authMiddleware, recommendationsRoutes);
app.use("/budgets", authMiddleware, budgetAlertRoutes);
app.use("/cloud", authMiddleware, cloudRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Clawxcost API running",
  });
});

app.use(errorHandlerMiddleware); // Add global error handler (must be last)

export default app;
