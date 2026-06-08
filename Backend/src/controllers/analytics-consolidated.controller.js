import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getAnalyticsIncidents,
  getAnalyticsRecommendations,
  getComprehensiveAnalytics,
} from "../services/analytics-consolidated.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getSummary = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await getAnalyticsSummary(userId);
    Logger.info("ANALYTICS", "Cost summary fetched", { requestId });
    res.status(200).json(successResponse(result.data));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANALYTICS", "Failed to fetch cost summary", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch cost summary", 500, requestId));
  }
};

export const getTrends = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await getAnalyticsTrends(userId);
    Logger.info("ANALYTICS", "Trends fetched", { requestId });
    res.status(200).json(successResponse(result.data));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANALYTICS", "Failed to fetch trends", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch trends", 500, requestId));
  }
};

export const getIncidents = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await getAnalyticsIncidents(userId);
    Logger.info("ANALYTICS", "Incidents fetched", { requestId });
    res.status(200).json(successResponse(result.data));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANALYTICS", "Failed to fetch incidents", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch incidents", 500, requestId));
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await getAnalyticsRecommendations(userId);
    Logger.info("ANALYTICS", "Recommendations fetched", { requestId });
    res.status(200).json(successResponse(result.data));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANALYTICS", "Failed to fetch recommendations", { requestId }, error);
    res
      .status(500)
      .json(errorResponse("Failed to fetch recommendations", 500, requestId));
  }
};

export const getComprehensive = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await getComprehensiveAnalytics(userId);
    Logger.info("ANALYTICS", "Comprehensive analytics fetched", { requestId });
    res.status(200).json(successResponse(result.data));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error(
      "ANALYTICS",
      "Failed to fetch comprehensive analytics",
      { requestId },
      error
    );
    res
      .status(500)
      .json(errorResponse("Failed to fetch comprehensive analytics", 500, requestId));
  }
};
