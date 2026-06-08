import mongoose from "mongoose";
import BillingNormalized from "../models/BillingNormalized.js";
import BillingForecast from "../models/BillingForecast.js";

/**
 * Calculate simple linear regression trend
 * @param {Array<number>} costs - Array of last 7 days costs
 * @returns {Object} - { slope, trend: 'increasing'|'decreasing'|'flat', confidence }
 */
function calculateTrendSlope(costs) {
  if (costs.length < 2) {
    return { slope: 0, trend: "flat", confidence: 0.5 };
  }

  // Simple linear regression: y = mx + b
  const n = costs.length;
  const x = Array.from({ length: n }, (_, i) => i); // [0, 1, 2, 3, 4, 5, 6]
  const y = costs;

  const xSum = x.reduce((a, b) => a + b, 0);
  const ySum = y.reduce((a, b) => a + b, 0);
  const xySum = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const xxSum = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const trend =
    Math.abs(slope) < 0.5 ? "flat" : slope > 0 ? "increasing" : "decreasing";

  // R² confidence
  const yMean = ySum / n;
  const intercept = (ySum - slope * xSum) / n;
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  const confidence = Math.max(0, Math.min(1, r2));

  return { slope, trend, confidence };
}

/**
 * Calculate month-to-date cost and projected monthly cost
 * @param {Array<Object>} lastSevenDays - Array of { date, cost } from last 7 days
 * @returns {Object}
 */
export function calculateMonthlyCostProjection(lastSevenDays, currentMonthCostActual = null) {
  if (!lastSevenDays || lastSevenDays.length === 0) {
    return {
      currentMonthCost: 0,
      projectedMonthlyTotal: 0,
      daysIntoMonth: 0,
      daysRemaining: 0,
      dailyAverage: 0,
      dailyTrend: "flat",
      trendConfidence: 0.5,
    };
  }

  // Get current date info
  const today = new Date();
  const daysIntoMonth = today.getDate();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInCurrentMonth - daysIntoMonth;

  // Calculate sum of costs from last 7 days
  const costs = lastSevenDays.map((day) => day.cost);
  const totalLast7Days = costs.reduce((a, b) => a + b, 0);
  const dailyAverage = totalLast7Days / costs.length;

  // Calculate trend
  const { trend, confidence } = calculateTrendSlope(costs);

  // Current month cost (actual month-to-date when available, fallback to rolling window sum in month)
  let currentMonthCost =
    typeof currentMonthCostActual === "number" && currentMonthCostActual >= 0
      ? currentMonthCostActual
      : 0;

  if (currentMonthCostActual === null) {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    for (const day of lastSevenDays) {
      const dayDate = new Date(day.date);
      if (dayDate >= firstOfMonth && dayDate <= today && dayDate.getMonth() === today.getMonth()) {
        currentMonthCost += day.cost;
      }
    }
  }

  // Projected monthly total (current + remaining days at daily average)
  const projectedMonthlyTotal = currentMonthCost + daysRemaining * dailyAverage;

  return {
    currentMonthCost: parseFloat(currentMonthCost.toFixed(2)),
    projectedMonthlyTotal: parseFloat(projectedMonthlyTotal.toFixed(2)),
    daysIntoMonth,
    daysRemaining,
    dailyAverage: parseFloat(dailyAverage.toFixed(2)),
    dailyTrend: trend,
    trendConfidence: parseFloat(confidence.toFixed(2)),
    forecastedAt: new Date(),
  };
}

/**
 * Generate cost forecasts for all user services
 * @param {string} userId - User ID
 * @param {Object} trendData - Data from trends calculation (lastSevenDays per service)
 * @returns {Promise<Object>}
 */
