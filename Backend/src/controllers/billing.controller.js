import BillingRaw from "../models/BillingRaw.js";
import BillingNormalized from "../models/BillingNormalized.js";
import { normalizeBillingRecord } from "../services/normalization.service.js";
import { recalculateAllTrends } from "../services/trends.service.js";
import { runAnomalyDetection } from "../services/anomaly-detection.service.js";
import { generateRecommendations } from "../services/recommendations.service.js";
import { generateCostForecasts } from "../services/forecasting.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const createBilling = async (req, res) => {
  try {
    const { provider, service, region, usageHours, cost, date } = req.body;
    const userId = req.user?.id;
    const requestId = req.requestId || Logger.generateRequestId();

    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    // Check for required fields
    if (!provider || !service || !region || usageHours === undefined || cost === undefined || !date) {
      Logger.warn("BILLING", "Validation failed: missing required fields", { requestId });
      return res.status(400).json(
        errorResponse("All fields are required: provider, service, region, usageHours, cost, date", 400, requestId)
      );
    }

    // Validate data types and values
    const validationErrors = [];

    // Validate provider
    if (!["aws", "gcp", "azure"].includes(provider.toLowerCase())) {
      validationErrors.push("provider must be one of: aws, gcp, azure");
    }

    // Validate cost: must be positive and reasonable
    if (typeof cost !== "number" || cost < 0) {
      validationErrors.push("cost must be a non-negative number");
    } else if (cost > 100000) {
      validationErrors.push("cost cannot exceed $100,000 per day (exceeds reasonable limit)");
    }

    // Validate usageHours: must be non-negative and ≤ 24
    if (typeof usageHours !== "number" || usageHours < 0) {
      validationErrors.push("usageHours must be a non-negative number");
    } else if (usageHours > 24) {
      validationErrors.push("usageHours cannot exceed 24 (use daily billing periods)");
    }

    // Validate date: must be valid and not in the future
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      validationErrors.push("date must be a valid date (YYYY-MM-DD format)");
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (parsedDate > today) {
        validationErrors.push("date cannot be in the future");
      }
    }

    if (validationErrors.length > 0) {
      Logger.warn("BILLING", "Validation failed: data value errors", { requestId, errors: validationErrors });
      return res.status(400).json(
        errorResponse(`Validation failed: ${validationErrors.join("; ")}`, 400, requestId)
      );
    }

    const rawRecord = await BillingRaw.create({
      userId,
      provider: provider.toLowerCase().trim(),
      service: service.trim(),
      region: region.trim(),
      usageHours,
      cost,
      date: parsedDate,
    });

    const normalizedData = normalizeBillingRecord(rawRecord);
    await BillingNormalized.create(normalizedData);

    Logger.info("BILLING", "Billing record created successfully", {
      requestId,
      provider,
      service,
      cost,
    });

    // Trigger analytics pipeline async (non-blocking)
    // Order: Trends → Anomaly Detection → Recommendations → Forecasting
    recalculateAllTrends(userId)
      .then(() => {
        Logger.info("BILLING", "Trend recalculation completed", { requestId });
        return runAnomalyDetection(userId);
      })
      .then(() => {
        Logger.info("BILLING", "Anomaly detection completed", { requestId });
        return generateRecommendations(userId);
      })
      .then(() => {
        Logger.info("BILLING", "Recommendation generation completed", { requestId });
        return generateCostForecasts(userId);
      })
      .then(() => {
        Logger.info("BILLING", "Cost forecasting completed", { requestId });
      })
      .catch((pipelineError) => {
        Logger.warn("BILLING", "Analytics pipeline failed (non-blocking)", { requestId }, pipelineError);
      });

    res.status(201).json(successResponse({ message: "Billing record processed successfully" }, 201));
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();

    // Handle validation errors from MongoDB
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join("; ");
      Logger.warn("BILLING", "MongoDB validation error", { requestId, messages });
      return res.status(400).json(errorResponse(`Validation failed: ${messages}`, 400, requestId));
    }

    // Handle validation errors from normalization
    if (error.message.includes("Unsupported provider") || error.message.includes("Unsupported service")) {
      Logger.warn("BILLING", "Invalid provider or service", { requestId });
      return res.status(400).json(errorResponse(error.message, 400, requestId));
    }

    Logger.error("BILLING", "Failed to create billing record", { requestId }, error);
    res.status(500).json(errorResponse("Failed to create billing record", 500, requestId));
  }
};
