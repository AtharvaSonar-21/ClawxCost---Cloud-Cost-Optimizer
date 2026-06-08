import { calculateAggregates } from "./aggregation.service.js";
import { recalculateAllTrends } from "./trends.service.js";
import { runAnomalyDetection } from "./anomaly-detection.service.js";
import { generateRecommendations } from "./recommendations.service.js";
import { generateCostForecasts, getAggregatedForecast } from "./forecasting.service.js";

export async function getAnalyticsSummary(userId) {
  const aggregates = await calculateAggregates(userId);

  return {
    success: true,
    data: {
      costSummary: aggregates,
      timestamp: new Date(),
    },
  };
}

export async function getAnalyticsTrends(userId) {
  const trends = await recalculateAllTrends(userId);

  const anomalies = trends.anomalies || [];
  const activeAnomalies = trends.incidents?.filter((i) => i.status === "active") || [];

  return {
    success: true,
    data: {
      summary: trends.summary,
      totalTrends: trends.trends?.length || 0,
      anomaliesDetected: anomalies.length,
      activeAnomalies: activeAnomalies.length,
      trends: trends.trends || [],
      anomalies: anomalies,
      timestamp: new Date(),
    },
  };
}

export async function getAnalyticsIncidents(userId) {
  const incidents = await runAnomalyDetection(userId);

  return {
    success: true,
    data: {
      summary: incidents.summary,
      totalIncidents: incidents.incidents?.length || 0,
      incidents: incidents.incidents || [],
      timestamp: new Date(),
    },
  };
}

export async function getAnalyticsRecommendations(userId) {
  const recommendations = await generateRecommendations(userId);

  return {
    success: true,
    data: {
      summary: recommendations.summary,
      totalRecommendations: recommendations.recommendations?.length || 0,
      recommendations: recommendations.recommendations || [],
      timestamp: new Date(),
    },
  };
}

export async function getAnalyticsForecast(userId) {
  const forecast = await getAggregatedForecast(userId);

  return {
    success: true,
    data: {
      ...forecast,
      timestamp: new Date(),
    },
  };
}

export async function getComprehensiveAnalytics(userId) {
  const [costData, trendData, incidentData, recommendationData, forecastData] = await Promise.all([
    calculateAggregates(userId),
    recalculateAllTrends(userId),
    runAnomalyDetection(userId),
    generateRecommendations(userId),
    generateCostForecasts(userId, null),
  ]);

  const forecastSummary = await getAggregatedForecast(userId);

  return {
    success: true,
    data: {
      costSummary: {
        totalCost: costData.totalCost,
        totalEntries: costData.totalEntries,
        costByProvider: costData.costByProvider,
        costByServiceType: costData.costByServiceType,
        topContributor: costData.topContributor,
      },
      forecast: {
        currentMonthCost: forecastSummary.totalCurrentMonth,
        projectedMonthlyTotal: forecastSummary.totalProjectedMonth,
        daysIntoMonth: forecastSummary.daysIntoMonth,
        daysRemaining: forecastSummary.daysRemaining,
        dailyAverage: forecastSummary.dailyAverage,
        trend: forecastSummary.overallTrend,
      },
      trends: {
        summary: trendData.summary,
        totalTrends: trendData.trends?.length || 0,
        anomaliesDetected: (trendData.anomalies || []).length,
      },
      incidents: {
        summary: incidentData.summary,
        totalActive: incidentData.incidents?.filter((i) => i.status === "active").length || 0,
        byType: {
          costSpikes: incidentData.incidents?.filter((i) => i.incidentType === "cost_spike")
            .length || 0,
          dominanceRisks: incidentData.incidents?.filter((i) => i.incidentType === "dominance_risk")
            .length || 0,
          vendorConcentration: incidentData.incidents?.filter(
            (i) => i.incidentType === "vendor_concentration_risk"
          ).length || 0,
        },
      },
      recommendations: {
        summary: recommendationData.summary,
        totalActive: recommendationData.recommendations?.filter((r) => r.status === "active")
          .length || 0,
        totalPotentialMonthlySavings: recommendationData.recommendations
          ?.reduce((sum, r) => sum + r.estimatedSavings.monthlyAmount, 0)
          .toFixed(2) || 0,
        byType: {
          computeRightsizing: recommendationData.recommendations?.filter(
            (r) => r.recommendationType === "compute_rightsizing"
          ).length || 0,
          storageLifecycle: recommendationData.recommendations?.filter(
            (r) => r.recommendationType === "storage_lifecycle"
          ).length || 0,
          regionDiversification: recommendationData.recommendations?.filter(
            (r) => r.recommendationType === "region_diversification"
          ).length || 0,
        },
      },
      healthCheckpoints: {
        costAnalysis: costData.totalCost > 0 ? "healthy" : "no_data",
        trendAnalysis: trendData.trends?.length > 0 ? "healthy" : "no_data",
        anomalyDetection: incidentData.incidents?.length >= 0 ? "active" : "error",
        recommendations: recommendationData.recommendations?.length >= 0 ? "active" : "error",
        forecasting: forecastSummary.totalProjectedMonth > 0 ? "active" : "no_data",
      },
      timestamp: new Date(),
    },
  };
}