export async function generateCostForecasts(userId, trendData) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const forecasts = [];

    // Generate forecasts for each unique combination
    const uniqueCombinations = await BillingNormalized.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: {
            provider: "$provider",
            serviceType: "$serviceType",
            region: "$region",
          },
        },
      },
    ]);

    for (const combo of uniqueCombinations) {
      const { provider, serviceType, region } = combo._id;

      // Get last 7 days of data for this combination
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const lastSevenDays = await BillingNormalized.aggregate([
        {
          $match: {
            userId: userObjectId,
            provider,
            serviceType,
            region,
            date: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            dailyTotal: { $sum: "$dailyCost" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      if (lastSevenDays.length === 0) continue;

      // Convert to expected format
      const formattedLastSevenDays = lastSevenDays.map((item) => ({
        date: item._id,
        cost: item.dailyTotal,
      }));

      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const currentMonthAgg = await BillingNormalized.aggregate([
        {
          $match: {
            userId: userObjectId,
            provider,
            serviceType,
            region,
            date: { $gte: firstOfMonth, $lte: today },
          },
        },
        {
          $group: {
            _id: null,
            totalCost: { $sum: "$dailyCost" },
          },
        },
      ]);

      const currentMonthCostActual = currentMonthAgg[0]?.totalCost || 0;
      const projection = calculateMonthlyCostProjection(
        formattedLastSevenDays,
        currentMonthCostActual
      );

      const forecastDoc = {
        userId: userObjectId,
        provider,
        serviceType,
        region,
        ...projection,
        lastUpdated: new Date(),
      };

      // Upsert forecast
      await BillingForecast.updateOne(
        { userId: userObjectId, provider, serviceType, region },
        forecastDoc,
        { upsert: true }
      );

      forecasts.push(forecastDoc);
    }

    return {
      success: true,
      summary: {
        totalForecasts: forecasts.length,
        lastUpdated: new Date(),
      },
      forecasts,
    };
  } catch (error) {
    throw new Error(`Failed to generate forecasts: ${error.message}`);
  }
}

/**
 * Get aggregate forecast for entire user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getAggregatedForecast(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const allForecasts = await BillingForecast.find({ userId: userObjectId });

    if (allForecasts.length === 0) {
      return {
        totalCurrentMonth: 0,
        totalProjectedMonth: 0,
        daysIntoMonth: new Date().getDate(),
        daysRemaining: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate(),
        overallTrend: "flat",
        forecastDetails: [],
      };
    }

    const totalCurrentMonth = allForecasts.reduce((sum, f) => sum + f.currentMonthCost, 0);
    const totalProjectedMonth = allForecasts.reduce((sum, f) => sum + f.projectedMonthlyTotal, 0);

    // Determine overall trend (weighted by projected cost)
    let trendScore = 0;
    allForecasts.forEach((f) => {
      const weight = f.projectedMonthlyTotal / totalProjectedMonth || 0;
      trendScore +=
        (f.dailyTrend === "increasing"
          ? weight
          : f.dailyTrend === "decreasing"
            ? -weight
            : 0);
    });
    const overallTrend =
      Math.abs(trendScore) < 0.1 ? "flat" : trendScore > 0 ? "increasing" : "decreasing";

    const today = new Date();
    const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return {
      totalCurrentMonth: parseFloat(totalCurrentMonth.toFixed(2)),
      totalProjectedMonth: parseFloat(totalProjectedMonth.toFixed(2)),
      daysIntoMonth: today.getDate(),
      daysRemaining: daysInCurrentMonth - today.getDate(),
      overallTrend,
      dailyAverage: parseFloat((totalProjectedMonth / daysInCurrentMonth).toFixed(2)),
      forecastDetails: allForecasts.map((f) => ({
        provider: f.provider,
        serviceType: f.serviceType,
        region: f.region,
        currentMonthCost: f.currentMonthCost,
        projectedMonthlyTotal: f.projectedMonthlyTotal,
        dailyTrend: f.dailyTrend,
        trendConfidence: f.trendConfidence,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to get aggregated forecast: ${error.message}`);
  }
}
