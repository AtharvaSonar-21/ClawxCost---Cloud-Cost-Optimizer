import { recalculateAllTrends } from "../services/trends.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getTrendAnalysis = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const trendData = await recalculateAllTrends(userId);
    Logger.info("TRENDS", "Trend analysis calculated", { requestId });
    res.status(200).json(successResponse(trendData));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("TRENDS", "Failed to calculate trend analysis", { requestId }, error);
    res.status(500).json(errorResponse("Failed to calculate trend analysis", 500, requestId));
  }
};
