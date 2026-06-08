import Recommendation from "../models/Recommendation.js";
import { generateRecommendations } from "../services/recommendations.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { buildRecommendationFilter } from "../utils/query-builder.js";

export const getRecommendations = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }
    const { filter, pagination } = buildRecommendationFilter(req.query);
    const scopedFilter = { ...filter, userId };

    const recommendations = await Recommendation.find(scopedFilter)
      .sort({ severity: -1, detectedAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.offset);

    const total = await Recommendation.countDocuments(scopedFilter);
    const activeCount = await Recommendation.countDocuments({ ...scopedFilter, status: "active" });
    const staleCount = await Recommendation.countDocuments({ ...scopedFilter, status: "stale" });
    const appliedCount = await Recommendation.countDocuments({ ...scopedFilter, status: "applied" });

    const totalSavings = recommendations.reduce(
      (sum, r) => sum + r.estimatedSavings.monthlyAmount,
      0
    );

    Logger.info("RECOMMENDATIONS", "Recommendations fetched", {
      requestId,
      total,
      returned: recommendations.length,
    });

    res.status(200).json(
      successResponse({
        recommendations,
        pagination: {
          total,
          limit: pagination.limit,
          offset: pagination.offset,
          returned: recommendations.length,
        },
        summary: {
          totalActive: activeCount,
          totalStale: staleCount,
          totalApplied: appliedCount,
          totalPotentialMonthlySavings: parseFloat(totalSavings.toFixed(2)),
        },
      })
    );
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("RECOMMENDATIONS", "Failed to fetch recommendations", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch recommendations", 500, requestId));
  }
};

export const getRecommendationSummary = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const all = await Recommendation.find({ userId });

    const bySeverity = {
      critical: all.filter((r) => r.severity === "critical").length,
      high: all.filter((r) => r.severity === "high").length,
      medium: all.filter((r) => r.severity === "medium").length,
      low: all.filter((r) => r.severity === "low").length,
    };

    const byStatus = {
      active: all.filter((r) => r.status === "active").length,
      stale: all.filter((r) => r.status === "stale").length,
      applied: all.filter((r) => r.status === "applied").length,
    };

    const byType = {
      compute_rightsizing: all.filter((r) => r.recommendationType === "compute_rightsizing")
        .length,
      storage_lifecycle: all.filter((r) => r.recommendationType === "storage_lifecycle").length,
      region_diversification: all.filter((r) => r.recommendationType === "region_diversification")
        .length,
    };

    const totalSavings = all.reduce((sum, r) => sum + r.estimatedSavings.monthlyAmount, 0);

    Logger.info("RECOMMENDATIONS", "Summary fetched", {
      requestId,
      totalRecommendations: all.length,
    });

    res.status(200).json(
      successResponse({
        summary: {
          totalRecommendations: all.length,
          severity: bySeverity,
          status: byStatus,
          type: byType,
          totalPotentialMonthlySavings: parseFloat(totalSavings.toFixed(2)),
        },
      })
    );
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("RECOMMENDATIONS", "Failed to fetch summary", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch recommendation summary", 500, requestId));
  }
};

export const applyRecommendation = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }
    const { id } = req.params;

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: id, userId },
      {
        status: "applied",
        appliedAt: new Date(),
      },
      { new: true }
    );

    if (!recommendation) {
      Logger.warn("RECOMMENDATIONS", "Apply failed: recommendation not found", {
        requestId,
        recommendationId: id,
      });
      return res.status(404).json(errorResponse("Recommendation not found", 404, requestId));
    }

    Logger.info("RECOMMENDATIONS", "Recommendation applied", { requestId, recommendationId: id });
    res.status(200).json(successResponse(recommendation));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("RECOMMENDATIONS", "Failed to apply recommendation", { requestId }, error);
    res.status(500).json(errorResponse("Failed to apply recommendation", 500, requestId));
  }
};

export const triggerGeneration = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await generateRecommendations(userId);
    Logger.info("RECOMMENDATIONS", "Generation triggered", { requestId });
    res.status(200).json(successResponse(result));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("RECOMMENDATIONS", "Failed to generate recommendations", { requestId }, error);
    res.status(500).json(errorResponse("Failed to generate recommendations", 500, requestId));
  }
};
